import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { markCouponUsed } from "@/lib/coupons";
import { fetchRazorpayOrder, fetchRazorpayOrderPayments } from "@/lib/razorpay";

export const runtime = "nodejs";

// POST /api/admin/orders/sync { orderId: number }
// Syncs a specific Razorpay order status directly with Razorpay API, or allows admin to mark paid
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!isAdminEmail(userData.user?.email)) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const orderId = Number(body.orderId);
    const forceMarkPaid = Boolean(body.forceMarkPaid);

    if (!orderId) {
      return NextResponse.json({ error: "Invalid order ID." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    let isPaid = forceMarkPaid;
    let paymentId = order.razorpay_payment_id || null;

    if (!isPaid && order.razorpay_order_id) {
      const rzOrder = await fetchRazorpayOrder(order.razorpay_order_id);
      if (rzOrder && (rzOrder.status === "paid" || (rzOrder.amount_paid && rzOrder.amount_paid > 0))) {
        isPaid = true;
        const payments = await fetchRazorpayOrderPayments(order.razorpay_order_id);
        const captured = payments.find((p) => p.status === "captured") || payments[0];
        if (captured?.id) paymentId = captured.id;
      }
    }

    if (isPaid) {
      await admin
        .from("orders")
        .update({
          status: "paid",
          razorpay_payment_id: paymentId,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (order.coupon_code) void markCouponUsed(order.coupon_code);

      // Link to draft invitation owned by user
      if (order.user_id) {
        await admin
          .from("invitations")
          .update({
            order_id: order.id,
            package: order.package || "basic",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", order.user_id)
          .is("order_id", null);
      }

      return NextResponse.json({ ok: true, status: "paid", paymentId });
    }

    return NextResponse.json({
      ok: true,
      status: order.status,
      message: "Order checked with gateway; status remains " + order.status,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sync failed." },
      { status: 500 }
    );
  }
}
