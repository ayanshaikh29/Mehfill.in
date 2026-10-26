import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText, setTicketStatus, signedScreenshotUrl } from "@/lib/support/tickets";
import type { TicketStatus } from "@/lib/support/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!isAdminEmail(data.user?.email)) return null;
  return createAdminClient();
}

const STATUSES: TicketStatus[] = ["open", "investigating", "waiting_customer", "resolved", "closed"];

async function parseId(params: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * GET /api/admin/support/tickets/[id]
 * Detail: ticket + conversation messages + short-lived signed screenshot URL.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const ticketId = await parseId(params);
  if (!ticketId) return NextResponse.json({ error: "Invalid ticket." }, { status: 400 });

  const { data: ticket } = await admin
    .from("support_tickets")
    .select("*")
    .eq("id", ticketId)
    .limit(1);
  if (!ticket || !ticket.length) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const row = ticket[0];

  let messages: unknown[] = [];
  if (row.conversation_id) {
    const { data: msgs } = await admin
      .from("support_messages")
      .select("role, content, image_path, created_at")
      .eq("conversation_id", row.conversation_id)
      .order("created_at", { ascending: true })
      .limit(100);
    messages = msgs || [];
  }

  const screenshotUrl = row.screenshot_path ? await signedScreenshotUrl(row.screenshot_path) : null;

  let incident = null;
  if (row.incident_id) {
    const { data: inc } = await admin
      .from("support_incidents")
      .select("id, fingerprint, severity, alert_status, alert_count, notified_at, first_ticket_at, last_ticket_at")
      .eq("id", row.incident_id)
      .limit(1);
    incident = inc?.[0] || null;
    if (incident) {
      const { data: siblings } = await admin
        .from("support_tickets")
        .select("id, ticket_ref, severity, status, created_at")
        .eq("incident_id", row.incident_id)
        .neq("id", ticketId)
        .order("created_at", { ascending: false })
        .limit(20);
      (incident as Record<string, unknown>).related_tickets = siblings || [];
    }
  }

  const { data: alertLog } = row.incident_id
    ? await admin
        .from("support_alerts")
        .select("id, status, subject, error, created_at")
        .eq("incident_id", row.incident_id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: null };

  return NextResponse.json({ ok: true, ticket: row, messages, screenshotUrl, incident, alertLog: alertLog || [] });
}

/**
 * PATCH /api/admin/support/tickets/[id]
 * Body: { status?, resolution_notes? }
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  const ticketId = await parseId(params);
  if (!ticketId) return NextResponse.json({ error: "Invalid ticket." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const status = typeof body.status === "string" ? (body.status as TicketStatus) : undefined;
  const notes = typeof body.resolution_notes === "string" ? cleanText(body.resolution_notes, 4000) : undefined;
  if (status && !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  if (!status && notes === undefined) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  try {
    await setTicketStatus(ticketId, status, notes);
  } catch {
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
