import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
          .select("id, user_email, plan, amount, status, created_at")
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

    return NextResponse.json(
      {
        totalVisits: totalRes.count ?? 0,
        weekVisits: weekRes.count ?? 0,
        monthVisits: monthRes.count ?? 0,
        orders: orderRows.data ?? [],
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
