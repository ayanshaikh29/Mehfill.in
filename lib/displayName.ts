// Friendly display name for a Supabase user — never a raw email.
// Priority: full_name / name from metadata → prettified email prefix → fallback.
export function displayName(
  user: {
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
  } | null
): string {
  const meta = user?.user_metadata ?? {};
  const full = String(meta.full_name ?? meta.name ?? "").trim();
  if (full) return full;

  const local = (user?.email || "").split("@")[0] || "";
  const cleaned = local
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, "")
    .trim();
  if (cleaned) {
    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return "Friend";
}
