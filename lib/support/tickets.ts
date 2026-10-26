// Server-side services for support conversations, tickets, screenshots and
// owner alerts. Everything here runs in API routes behind either an
// authenticated user or a session binding — nothing is exposed to the browser.

import { createAdminClient } from "@/lib/supabase/admin";
import type { AlertStatus, IssueCategory, Severity, TicketStatus } from "./types";
import { classifyIssue } from "./classify";
import {
  alertSkipReason,
  buildAlertEmail,
  deliverOwnerAlert,
  incidentFingerprint,
  shouldSendAlert,
} from "./alerts";

const BUCKET = "support-screenshots";

/* ─────────────────────────── helpers ─────────────────────────── */

/** Trimmed text safe for DB storage (control chars removed; rendered as text). */
export function cleanText(input: string, maxLen: number): string {
  return input
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLen);
}

/** MF-YY-XXXXXX (year + 6 unambiguous chars). */
export function makeTicketRef(d = new Date()): string {
  const yy = String(d.getFullYear() % 100).padStart(2, "0");
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256);
  for (let i = 0; i < 6; i++) suffix += alphabet[bytes[i] % alphabet.length];
  return `MF-${yy}-${suffix}`;
}

const RETRYABLE_PG_CODES = new Set(["23505"]); // unique_violation

async function withUniqueRetry<T>(fn: () => Promise<T>, attempts = 5): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code && RETRYABLE_PG_CODES.has(code)) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

export interface ConversationRow {
  id: string;
  user_id: string | null;
  session_id: string | null;
}

export async function getOrCreateConversation(params: {
  userId: string | null;
  sessionId: string;
  route?: string;
  invitationId?: string | null;
  templateSlug?: string | null;
}): Promise<ConversationRow> {
  const db = createAdminClient();
  const { userId, sessionId } = params;

  // Prefer the user's latest conversation (auth wins over session reuse).
  if (userId) {
    const { data: mine } = await db
      .from("support_conversations")
      .select("id, user_id, session_id, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1);
    if (mine && mine.length) return mine[0] as ConversationRow;
  }
  const { data: bySession } = await db
    .from("support_conversations")
    .select("id, user_id, session_id, updated_at")
    .eq("session_id", sessionId)
    .order("updated_at", { ascending: false })
    .limit(1);
  if (bySession && bySession.length) {
    const row = bySession[0] as ConversationRow & { user_id: string | null };
    // Anonymous session later opened by a logged-in user → attach the user.
    if (userId && !row.user_id) {
      await db.from("support_conversations").update({ user_id: userId }).eq("id", row.id);
      row.user_id = userId;
    }
    return row;
  }

  const { data: created, error } = await db
    .from("support_conversations")
    .insert({
      user_id: userId,
      session_id: sessionId,
      route: params.route || "",
      invitation_id: params.invitationId || null,
      template_slug: params.templateSlug || null,
    })
    .select("id, user_id, session_id")
    .single();
  if (error || !created) throw new Error(`conversation create failed: ${error?.message}`);
  return created as ConversationRow;
}

export async function appendMessage(params: {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  imagePath?: string | null;
}): Promise<void> {
  const db = createAdminClient();
  const { error } = await db.from("support_messages").insert({
    conversation_id: params.conversationId,
    role: params.role,
    content: params.content,
    image_path: params.imagePath || null,
  });
  if (error) throw new Error(`message insert failed: ${error.message}`);
  await db
    .from("support_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", params.conversationId);
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function getRecentMessages(
  conversationId: string,
  limit = 10
): Promise<HistoryMessage[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("support_messages")
    .select("role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (data || []).reverse() as { role: string; content: string }[];
  return rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content }));
}

/* ─────────────────────────── screenshots ─────────────────────── */

/** Upload to the PRIVATE bucket. Path: {ticketRef|convId}/{ts}-{n}.{ext} */
export async function storeScreenshot(params: {
  bytes: Buffer;
  mime: string;
  folder: string;
}): Promise<{ path: string } | { error: string }> {
  const db = createAdminClient();
  const ext = params.mime === "image/png" ? "png" : params.mime === "image/webp" ? "webp" : "jpg";
  const path = `${params.folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await db.storage.from(BUCKET).upload(path, params.bytes, {
    contentType: params.mime,
    upsert: false,
  });
  if (error) return { error: error.message };
  return { path };
}

/** Short-lived signed URL (admin views only — bucket stays private). */
export async function signedScreenshotUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const db = createAdminClient();
  const { data, error } = await db.storage.from(BUCKET).createSignedUrl(path, 600);
  if (error) return null;
  return data.signedUrl;
}

/* ─────────────────────────── incidents + alerts ──────────────── */

interface IncidentRow {
  id: number;
  fingerprint: string;
  category: string;
  severity: Severity;
  alert_status: AlertStatus;
  alert_count: number;
}

const P_LEVEL: Record<Severity, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

/**
 * Group the report into an incident and apply owner-alert policy:
 *   - P1/P2: email owner on FIRST report, re-email only on severity escalation,
 *     retry when previous delivery failed/pending.
 *   - P3/P4: never emailed (alert_status = not_required) — they are visible in
 *     the admin dashboard queue.
 * NEVER claims "sent" unless Resend returned ok.
 */
export async function attachIncidentAndAlert(params: {
  ticketId: number;
  ticketRef: string;
  category: IssueCategory;
  severity: Severity;
  route: string | null;
  templateSlug: string | null;
  description: string;
  aiSummary: string;
  screenshotPath: string | null;
  reportCount: number;
}): Promise<AlertStatus> {
  const db = createAdminClient();
  const fp = incidentFingerprint(params.category, params.route || "", params.templateSlug || "", params.description);

  // Find-or-create the incident (unique fingerprint; retry on race).
  const incident = await (async (): Promise<IncidentRow | null> => {
    for (let i = 0; i < 3; i++) {
      const { data: existing } = await db
        .from("support_incidents")
        .select("id, fingerprint, category, severity, alert_status, alert_count")
        .eq("fingerprint", fp)
        .limit(1);
      if (existing && existing.length) return existing[0] as IncidentRow;
      const { data: inserted, error } = await db
        .from("support_incidents")
        .insert({ fingerprint: fp, category: params.category, severity: params.severity })
        .select("id, fingerprint, category, severity, alert_status, alert_count");
      if (!error && inserted && inserted.length) return inserted[0] as IncidentRow;
      if (error && !RETRYABLE_PG_CODES.has(error.code || "")) return null;
    }
    return null;
  })();

  if (!incident) {
    // Incident tracking unavailable — tickets still work, alert = pending.
    await db.from("support_tickets").update({ alert_status: "pending" }).eq("id", params.ticketId);
    return "pending";
  }

  // Incident severity = max seen (never downgrade).
  const incomingWorse = P_LEVEL[params.severity] < P_LEVEL[incident.severity];
  let alertStatus: AlertStatus;

  if (params.severity === "P3" || params.severity === "P4") {
    // Cosmetic / question tickets: visible in the admin queue, no owner email.
    alertStatus = "not_required";
    await db.from("support_alerts").insert({
      incident_id: incident.id,
      ticket_id: params.ticketId,
      severity: params.severity,
      status: "not_required",
      subject: `No alert needed (P3/P4) ${fp}`,
    });
    await db
      .from("support_incidents")
      .update({ alert_count: incident.alert_count + 1, last_ticket_at: new Date().toISOString() })
      .eq("id", incident.id);
  } else {
    const prev: { alert_status: AlertStatus; severity: Severity } = {
      alert_status: incident.alert_status,
      severity: incident.severity,
    };
    if (!shouldSendAlert(prev, params.severity)) {
      alertStatus = "skipped_duplicate";
      await db.from("support_alerts").insert({
        incident_id: incident.id,
        ticket_id: params.ticketId,
        severity: params.severity,
        status: "skipped_duplicate",
        subject: `Duplicate incident ${fp}`,
        error: alertSkipReason(prev),
      });
    } else {
      // Escalation only when this incident was already emailed at a LOWER
      // severity and the new report is more severe.
      const escalation = prev.alert_status === "sent" && P_LEVEL[params.severity] < P_LEVEL[prev.severity];
      const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://mehfill.in"}/admin/support?ref=${encodeURIComponent(params.ticketRef)}`;
      const screenshotUrl = params.screenshotPath ? await signedScreenshotUrl(params.screenshotPath) : null;
      const email = buildAlertEmail({
        ticketRef: params.ticketRef,
        severity: params.severity,
        category: params.category,
        summary: params.aiSummary.slice(0, 200),
        description: params.description,
        route: params.route,
        templateSlug: params.templateSlug,
        reportCount: params.reportCount,
        escalation,
        screenshotUrl,
        adminUrl,
        timestamp: new Date().toISOString(),
        suggestedSteps: suggestedInvestigation(params.category),
      });
      const delivery = await deliverOwnerAlert(email);
      alertStatus =
        delivery.status === "sent"
          ? "sent"
          : delivery.status === "skipped_no_provider"
            ? "skipped_no_provider"
            : "failed";
      await db.from("support_alerts").insert({
        incident_id: incident.id,
        ticket_id: params.ticketId,
        severity: params.severity,
        status: alertStatus,
        subject: email.subject.slice(0, 300),
        error: delivery.error || null,
      });
    }
    await db
      .from("support_incidents")
      .update({
        ...(incomingWorse ? { severity: params.severity } : {}),
        alert_status: alertStatus,
        alert_count: incident.alert_count + 1,
        ...(alertStatus === "sent" ? { notified_at: new Date().toISOString() } : {}),
        last_ticket_at: new Date().toISOString(),
      })
      .eq("id", incident.id);
  }

  await db.from("support_tickets").update({ incident_id: incident.id, alert_status: alertStatus }).eq("id", params.ticketId);
  return alertStatus;
}

function suggestedInvestigation(category: IssueCategory): string {
  switch (category) {
    case "payment":
      return "Check /api/admin orders + upi_payments for the Txn ID; verify order state vs publish gate; confirm Razorpay webhook/checkout logs.";
    case "data_integrity":
      return "Inspect invitation row (updated_at vs last editor save); check autosave PATCH logs; confirm no status rewrite on save.";
    case "auth_security":
      return "Check Supabase auth logs for the user; review RLS policies (003 migration); rotate keys if exposure suspected.";
    case "outage":
      return "Check Vercel/host logs and Supabase health; confirm /api/invitations GET status codes; consider status page note.";
    case "functional_bug":
      return "Reproduce on the reported route with the referenced template slug; compare personalize.ts token mapping; attach to the release checklist.";
    default:
      return "Reproduce with the customer's route/template context; reply on the ticket if more detail is needed.";
  }
}

/* ─────────────────────────── ticket creation ─────────────────── */

export interface CreateTicketInput {
  conversationId: string | null;
  userId: string | null;
  sessionId: string;
  description: string;
  /** True only if the user explicitly attached a screenshot. */
  screenshot?: { bytes: Buffer; mime: string } | null;
  context: { route?: string; templateSlug?: string; invitationId?: string; step?: string };
}

export interface CreateTicketResult {
  ticket_ref: string;
  category: IssueCategory;
  severity: Severity;
  alert_status: AlertStatus;
}

export async function createTicket(input: CreateTicketInput): Promise<CreateTicketResult> {
  const description = cleanText(input.description, 4000);
  if (description.length < 8) throw new Error("Please describe the problem in a bit more detail.");

  const classification = await classifyIssue(description);

  // One-line summary for owner alerts (AI when available; honest fallback).
  let summary = description.replace(/\s+/g, " ").slice(0, 200);
  const { groqChat } = await import("./groq");
  if (classification.severity !== "P4") {
    const res = await groqChat({
      maxTokens: 60,
      timeoutMs: 10_000,
      messages: [
        {
          role: "system",
          content: "Summarize this customer bug report in ONE plain sentence (max 25 words). Reply with the sentence only.",
        },
        { role: "user", content: description.slice(0, 600) },
      ],
    });
    if (res.ok && res.text) summary = cleanText(res.text, 200) || summary;
  }

  const ticketRef = makeTicketRef();
  const db = createAdminClient();

  let screenshotPath: string | null = null;
  if (input.screenshot) {
    const up = await storeScreenshot({
      bytes: input.screenshot.bytes,
      mime: input.screenshot.mime,
      folder: ticketRef,
    });
    if ("path" in up) screenshotPath = up.path;
  }

  const ticketId = await withUniqueRetry(async () => {
    const ref = makeTicketRef();
    const { data, error } = await db
      .from("support_tickets")
      .insert({
        ticket_ref: ref === ticketRef ? ticketRef : ref,
        conversation_id: input.conversationId,
        user_id: input.userId,
        session_id: input.sessionId,
        category: classification.category,
        severity: classification.severity,
        status: "open",
        route: cleanText(input.context.route || "", 300) || null,
        template_slug: cleanText(input.context.templateSlug || "", 60) || null,
        description,
        ai_summary: summary,
        screenshot_path: screenshotPath,
        customer_notes: input.context.step ? [`Editor step: ${input.context.step}`] : [],
      })
      .select("id, ticket_ref")
      .single();
    if (error) throw error;
    return (data as { id: number; ticket_ref: string }).id;
  });

  const alertStatus = await attachIncidentAndAlert({
    ticketId,
    ticketRef,
    category: classification.category,
    severity: classification.severity,
    route: input.context.route || null,
    templateSlug: input.context.templateSlug || null,
    description,
    aiSummary: summary,
    screenshotPath,
    reportCount: 1,
  });

  const { data: finalRow } = await db
    .from("support_tickets")
    .select("ticket_ref, category, severity, alert_status")
    .eq("id", ticketId)
    .single();

  return {
    ticket_ref: (finalRow as { ticket_ref: string })?.ticket_ref || ticketRef,
    category: (finalRow as { category: IssueCategory })?.category || classification.category,
    severity: (finalRow as { severity: Severity })?.severity || classification.severity,
    alert_status: (finalRow as { alert_status: AlertStatus })?.alert_status || alertStatus,
  };
}

/* ─────────────────────────── ownership ───────────────────────── */

/**
 * A customer may read/append to a ticket only if:
 *   - it belongs to their auth user, OR
 *   - it was created with their same anonymous session id.
 * No auth context → empty string (never match any ticket).
 */
export async function customerCanAccessTicket(
  ticketId: number,
  user: { id: string } | null,
  sessionId: string
): Promise<boolean> {
  if (!user && !sessionId) return false;
  const db = createAdminClient();
  const { data } = await db
    .from("support_tickets")
    .select("id, user_id, session_id")
    .eq("id", ticketId)
    .limit(1);
  if (!data || !data.length) return false;
  const t = data[0] as { user_id: string | null; session_id: string | null };
  if (user && t.user_id === user.id) return true;
  if (sessionId && t.session_id && t.session_id === sessionId) return true;
  return false;
}

export async function setTicketStatus(
  ticketId: number,
  status: TicketStatus | undefined,
  resolutionNotes?: string | null
): Promise<void> {
  const db = createAdminClient();
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) patch.status = status;
  if (resolutionNotes !== undefined) patch.resolution_notes = resolutionNotes;
  await db.from("support_tickets").update(patch).eq("id", ticketId);
}
