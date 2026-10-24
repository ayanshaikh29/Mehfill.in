import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchRazorpayOrder, fetchRazorpayOrderPayments } from "@/lib/razorpay";
import { markCouponUsed } from "@/lib/coupons";

// GET /api/admin/overview — owner-only, service-role reads (bypasses RLS)
// so the dashboard sees EVERY customer's real data immediately.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!isAdminEmail(data.user?.email)) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "backend_not_connected" }, { status: 503 });
    }

    const admin = createAdminClient();
    const now = Date.now();

    const [totalRes, weekRes, monthRes, orderRows, upiRows, visitRows, recent, paths] =
      await Promise.all([
        admin.from("visits").select("id", { count: "exact", head: true }),
        admin
          .from("visits")
          .select("id", { count: "exact", head: true })
          .gte("created_at", new Date(now - 7 * 864e5).toISOString()),
        admin
          .from("visits")
          .select("id", { count: "exact", head: true })
          .gte("created_at", new Date(now - 30 * 864e5).toISOString()),
        admin
          .from("orders")
          .select("id, user_email, plan, amount, status, created_at, razorpay_order_id, razorpay_payment_id, user_id, coupon_code")
          .order("created_at", { ascending: false })
          .limit(100),
        admin
          .from("upi_payments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        admin
          .from("visits")
          .select("id, path, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
        admin
          .from("visits")
          .select("created_at")
          .gte("created_at", new Date(now - 14 * 864e5).toISOString())
          .limit(3000),
        admin
          .from("visits")
          .select("path")
          .gte("created_at", new Date(now - 30 * 864e5).toISOString())
          .limit(3000),
      ]);

    const orders = orderRows.data ?? [];

    // Auto-reconciliation: Check recent orders still in 'created' status against Razorpay API
    const createdOrders = orders.filter(
      (o) => o.status === "created" && o.razorpay_order_id
    ).slice(0, 5); // Check top 5 recent created orders

    for (const o of createdOrders) {
      try {
        const rzOrder = await fetchRazorpayOrder(o.razorpay_order_id!);
        if (rzOrder && (rzOrder.status === "paid" || (rzOrder.amount_paid && rzOrder.amount_paid > 0))) {
          const payments = await fetchRazorpayOrderPayments(o.razorpay_order_id!);
          const capturedPayment = payments.find((p) => p.status === "captured") || payments[0];
          const paymentId = capturedPayment?.id || null;

          await admin
            .from("orders")
            .update({
              status: "paid",
              razorpay_payment_id: paymentId,
              verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", o.id);

          o.status = "paid";
          o.razorpay_payment_id = paymentId;

          if (o.coupon_code) void markCouponUsed(o.coupon_code);

          // Also ensure invitation is linked
          if (o.user_id) {
            await admin
              .from("invitations")
              .update({ order_id: o.id, updated_at: new Date().toISOString() })
              .eq("user_id", o.user_id)
              .is("order_id", null);
          }
        }
      } catch (err) {
        console.warn(`[admin/overview] reconciliation check failed for order ${o.id}:`, err);
      }
    }

    return NextResponse.json(
      {
        totalVisits: totalRes.count ?? 0,
        weekVisits: weekRes.count ?? 0,
        monthVisits: monthRes.count ?? 0,
        orders,
        upi: upiRows.data ?? [],
        visits: visitRows.data ?? [],
        recent: recent.data ?? [],
        paths: paths.data ?? [],
        serverTime: now,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
