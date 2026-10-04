// Abuse guardrails for rag-chat: input cleaning, prompt-injection screening,
// output screening, visitor identification and a cheap in-memory rate limiter.

export const MAX_MESSAGE_CHARS = 500;

export const REFUSAL_REPLY =
  "I can only chat about my background, projects, research and experience. Ask me about any of those and I'm happy to dig in!";

// Strip control characters and collapse whitespace; null when unusable.
export function cleanMessage(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  // deno-lint-ignore no-control-regex
  const text = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
}

const INJECTION_PATTERNS: RegExp[] = [
  /\b(ignore|disregard|forget|override)\b.{0,40}\b(previous|prior|above|earlier|all|your)\b.{0,30}\b(instructions?|prompts?|rules?|guidelines?)\b/i,
  /\b(reveal|show|print|repeat|display|output|leak|tell me)\b.{0,40}\b(system|hidden|initial|original)\b.{0,20}\b(prompt|instructions?|message)\b/i,
  /\bsystem prompt\b/i,
  /\b(developer|debug|admin|god|dan)\s+mode\b/i,
  /\bjailbreak\b/i,
  /\byou are now\b.{0,40}\b(unrestricted|free|no rules|evil|dan)\b/i,
  /\bpretend (that )?you (have no|are not bound)/i,
];

export function looksLikeInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text));
}

const LEAK_MARKERS = [
  "Behavior Rules",
  "Draw strictly from the provided context",
  "Output format:",
  "systemInstruction",
  "Respond with ONLY a JSON object",
];
const SECRET_PATTERN = /\b(AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})/;
const MAX_REPLY_CHARS = 4000;

// Replace replies that leak the prompt or look like they contain a secret.
export function sanitizeReply(reply: string): string {
  if (LEAK_MARKERS.some((m) => reply.includes(m)) || SECRET_PATTERN.test(reply)) {
    return REFUSAL_REPLY;
  }
  return reply.length > MAX_REPLY_CHARS ? reply.slice(0, MAX_REPLY_CHARS) + "…" : reply;
}

// Client IP from proxy headers, or null when it cannot be determined.
// cf-connecting-ip is set by Cloudflare (client-supplied values are overwritten). For
// x-forwarded-for, entries on the left can be spoofed by the caller, so count from the right:
// TRUSTED_PROXY_HOPS (default 1) is how many proxies append to the header in front of this
// function. Too small a value can collapse all visitors onto a proxy's address; too large trusts
// spoofable entries - check the logged header shape (set IP_DEBUG=1) after deploying.
export function clientIp(req: Request): string | null {
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const parts = (req.headers.get("x-forwarded-for") ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const hops = Math.max(1, Number(Deno.env.get("TRUSTED_PROXY_HOPS") ?? "1") || 1);
  if (Deno.env.get("IP_DEBUG")) {
    console.log(`ip-debug: cf=${cf ? "yes" : "no"} xff_entries=${parts.length} hops=${hops}`);
  }
  if (parts.length > 0) return parts[Math.max(0, parts.length - hops)];
  return req.headers.get("x-real-ip")?.trim() || null;
}

// Read and parse a JSON body while enforcing a byte cap, even without a Content-Length header
// (chunked uploads would otherwise be read in full).
export async function readJsonCapped(
  req: Request,
  maxBytes: number
): Promise<{ ok: true; value: unknown } | { ok: false; tooLarge: boolean }> {
  const reader = req.body?.getReader();
  if (!reader) return { ok: false, tooLarge: false };
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return { ok: false, tooLarge: true };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch (_) {
    return { ok: false, tooLarge: false };
  }
}

// Anonymous visitor id generated in the browser; keep it short and charset-limited.
export function cleanClientId(raw: unknown): string | null {
  return typeof raw === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(raw) ? raw : null;
}

export async function hashIp(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Per-isolate limiter: always on, even before the database migration is applied.
const hits = new Map<string, number[]>();
export function memoryRetryAfter(key: string, limit = 8, windowMs = 60_000): number {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000));
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return 0;
}
