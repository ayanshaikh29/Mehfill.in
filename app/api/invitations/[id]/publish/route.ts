import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { err, rateLimit, clientIp, requireUser } from "@/lib/api-helpers";
import { isValidContent, isProvisionalSlug, generateSlug } from "@/lib/invitation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 10)) return err("Too many requests.", 429);

  const user = await requireUser();
  if (!user?.id) return err("Please sign in.", 401);
  const { id } = await ctx.params;

  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!invitation) return err("Invitation not found.", 404);
  if (invitation.status === "deleted") return err("Invitation was deleted.", 410);

  // Payment requirement: an invitation can ONLY go live after verified payment.
  if (!invitation.order_id) {
    return err("Payment required. Please complete purchase before publishing your invitation.", 402);
  }

  const [{ data: order }, { data: upi }] = await Promise.all([
    admin.from("orders").select("id, status, user_id, user_email").eq("id", invitation.order_id).maybeSingle(),
    admin.from("upi_payments").select("id, status, user_email").eq("id", invitation.order_id).maybeSingle(),
  ]);

  // Strict ownership check: the payment record must belong to this user
  const orderBelongsToUser = Boolean(
    (order && (order.user_id === user.id || (user.email && order.user_email?.toLowerCase() === user.email.toLowerCase()))) ||
    (upi && user.email && upi.user_email?.toLowerCase() === user.email.toLowerCase())
  );

  if (!orderBelongsToUser) {
    return err("Payment verification mismatch. This order does not belong to your account.", 403);
  }

  // Explicit verified paid states
  const orderPaid = order?.status === "paid";
  const upiPaid = upi?.status === "paid" || upi?.status === "completed" || upi?.status === "verified";
  const isPaid = orderPaid || upiPaid;

  if (!isPaid) {
    const isUpiPending = upi?.status === "pending" || upi?.status === "pending_verification" || order?.status === "pending_verification";
    return err(
      isUpiPending
        ? "Your payment is currently being verified. Publishing unlocks once verified."
        : "Payment required. Please complete payment before publishing your invitation.",
      402
    );
  }

  if (!isValidContent(invitation.content)) {
    return err("Please complete all required details before publishing.", 400);
  }

  const c = invitation.content;
  if (!c.brideName || !c.groomName || !c.weddingDate || !c.venueName) {
    return err("Names, wedding date and venue are required to publish.", 400);
  }

  // Generate slug from couple names when missing OR still provisional
  // (e.g. invite-abc123 seeded at creation from account username).
  let slug: string = invitation.slug || "";
  if (!slug || isProvisionalSlug(slug)) {
    const { data: slugs } = await admin
      .from("invitations")
      .select("slug")
      .not("slug", "is", null)
      .neq("id", id);
    const taken = (slugs || []).map((s) => s.slug as string);
    slug = generateSlug(c.brideName, c.groomName, taken);
  }

  const { error } = await admin
    .from("invitations")
    .update({
      status: "published",
      slug,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return err("Could not publish. Please try again.", 500);

  return NextResponse.json({
    ok: true,
    slug,
    url: `https://mehfill.in/i/${slug}`,
  });
}
