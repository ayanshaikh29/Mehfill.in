import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

function sanitize(str: string, maxLen: number): string {
  return str.replace(/[<>\"'`]/g, "").slice(0, maxLen).trim();
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "backend_not_connected" }, { status: 503 });
    }
    const fd = await request.formData();
    const plan = sanitize(String(fd.get("plan") || ""), 40);
    const amount = Number(fd.get("amount") || 0);
    const customer_name = sanitize(String(fd.get("customer_name") || ""), 120);
    const whatsapp = sanitize(String(fd.get("whatsapp") || ""), 30).replace(/\D/g, "");
    const txn_id = sanitize(String(fd.get("txn_id") || ""), 60).replace(/[^a-zA-Z0-9]/g, "");
    const shot = fd.get("screenshot");

    // Registration fields
    const email = sanitize(String(fd.get("email") || ""), 120);
    const mobile = sanitize(String(fd.get("mobile") || ""), 30).replace(/\D/g, "");
    const city = sanitize(String(fd.get("city") || ""), 60);
    const state = sanitize(String(fd.get("state") || ""), 60);
    const pincode = sanitize(String(fd.get("pincode") || ""), 10);
    const occasion = sanitize(String(fd.get("occasion") || ""), 40);
    const event_date = sanitize(String(fd.get("event_date") || ""), 20);
    const venue_name = sanitize(String(fd.get("venue_name") || ""), 120);
    const venue_address = sanitize(String(fd.get("venue_address") || ""), 200);
    const template_slug = sanitize(String(fd.get("template_slug") || ""), 40);

    if (!plan || !amount || !customer_name || !whatsapp || !txn_id) {
      return NextResponse.json({ error: "Missing details." }, { status: 400 });
    }

    // Validate WhatsApp number (Indian format)
    if (!/^91\d{10}$/.test(whatsapp)) {
      return NextResponse.json({ error: "Invalid WhatsApp number." }, { status: 400 });
    }

    let user_email: string | null = null;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user_email = data.user?.email ?? null;
    } catch {
      // Guests can pay too.
    }

    const admin = createAdminClient();

    // Optional screenshot → payment-proofs bucket (created on demand).
    let screenshot_url: string | null = null;
    if (shot instanceof File && shot.size > 0 && shot.size < 5 * 1024 * 1024) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(shot.type)) {
        return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
      }
      try {
        await admin.storage.createBucket("payment-proofs", { public: true });
      } catch {
        // Bucket probably already exists.
      }
      const ext = (shot.name.split(".").pop() || "jpg").slice(0, 5);
      const key = `${Date.now()}_${txn_id.slice(0, 20)}.${ext}`;
      const { error: upErr } = await admin.storage.from("payment-proofs").upload(key, shot, {
        contentType: shot.type || "image/jpeg",
      });
      if (!upErr) {
        screenshot_url = admin.storage.from("payment-proofs").getPublicUrl(key).data.publicUrl;
      }
    }

    const { data: row, error } = await admin
      .from("upi_payments")
      .insert({
        user_email,
        plan,
        amount,
        customer_name,
        whatsapp,
        txn_id,
        screenshot_url,
        status: "pending",
        // New registration fields
        email,
        mobile,
        city,
        state,
        pincode,
        occasion,
        event_date,
        venue_name,
        venue_address,
        template_slug,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "Could not save. Please send details on WhatsApp." }, { status: 500 });

    return NextResponse.json({ ok: true, id: row.id });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please send details on WhatsApp." }, { status: 500 });
  }
}