// Same-site redirect guard for ?callbackUrl / ?next parameters.
// Only accepts root-relative paths on this host — anything else
// (//evil.com, https://…, /\evil.com, javascript:…) falls back.
export function safeRedirectPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (raw.includes("\\")) return fallback;
  if (raw.length > 1024) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (raw.includes("://")) return fallback;
  return raw;
}
