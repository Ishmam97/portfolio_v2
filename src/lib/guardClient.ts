// Client helpers for the guarded edge functions (rag-chat, send-contact-email).

// Anonymous per-browser id so the backend can apply an extra per-browser cap.
export const getClientId = (): string | undefined => {
  try {
    let id = localStorage.getItem("twin_client_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("twin_client_id", id);
    }
    return id;
  } catch {
    return undefined;
  }
};

const GUARD_CODES = ["rate_limited", "banned", "message_too_long", "payload_too_large", "invalid_request"];

// Guardrail rejections come back as non-2xx with a friendly `response`; null for any other error.
export const readGuardMessage = async (error: unknown): Promise<string | null> => {
  const res = (error as { context?: Response } | null)?.context;
  if (!res || typeof res.json !== "function") return null;
  try {
    const body = await res.json();
    return GUARD_CODES.includes(body?.error) && typeof body?.response === "string" ? body.response : null;
  } catch {
    return null;
  }
};
