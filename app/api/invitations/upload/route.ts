import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { err, rateLimit, clientIp, requireUser } from "@/lib/api-helpers";

export const runtime = "nodejs";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AUDIO_TYPES = ["audio/mpeg", "audio/mp4", "audio/mp3", "audio/x-m4a", "audio/aac", "audio/wav", "audio/ogg"];
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

// Upload a gallery photo or music track into the invitation-assets bucket under
// the user's own folder: <user_id>/<timestamp>_<random>.<ext>
// kind=photo (default) | music
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip, 15)) return err("Too many upload requests.", 429);

  const user = await requireUser();
  if (!user?.id) return err("Please sign in to upload files.", 401);

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return err("Invalid upload request.");
  }

  const kind = fd.get("kind") === "music" ? "music" : "photo";
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return err("No file received.");
  }

  const isImage = IMAGE_TYPES.includes(file.type);
  const isAudio = AUDIO_TYPES.includes(file.type);
  if (kind === "music") {
    if (!isAudio) return err("Only MP3, M4A, AAC, WAV or OGG audio files are allowed.");
    if (file.size > MAX_AUDIO_BYTES) return err("Music must be under 8MB. Please compress and retry.");
  } else {
    if (!isImage) return err("Only JPG, PNG or WebP images are allowed.");
    if (file.size > MAX_IMAGE_BYTES) return err("Image must be under 4MB. Please compress and retry.");
  }

  const admin = createAdminClient();
  try {
    await admin.storage.createBucket("invitation-assets", { public: true });
  } catch {
    // exists
  }

  let ext = "bin";
  if (file.type === "image/png") ext = "png";
  else if (file.type === "image/webp") ext = "webp";
  else if (file.type === "image/jpeg") ext = "jpg";
  else if (file.type === "audio/mpeg" || file.type === "audio/mp3") ext = "mp3";
  else if (file.type === "audio/mp4" || file.type === "audio/x-m4a" || file.type === "audio/aac") ext = "m4a";
  else if (file.type === "audio/wav") ext = "wav";
  else if (file.type === "audio/ogg") ext = "ogg";

  const prefix = kind === "music" ? "music" : "photos";
  const key = `${user.id}/${prefix}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await admin.storage
    .from("invitation-assets")
    .upload(key, file, { contentType: file.type, upsert: false });
  if (upErr) {
    console.error("[upload]", upErr);
    return err("Could not save the file. Please try again.", 500);
  }

  const { data } = admin.storage.from("invitation-assets").getPublicUrl(key);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
