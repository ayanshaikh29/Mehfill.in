// Server-side screenshot validation for the support assistant.
// Content is verified by MAGIC BYTES — a .png extension on a script or an
// executable is rejected regardless of what the client claims.

export const SUPPORT_IMAGE_MIME = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export type SupportImageMime = (typeof SUPPORT_IMAGE_MIME)[keyof typeof SUPPORT_IMAGE_MIME];

/** Decoded-byte cap (base64 expands ~4/3 — keeps Groq's 4MB base64 limit safe). */
export function maxImageBytes(): number {
  const fromEnv = Number(process.env.SUPPORT_MAX_IMAGE_BYTES);
  if (Number.isFinite(fromEnv) && fromEnv >= 64 * 1024 && fromEnv <= 3.5 * 1024 * 1024) {
    return fromEnv;
  }
  return 2 * 1024 * 1024;
}

export interface ValidImage {
  mime: SupportImageMime;
  bytes: Buffer;
}

function detectMime(buf: Buffer): SupportImageMime | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return SUPPORT_IMAGE_MIME.jpeg;
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return SUPPORT_IMAGE_MIME.png;
  }
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return SUPPORT_IMAGE_MIME.webp;
  }
  return null;
}

/** Validate a base64 data-URL OR raw base64 string from the client. */
export function validateSupportImage(input: string): ValidImage | { error: string } {
  if (typeof input !== "string" || !input.length) return { error: "Empty image." };

  let b64 = input;
  let declaredMime = "";
  const dataUrl = /^data:([a-z0-9/+.-]+);base64,/i.exec(input);
  if (dataUrl) {
    declaredMime = dataUrl[1].toLowerCase();
    b64 = input.slice(dataUrl[0].length);
  }
  // Strip whitespace newlines some encoders add.
  b64 = b64.replace(/\s+/g, "");
  if (b64.length > Math.ceil(maxImageBytes() * 4 / 3) + 1024) {
    return { error: "Image is too large. Please upload a screenshot under 2MB." };
  }
  if (!/^[a-z0-9+/]+={0,2}$/i.test(b64)) {
    return { error: "Image data is malformed." };
  }

  let bytes: Buffer;
  try {
    bytes = Buffer.from(b64, "base64");
  } catch {
    return { error: "Image could not be decoded." };
  }
  if (!bytes.length) return { error: "Image could not be decoded." };
  if (bytes.length > maxImageBytes()) {
    return { error: "Image is too large. Please upload a screenshot under 2MB." };
  }

  const mime = detectMime(bytes);
  if (!mime) return { error: "Unsupported file. Please upload a JPEG, PNG or WebP screenshot." };
  // Declared mime must not contradict actual content (defends against
  // "data:text/html;base64,..." smuggling attempts).
  if (declaredMime && declaredMime !== mime && !(declaredMime === "image/jpg" && mime === "image/jpeg")) {
    return { error: "File content does not match its declared type." };
  }
  return { mime, bytes };
}
