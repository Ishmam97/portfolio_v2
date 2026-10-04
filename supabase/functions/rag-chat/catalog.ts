// Mirrors the ids in src/data/projects.ts and src/data/experience.ts.
// The chat UI renders the real cards from those files; this list only tells
// the model which ids it may reference.
export interface CatalogEntry {
  type: "project" | "experience";
  id: string;
  title: string;
  keywords: string[];
}

export const CATALOG: CatalogEntry[] = [
  { type: "project", id: "forge", title: "Agentic Scaffold (Forge) - Claude Code-native multi-agent engineering scaffold", keywords: ["forge", "agentic scaffold"] },
  { type: "project", id: "interviewer-ai", title: "Interviewer AI - RAG mock technical interview platform", keywords: ["interviewer ai", "interviewer_ai", "mock interview"] },
  { type: "project", id: "ualr-chatbot", title: "UALR Graduate School Chatbot - RAG admissions chatbot", keywords: ["graduate school chatbot", "grad school chatbot", "grad guide", "admissions chatbot"] },
  { type: "project", id: "cosmos", title: "Cosmos - research lab website", keywords: ["cosmos website", "cosmos lab website"] },
  { type: "project", id: "ublog", title: "UBlog - MERN social media site", keywords: ["ublog"] },
  { type: "project", id: "disinfectors", title: "Disinfectors Inc. Website", keywords: ["disinfectors"] },
  { type: "project", id: "feedme", title: "Feedme - Kotlin food delivery Android app", keywords: ["feedme", "food delivery"] },
  { type: "experience", id: "researchbuddy", title: "Founding CTO & Lead Software Engineer at ResearchBuddy AI", keywords: ["researchbuddy", "research buddy"] },
  { type: "experience", id: "ualr-ai", title: "AI Solutions Engineer (Graduate Assistant) at UALR", keywords: ["ai solutions engineer", "graduate assistant"] },
  { type: "experience", id: "atu-instructor", title: "Instructor at Arkansas Tech University", keywords: ["arkansas tech", "atu", "instructor", "taught", "teaching"] },
  { type: "experience", id: "gainwell", title: "Software Engineering Intern at Gainwell Technologies", keywords: ["gainwell", "gabby"] },
  { type: "experience", id: "cosmos-ra", title: "Research Assistant (Machine Learning) at COSMOS", keywords: ["research assistant", "cosmos"] },
  { type: "experience", id: "ms-ualr", title: "MS in Computer Science at UALR", keywords: ["master", "ms in", "m.s"] },
  { type: "experience", id: "optimizely", title: "Full Stack Software Engineer I at Optimizely", keywords: ["optimizely"] },
  { type: "experience", id: "bs-brac", title: "BS in Computer Science at Brac University", keywords: ["brac", "bachelor", "undergrad"] },
];

export interface CardRef {
  type: "project" | "experience";
  id: string;
}

export const MAX_CARDS = 2;

export const catalogPrompt = CATALOG.map(
  (c) => `  - ${c.type}:${c.id} -> ${c.title}`
).join("\n");

// Keeps only ids that exist in the catalog (with the right type), dedupes, caps the count.
export function sanitizeCards(raw: unknown): CardRef[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: CardRef[] = [];
  for (const item of raw) {
    const type = (item as CardRef)?.type;
    const id = (item as CardRef)?.id;
    if (typeof id !== "string" || typeof type !== "string") continue;
    const key = `${type}:${id}`;
    if (seen.has(key)) continue;
    if (!CATALOG.some((c) => c.type === type && c.id === id)) continue;
    seen.add(key);
    out.push({ type: type as CardRef["type"], id });
    if (out.length >= MAX_CARDS) break;
  }
  return out;
}

// Parses the model output ({reply, cards}); falls back to treating it as plain text.
export function parseModelOutput(text: string): { reply: string; cards: CardRef[] } {
  const stripped = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    const parsed = JSON.parse(stripped);
    if (parsed && typeof parsed.reply === "string") {
      return { reply: parsed.reply, cards: sanitizeCards(parsed.cards) };
    }
  } catch (_) {
    // not strict JSON; some models put raw newlines inside the reply string
    const m = stripped.match(/"reply"\s*:\s*"([\s\S]*)"\s*,\s*"cards"\s*:\s*(\[[\s\S]*?\])\s*\}\s*$/);
    if (m) {
      try {
        const reply = JSON.parse('"' + m[1].replace(/\r?\n/g, "\\n").replace(/\t/g, "\\t") + '"');
        return { reply, cards: sanitizeCards(JSON.parse(m[2])) };
      } catch (_) {
        // fall through to plain text
      }
    }
  }
  return { reply: text, cards: [] };
}

// Deterministic fallback: cards whose keywords appear in the user's question.
export function cardsFromMessage(message: string): CardRef[] {
  const text = ` ${message.toLowerCase().replace(/[^a-z0-9. ]+/g, " ")} `;
  const hits = CATALOG.map((c) => ({
    c,
    score: c.keywords.reduce(
      (n, k) => (text.includes(k.length <= 3 ? ` ${k} ` : k) ? n + k.length : n),
      0
    ),
  }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CARDS);
  return hits.map((h) => ({ type: h.c.type, id: h.c.id }));
}
