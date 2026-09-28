import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// POST /api/track { path } — logs a page visit. Always returns ok.
export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    const { path } = await request.json().catch(() => ({ path: "/" }));
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    await supabase.from("visits").insert({ path: String(path || "/").slice(0, 200) });
  } catch {
    // Analytics must never break the site.
  }
  return NextResponse.json({ ok: true });
}
