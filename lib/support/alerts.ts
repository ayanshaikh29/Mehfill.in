// Owner alert policy + delivery for critical support incidents.
//
// Pure policy/content functions live here (unit-testable without network).
// Delivery uses the Resend HTTP API when configured (RESEND_API_KEY +
// SUPPORT_ALERT_EMAIL) — no SDK dependency. Status is ALWAYS returned to the
// caller so the DB records what actually happened; the UI never claims an
// alert was sent unless delivery returned ok.

import type { IssueCategory, Severity } from "./types";
import { CATEGORY_LABELS, SEVERITY_LABELS } from "./classify";

/* ────────────────────── Incident grouping (dedup) ─────────────────────── */

function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** Group similar reports: category + route + template + core keywords. */
export function incidentFingerprint(
  category: IssueCategory,
  route: string,
  templateSlug: string,
  text: string
): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 12)
    .sort();
  const core = `${category}|${route}|${templateSlug}|${words.join(" ")}`;
  return fnv1a(core);
}

export interface IncidentAlertState {
  alert_status: string | null;
  severity: Severity;
}

const ALERT_SEVERITY_RANK: Record<Severity, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

/**
 * Email policy:
 * - new incident → send
 * - same incident already sent → skip (no flood), UNLESS severity increased
 *   (escalation re-notifies)
 * - previous delivery failed / pending / provider-missing → retry
 */
export function shouldSendAlert(prev: IncidentAlertState, incoming: Severity): boolean {
  if (prev.alert_status === "sent") {
    // Only a STRICT escalation (lower P number) re-notifies.
    return ALERT_SEVERITY_RANK[incoming] < ALERT_SEVERITY_RANK[prev.severity];
  }
  return true; // pending | failed | skipped_* → (re)try
}

export function alertSkipReason(prev: IncidentAlertState): string | null {
  if (prev.alert_status === "sent") return "Severity unchanged for an already-notified incident.";
  return null;
}

/* ─────────────────────────── Email content ────────────────────────────── */

export interface AlertEmailInput {
  ticketRef: string;
  severity: Severity;
  category: IssueCategory;
  summary: string;
  description: string;
  route: string | null;
  templateSlug: string | null;
  reportCount: number;
  escalation: boolean;
  screenshotUrl: string | null;
  adminUrl: string;
  timestamp: string;
  suggestedSteps: string;
}

export function buildAlertEmail(input: AlertEmailInput): { subject: string; text: string; html: string } {
  const subject = `[${input.severity}] ${input.escalation ? "ESCALATION · " : ""}Mehfill support · ${input.ticketRef} · ${CATEGORY_LABELS[input.category]}`;
  const lines = [
    `${SEVERITY_LABELS[input.severity]}`,
    `Category: ${CATEGORY_LABELS[input.category]}`,
    `Ticket: ${input.ticketRef}`,
    `Time: ${input.timestamp}`,
    `Affected route: ${input.route || "unknown"}`,
    `Template: ${input.templateSlug || "unknown"}`,
    `Similar reports grouped: ${input.reportCount}`,
    ``,
    `Summary: ${input.summary}`,
    `Reported:`,
    input.description.replace(/\s+/g, " ").slice(0, 600),
    ``,
    `Suggested investigation: ${input.suggestedSteps}`,
    input.screenshotUrl ? `Screenshot (expiring link): ${input.screenshotUrl}` : `Screenshot: not provided`,
    `Admin: ${input.adminUrl}`,
    ``,
    `— sent by Mehfill.in support assistant (automated)`,
  ];
  const text = lines.join("\n");
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<div style="font-family:system-ui,sans-serif;font-size:14px;color:#24211d">
<h2 style="margin:0 0 8px">${esc(input.severity)} · ${esc(CATEGORY_LABELS[input.category])}${input.escalation ? " · ESCALATED" : ""}</h2>
<p style="margin:2px 0"><b>Ticket:</b> ${esc(input.ticketRef)} · <b>Time:</b> ${esc(input.timestamp)}</p>
<p style="margin:2px 0"><b>Route:</b> ${esc(input.route || "unknown")} · <b>Template:</b> ${esc(input.templateSlug || "unknown")} · <b>Grouped reports:</b> ${input.reportCount}</p>
<hr/>
<p><b>Summary:</b> ${esc(input.summary)}</p>
<p><b>Reported:</b><br/>${esc(input.description.slice(0, 600))}</p>
<p><b>Suggested investigation:</b> ${esc(input.suggestedSteps)}</p>
${input.screenshotUrl ? `<p><a href="${esc(input.screenshotUrl)}">Open screenshot</a> (expiring link)</p>` : ""}
<p><a href="${esc(input.adminUrl)}">Open admin issue dashboard</a></p>
<p style="color:#777">Automated alert — Mehfill.in support assistant</p>
</div>`;
  return { subject, text, html };
}

/* ───────────────────────────── Delivery ───────────────────────────────── */

export interface DeliveryResult {
  ok: boolean;
  status: "sent" | "skipped_no_provider" | "failed";
  error?: string;
}

export async function deliverOwnerAlert(email: {
  subject: string;
  text: string;
  html: string;
}): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.SUPPORT_ALERT_EMAIL;
  const from = process.env.SUPPORT_ALERT_FROM || "Mehfill Support <onboarding@resend.com>";
  if (!apiKey || !to) return { ok: false, status: "skipped_no_provider" };

  const body = JSON.stringify({
    from,
    to: [to],
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      let res: Response;
      try {
        res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      if (res.ok) return { ok: true, status: "sent" };
      const retryable = res.status === 429 || res.status >= 500;
      if (retryable && attempt === 0) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      const detail = (await res.text().catch(() => "")).slice(0, 200);
      return { ok: false, status: "failed", error: `HTTP ${res.status} ${detail}` };
    } catch (e) {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return { ok: false, status: "failed", error: e instanceof Error ? e.message.slice(0, 200) : "network error" };
    }
  }
  return { ok: false, status: "failed", error: "unreachable" };
}
