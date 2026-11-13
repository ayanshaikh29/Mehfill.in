import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { err, rateLimit, clientIp, requireUser } from "@/lib/api-helpers";
import { defaultContent, provisionalSlug, type InvitationContent } from "@/lib/invitation";
import { getCatalogTemplate } from "@/lib/catalog";

export const runtime = "nodejs";

// Create a draft invitation from a PAID order the user owns.
// Razorpay verify route already does this; this endpoint covers
// manual-UPI orders once the owner marks them paid, and retries.
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 10)) return err("Too many requests.", 429);

  const user = await requireUser();
  if (!user?.id) return err("Please sign in to continue.", 401);

  let body: { orderId?: number; templateSlug?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const admin = createAdminClient();

  // The customer's explicit design selection is sacred — if it no longer
  // exists in the catalog, fail loudly instead of silently creating a
  // draft for a different (default) design.
  if (body.templateSlug && !getCatalogTemplate(body.templateSlug)) {
    return err("This design is no longer available. Please choose another design.", 400);
  }

  // Find a paid order without an invitation for this user.
  let order: { id: number; template_slug: string | null; package: string } | null = null;
  if (body.orderId) {
    const { data } = await admin
      .from("orders")
      .select("id, template_slug, package, status")
      .eq("id", body.orderId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (data && data.status === "paid") order = data;
  }
  if (!order) {
    const { data: paid } = await admin
      .from("orders")
      .select("id, template_slug, package")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    order = paid;
  }

  // Also allow manually-verified UPI payments linked by email.
  if (!order) {
    const { data: upi } = await admin
      .from("upi_payments")
      .select("id, template_slug, plan, status")
      .eq("user_email", user.email || "")
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (upi) {
      // Selection wins over the UPI record's template — the customer picked
      // THIS design on the dashboard just now (validated above).
      const upiTemplate = (upi.template_slug || "").split(",")[0];
      const pkg = String(upi.plan || "").includes("premium") ? "premium" : "basic";
      return createInvitation(user.id, upi.id, body.templateSlug || upiTemplate, pkg, admin);
    }
  }

  // If orderId or paid order is present, link it; otherwise create a free editable draft
  // so the user can complete the step-by-step editor and see their final preview before checkout!
  const targetTemplate = body.templateSlug || order?.template_slug || "royal-marigold";
  const targetPkg = order?.package || "basic";

  return createInvitation(
    user.id,
    order ? order.id : null,
    targetTemplate,
    targetPkg,
    admin
  );
}

async function createInvitation(
  userId: string,
  orderId: number | null,
  templateSlug: string,
  pkg: string,
  admin: ReturnType<typeof createAdminClient>
) {
  const template = getCatalogTemplate(templateSlug);
  const finalTemplate = template?.slug || "royal-marigold";

  const { data: slugs } = await admin
    .from("invitations")
    .select("slug")
    .not("slug", "is", null);
  const taken = (slugs || []).map((s) => s.slug as string);
  // Provisional slug only — publish regenerates from couple names.
  const slug = provisionalSlug(taken);

  const content: InvitationContent = defaultContent(finalTemplate);

  const { data, error } = await admin
    .from("invitations")
    .insert({
      user_id: userId,
      order_id: orderId,
      template_slug: finalTemplate,
      package: pkg === "premium" ? "premium" : "basic",
      slug,
      status: "draft",
      content,
      theme: {},
    })
    .select("id, slug, status")
    .single();
  if (error) return err("Could not create invitation. Please contact support.", 500);

  return NextResponse.json({ ok: true, invitationId: data.id, invitationSlug: data.slug });
}

// List the current user's invitations with verified payment status.
export async function GET() {
  const user = await requireUser();
  if (!user?.id) return err("Please sign in.", 401);

  const admin = createAdminClient();
  const [{ data: invitations }, { data: userOrders }, { data: userUpi }] = await Promise.all([
    admin
      .from("invitations")
      .select("id, template_slug, package, slug, status, content, published_at, created_at, updated_at, order_id")
      .eq("user_id", user.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false }),
    admin
      .from("orders")
      .select("id, status")
      .eq("user_id", user.id),
    user.email
      ? admin.from("upi_payments").select("id, status").eq("user_email", user.email)
      : Promise.resolve({ data: [] }),
  ]);

  const paidOrderIds = new Set<number>();
  for (const o of userOrders || []) {
    if (o.status === "paid") paidOrderIds.add(o.id);
  }
  for (const u of userUpi || []) {
    if (u.status === "paid" || u.status === "completed" || u.status === "verified") {
      paidOrderIds.add(u.id);
    }
  }

  const enriched = (invitations || []).map((inv) => ({
    ...inv,
    isPaid: Boolean(inv.order_id && paidOrderIds.has(inv.order_id)),
  }));

  return NextResponse.json({ ok: true, invitations: enriched });
}
