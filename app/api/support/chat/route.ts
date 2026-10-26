import { NextResponse } from "next/server";
import { clientIp, err, rateLimit, sanitize, requireUser } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateForPublish, type InvitationContent } from "@/lib/invitation";
import { cleanText, getOrCreateConversation, appendMessage, getRecentMessages } from "@/lib/support/tickets";
import { searchKnowledge } from "@/lib/support/knowledge-base";
import { buildSupportSystemPrompt } from "@/lib/support/prompt";
import { groqChat, groqModel, groqVisionModel, groqConfigured, visionAvailable } from "@/lib/support/groq";
import { validateSupportImage } from "@/lib/support/image";
import type { GroqContentPart, GroqMessage } from "@/lib/support/groq";
import type { SupportContext } from "@/lib/support/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_RE = /^[A-Za-z0-9-]{8,64}$/;
const MAX_MESSAGE = 2000;
const HISTORY_LIMIT = 10;
const KB_CHAR_BUDGET = 3000;

function normalizeContext(raw: unknown): SupportContext {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) =>
    typeof v === "string" ? sanitize(v, max) : undefined;
  const ctx: SupportContext = {};
  const path = str(o.path, 300);
  if (path) ctx.path = path;
  const templateSlug = str(o.templateSlug, 60);
  if (templateSlug) ctx.templateSlug = templateSlug;
  const editorStep = str(o.editorStep, 40);
  if (editorStep) ctx.editorStep = editorStep;
  const errorText = typeof o.errorText === "string" ? cleanText(o.errorText, 300) : undefined;
  if (errorText) ctx.errorText = errorText;
  if (typeof o.invitationId === "string" && o.invitationId.length <= 64) ctx.invitationId = o.invitationId;
  if (typeof o.saved === "boolean") ctx.saved = o.saved;
  return ctx;
}

/** Owner-only draft facts (never returns data for an invitation the caller doesn't own). */
async function invitationSummary(
  invitationId: string | undefined,
  userId: string | null
): Promise<string | undefined> {
  if (!invitationId || !userId) return undefined;
  const db = createAdminClient();
  const { data } = await db
    .from("invitations")
    .select("id, user_id, template_slug, status, content")
    .eq("id", invitationId)
    .eq("user_id", userId)
    .limit(1);
  if (!data || !data.length) return undefined;
  const inv = data[0] as { template_slug: string; status: string; content: InvitationContent | null };
  const content = inv.content;
  if (!content) return `Draft exists (design: ${inv.template_slug}, status: ${inv.status}) but no details are saved yet.`;
  const missing = validateForPublish(content);
  return [
    `Design: ${inv.template_slug}; status: ${inv.status}.`,
    content.weddingDate ? `Wedding date set: ${content.weddingDate}.` : "Wedding date: not set yet.",
    missing.length
      ? `Publish-blocking missing fields: ${missing.join(", ")}.`
      : "All publish-required fields are filled.",
  ].join(" ");
}

function kbSearch(query: string): ReturnType<typeof searchKnowledge> {
  const hits = searchKnowledge(query, 5);
  // Enforce the char budget so the prompt cannot grow unbounded.
  let used = 0;
  const kept = [];
  for (const h of hits) {
    const size = h.body.length + h.title.length;
    if (used + size > KB_CHAR_BUDGET && kept.length) break;
    used += size;
    kept.push(h);
  }
  return kept;
}

/** Honest degraded reply when the model/key is unavailable (tickets still work). */
function fallbackReply(userMessage: string): string {
  const hits = searchKnowledge(userMessage, 2);
  const head =
    "Our live AI assistant is temporarily unavailable, so I could not think through that fully — apologies.";
  if (hits.length) {
    const lines = hits.map((h) => `• ${h.title} (${h.id})`).join("\n");
    return `${head}\n\nFrom our help docs, these look relevant:\n${lines}\n\nYou can still tap **Report a bug** (the team will see it) or message us on WhatsApp from the Contact options.`;
  }
  return `${head}\n\nYou can tap **Report a bug** so the team can look into it, or use the Contact options for WhatsApp/email.`;
}

/**
 * POST /api/support/chat
 * Body: { message, sessionId, conversationId?, context?, image? (data-URL, optional) }
 * Returns: { ok, reply, conversationId, degraded?, visionUsed? }
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 15, 60_000) || !rateLimit(`${ip}:chat10`, 50, 600_000)) {
    return err("Too many messages. Please wait a minute and try again.", 429);
  }

  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  if (!SESSION_RE.test(sessionId)) return err("Invalid session.");
  if (!message) return err("Message cannot be empty.");
  if (message.length > MAX_MESSAGE) return err(`Message is too long (max ${MAX_MESSAGE} characters).`);

  const context = normalizeContext(body.context);

  // Optional inline image (chat images are analysed then discarded — only
  // bug-report screenshots are stored, and only with explicit consent).
  let imageDataUrl: string | null = null;
  let visionUsed = false;
  if (typeof body.image === "string" && body.image) {
    const checked = validateSupportImage(body.image);
    if ("error" in checked) return err(checked.error);
    if (!visionAvailable()) {
      // Honest: image cannot be analysed right now, text still works.
      imageDataUrl = null;
    } else {
      imageDataUrl = `data:${checked.mime};base64,${body.image.replace(/^data:[a-z0-9/+.-]+;base64,/i, "").replace(/\s+/g, "")}`;
      visionUsed = true;
    }
  }

  const user = await requireUser();

  let conversationId: string = typeof body.conversationId === "string" ? body.conversationId : "";
  try {
    const conv = await getOrCreateConversation({
      userId: user?.id ?? null,
      sessionId,
      route: context.path || "",
      invitationId: context.invitationId || null,
      templateSlug: context.templateSlug || null,
    });
    // Never trust a client-supplied conversation that isn't theirs — the
    // server always continues the caller's own conversation.
    conversationId = conv.id;
  } catch {
    return err("Could not open a support conversation. Please try again.", 500);
  }

  const history = await getRecentMessages(conversationId, HISTORY_LIMIT).catch(() => []);
  const invSummary = await invitationSummary(context.invitationId, user?.id ?? null);
  const systemPrompt = buildSupportSystemPrompt({
    hits: kbSearch(`${message} ${context.errorText || ""}`),
    context,
    invitationSummary: invSummary,
    visionUsed,
  });

  const historyMessages: GroqMessage[] = history.map((m) => ({ role: m.role, content: m.content }));
  const userParts: GroqContentPart[] = [{ type: "text", text: message }];
  if (imageDataUrl) userParts.push({ type: "image_url", image_url: { url: imageDataUrl } });

  const messages: GroqMessage[] = [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: imageDataUrl ? userParts : message },
  ];

  let reply: string;
  let degraded = false;
  if (!groqConfigured()) {
    reply = fallbackReply(message);
    degraded = true;
  } else {
    const res = await groqChat({
      messages,
      model: visionUsed ? groqVisionModel() : groqModel(),
      maxTokens: visionUsed ? 1400 : 900,
      timeoutMs: visionUsed ? 40_000 : 25_000,
    });
    if (res.ok && res.text) {
      reply = cleanText(res.text, 6000);
    } else {
      reply = fallbackReply(message);
      degraded = true;
    }
  }
  if (!reply) {
    reply = fallbackReply(message);
    degraded = true;
  }

  // Persist the exchange (best-effort — never fail the response over history).
  await appendMessage({ conversationId, role: "user", content: cleanText(message, MAX_MESSAGE) }).catch(
    () => undefined
  );
  await appendMessage({ conversationId, role: "assistant", content: reply }).catch(() => undefined);

  return NextResponse.json({ ok: true, reply, conversationId, degraded, visionUsed });
}

/** GET /api/support/chat?conversationId=…&sessionId=… — own history only. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const conversationId = url.searchParams.get("conversationId") || "";
  const sessionId = url.searchParams.get("sessionId") || "";
  if (!SESSION_RE.test(sessionId)) return err("Invalid session.");

  const db = createAdminClient();
  const { data } = await db
    .from("support_conversations")
    .select("id, user_id, session_id")
    .eq("id", conversationId)
    .limit(1);
  if (!data || !data.length) return NextResponse.json({ ok: true, messages: [] });
  const conv = data[0] as { id: string; user_id: string | null; session_id: string | null };

  const user = await requireUser();
  const owns =
    (user && conv.user_id === user.id) || (!!conv.session_id && conv.session_id === sessionId);
  if (!owns) return err("Not authorized.", 403);

  const messages = await getRecentMessages(conv.id, 30);
  return NextResponse.json({ ok: true, conversationId: conv.id, messages });
}
