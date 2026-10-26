import { NextResponse } from "next/server";
import { clientIp, err, rateLimit, requireUser } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText, createTicket, getOrCreateConversation } from "@/lib/support/tickets";
import { validateSupportImage } from "@/lib/support/image";
import type { AlertStatus } from "@/lib/support/types";
import type { SupportContext } from "@/lib/support/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_RE = /^[A-Za-z0-9-]{8,64}$/;

/** Honest, non-technical copy for what happened with owner notification. */
function alertMessage(status: AlertStatus): string {
  switch (status) {
    case "sent":
      return "Ticket created — the Mehfill team has been notified immediately.";
    case "failed":
      return "Ticket created — it's queued for the team (instant notification had a hiccup).";
    case "pending":
    case "skipped_no_provider":
      return "Ticket created — it's queued for the team's review.";
    case "skipped_duplicate":
      return "Ticket created — this matches an issue the team is already tracking.";
    default:
      return "Ticket created — the team will review it.";
  }
}

function normalizeContext(raw: unknown): SupportContext {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[<>"]/g, "").slice(0, max).trim() : undefined);
  const ctx: SupportContext = {};
  const path = str(o.path, 300);
  if (path) ctx.path = path;
  const templateSlug = str(o.templateSlug, 60);
  if (templateSlug) ctx.templateSlug = templateSlug;
  const editorStep = str(o.editorStep, 40);
  if (editorStep) ctx.editorStep = editorStep;
  if (typeof o.invitationId === "string" && o.invitationId.length <= 64) ctx.invitationId = o.invitationId;
  return ctx;
}

/**
 * POST /api/support/tickets
 * Body: { description, sessionId, context?, conversationId?, image?, attachScreenshot? }
 * Classification happens SERVER-SIDE (rules first); client severity is ignored.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 5, 600_000)) return err("Too many tickets. Please wait a while before reporting again.", 429);

  const body = await request.json().catch(() => ({}));
  const description = typeof body.description === "string" ? body.description : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  if (!SESSION_RE.test(sessionId)) return err("Invalid session.");
  if (cleanText(description, 4000).length < 8) {
    return err("Please describe the problem in at least a sentence or two.");
  }

  const context = normalizeContext(body.context);

  // Screenshot: ONLY when the customer explicitly attached one (consent is
  // the attach action itself) and it passes magic-byte validation.
  let screenshot: { bytes: Buffer; mime: string } | null = null;
  if (typeof body.image === "string" && body.image && body.attachScreenshot !== false) {
    const checked = validateSupportImage(body.image);
    if ("error" in checked) return err(checked.error);
    screenshot = { bytes: checked.bytes, mime: checked.mime };
  }

  const user = await requireUser();
  let conversationId: string | null = typeof body.conversationId === "string" ? body.conversationId : null;
  try {
    const conv = await getOrCreateConversation({
      userId: user?.id ?? null,
      sessionId,
      route: context.path || "",
      invitationId: context.invitationId || null,
      templateSlug: context.templateSlug || null,
    });
    conversationId = conv.id;
  } catch {
    conversationId = null;
  }

  try {
    const result = await createTicket({
      conversationId,
      userId: user?.id ?? null,
      sessionId,
      description,
      screenshot,
      context,
    });
    return NextResponse.json({
      ok: true,
      ...result,
      message: alertMessage(result.alert_status),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ticket creation failed.";
    return err(msg.includes("at least") ? msg : "Could not create the ticket. Please try again.", 400);
  }
}

/** GET /api/support/tickets?sessionId=… — the caller's own tickets. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId") || "";
  if (!SESSION_RE.test(sessionId)) return err("Invalid session.");

  const user = await requireUser();
  const db = createAdminClient();
  let query = db
    .from("support_tickets")
    .select("id, ticket_ref, category, severity, status, alert_status, ai_summary, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (user) query = query.eq("user_id", user.id);
  else query = query.eq("session_id", sessionId);
  const { data } = await query;
  return NextResponse.json({ ok: true, tickets: data || [] });
}
