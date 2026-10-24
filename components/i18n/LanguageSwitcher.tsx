"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "./I18nProvider";

/**
 * Language selector — desktop pill dropdown + compact variant for the
 * mobile drawer. The current language is shown in its native script.
 */
export default function LanguageSwitcher({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LOCALE_LABELS[locale];

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        onClick={() => setOpen((v) => !v)}
        className={
          compact
            ? "inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-[13px] font-semibold text-ivory transition-colors hover:bg-white/10 w-full justify-center"
            : `inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                dark
                  ? "border-white/20 text-ivory hover:bg-white/10"
                  : "border-charcoal/10 bg-white/70 text-charcoal/70 hover:bg-white hover:text-charcoal"
              }`
        }
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">{current.native}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-charcoal/10 bg-white py-1.5 shadow-[0_16px_48px_rgba(28,25,23,0.18)]"
        >
          {LOCALES.map((l: Locale) => {
            const label = LOCALE_LABELS[l];
            const active = l === locale;
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLocale(l);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-start text-[13.5px] transition-colors hover:bg-cream ${
                    active ? "font-bold text-terracotta" : "text-charcoal/75"
                  }`}
                >
                  <span>
                    <span className="block leading-tight">{label.native}</span>
                    <span className="block text-[11px] tracking-wide text-charcoal/40">{label.english}</span>
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-terracotta" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
