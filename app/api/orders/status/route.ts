import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { err, rateLimit, clientIp, requireUser } from "@/lib/api-helpers";

export const runtime = "nodejs";

// GET /api/orders/status?orderId=... or ?invitationId=...
// Authoritative endpoint for Thank You & Checkout pages to inspect real verified order & publication state
export async function GET(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 30)) return err("Too many requests.", 429);

  const user = await requireUser();
  if (!user?.id) return err("Please sign in.", 401);

  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const invitationId = url.searchParams.get("invitationId");

  if (!orderId && !invitationId) {
    return err("orderId or invitationId is required.", 400);
  }

  const admin = createAdminClient();

  let order: {
    id: number;
    user_id: string | null;
    user_email: string | null;
    package: string;
    amount: number;
    currency: string;
    status: string;
    template_slug: string | null;
    created_at: string;
  } | null = null;

  let invitation: {
    id: string;
    user_id: string;
    order_id: number | null;
    package: string;
    template_slug: string;
    slug: string | null;
    status: string;
    content: Record<string, unknown>;
  } | null = null;

  if (invitationId) {
    const { data: inv } = await admin
      .from("invitations")
      .select("id, user_id, order_id, package, template_slug, slug, status, content")
      .eq("id", invitationId)
      .eq("user_id", user.id)
      .maybeSingle();
    invitation = inv;

    if (inv?.order_id) {
      const { data: ord } = await admin
        .from("orders")
        .select("id, user_id, user_email, package, amount, currency, status, template_slug, created_at")
        .eq("id", inv.order_id)
        .maybeSingle();
      if (ord && (ord.user_id === user.id || (user.email && ord.user_email?.toLowerCase() === user.email.toLowerCase()))) {
        order = ord;
      }
    }
  }

  if (orderId && !order) {
    const numericId = Number(orderId);
    if (!Number.isNaN(numericId)) {
      const { data: ord } = await admin
        .from("orders")
        .select("id, user_id, user_email, package, amount, currency, status, template_slug, created_at")
        .eq("id", numericId)
        .maybeSingle();

      if (ord && (ord.user_id === user.id || (user.email && ord.user_email?.toLowerCase() === user.email.toLowerCase()))) {
        order = ord;
      }
    }

    if (order && !invitation) {
      const { data: inv } = await admin
        .from("invitations")
        .select("id, user_id, order_id, package, template_slug, slug, status, content")
        .eq("order_id", order.id)
        .eq("user_id", user.id)
        .maybeSingle();
      invitation = inv;
    }
  }

  if (!order && !invitation) {
    return err("Record not found or unauthorized.", 404);
  }

  const isPaid = order?.status === "paid";
  const isPublished = invitation?.status === "published" && isPaid;

  const content = (invitation?.content || {}) as { brideName?: string; groomName?: string };
  const coupleTitle = content.brideName && content.groomName
    ? `${content.brideName} & ${content.groomName}`
    : null;

  return NextResponse.json({
    ok: true,
    order: order ? {
      id: order.id,
      package: order.package,
      amount: order.amount,
      currency: order.currency || "INR",
      status: order.status,
      isPaid,
      createdAt: order.created_at,
    } : null,
    invitation: invitation ? {
      id: invitation.id,
      package: invitation.package,
      templateSlug: invitation.template_slug,
      slug: invitation.slug,
      status: invitation.status,
      isPublished,
      coupleTitle,
      publicUrl: isPublished && invitation.slug ? `https://mehfill.in/i/${invitation.slug}` : null,
    } : null,
  });
}
