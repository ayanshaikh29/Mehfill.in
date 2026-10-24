import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { markCouponUsed } from "@/lib/coupons";

const adminRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function adminRateLimit(ip: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const record = adminRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    adminRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

// POST /api/admin/verify-payment { id, status: "paid" | "rejected" }
// Owner-only: marks a UPI payment verified after manual checking.
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!adminRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!isAdminEmail(data.user?.email)) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }
    const { id, status } = await request.json().catch(() => ({}));
    if (!id || !["paid", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    const admin = createAdminClient();
    const { error } = await admin.from("upi_payments").update({ status }).eq("id", Number(id));
    if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });

    // Keep the unified orders pipeline in sync + auto-create the
    // invitation draft so the customer's editor unlocks immediately.
    if (status === "paid") {
      const { data: upi } = await admin
        .from("upi_payments")
        .select("email, user_email, plan, amount, template_slug, coupon_code")
        .eq("id", Number(id))
        .maybeSingle();
      const email = upi?.email || upi?.user_email || null;

      // Coupon usage counts only once the payment is actually verified.
      if (upi?.coupon_code) void markCouponUsed(upi.coupon_code);

      if (email) {
        await admin
          .from("orders")
          .update({ status: "paid", verified_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("user_email", email)
          .eq("status", "pending_verification");

        const { data: order } = await admin
          .from("orders")
          .select("id, user_id, template_slug, package")
          .eq("user_email", email)
          .eq("status", "paid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (order?.user_id) {
          const { data: existing } = await admin
            .from("invitations")
            .select("id")
            .eq("order_id", order.id)
            .maybeSingle();
          if (!existing) {
            const { data: slugs } = await admin
              .from("invitations")
              .select("slug")
              .not("slug", "is", null);
            const taken = (slugs || []).map((s) => String(s.slug));
            const base = (order.template_slug || "invite").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "invite";
            let slug = base;
            let n = 2;
            while (taken.includes(slug)) slug = `${base}-${n++}`;

            await admin.from("invitations").insert({
              user_id: order.user_id,
              order_id: order.id,
              template_slug: order.template_slug || "royal-marigold",
              package: order.package || "basic",
              slug,
              status: "draft",
              content: {
                brideName: "", groomName: "", weddingDate: "", venueName: "", venueAddress: "",
                events: [], gallery: [],
                rsvp: { enabled: true, message: "Kindly confirm your presence before the celebrations begin.", guestOptions: ["1", "2", "3", "4", "5+"] },
                message: "With the blessings of our families, we invite you to share in our joy as we begin our forever.",
              },
              theme: {},
            });
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}