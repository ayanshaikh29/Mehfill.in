import { createAdminClient } from "@/lib/supabase/admin";
import { sanitize } from "@/lib/api-helpers";

export interface CouponResult {
  ok: boolean;
  error?: string;
  coupon?: {
    id: number;
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    discountAmount: number;
  };
}

// Shared server-side coupon validation (service role — coupons table is
// not browser-readable). Returns the discount for a given order amount.
export async function validateCoupon(
  rawCode: string,
  amountRupees: number
): Promise<CouponResult> {
  const code = sanitize(rawCode || "", 40).toUpperCase();
  if (!code) return { ok: false, error: "Enter a coupon code." };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Coupons are not available right now." };
  }

  const admin = createAdminClient();
  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .maybeSingle();

  if (!coupon) return { ok: false, error: "This coupon code is not valid." };
  if (!coupon.active) return { ok: false, error: "This coupon is no longer active." };

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { ok: false, error: "This coupon is not active yet." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return { ok: false, error: "This coupon has expired." };
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }
  if (coupon.min_amount && amountRupees < coupon.min_amount) {
    return {
      ok: false,
      error: `This coupon needs a minimum order of ₹${coupon.min_amount}.`,
    };
  }

  const discountAmount =
    coupon.discount_type === "percent"
      ? Math.round((amountRupees * coupon.discount_value) / 100)
      : coupon.discount_value;
  const clamped = Math.min(discountAmount, amountRupees);

  return {
    ok: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount: clamped,
    },
  };
}

// Bump usage after a successful payment (idempotent-ish: guards max_uses).
export async function markCouponUsed(code: string | null | undefined) {
  if (!code || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const admin = createAdminClient();
  const { data } = await admin
    .from("coupons")
    .select("id, max_uses, used_count")
    .ilike("code", code)
    .maybeSingle();
  if (!data) return;
  if (data.max_uses !== null && data.used_count >= data.max_uses) return;
  await admin
    .from("coupons")
    .update({ used_count: data.used_count + 1 })
    .eq("id", data.id);
}
