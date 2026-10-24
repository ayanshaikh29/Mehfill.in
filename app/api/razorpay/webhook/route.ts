import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyRazorpayWebhook } from "@/lib/razorpay";
import { markCouponUsed } from "@/lib/coupons";

export const runtime = "nodejs";

// Razorpay webhook — server-to-server backup for payment confirmation.
// Configure the webhook URL in Razorpay dashboard: /api/razorpay/webhook
// Events handled: payment.captured, payment.failed, order.paid.
export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature") || "";
  const raw = await request.text();

  if (!verifyRazorpayWebhook(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event?: string; payload?: Record<string, { entity?: Record<string, unknown> }> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = typeof payment?.order_id === "string" ? payment.order_id : null;
  if (!orderId) return NextResponse.json({ ok: true });

  const admin = createAdminClient();

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const paymentId = typeof payment?.id === "string" ? payment.id : null;
    // Idempotent update — only flips created → paid.
    const { data: updated } = await admin
      .from("orders")
      .update({
        status: "paid",
        razorpay_payment_id: paymentId,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", orderId)
      .eq("status", "created")
      .select("coupon_code");
    if (updated?.[0]?.coupon_code) void markCouponUsed(updated[0].coupon_code);
  } else if (event.event === "payment.failed") {
    await admin
      .from("orders")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("razorpay_order_id", orderId)
      .eq("status", "created");
  }

  return NextResponse.json({ ok: true });
}
