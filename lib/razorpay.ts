// Server-side Razorpay helpers. NEVER import from client components.
// Works in test mode when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are set;
// isRazorpayConfigured() lets routes fall back to manual UPI otherwise.

import crypto from "node:crypto";

export function razorpayKeys() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || "",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  };
}

export function isRazorpayConfigured(): boolean {
  const { keyId, keySecret } = razorpayKeys();
  if (!keyId || !keySecret) return false;
  // Reject malformed keys early so routes fall back to UPI instead of 401ing.
  if (!/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) return false;
  if (keySecret.length < 10) return false;
  return true;
}

export function isLiveMode(): boolean {
  const { keyId } = razorpayKeys();
  return keyId.startsWith("rzp_live_");
}

export interface CreateOrderInput {
  amountRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(input: CreateOrderInput) {
  const { keyId, keySecret } = razorpayKeys();
  if (!isRazorpayConfigured()) throw new Error("Razorpay not configured");

  const amountPaise = Math.round(input.amountRupees * 100);
  // Razorpay rejects orders below 100 paise (₹1).
  if (amountPaise < 100) throw new Error("Amount below Razorpay minimum (₹1)");
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes || {},
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Auth failure = bad/expired keys — surface a clear message for the route.
    if (res.status === 401) {
      throw new Error("RAZORPAY_AUTH");
    }
    throw new Error(`Razorpay order failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    receipt: string;
  }>;
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = razorpayKeys();
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(params.signature, "hex")
    );
  } catch {
    return false;
  }
}

export function verifyRazorpayWebhook(body: string, signature: string): boolean {
  const { webhookSecret } = razorpayKeys();
  if (!webhookSecret) return false;
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function fetchRazorpayOrder(orderId: string) {
  const { keyId, keySecret } = razorpayKeys();
  if (!isRazorpayConfigured()) return null;
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    id: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    status: string;
    attempts: number;
  }>;
}

export async function fetchRazorpayOrderPayments(orderId: string) {
  const { keyId, keySecret } = razorpayKeys();
  if (!isRazorpayConfigured()) return [];
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}/payments`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: Array<{ id: string; status: string; amount: number }> };
  return data.items || [];
}
