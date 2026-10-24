import { NextResponse } from "next/server";
import { createClient, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!isAdminEmail(data.user?.email)) return null;
  return createAdminClient();
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const { data } = await admin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return NextResponse.json({ ok: true, coupons: data || [] });
}

// POST { code, discountType, discountValue, minAmount?, maxUses?, startsAt?, expiresAt?, note? }
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const code = String(body.code || "").toUpperCase().trim().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
  const discountType = body.discountType === "fixed" ? "fixed" : "percent";
  const discountValue = Math.max(1, Math.round(Number(body.discountValue) || 0));

  if (!code || discountValue < 1) {
    return NextResponse.json({ error: "Code and discount value are required." }, { status: 400 });
  }
  if (discountType === "percent" && discountValue > 100) {
    return NextResponse.json({ error: "Percent discount cannot exceed 100." }, { status: 400 });
  }

  const record = {
    code,
    discount_type: discountType,
    discount_value: discountValue,
    min_amount: Math.max(0, Math.round(Number(body.minAmount) || 0)),
    max_uses: body.maxUses ? Math.max(1, Math.round(Number(body.maxUses))) : null,
    starts_at: body.startsAt || null,
    expires_at: body.expiresAt || null,
    note: String(body.note || "").slice(0, 200),
    active: true,
  };

  const { error } = await admin.from("coupons").insert(record);
  if (error) {
    return NextResponse.json(
      { error: "Could not create coupon (is the code already in use?)." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

// PATCH { id, active? } — toggle active
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { id, active } = body;
  if (!id || typeof active !== "boolean") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { error } = await admin.from("coupons").update({ active }).eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed." }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// DELETE { id }
export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { error } = await admin.from("coupons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
