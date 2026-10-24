"use client";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { useCurrency } from "./CurrencyProvider";

const ORDER: CurrencyCode[] = ["INR", "USD", "GBP", "EUR", "AED", "SAR", "CAD", "AUD", "SGD"];

/** Compact currency select for the navbar — display preference only. */
export default function CurrencySwitcher({ dark = false }: { dark?: boolean }) {
  const { currency, setCurrency } = useCurrency();

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        className={`appearance-none rounded-full border px-3 py-1.5 pr-7 text-[12.5px] font-semibold outline-none transition-colors ${
          dark
            ? "border-white/20 bg-white/10 text-ivory hover:border-white/40"
            : "hairline bg-white/70 text-charcoal/75 hover:border-charcoal/30"
        }`}
      >
        {ORDER.map((code) => (
          <option key={code} value={code}>
            {CURRENCIES[code].label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 12 8"
        className={`pointer-events-none absolute right-2.5 h-2 w-3 ${dark ? "text-ivory/60" : "text-charcoal/45"}`}
      >
        <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </label>
  );
}
