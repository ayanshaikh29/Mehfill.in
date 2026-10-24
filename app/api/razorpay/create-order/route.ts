import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { err, rateLimit, clientIp, requireUser } from "@/lib/api-helpers";
import { createRazorpayOrder, isRazorpayConfigured } from "@/lib/razorpay";
import { getPlan, formatINR } from "@/lib/plans";
import { getCatalogTemplate } from "@/lib/catalog";
import { validateCoupon, markCouponUsed } from "@/lib/coupons";
import { defaultContent, provisionalSlug } from "@/lib/invitation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 10)) return err("Too many requests. Try again in a minute.", 429);

  const user = await requireUser();
  if (!user?.id || !user.email) {
    return err("Please sign in to continue.", 401);
  }

  let body: { packageId?: string; templateSlug?: string; couponCode?: string; invitationId?: string };
  try {
    body = await request.json();
  } catch {
    return err("Invalid request body.");
  }

  const plan = getPlan(body.packageId || "");
  const template = getCatalogTemplate(body.templateSlug || "");
  if (!plan) return err("Unknown package.");
  if (!template) return err("Unknown design.");

  const admin = createAdminClient();

  // If invitationId was passed, verify that the current user owns it
  if (body.invitationId) {
    const { data: inv } = await admin
      .from("invitations")
      .select("id, user_id")
      .eq("id", body.invitationId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!inv) {
      return err("Invitation not found or unauthorized.", 404);
    }
  }

  // Server-side coupon validation — never trust client-supplied discounts.
  let discount = 0;
  let couponCode: string | null = null;
  if (body.couponCode?.trim()) {
    const result = await validateCoupon(body.couponCode, plan.price);
    if (!result.ok || !result.coupon) {
      return err(result.error || "Invalid coupon.", 400);
    }
    discount = result.coupon.discountAmount;
    couponCode = result.coupon.code;
  }
  const payable = Math.max(0, plan.price - discount);

  // 100% discount — nothing to charge. Razorpay rejects zero-amount orders,
  // so fulfil the order (and draft invitation) directly instead of calling it.
  if (payable <= 0) {
    const { data: order, error: insertErr } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        user_email: user.email,
        plan: plan.name.toLowerCase(),
        package: plan.id,
        template_slug: template.slug,
        amount: 0,
        amount_paise: 0,
        currency: "INR",
        status: "paid",
        payment_method: "discount",
        coupon_code: couponCode,
        discount,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (insertErr || !order) {
      console.error("[razorpay/create-order] free order insert", insertErr);
      return err("Could not create your order. Please try again.", 500);
    }

    if (couponCode) void markCouponUsed(couponCode);

    let finalInvitationId = body.invitationId || null;
    let finalSlug: string | null = null;

    if (body.invitationId) {
      const { data: updatedInvite } = await admin
        .from("invitations")
        .update({
          order_id: order.id,
          package: plan.id,
          template_slug: template.slug,
          updated_at: new Date().toISOString(),
        })
        .eq("id", body.invitationId)
        .eq("user_id", user.id)
        .select("id, slug")
        .maybeSingle();

      if (updatedInvite) {
        finalInvitationId = updatedInvite.id;
        finalSlug = updatedInvite.slug;
      }
    }

    if (!finalInvitationId) {
      const { data: slugs } = await admin.from("invitations").select("slug").not("slug", "is", null);
      const taken = (slugs || []).map((s) => s.slug as string);
      // Provisional slug only — publish regenerates from couple names.
      const slug = provisionalSlug(taken);

      const { data: created, error: insInviteErr } = await admin
        .from("invitations")
        .insert({
          user_id: user.id,
          order_id: order.id,
          template_slug: template.slug,
          package: plan.id,
          slug,
          status: "draft",
          content: defaultContent(),
          theme: {},
        })
        .select("id, slug")
        .single();
      if (insInviteErr) console.error("[razorpay/create-order] free invitation insert", insInviteErr);
      finalInvitationId = created?.id ?? null;
      finalSlug = created?.slug ?? slug;
    }

    return NextResponse.json({
      ok: true,
      free: true,
      amountPaise: 0,
      invitationId: finalInvitationId,
      invitationSlug: finalSlug,
    });
  }

  if (!isRazorpayConfigured()) {
    return err("Online payments are not enabled yet. Please contact support.", 503);
  }

  try {
    const order = await createRazorpayOrder({
      amountRupees: payable,
      receipt: `meh_${Date.now().toString(36)}`,
      notes: {
        package: plan.id,
        template: template.slug,
        user: user.email,
        ...(body.invitationId ? { invitation_id: body.invitationId } : {}),
        ...(couponCode ? { coupon: couponCode } : {}),
      },
    });

    const { error: insertErr } = await admin.from("orders").insert({
      user_id: user.id,
      user_email: user.email,
      plan: plan.name.toLowerCase(),
      package: plan.id,
      template_slug: template.slug,
      amount: payable,
      amount_paise: order.amount,
      currency: order.currency,
      status: "created",
      razorpay_order_id: order.id,
      payment_method: "razorpay",
      coupon_code: couponCode,
      discount,
    });
    if (insertErr) {
      return err("Could not create your order. Please try again.", 500);
    }

    return NextResponse.json({
      ok: true,
      razorpayOrderId: order.id,
      amountPaise: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      amountLabel: formatINR(payable),
      notes: {
        package: plan.name,
        template: template.name,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[razorpay/create-order]", msg);
    // Auth failure = invalid/expired keys. Fall back to manual UPI instead of
    // hard-failing the checkout — customer can still complete via UPI.
    if (msg === "RAZORPAY_AUTH" || msg.includes("401")) {
      return err(
        "Online payment is temporarily unavailable. Please complete payment via UPI instead.",
        503
      );
    }
    return err("Could not reach the payment gateway. Please try again.", 502);
  }
}
