// Server-side Groq client for the support assistant.
//
// SECURITY: GROQ_API_KEY is read from a server-only env var — never exposed
// to the client bundle, logs, API responses or the database.
//
// Verified against Groq docs (console.groq.com/docs/vision):
//   - meta-llama/llama-4-scout-17b-16e-instruct — multimodal (text + images),
//     128K context, JSON mode, image input up to 5 images, base64 requests
//     ≤ 4MB. Default for BOTH chat and vision (override via env).
//   - meta-llama/llama-4-maverick-17b-128e-instruct — higher-quality vision
//     alternative (set GROQ_VISION_MODEL).
// Model ids are configured server-side ONLY — never hardcoded in the frontend.

export type GroqErrorCode =
  | "no_key"
  | "rate_limit"
  | "timeout"
  | "provider_error"
  | "bad_request"
  | "unavailable";

export interface GroqResult {
  ok: boolean;
  text?: string;
  code?: GroqErrorCode;
  /** HTTP status from Groq when available (for diagnostics, never secrets). */
  status?: number;
}

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string | GroqContentPart[];
}

export type GroqContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const DEFAULT_TIMEOUT_MS = 25_000;

export function groqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export function groqModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL;
}

/** Vision model — empty string explicitly disables image analysis. */
export function groqVisionModel(): string {
  if (process.env.GROQ_VISION_MODEL === "") return "";
  return process.env.GROQ_VISION_MODEL?.trim() || groqModel();
}

export function visionAvailable(): boolean {
  return groqConfigured() && Boolean(groqVisionModel());
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function once(
  body: string,
  timeoutMs: number
): Promise<{ status: number; json?: unknown; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body,
      signal: controller.signal,
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("abort")) return { status: 0, error: "timeout" };
    return { status: 0, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Single chat completion with ONE safe retry on 429/5xx/network failure.
 * Never retries indefinitely — cost and loops stay bounded.
 */
export async function groqChat(options: {
  messages: GroqMessage[];
  /** Defaults to groqModel(); pass groqVisionModel() for image requests. */
  model?: string;
  /** Cap completion tokens (default 900). */
  maxTokens?: number;
  /** JSON mode for structured classification (only for models that support it). */
  jsonMode?: boolean;
  timeoutMs?: number;
}): Promise<GroqResult> {
  if (!groqConfigured()) return { ok: false, code: "no_key" };

  const payload: Record<string, unknown> = {
    model: options.model || groqModel(),
    messages: options.messages,
    max_tokens: options.maxTokens ?? 900,
    temperature: 0.3,
  };
  if (options.jsonMode) payload.response_format = { type: "json_object" };
  const body = JSON.stringify(payload);
  const timeout = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let attempt = 0;
  for (;;) {
    const res = await once(body, timeout);
    if (res.error !== undefined) {
      // Network blip or timeout — one retry, then give up gracefully.
      if (attempt++ < 1) {
        await sleep(700);
        continue;
      }
      return { ok: false, code: res.error === "timeout" ? "timeout" : "provider_error" };
    }
    const status = res.status;
    const json = res.json;
    if (status >= 200 && status < 300) {
      const text =
        (json as { choices?: { message?: { content?: unknown } }[] })
          ?.choices?.[0]?.message?.content;
      if (typeof text === "string" && text.trim()) return { ok: true, text: text.trim() };
      return { ok: false, code: "provider_error", status };
    }
    if (status === 429 || (status >= 500 && status < 600)) {
      if (attempt++ < 1) {
        await sleep(status === 429 ? 1200 : 700);
        continue;
      }
      return { ok: false, code: status === 429 ? "rate_limit" : "provider_error", status };
    }
    if (status === 401 || status === 403) return { ok: false, code: "bad_request", status };
    return { ok: false, code: "provider_error", status };
  }
}
