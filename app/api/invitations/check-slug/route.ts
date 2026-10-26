import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, err, rateLimit, requireUser } from "@/lib/api-helpers";

export const runtime = "nodejs";

const RESERVED_SLUGS = new Set([
  "admin", "api", "auth", "checkout", "dashboard", "demos", "login",
  "privacy-policy", "terms-and-conditions", "templates", "studio",
  "digital-invitations", "wedding-invitations", "reviews", "contact",
  "about", "how-it-works", "refund-policy", "signed-out"
]);

export async function GET(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 60)) return err("Too many requests.", 429);

  // Slug probing is only for signed-in customers editing their invitation.
  const user = await requireUser();
  if (!user?.id) return err("Please sign in.", 401);

  const { searchParams } = new URL(request.url);
  const rawSlug = searchParams.get("slug") || "";
  const currentInvitationId = searchParams.get("invitationId") || "";

  // Normalize slug: lowercase, replace spaces/underscores with hyphens, remove non-alphanumeric except hyphen
  const slug = rawSlug
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!slug) {
    return NextResponse.json({ ok: false, available: false, error: "A custom invitation URL is required." });
  }

  if (slug.length < 3) {
    return NextResponse.json({ ok: false, available: false, error: "URL slug must be at least 3 characters." });
  }

  if (slug.length > 50) {
    return NextResponse.json({ ok: false, available: false, error: "URL slug must be under 50 characters." });
  }

  if (RESERVED_SLUGS.has(slug)) {
    return NextResponse.json({ ok: true, available: false, error: "This URL is reserved. Please choose another." });
  }

  const admin = createAdminClient();
  let query = admin
    .from("invitations")
    .select("id")
    .eq("slug", slug)
    .neq("status", "deleted");

  if (currentInvitationId) {
    query = query.neq("id", currentInvitationId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return err("Could not check URL availability.", 500);
  }

  const available = !data;

  return NextResponse.json({
    ok: true,
    slug,
    available,
    error: available ? null : "This URL is already taken. Please try another one.",
  });
}
