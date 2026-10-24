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

/** Stored preference → browser region → INR (primary market). */
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
