import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Bots/crawlers must never inflate real human stats.
const BOT_RE = /bot|crawl|spider|slurp|mediapartners|baidu|yandex|sogou|exabot|facebot|ia_archiver|semrush|ahrefs|mj12bot|dotbot|petal|headless|lighthouse|pagespeed/i;

// POST /api/track { path } — logs a REAL human page visit. Always returns ok.
export async function POST(request: Request) {
  try {
    const ua = request.headers.get("user-agent") || "";
    if (BOT_RE.test(ua)) return NextResponse.json({ ok: true, skipped: true });
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const { path } = await request.json().catch(() => ({ path: "/" }));
    const clean = String(path || "/").slice(0, 200);
    // Owner-only pages are excluded client-side too; double-guard here.
    if (clean === "/admin" || clean.startsWith("/admin/") || clean === "/studio" || clean.startsWith("/studio/")) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    await supabase.from("visits").insert({ path: clean });
  } catch {
    // Analytics must never break the site.
  }
  return NextResponse.json({ ok: true });
}
