import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const confirmLimit = new Map<string, { count: number; resetAt: number }>();

// POST /api/confirm-user { userId } — auto-confirms a freshly registered
// email so users can sign in instantly (no verification mail needed).
// Hardened: only accounts created within the last 15 minutes may be confirmed,
// so this endpoint cannot be abused to confirm arbitrary/old accounts.
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
    if (!userId || typeof userId !== "string" || !/^[0-9a-f-]{36}$/i.test(userId)) {
      return NextResponse.json({ error: "Missing user." }, { status: 400 });
    }
    const admin = createAdminClient();

    // Only confirm brand-new accounts (created within 15 minutes) that are
    // still unconfirmed — this endpoint is meant for the registration flow only.
    const { data: userData, error: getErr } = await admin.auth.admin.getUserById(userId);
    if (getErr || !userData?.user) {
      return NextResponse.json({ error: "Confirm failed." }, { status: 404 });
    }
    const createdAt = userData.user.created_at ? new Date(userData.user.created_at).getTime() : 0;
    const isFresh = createdAt > 0 && now - createdAt < 15 * 60 * 1000;
    const alreadyConfirmed = Boolean(userData.user.email_confirmed_at);
    if (!isFresh || alreadyConfirmed) {
      // Fresh signup already confirmed (e.g. double-submit) is fine to accept.
      if (alreadyConfirmed) return NextResponse.json({ ok: true });
      return NextResponse.json({ error: "This account can no longer be auto-confirmed." }, { status: 403 });
    }

    const { error } = await admin.auth.admin.updateUserById(userId, { email_confirm: true });
    if (error) return NextResponse.json({ error: "Confirm failed." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
