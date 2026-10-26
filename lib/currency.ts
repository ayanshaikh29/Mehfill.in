// Display-only currency system.
//
// INR is the single source of truth — every order, coupon, Razorpay charge and
// UPI payment happens in INR on the server. These rates only convert prices
// for *show* so international visitors see familiar numbers. Never feed a
// converted value into an API call.

export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AED" | "SAR" | "CAD" | "AUD" | "SGD";

interface CurrencyDef {
  /** Units of this currency per 1 INR (indicative, rounded). */
  rate: number;
  locale: string;
  label: string;
  symbol: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  INR: { rate: 1, locale: "en-IN", label: "INR (₹)", symbol: "₹" },
  USD: { rate: 0.012, locale: "en-US", label: "USD ($)", symbol: "$" },
  GBP: { rate: 0.0095, locale: "en-GB", label: "GBP (£)", symbol: "£" },
  EUR: { rate: 0.011, locale: "en-IE", label: "EUR (€)", symbol: "€" },
  AED: { rate: 0.044, locale: "en-AE", label: "AED (د.إ)", symbol: "AED" },
  SAR: { rate: 0.045, locale: "en-SA", label: "SAR (﷼)", symbol: "SAR" },
  CAD: { rate: 0.016, locale: "en-CA", label: "CAD ($)", symbol: "$" },
  AUD: { rate: 0.018, locale: "en-AU", label: "AUD ($)", symbol: "$" },
  SGD: { rate: 0.016, locale: "en-SG", label: "SGD ($)", symbol: "$" },
};

export const CURRENCY_STORAGE_KEY = "mf_currency";
export const CURRENCY_COOKIE = "mf_currency";

const REGION_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD",
  GB: "GBP",
  IE: "EUR",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  FI: "EUR",
  GR: "EUR",
  AE: "AED",
  SA: "SAR",
  QA: "SAR",
  KW: "SAR",
  CA: "CAD",
  AU: "AUD",
  SG: "SGD",
  IN: "INR",
};

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === "string" && v in CURRENCIES;
}

/** Region subtag of the browser language, e.g. "en-US" → "US". */
function regionFromLocale(locale: string | undefined | null): string | null {
  if (!locale) return null;
  const parts = locale.split("-");
  const region = parts[parts.length - 1];
  return region && region.length === 2 ? region.toUpperCase() : null;
}

/**
 * Browser timezone → currency — the reliable *location* proxy.
 *
 * navigator.language is NOT a location: plenty of machines physically in
 * India ship with an en-US Windows locale, which used to flip every price
 * to $ for visitors in India. The OS timezone reflects where the visitor
 * actually is, so India (Asia/Kolkata) always resolves to INR.
 */
function currencyFromTimezone(tz: string | null | undefined): CurrencyCode | null {
  if (!tz) return null;
  // Primary market first — India is the default everywhere.
  if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "INR";
  if (tz.startsWith("Europe/London")) return "GBP";
  if (tz === "Europe/Dublin") return "EUR";
  if (tz.startsWith("Asia/Dubai")) return "AED";
  if (tz.startsWith("Asia/Riyadh")) return "SAR";
  if (tz.startsWith("Asia/Qatar")) return "SAR";
  if (tz.startsWith("Asia/Kuwait")) return "SAR";
  if (tz.startsWith("Asia/Bahrain")) return "SAR";
  if (tz.startsWith("Asia/Singapore")) return "SGD";
  if (tz.startsWith("Australia/") || tz.startsWith("Antarctica/")) return "AUD";
  if (
    tz.startsWith("America/Toronto") ||
    tz.startsWith("America/Vancouver") ||
    tz.startsWith("America/Edmonton") ||
    tz.startsWith("America/Winnipeg") ||
    tz.startsWith("America/Halifax") ||
    tz.startsWith("America/St_Johns") ||
    tz.startsWith("America/Regina") ||
    tz.startsWith("America/Moncton") ||
    tz.startsWith("America/Iqaluit")
  ) {
    return "CAD";
  }
  if (tz.startsWith("America/")) return "USD";
  if (tz.startsWith("Europe/")) return "EUR";
  return null;
}

/** Stored preference → browser timezone → browser region → INR (primary market). */
export function detectCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "INR";
  try {
    const stored =
      window.localStorage.getItem(CURRENCY_STORAGE_KEY) ||
      document.cookie
        .split("; ")
        .find((c) => c.startsWith(`${CURRENCY_COOKIE}=`))
        ?.slice(CURRENCY_COOKIE.length + 1);
    if (isCurrencyCode(stored)) return stored;
  } catch {
    /* storage may be blocked */
  }
  // Location first (timezone), language tag only as a fallback.
  const tzCurrency = currencyFromTimezone(
    typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : null
  );
  if (tzCurrency) return tzCurrency;
  const region =
    regionFromLocale(typeof navigator !== "undefined" ? navigator.language : null) ||
    regionFromLocale(typeof navigator !== "undefined" ? navigator.languages?.[0] : null);
  if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  return "INR";
}

export function storeCurrency(code: CurrencyCode) {
  try {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    document.cookie = `${CURRENCY_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* storage may be blocked */
  }
}

/** Convert an INR amount and format it for display in the given currency. */
export function formatMoney(amountInINR: number, code: CurrencyCode): string {
  const def = CURRENCIES[code];
  const converted = amountInINR * def.rate;
  try {
    return new Intl.NumberFormat(def.locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: code === "INR" ? 0 : converted < 100 ? 2 : 0,
    }).format(converted);
  } catch {
    return `${def.symbol}${converted.toFixed(code === "INR" ? 0 : 2)}`;
  }
}
