import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";
import { getPlan } from "@/lib/plans";
import { err, rateLimit, clientIp } from "@/lib/api-helpers";

export const runtime = "nodejs";

// POST /api/coupons/validate { code, packageId }
// The order amount is ALWAYS computed server-side from the package price —
// a client-supplied figure can never influence the discount preview.
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 20)) return err("Too many attempts. Try again in a minute.", 429);

  let body: { code?: string; packageId?: string };
  try {
    body = await request.json();
  } catch {
    return err("Invalid request.");
  }

  const plan = getPlan(body.packageId || "");
  if (!plan) return err("Choose a package first.", 400);
  const amount = plan.price;

  const result = await validateCoupon(body.code || "", amount);
  if (!result.ok || !result.coupon) {
    return err(result.error || "Invalid coupon.", 400);
  }

  const payable = amount - result.coupon.discountAmount;
  return NextResponse.json({ ok: true, coupon: result.coupon, payable, amount });
}
