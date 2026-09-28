import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}