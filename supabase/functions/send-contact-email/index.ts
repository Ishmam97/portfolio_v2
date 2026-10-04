import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@3.4.0";
import {
  checkLimit,
  cleanClientId,
  clientIp,
  envInt,
  escapeHtml,
  hashIp,
  isValidEmail,
  memoryRetryAfter,
  readJsonCapped,
} from "../_shared/guard.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_BODY_BYTES = 8192;
const MAX_NAME = 80;
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;
const MIN_FILL_MS = 2500; // humans take longer than this to fill the form

// Control characters out, whitespace trimmed; newlines kept for the message body only.
// deno-lint-ignore no-control-regex
const clean = (v: unknown, keepNewlines = false): string =>
  typeof v === "string"
    ? v
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
        .replace(keepNewlines ? /[ \t]+/g : /\s+/g, " ")
        .trim()
    : "";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const respond = (status: number, payload: Record<string, unknown>, retryAfter?: number) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
      },
    });

  if (req.method !== "POST") {
    return respond(405, { error: "invalid_request", response: "Method not allowed." });
  }

  try {
    // Identity from headers only (hashed IP). If unknown, fall back to user-agent so visitors are
    // not lumped together, and also charge a shared bucket.
    const ip = clientIp(req);
    const salt = Deno.env.get("IP_HASH_SALT") ?? "rag-chat";
    const ipHash = await hashIp(
      ip ?? `anon:${req.headers.get("user-agent") ?? ""}|${req.headers.get("accept-language") ?? ""}`,
      salt
    );

    // Throttle before reading the body so junk requests count too.
    const wait = memoryRetryAfter(`contact:${ipHash}`, envInt("CONTACT_MEM_PER_MIN", 4));
    if (wait > 0) {
      return respond(429, { error: "rate_limited", response: `Too many attempts. Please wait ${wait}s and try again.` }, wait);
    }

    const parsed = await readJsonCapped(req, MAX_BODY_BYTES);
    if (!parsed.ok) {
      return respond(parsed.tooLarge ? 413 : 400, {
        error: parsed.tooLarge ? "payload_too_large" : "invalid_request",
        response: parsed.tooLarge ? "That message is too large." : "I couldn't read that message. Please try again.",
      });
    }
    const body = (parsed.value ?? {}) as Record<string, unknown>;

    // Bot traps: a hidden "website" field that humans never fill, and implausibly fast submits.
    // Pretend success so bots get no signal to adapt to.
    const filledTooFast = !(Number(body.elapsedMs) >= MIN_FILL_MS); // a missing value also counts as too fast
    if (clean(body.website) !== "" || filledTooFast) {
      console.warn(`Contact bot trap hit ip=${ipHash.slice(0, 12)}`);
      return respond(200, { success: true });
    }

    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    const message = clean(body.message, true);

    if (!name || !email || !message) {
      return respond(400, { error: "invalid_request", response: "Please fill in your name, email and message." });
    }
    if (name.length > MAX_NAME) {
      return respond(400, { error: "invalid_request", response: `Please keep your name under ${MAX_NAME} characters.` });
    }
    if (!isValidEmail(email)) {
      return respond(400, { error: "invalid_request", response: "Please enter a valid email address." });
    }
    if (message.length < MIN_MESSAGE || message.length > MAX_MESSAGE) {
      return respond(400, {
        error: "invalid_request",
        response: `Please write between ${MIN_MESSAGE} and ${MAX_MESSAGE} characters (yours was ${message.length}).`,
      });
    }
    // The confirmation email goes to whatever address was typed, so never to our own sender domain.
    if (/@resend\.dev$/i.test(email)) {
      return respond(400, { error: "invalid_request", response: "Please enter a valid email address." });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const clientId = cleanClientId(body.clientId);
    let blocked = await checkLimit(supabase, ipHash, clientId, "contact", {
      ipPerMin: envInt("CONTACT_IP_PER_MIN", 2),
      ipPerHour: envInt("CONTACT_IP_PER_HOUR", 4),
      ipPerDay: envInt("CONTACT_IP_PER_DAY", 8),
      clientPerHour: envInt("CONTACT_CLIENT_PER_HOUR", 4),
      globalPerDay: envInt("CONTACT_GLOBAL_PER_DAY", 100),
    });
    if (!blocked && !ip) {
      blocked = await checkLimit(supabase, await hashIp("anon-shared", salt), null, "contact_anon", {
        ipPerMin: 5,
        ipPerHour: 20,
        ipPerDay: 60,
      });
    }
    // Per-recipient cap stops the form being used to mail-bomb someone else's address.
    if (!blocked) {
      blocked = await checkLimit(supabase, `rcpt:${await hashIp(email, salt)}`, null, "contact_rcpt", {
        ipPerMin: 1,
        ipPerHour: envInt("CONTACT_RCPT_PER_HOUR", 2),
        ipPerDay: envInt("CONTACT_RCPT_PER_DAY", 3),
        globalPerDay: 1_000_000,
      });
    }
    if (blocked) {
      const retry = blocked.retry_after_seconds || 60;
      console.warn(`Contact rate limited (${blocked.reason}) ip=${ipHash.slice(0, 12)}`);
      const text =
        blocked.reason === "global_day"
          ? "The contact form has reached its daily limit. Please reach me through LinkedIn or GitHub instead."
          : `You've sent a few messages already. Please try again in ${retry > 90 ? Math.ceil(retry / 60) + " minutes" : retry + "s"}.`;
      return respond(429, { error: "rate_limited", response: text }, retry);
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    // Email to you
    await resend.emails.send({
      from: "Portfolio Contact Form <onboarding@resend.dev>",
      to: "ishmam.a.solaiman@gmail.com",
      replyTo: email,
      subject: `New message from ${name}`,
      html: `<p>You have a new message from your portfolio contact form.</p>
             <p><strong>Name:</strong> ${safeName}</p>
             <p><strong>Email:</strong> ${safeEmail}</p>
             <p><strong>Message:</strong></p>
             <p>${safeMessage}</p>`,
    });

    // Confirmation email to the sender (all user-supplied text escaped)
    await resend.emails.send({
      from: "Ishmam Solaiman <onboarding@resend.dev>",
      to: email,
      subject: "Thank you for your message!",
      html: `<p>Hi ${safeName},</p>
             <p>Thank you for reaching out. I have received your message and will get back to you as soon as possible.</p>
             <p>Best regards,<br>Ishmam Solaiman</p>`,
    });

    return respond(200, { success: true });
  } catch (error) {
    // Details stay in the logs; callers only get a generic failure.
    console.error("Error sending email:", error);
    return respond(500, { error: "send_failed", response: "Something went wrong sending your message. Please try again later." });
  }
});
