// Shared types for the Mehfill.in AI support assistant.

export type IssueCategory =
  | "question"
  | "howto"
  | "ui_minor"
  | "functional_bug"
  | "data_integrity"
  | "auth_security"
  | "payment"
  | "outage";

export type Severity = "P1" | "P2" | "P3" | "P4";

export type TicketStatus =
  | "open"
  | "investigating"
  | "waiting_customer"
  | "resolved"
  | "closed";

/** pending = queued, not_required = P3/P4 (no owner email), sent = delivered ok */
export type AlertStatus =
  | "pending"
  | "sent"
  | "failed"
  | "not_required"
  | "skipped_duplicate"
  | "skipped_no_provider";

/** Minimal, non-sensitive page context the chat widget may send. */
export interface SupportContext {
  path?: string;
  templateSlug?: string;
  editorStep?: string;
  invitationId?: string;
  saved?: boolean;
  errorText?: string;
}

/** Client-side editor context written to window.__MF_SUPPORT_CTX by the editor. */
export interface EditorSupportContext {
  route: string;
  invitationId?: string;
  templateSlug?: string;
  step?: string;
  saved?: boolean;
}

export interface TicketRow {
  id: number;
  ticket_ref: string;
  conversation_id: string | null;
  user_id: string | null;
  session_id: string | null;
  category: IssueCategory;
  severity: Severity;
  status: TicketStatus;
  route: string | null;
  template_slug: string | null;
  description: string;
  ai_summary: string | null;
  screenshot_path: string | null;
  incident_id: number | null;
  alert_status: AlertStatus | null;
  customer_notes: string[];
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}
