import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { err, rateLimit, clientIp, requireUser, sanitize } from "@/lib/api-helpers";
import { isContentShaped, isProvisionalSlug, isSafeHttpUrl, generateSlug, type InvitationContent, type LoveStoryMilestone, type GalleryItem } from "@/lib/invitation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function loadOwned(id: string, userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("invitations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return { admin, invitation: data };
}

export async function GET(_request: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user?.id) return err("Please sign in.", 401);
  const { id } = await ctx.params;

  const { admin, invitation } = await loadOwned(id, user.id);
  if (!invitation) return err("Invitation not found.", 404);

  let isPaid = false;
  if (invitation.order_id) {
    const [{ data: order }, { data: upi }] = await Promise.all([
      admin.from("orders").select("id, status, user_id, user_email").eq("id", invitation.order_id).maybeSingle(),
      admin.from("upi_payments").select("id, status, user_email").eq("id", invitation.order_id).maybeSingle(),
    ]);

    const orderBelongsToUser = Boolean(
      (order && (order.user_id === user.id || (user.email && order.user_email?.toLowerCase() === user.email.toLowerCase()))) ||
      (upi && user.email && upi.user_email?.toLowerCase() === user.email.toLowerCase())
    );

    if (orderBelongsToUser) {
      const orderPaid = order?.status === "paid";
      const upiPaid = upi?.status === "paid" || upi?.status === "completed" || upi?.status === "verified";
      isPaid = orderPaid || upiPaid;
    }
  }

  return NextResponse.json({ ok: true, invitation: { ...invitation, isPaid } });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 30)) return err("Too many requests.", 429);

  const user = await requireUser();
  if (!user?.id) return err("Please sign in.", 401);
  const { id } = await ctx.params;

  const { admin, invitation } = await loadOwned(id, user.id);
  if (!invitation) return err("Invitation not found.", 404);
  if (invitation.status === "deleted") return err("Invitation was deleted.", 410);

  let body: { content?: InvitationContent; theme?: Record<string, string>; slug?: string };
  try {
    body = await request.json();
  } catch {
    return err("Invalid request.");
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.slug === "string" && body.slug.trim()) {
    const raw = body.slug.trim().toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (raw.length >= 3 && raw.length <= 50) {
      // Check if taken by another invitation
      const { data: existing } = await admin
        .from("invitations")
        .select("id")
        .eq("slug", raw)
        .neq("id", id)
        .neq("status", "deleted")
        .maybeSingle();

      if (existing) {
        return err("This invitation URL is already taken.", 409);
      }
      updates.slug = raw;
    }
  }

  if (body.content !== undefined) {
    if (!isContentShaped(body.content)) {
      return err("Invalid invitation details.");
    }
    // Cap gallery at 20 images, events at 15 — sane limits. Draft saves allow
    // partial content; publish enforces names/date/venue completeness.
    const rawMusic = typeof body.content.musicUrl === "string" ? body.content.musicUrl : "";
    // Only accept our own uploaded audio (invitation-assets path) — never arbitrary external URLs.
    const musicOk =
      rawMusic === "" ||
      (rawMusic.length <= 500 && rawMusic.includes("/invitation-assets/"));
    const rawGalleryItems = Array.isArray(body.content.galleryItems) ? body.content.galleryItems : null;
    const sanitizedGalleryItems: GalleryItem[] | undefined = rawGalleryItems
      ? rawGalleryItems
          .slice(0, 20)
          .filter((item) => item && typeof item.url === "string" && isSafeHttpUrl(item.url))
          .map((item) => ({
            id: sanitize(String(item.id || ""), 64) || crypto.randomUUID(),
            url: item.url.trim(),
            caption: sanitize(item.caption || "", 160),
            category: ["all", "couple", "ceremonies", "palace"].includes(String(item.category || ""))
              ? String(item.category)
              : "all",
          }))
      : undefined;
    const rawGallery = (body.content.gallery || []).slice(0, 20).filter((u) => typeof u === "string" && isSafeHttpUrl(u));
    const gallery = sanitizedGalleryItems ? sanitizedGalleryItems.map((item) => item.url) : rawGallery;

    const sanitizePhotoUrl = (u: unknown) =>
      typeof u === "string" && isSafeHttpUrl(u) ? u.trim().slice(0, 500) : "";

    const content = {
      ...body.content,
      events: (body.content.events || []).slice(0, 15).map((e) => ({
        id: sanitize(String(e.id || ""), 64) || crypto.randomUUID(),
        name: sanitize(e.name || "", 80),
        date: sanitize(e.date || "", 20),
        time: sanitize(e.time || "", 10),
        venue: sanitize(e.venue || "", 160),
        address: sanitize(e.address || "", 300),
        mapsUrl: isSafeHttpUrl(e.mapsUrl) ? e.mapsUrl!.trim().slice(0, 400) : "",
        description: sanitize(e.description || "", 400),
      })),
      gallery,
      ...(sanitizedGalleryItems ? { galleryItems: sanitizedGalleryItems } : {}),
      musicUrl: musicOk ? rawMusic : "",
      brideName: sanitize(body.content.brideName || "", 80),
      groomName: sanitize(body.content.groomName || "", 80),
      bridePhoto: sanitizePhotoUrl(body.content.bridePhoto),
      groomPhoto: sanitizePhotoUrl(body.content.groomPhoto),
      brideParents: sanitize(body.content.brideParents || "", 160),
      groomParents: sanitize(body.content.groomParents || "", 160),
      brideBio: sanitize(body.content.brideBio || "", 300),
      groomBio: sanitize(body.content.groomBio || "", 300),
      initials: sanitize(body.content.initials || "", 20),
      familyNames: sanitize(body.content.familyNames || "", 240),
      message: sanitize(body.content.message || "", 600),
      intro: sanitize(body.content.intro || "", 800),
      weddingDate: sanitize(body.content.weddingDate || "", 20),
      startTime: sanitize(body.content.startTime || "", 10),
      endTime: sanitize(body.content.endTime || "", 10),
      venueName: sanitize(body.content.venueName || "", 160),
      venueAddress: sanitize(body.content.venueAddress || "", 400),
      mapsUrl: isSafeHttpUrl(body.content.mapsUrl) ? body.content.mapsUrl!.trim().slice(0, 400) : "",
      rsvp: {
        enabled: Boolean(body.content.rsvp?.enabled ?? true),
        contactName: sanitize(body.content.rsvp?.contactName || "", 80),
        contactPhone: sanitize(body.content.rsvp?.contactPhone || "", 20),
        deadline: sanitize(body.content.rsvp?.deadline || "", 20),
        message: sanitize(body.content.rsvp?.message || "", 400),
        guestOptions: (body.content.rsvp?.guestOptions || ["1", "2", "3", "4", "5+"])
          .slice(0, 8)
          .map((g) => sanitize(String(g), 10)),
      },
      loveStory: (body.content.loveStory || [])
        .slice(0, 10)
        .map((m: Partial<LoveStoryMilestone>) => ({
          id: String(m.id || crypto.randomUUID()),
          title: sanitize(m.title || "", 100),
          date: sanitize(m.date || "", 20),
          description: sanitize(m.description || "", 500),
          imageUrl: typeof m.imageUrl === "string" && m.imageUrl.startsWith("https://")
            ? m.imageUrl
            : "",
        })),
      useTemplateImages: Boolean(body.content.useTemplateImages ?? false),
    } satisfies InvitationContent;
    updates.content = content;

    // If the slug is still provisional (invite-… seeded at creation) and both
    // names are now known, promote it to a couple-name slug immediately so the
    // preview URL matches the couple even before publish.
    if (
      isProvisionalSlug(invitation.slug) &&
      content.brideName &&
      content.groomName
    ) {
      const { data: slugs } = await admin
        .from("invitations")
        .select("slug")
        .not("slug", "is", null)
        .neq("id", id);
      const taken = (slugs || []).map((s) => s.slug as string);
      updates.slug = generateSlug(content.brideName, content.groomName, taken);
    }
  }

  if (body.theme !== undefined && typeof body.theme === "object") {
    // Basic package cannot change theme; premium themes applied by admin.
    if (invitation.package !== "premium") {
      return err("Theme changes require the Premium package.", 403);
    }
    const theme: Record<string, string> = {};
    for (const [k, v] of Object.entries(body.theme).slice(0, 20)) {
      if (/^#[0-9a-fA-F]{3,8}$/.test(String(v)) || /^[\w\s-]{0,40}$/.test(String(v))) {
        theme[sanitize(k, 40)] = String(v).slice(0, 60);
      }
    }
    updates.theme = theme;
  }

  if (Object.keys(updates).length === 1) return err("Nothing to update.");

  const { error } = await admin.from("invitations").update(updates).eq("id", id);
  if (error) return err("Could not save changes.", 500);

  const { data: fresh } = await admin
    .from("invitations")
    .select("*")
    .eq("id", id)
    .single();

  return NextResponse.json({ ok: true, invitation: fresh });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await requireUser();
  if (!user?.id) return err("Please sign in.", 401);
  const { id } = await ctx.params;

  const { admin, invitation } = await loadOwned(id, user.id);
  if (!invitation) return err("Invitation not found.", 404);

  await admin
    .from("invitations")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ ok: true });
}
