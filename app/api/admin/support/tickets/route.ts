import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!isAdminEmail(data.user?.email)) return null;
  return createAdminClient();
}

const STATUSES = ["open", "investigating", "waiting_customer", "resolved", "closed"] as const;
const SEVERITIES = ["P1", "P2", "P3", "P4"] as const;

/**
 * GET /api/admin/support/tickets
 * Query: status, severity, q (ticket ref / text search), limit.
 */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const severity = url.searchParams.get("severity");
  const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 200);

  let query = admin
    .from("support_tickets")
    .select("id, ticket_ref, category, severity, status, route, template_slug, description, ai_summary, screenshot_path, alert_status, incident_id, created_at, updated_at")
    .order("severity", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status && (STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  if (severity && (SEVERITIES as readonly string[]).includes(severity)) query = query.eq("severity", severity);
  if (q) {
    if (/^MF-/i.test(q)) query = query.ilike("ticket_ref", `%${q.toUpperCase()}%`);
    else query = query.or(`description.ilike.%${q}%,ai_summary.ilike.%${q}%,route.ilike.%${q}%`);
  }

  const { data: tickets, error } = await query;
  if (error) return NextResponse.json({ error: "Query failed." }, { status: 500 });

  // Incident grouping info for the list.
  const incidentIds = [...new Set((tickets || []).map((t) => t.incident_id).filter(Boolean))] as number[];
  const incidentMap = new Map<number, { id: number; severity: string; alert_status: string; alert_count: number }>();
  if (incidentIds.length) {
    const { data: incidents } = await admin
      .from("support_incidents")
      .select("id, severity, alert_status, alert_count")
      .in("id", incidentIds);
    for (const inc of incidents || []) incidentMap.set(inc.id, inc);
  }

  const rows = (tickets || []).map((t) => ({
    ...t,
    incident: t.incident_id ? incidentMap.get(t.incident_id) || null : null,
  }));

  return NextResponse.json({ ok: true, tickets: rows });
}
