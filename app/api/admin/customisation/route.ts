import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const STATUSES = [
  "requested",
  "in_progress",
  "preview_ready",
  "revision_requested",
  "approved",
  "published",
  "cancelled",
];

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!isAdminEmail(data.user?.email)) return null;
  return createAdminClient();
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const { data } = await admin
    .from("customisation_requests")
    .select("*, invitations!inner(id, slug, status, template_slug, package, content)")
    .order("created_at", { ascending: false })
    .limit(200);

  return NextResponse.json({ ok: true, requests: data || [] });
}

// PATCH { id, status, adminNotes?, revisionCount?, maxRevisions? }
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { id, status, adminNotes, revisionCount, maxRevisions } = body;
  if (!id || !status || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (typeof adminNotes === "string") updates.admin_notes = adminNotes.slice(0, 2000);
  if (typeof revisionCount === "number") updates.revision_count = Math.max(0, revisionCount);
  if (typeof maxRevisions === "number") updates.max_revisions = Math.max(0, maxRevisions);

  const { error } = await admin
    .from("customisation_requests")
    .update(updates)
    .eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
