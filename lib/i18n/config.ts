// Internationalisation configuration — the language layer for the whole app.
// Adding a language = add its Locale entry here + a dictionary file.
// RTL rendering is driven by RTL_LOCALES (dir="rtl" on <html>).

export type Locale = "en" | "hi" | "mr" | "ur";

export const LOCALES: Locale[] = ["en", "hi", "mr", "ur"];

export const RTL_LOCALES: Locale[] = ["ur"];

export const LOCALE_COOKIE = "mf_locale";

export const LOCALE_LABELS: Record<Locale, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  hi: { native: "हिन्दी", english: "Hindi" },
  mr: { native: "मराठी", english: "Marathi" },
  ur: { native: "اردو", english: "Urdu" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}
