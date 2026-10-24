import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { err, rateLimit, clientIp, sanitize } from "@/lib/api-helpers";

export const runtime = "nodejs";

// Published templates post FormData with their own field names (name/phone/
// guests/attend/attendance/note...), while our React renderer posts JSON with
// guestName/guestPhone/guestCount/... — normalise both shapes here.
async function readBody(request: Request): Promise<Record<string, string>> {
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("form-data") || ct.includes("urlencoded")) {
    try {
      const fd = await request.formData();
      const out: Record<string, string> = {};
      fd.forEach((value, key) => {
        if (typeof value === "string") out[key] = value;
      });
      return out;
    } catch {
      return {};
    }
  }
  try {
    const json: unknown = await request.json();
    if (json && typeof json === "object") {
      const out: Record<string, string> = {};
      for (const [key, value] of Object.entries(json as Record<string, unknown>)) {
        if (value !== null && value !== undefined) out[key] = String(value);
      }
      return out;
    }
  } catch {
    /* fall through */
  }
  return {};
}

/** Map free-form RSVP choices (template wording) onto yes/maybe/no. */
function normalizeAttending(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (["no", "no.", "false"].includes(v) || v.includes("declin") || v.includes("regret")) return "no";
  if (["maybe", "not sure", "pending"].includes(v) || v.includes("maybe")) return "maybe";
  return "yes";
}

// Guests submit RSVP against a published invitation slug.
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 8)) return err("Too many RSVPs from this device. Try again later.", 429);

  const body = await readBody(request);

  const slug = sanitize(body.slug || "", 60);
  const guestName = sanitize(body.guestName || body.name || "", 80);
  if (!slug || !guestName) return err("Please enter your name.");

  const rawAttendance = body.attending || body.attendance || body.attend || "";
  const attending = ["yes", "maybe", "no"].includes(rawAttendance)
    ? rawAttendance
    : normalizeAttending(rawAttendance);
  const guestCount = Math.min(Math.max(Number(body.guestCount || body.guests) || 1, 0), 20);
  const message = sanitize(body.message || body.note || "", 400);
  const guestPhone = sanitize(body.guestPhone || body.phone || "", 20)
    .replace(/\D/g, "")
    .slice(0, 15);

  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("id, status, content")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!invitation) return err("This invitation is not available.", 404);

  const rsvpConfig = (invitation.content as { rsvp?: { enabled?: boolean } })?.rsvp;
  if (rsvpConfig && rsvpConfig.enabled === false) {
    return err("RSVP is closed for this invitation.", 400);
  }

  const { error } = await admin.from("rsvps").insert({
    invitation_id: invitation.id,
    guest_name: guestName,
    guest_phone: guestPhone || null,
    attending,
    guest_count: guestCount,
    message: message || null,
  });
  if (error) return err("Could not save your RSVP. Please try again.", 500);

  return NextResponse.json({ ok: true });
}
