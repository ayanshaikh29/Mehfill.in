import { NextResponse } from "next/server";
import { clientIp, err, rateLimit, requireUser } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanText, customerCanAccessTicket } from "@/lib/support/tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseId(params: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** GET /api/support/tickets/[id] — own ticket detail (summary + status only). */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ticketId = await parseId(params);
  if (!ticketId) return err("Invalid ticket.", 400);

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId") || "";
  const user = await requireUser();
  if (!(await customerCanAccessTicket(ticketId, user, sessionId))) {
    return err("Not authorized.", 403);
  }

  const db = createAdminClient();
  const { data } = await db
    .from("support_tickets")
    .select("id, ticket_ref, category, severity, status, description, ai_summary, created_at, updated_at, customer_notes, resolution_notes")
    .eq("id", ticketId)
    .limit(1);
  if (!data || !data.length) return err("Ticket not found.", 404);
  return NextResponse.json({ ok: true, ticket: data[0] });
}

/**
 * PATCH /api/support/tickets/[id] — customer follow-up note on OWN ticket.
 * Body: { note, sessionId }
 * Customers cannot change severity/category/status — that is admin-only.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = clientIp(request);
  if (!rateLimit(`${ip}:tnote`, 10, 600_000)) return err("Too many updates. Please wait.", 429);

  const ticketId = await parseId(params);
  if (!ticketId) return err("Invalid ticket.", 400);

  const body = await request.json().catch(() => ({}));
  const note = typeof body.note === "string" ? cleanText(body.note, 1000) : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  if (note.length < 2) return err("Note cannot be empty.");

  const user = await requireUser();
  if (!(await customerCanAccessTicket(ticketId, user, sessionId))) {
    return err("Not authorized.", 403);
  }

  const db = createAdminClient();
  const { data: existing } = await db
    .from("support_tickets")
    .select("customer_notes")
    .eq("id", ticketId)
    .limit(1);
  const current = (existing?.[0]?.customer_notes as string[] | undefined) || [];
  if (current.length >= 20) return err("Note limit reached for this ticket.", 400);

  const { error } = await db
    .from("support_tickets")
    .update({
      customer_notes: [...current, note],
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticketId);
  if (error) return err("Could not save your note.", 500);
  return NextResponse.json({ ok: true });
}
