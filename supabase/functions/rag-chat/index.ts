import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { catalogPrompt, parseModelOutput, cardsFromMessage, MAX_CARDS, type CardRef } from "./catalog.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  message: string;
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { message }: ChatMessage = await req.json();

    // Validate message
    if (!message || typeof message !== "string") {
      throw new Error("Invalid message format");
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

    if (!geminiApiKey && !openRouterApiKey) {
      throw new Error("No LLM provider configured (set GEMINI_API_KEY and/or OPENROUTER_API_KEY)");
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
    let source: "gemini" | "openrouter" | null = null;

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
        throw new Error(
          `Invalid response from Gemini API (finishReason=${candidate?.finishReason ?? "none"}, raw=${JSON.stringify(aiResponse).slice(0, 500)})`
        );
      }
      ({ reply: botMessage, cards } = parseModelOutput(text));
      source = "gemini";
      console.log(`Answered by Gemini model: ${geminiModelUsed}`);
    } catch (err) {
      geminiError = err;
      console.error("Gemini API failed, falling back to OpenRouter:", err);
      if (!openRouterApiKey) {
        throw new Error(`Gemini failed and OPENROUTER_API_KEY is not configured: ${err}`);
      }
      // Fallback to OpenRouter
      const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterApiKey}`,
        },
        body: JSON.stringify({
          model: Deno.env.get("OPENROUTER_MODEL") ?? "google/gemma-4-31b-it:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          max_tokens: 800,
          response_format: { type: "json_object" },
          temperature: 0.7,
        })
      });
      if (!openRouterResponse.ok) {
        const errorData = await openRouterResponse.text();
        throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorData} | gemini: ${(err as Error)?.message ?? err}`);
      }
      const openRouterData = await openRouterResponse.json();
      const openRouterText = openRouterData.choices?.[0]?.message?.content;
      if (openRouterText) {
        ({ reply: botMessage, cards } = parseModelOutput(openRouterText));
      } else {
        botMessage = "I'm sorry, I couldn't generate a response at this time.";
      }
      source = "openrouter";
    }

    // Backstop: if the model skipped the cards, match the question against known names.
    if (cards.length === 0) {
      cards = cardsFromMessage(message);
    }

    return new Response(
      JSON.stringify({
        response: botMessage,
        cards,
        source,
        geminiError: geminiError ? (geminiError as Error)?.message ?? String(geminiError) : null,
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
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
