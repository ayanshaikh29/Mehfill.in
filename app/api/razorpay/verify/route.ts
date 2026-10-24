import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { err, rateLimit, clientIp, requireUser } from "@/lib/api-helpers";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { defaultContent, provisionalSlug } from "@/lib/invitation";
import { markCouponUsed } from "@/lib/coupons";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 15)) return err("Too many requests.", 429);

  const user = await requireUser();
  if (!user?.id || !user.email) return err("Please sign in to continue.", 401);

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    return err("Invalid request.");
  }

  // Support both snake_case (Razorpay standard response) and camelCase
  const razorpayOrderId = (body.razorpay_order_id || body.razorpayOrderId) as string | undefined;
  const razorpayPaymentId = (body.razorpay_payment_id || body.razorpayPaymentId) as string | undefined;
  const razorpaySignature = (body.razorpay_signature || body.razorpaySignature) as string | undefined;
  const invitationId = (body.invitation_id || body.invitationId) as string | undefined;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return err("Missing payment verification details.");
  }

  const valid = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });
  if (!valid) {
    return err("Payment signature verification failed.", 400);
  }

  const admin = createAdminClient();

  // Idempotent: find order by razorpay_order_id owned by this user.
  const { data: order, error: findErr } = await admin
    .from("orders")
    .select("*")
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (findErr || !order) return err("Order not found.", 404);

  // Already verified — return existing invitation if any (duplicate callback safe).
  if (order.status === "paid") {
    const { data: existing } = await admin
      .from("invitations")
      .select("id, slug, status")
      .eq("order_id", order.id)
      .maybeSingle();
    return NextResponse.json({
      ok: true,
      alreadyPaid: true,
      invitationId: existing?.id ?? null,
      invitationSlug: existing?.slug ?? null,
    });
  }

  if (order.status === "refunded" || order.status === "rejected") {
    return err("This order cannot be completed.", 400);
  }

  const { error: updErr } = await admin
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("status", "created"); // guard against races
  if (updErr) return err("Could not confirm payment.", 500);

  // Coupon usage counts only on successful payment.
  if (order.coupon_code) void markCouponUsed(order.coupon_code);

  // Create or link the invitation draft to the paid order.
  let resolvedInvitationId: string | null = null;
  let invitationSlug: string | null = null;

  if (invitationId) {
    const { data: updatedInvite } = await admin
      .from("invitations")
      .update({
        order_id: order.id,
        package: order.package || "basic",
        template_slug: order.template_slug || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId)
      .eq("user_id", user.id)
      .select("id, slug")
      .maybeSingle();

    if (updatedInvite) {
      resolvedInvitationId = updatedInvite.id;
      invitationSlug = updatedInvite.slug;
    } else {
      // If invitationId was passed but not found for this user, do not let it link
      console.warn(`[verify] invitation ${invitationId} not found for user ${user.id}`);
    }
  }

  if (!resolvedInvitationId) {
    const { data: existingInvite } = await admin
      .from("invitations")
      .select("id, slug")
      .eq("order_id", order.id)
      .maybeSingle();

    if (existingInvite) {
      resolvedInvitationId = existingInvite.id;
      invitationSlug = existingInvite.slug;
    } else {
      const { data: slugs } = await admin
        .from("invitations")
        .select("slug")
        .not("slug", "is", null);
      const taken = (slugs || []).map((s) => s.slug as string);
      // Provisional slug only — publish regenerates from couple names.
      const seed = provisionalSlug(taken);

      const { data: created, error: insErr } = await admin
        .from("invitations")
        .insert({
          user_id: user.id,
          order_id: order.id,
          template_slug: order.template_slug || "royal-marigold",
          package: order.package || "basic",
          slug: seed, // provisional unique slug; customer can keep it
          status: "draft",
          content: defaultContent(),
          theme: {},
        })
        .select("id, slug")
        .single();
      if (insErr) {
        console.error("[verify] invitation insert", insErr);
        // Payment is verified — don't fail the whole request.
      } else {
        resolvedInvitationId = created.id;
        invitationSlug = created.slug;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    orderId: order.id,
    invitationId: resolvedInvitationId,
    invitationSlug,
  });
}
