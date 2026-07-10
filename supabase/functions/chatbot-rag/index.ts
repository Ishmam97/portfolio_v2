import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const PINECONE_API_KEY = Deno.env.get("PINECONE_API_KEY")!;
const PINECONE_INDEX_HOST = Deno.env.get("PINECONE_INDEX_HOST")!;
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function embedText(text: string) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/text-embed-004:embed",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GEMINI_API_KEY,
      },
      body: JSON.stringify({ text }),
    },
  );
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.embedding || data.embeddings[0];
}

async function queryPinecone(vector: number[]) {
  const res = await fetch(`${PINECONE_INDEX_HOST}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Api-Key": PINECONE_API_KEY,
    },
    body: JSON.stringify({
      vector,
      topK: 5,
      includeMetadata: true,
    }),
  });
  if (!res.ok) throw new Error(`Pinecone error: ${res.status}`);
  const data = await res.json();
  return data.matches?.map((m: any) => m.metadata?.text || m.metadata?.content).join("\n\n") || "";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const embedding = await embedText(message);
    const context = await queryPinecone(embedding.values || embedding);

    const payload = {
      model: "openrouter/deepseek-chat-v3-0324:free",
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Use the following context to answer the user.\n${context}`,
        },
        { role: "user", content: message },
      ],
    };

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    return new Response(aiRes.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      status: aiRes.status,
    });
  } catch (error: any) {
    console.error("chatbot-rag error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
