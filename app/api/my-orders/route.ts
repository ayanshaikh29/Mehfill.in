import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/my-orders — orders of the signed-in user (RLS enforced).
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.email) return NextResponse.json({ orders: [] });
    const { data, error } = await supabase
      .from("orders")
      .select("id, plan, amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return NextResponse.json({ orders: [] });
    return NextResponse.json({ orders: data ?? [] });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}
