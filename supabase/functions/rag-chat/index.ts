import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  MAX_MESSAGE_CHARS,
  REFUSAL_REPLY,
  cleanClientId,
  cleanMessage,
  clientIp,
  hashIp,
  looksLikeInjection,
  memoryRetryAfter,
  readJsonCapped,
  sanitizeReply,
} from "./guard.ts";
import { catalogPrompt, parseModelOutput, cardsFromMessage, MAX_CARDS, type CardRef } from "./catalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_BODY_BYTES = 4096;

interface ChatMessage {
  message: string;
  clientId?: string;
}

// Gemini returns transient 503s under load; one short retry avoids most fallbacks.
// A 429 is a quota error, so it is not retried here: the caller moves to the next model instead.
async function fetchWithRetry(url: string, init: RequestInit, retries = 1): Promise<Response> {
  let res = await fetch(url, init);
  for (let i = 0; i < retries && res.status === 503; i++) {
    await new Promise((r) => setTimeout(r, 1200));
    res = await fetch(url, init);
  }
  return res;
}

serve(async (req) => {
  // Status codes only (no upstream bodies) so failures can be diagnosed from the client.
  const attempts: string[] = [];
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ---- Guardrails -------------------------------------------------------
    const reject = (status: number, code: string, text: string, retryAfter?: number) =>
      new Response(JSON.stringify({ response: text, error: code, retryAfter: retryAfter ?? null }), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
        },
      });

    // Visitor identity from request headers only (never from the body, which the caller controls).
    // Hashed IP; MAC addresses never reach a web server. If no IP can be determined, fall back to
    // user-agent/language, and also charge a shared "anon" bucket so rotating the browser id
    // cannot sidestep the limits.
    const ip = clientIp(req);
    const salt = Deno.env.get("IP_HASH_SALT") ?? "rag-chat";
    const ipHash = await hashIp(
      ip ?? `anon:${req.headers.get("user-agent") ?? ""}|${req.headers.get("accept-language") ?? ""}`,
      salt
    );

    // Throttle BEFORE reading the body so malformed/oversized/empty requests count too.
    const waitMem = memoryRetryAfter(ipHash);
    if (waitMem > 0) {
      return reject(429, "rate_limited", `You're sending messages quickly. Please wait ${waitMem}s and try again.`, waitMem);
    }

    const parsed = await readJsonCapped(req, MAX_BODY_BYTES);
    if (!parsed.ok) {
      return parsed.tooLarge
        ? reject(413, "payload_too_large", "That message is too large. Please keep it short.")
        : reject(400, "invalid_request", "I couldn't read that message. Please try again.");
    }
    const body = (parsed.value ?? {}) as Partial<ChatMessage>;

    const message = cleanMessage(body.message);
    if (!message) {
      return reject(400, "invalid_request", "Please type a question first.");
    }
    if (message.length > MAX_MESSAGE_CHARS) {
      return reject(
        400,
        "message_too_long",
        `Please keep questions under ${MAX_MESSAGE_CHARS} characters (yours was ${message.length}).`
      );
    }

    // Anonymous browser id: only an extra per-browser cap on top of the IP limits (it is spoofable).
    const clientId = cleanClientId(body.clientId);

    const checkLimit = async (key: string, cid: string | null, caps: Record<string, number> = {}) => {
      const { data, error } = await supabaseClient.rpc("check_chat_rate_limit", {
        p_ip_hash: key,
        p_client_id: cid,
        ...caps,
      });
      if (error) {
        // Fail open so the chat keeps working if the migration has not been applied yet.
        console.error("check_chat_rate_limit failed (rate limiting by memory only):", error.message);
        return null;
      }
      return data?.[0] && !data[0].allowed ? data[0] : null;
    };

    let blockedBy = await checkLimit(ipHash, clientId);
    if (!blockedBy && !ip) {
      // No IP available: shared ceiling across all anonymous callers, generous but finite.
      blockedBy = await checkLimit(await hashIp("anon-shared", salt), null, {
        p_ip_per_min: 30,
        p_ip_per_hour: 200,
        p_ip_per_day: 600,
      });
    }
    if (blockedBy) {
      const wait = blockedBy.retry_after_seconds ?? 60;
      console.warn(`Rate limited (${blockedBy.reason}) ip=${ipHash.slice(0, 12)} client=${clientId ?? "-"}`);
      const text =
        blockedBy.reason === "global_day"
          ? "The chat has reached its daily limit. Please come back tomorrow, or reach me through the contact section."
          : `You've reached the chat limit for now. Please try again in ${wait > 90 ? Math.ceil(wait / 60) + " minutes" : wait + "s"}.`;
      return reject(429, "rate_limited", text, wait);
    }

    // Cheap pre-check: refuse obvious prompt-injection attempts without spending a model call.
    if (looksLikeInjection(message)) {
      console.warn(`Blocked injection attempt ip=${ipHash.slice(0, 12)} client=${clientId ?? "-"}`);
      return new Response(
        JSON.stringify({ response: REFUSAL_REPLY, cards: [], source: "guardrail", relevantSections: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch relevant resume sections based on simple keyword matching
    const { data: resumeSections, error: fetchError } = await supabaseClient
      .from("resume_sections")
      .select("*");

    if (fetchError) {
      throw fetchError;
    }

    // Simple relevance scoring based on keyword matching
    const relevantSections = resumeSections
      .map((section) => {
        const lowerMessage = message.toLowerCase();
        const lowerContent = section.content.toLowerCase();
        const lowerTitle = section.title.toLowerCase();

        let score = 0;

        // Check for keyword matches
        const keywords = lowerMessage
          .split(" ")
          .filter((word) => word.length > 3);
        keywords.forEach((keyword) => {
          if (lowerContent.includes(keyword)) score += 2;
          if (lowerTitle.includes(keyword)) score += 3;
        });

        // Boost certain section types based on common queries
        if (
          lowerMessage.includes("experience") ||
          lowerMessage.includes("work") ||
          lowerMessage.includes("job")
        ) {
          if (section.section_type === "experience") score += 5;
        }
        if (
          lowerMessage.includes("skill") ||
          lowerMessage.includes("technology") ||
          lowerMessage.includes("tech")
        ) {
          if (section.section_type === "skills") score += 5;
        }
        if (
          lowerMessage.includes("education") ||
          lowerMessage.includes("study") ||
          lowerMessage.includes("degree")
        ) {
          if (section.section_type === "education") score += 5;
        }
        if (
          lowerMessage.includes("project") ||
          lowerMessage.includes("build") ||
          lowerMessage.includes("research")
        ) {
          if (section.section_type === "projects") score += 5;
        }

        return { ...section, relevanceScore: score };
      })
      .filter((section) => section.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3); // Top 3 most relevant sections

    // Create context from relevant sections
    const context =
      relevantSections.length > 0
        ? relevantSections
            .map((section) => `${section.title}:\n${section.content}`)
            .join("\n\n")
        : "No specific context available for this query.";

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    const aimlApiKey = Deno.env.get("AIML_API_KEY");

    if (!geminiApiKey && !openRouterApiKey && !aimlApiKey) {
      throw new Error("No LLM provider configured (set GEMINI_API_KEY, OPENROUTER_API_KEY and/or AIML_API_KEY)");
    }

    const systemPrompt = `You are the AI digital twin of Ishmam A. Solaiman.
Persona:
  • You speak as Ishmam in first person ("I", "my", "me").
  • Professional yet approachable; confident but humble.
  • Passionate about AI, machine learning, and software development.
  • Always eager to discuss technology and innovation.

Portfolio Context:
  – Use a software-engineering lens: highlight code, architectures, frameworks, and open-source contributions.
  – Showcase key projects, technical challenges solved, and measurable impact.
  – Emphasize clean code, testing, CI/CD, scalability, and collaboration.

Traits:
  – Professional and warm
  – Passionate about AI/ML and software dev
  – Confident about achievements, but modest
  – Curious and forward-thinking

Behavior Rules:
  1. Respond as Ishmam, using first-person.
  2. Draw strictly from the provided context; never invent facts.
  3. Be specific about technologies, projects, and achievements.
  4. If a question falls outside the context, politely steer back to known areas.
  5. Keep tone conversational yet professional.
  6. Highlight relevant experience and skills when applicable.

Cards:
  The UI can show a visual card next to your answer. When your answer is mainly about a specific project or job/education entry from the list below, reference it in "cards" (at most ${MAX_CARDS}, most relevant first). Only use ids from this list. If the question names one of these entries (a project, company, role, or school), you MUST include its card. Use an empty array for general questions (skills, contact, greetings) or when no single entry is the focus.
${catalogPrompt}

Output format:
  Respond with ONLY a JSON object: {"reply": "<your answer, markdown allowed>", "cards": [{"type": "project" | "experience", "id": "<id>"}]}

Context:
${context.trim()}`;

    let botMessage: string | null = null;
    let cards: CardRef[] = [];
    let geminiError: unknown = null;
    let geminiModelUsed: string | null = null;
    const geminiModels = (Deno.env.get("GEMINI_MODELS") ?? "gemini-flash-latest,gemini-flash-lite-latest,gemini-2.5-flash-lite")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    let source: "gemini" | "openrouter" | "aiml" | null = null;

    // Try Gemini API first
    try {
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
      }

      const geminiInit: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                reply: { type: "STRING" },
                cards: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      type: { type: "STRING", enum: ["project", "experience"] },
                      id: { type: "STRING" },
                    },
                    required: ["type", "id"],
                  },
                },
              },
              required: ["reply", "cards"],
            },
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      };

      // Free-tier quota is per model, so walk the chain when one is exhausted/overloaded/unknown.
      let geminiResponse: Response | null = null;
      const modelErrors: string[] = [];
      for (const model of geminiModels) {
        const res = await fetchWithRetry(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
          geminiInit
        );
        attempts.push(`${model}:${res.status}`);
        if (res.ok) {
          geminiResponse = res;
          geminiModelUsed = model;
          break;
        }
        modelErrors.push(`${model}: ${res.status} ${(await res.text()).slice(0, 200)}`);
        if (![400, 404, 429, 503].includes(res.status)) break;
      }
      if (!geminiResponse) {
        throw new Error(`Gemini API error: ${modelErrors.join(" | ")}`);
      }

      const aiResponse = await geminiResponse.json();
      const candidate = aiResponse.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;
      if (!text) {
        attempts.push(`${geminiModelUsed}:empty(${candidate?.finishReason ?? "none"})`);
        throw new Error(
          `Invalid response from Gemini API (finishReason=${candidate?.finishReason ?? "none"}, raw=${JSON.stringify(aiResponse).slice(0, 500)})`
        );
      }
      ({ reply: botMessage, cards } = parseModelOutput(text));
      source = "gemini";
      console.log(`Answered by Gemini model: ${geminiModelUsed}`);
    } catch (err) {
      geminiError = err;
      console.error("Gemini failed, trying fallback providers:", err);

      // OpenAI-compatible fallbacks, tried in order. AIML is the cheap last resort.
      const fallbacks: { name: "openrouter" | "aiml"; url: string; key: string; model: string }[] = [];
      if (openRouterApiKey) {
        fallbacks.push({
          name: "openrouter",
          url: "https://openrouter.ai/api/v1/chat/completions",
          key: openRouterApiKey,
          model: Deno.env.get("OPENROUTER_MODEL") ?? "google/gemma-4-31b-it:free",
        });
      }
      if (aimlApiKey) {
        fallbacks.push({
          name: "aiml",
          url: "https://api.aimlapi.com/v1/chat/completions",
          key: aimlApiKey,
          model: Deno.env.get("AIML_MODEL") ?? "alibaba/qwen-turbo",
        });
      }
      if (fallbacks.length === 0) {
        throw new Error(`Gemini failed and no fallback provider is configured: ${err}`);
      }

      let lastError: unknown = err;
      for (const fb of fallbacks) {
        try {
          const res = await fetch(fb.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${fb.key}`,
            },
            body: JSON.stringify({
              model: fb.model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message },
              ],
              max_tokens: 800,
              response_format: { type: "json_object" },
              temperature: 0.7,
            }),
          });
          attempts.push(`${fb.name}:${res.status}`);
          if (!res.ok) {
            throw new Error(`${fb.name} API error: ${res.status} - ${(await res.text()).slice(0, 300)}`);
          }
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (!text) {
            attempts.push(`${fb.name}:empty`);
            throw new Error(`${fb.name} returned empty content`);
          }
          ({ reply: botMessage, cards } = parseModelOutput(text));
          source = fb.name;
          console.log(`Answered by ${fb.name} model: ${fb.model}`);
          lastError = null;
          break;
        } catch (e) {
          lastError = e;
          console.error(`${fb.name} fallback failed:`, e);
        }
      }
      if (lastError) throw lastError;
    }

    // Backstop: if the model skipped the cards, match the question against known names.
    if (cards.length === 0) {
      cards = cardsFromMessage(message);
    }

    return new Response(
      JSON.stringify({
        response: sanitizeReply(botMessage ?? ""),
        cards,
        source,
        // Provider error text stays in the logs; clients only learn whether Gemini was skipped.
        geminiFailed: geminiError !== null,
        relevantSections: relevantSections.map((s) => ({
          title: s.title,
          section_type: s.section_type,
        })),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in rag-chat function:", error);
    return new Response(
      JSON.stringify({
        response:
          "I'm sorry, I encountered an error processing your question. Please try again.",
        // Upstream provider errors can carry quota/project details; they stay in the function logs.
        error: "chat_unavailable",
        attempts,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
