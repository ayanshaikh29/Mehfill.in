import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const confirmLimit = new Map<string, { count: number; resetAt: number }>();

// POST /api/confirm-user { userId } — auto-confirms a freshly registered
// email so users can sign in instantly (no verification mail needed).
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const rec = confirmLimit.get(ip);
  if (!rec || now > rec.resetAt) confirmLimit.set(ip, { count: 1, resetAt: now + 60_000 });
  else {
    if (rec.count >= 5) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    rec.count++;
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "backend_not_connected" }, { status: 503 });
    }
    const { userId } = await request.json().catch(() => ({}));
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Missing user." }, { status: 400 });
    }
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, { email_confirm: true });
    if (error) return NextResponse.json({ error: "Confirm failed." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
