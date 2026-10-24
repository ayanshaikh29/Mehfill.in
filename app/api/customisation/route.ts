import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { err, rateLimit, clientIp, requireUser, sanitize } from "@/lib/api-helpers";

export const runtime = "nodejs";

// Premium customers submit a customisation brief after payment.
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 6)) return err("Too many requests.", 429);

  const user = await requireUser();
  if (!user?.id) return err("Please sign in.", 401);

  let body: {
    invitationId?: string;
    brief?: string;
    colourPrefs?: string;
    typographyPrefs?: string;
    animationPrefs?: string;
    referenceUrls?: string;
  };
  try {
    body = await request.json();
  } catch {
    return err("Invalid request.");
  }

  const brief = sanitize(body.brief || "", 2000);
  if (brief.length < 20) {
    return err("Please describe your customisation ideas in at least 20 characters.");
  }

  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("id, user_id, package, order_id, status")
    .eq("id", body.invitationId || "")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!invitation) return err("Invitation not found.", 404);
  if (invitation.package !== "premium") {
    return err("Customisation requests are for Premium orders only.", 403);
  }

  const { data: existing } = await admin
    .from("customisation_requests")
    .select("id, status")
    .eq("invitation_id", invitation.id)
    .maybeSingle();
  if (existing && existing.status !== "cancelled") {
    return err("A customisation request already exists for this invitation.", 409);
  }

  const { data, error } = await admin
    .from("customisation_requests")
    .insert({
      invitation_id: invitation.id,
      user_id: user.id,
      order_id: invitation.order_id,
      status: "requested",
      brief,
      colour_prefs: sanitize(body.colourPrefs || "", 300),
      typography_prefs: sanitize(body.typographyPrefs || "", 300),
      animation_prefs: sanitize(body.animationPrefs || "", 300),
      reference_urls: sanitize(body.referenceUrls || "", 600),
    })
    .select("id, status, created_at")
    .single();
  if (error) return err("Could not submit your brief. Please try again.", 500);

  return NextResponse.json({ ok: true, request: data });
}

// List customisation requests for the signed-in user.
export async function GET() {
  const user = await requireUser();
  if (!user?.id) return err("Please sign in.", 401);

  const admin = createAdminClient();
  const { data } = await admin
    .from("customisation_requests")
    .select("*, invitations!inner(id, slug, status, template_slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ ok: true, requests: data || [] });
}
