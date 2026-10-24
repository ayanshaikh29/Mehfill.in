import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";

// GET /api/admin/me — server-authoritative admin check.
// Client pages must never ship the ADMIN_EMAILS allowlist in their bundle.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return NextResponse.json({ admin: isAdminEmail(data.user?.email) });
  } catch {
    return NextResponse.json({ admin: false });
  }
}
