import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!isAdminEmail(data.user?.email)) return null;
  return createAdminClient();
}

// GET /api/admin/invitations — list all invitations with owner emails.
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const { data: invitations } = await admin
    .from("invitations")
    .select("id, user_id, order_id, template_slug, package, slug, status, published_at, created_at, updated_at, content")
    .neq("status", "deleted")
    .order("created_at", { ascending: false })
    .limit(200);

  // Enrich with owner email.
  const userIds = [...new Set((invitations || []).map((i) => i.user_id))];
  let emailMap = new Map<string, string>();
  if (userIds.length) {
    const { data: users } = await admin.auth.admin.listUsers();
    emailMap = new Map(
      (users?.users || [])
        .filter((u) => userIds.includes(u.id))
        .map((u) => [u.id, u.email || ""])
    );
  }

  const rows = (invitations || []).map((i) => {
    const c = (i.content || {}) as Record<string, unknown>;
    return {
      ...i,
      owner_email: emailMap.get(i.user_id) || null,
      bride: typeof c.brideName === "string" ? c.brideName : "",
      groom: typeof c.groomName === "string" ? c.groomName : "",
      wedding_date: typeof c.weddingDate === "string" ? c.weddingDate : "",
    };
  });

  return NextResponse.json({ ok: true, invitations: rows });
}

// PATCH /api/admin/invitations { id, action: "publish" | "unpublish" | "suspend" }
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const { id, action } = await request.json().catch(() => ({}));
  if (!id || !["publish", "unpublish", "suspend"].includes(action)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const status =
    action === "publish" ? "published" : action === "suspend" ? "suspended" : "draft";

  const { error } = await admin
    .from("invitations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
