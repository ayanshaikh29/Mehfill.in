"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isLocale, isRTL, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => undefined,
  t: (key) => key,
});

function readStoredLocale(): Locale | null {
  try {
    const fromCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${LOCALE_COOKIE}=`))
      ?.slice(LOCALE_COOKIE.length + 1);
    if (isLocale(fromCookie)) return fromCookie;
    const fromLocal = window.localStorage.getItem(LOCALE_COOKIE);
    if (isLocale(fromLocal)) return fromLocal;
  } catch {
    /* storage may be blocked */
  }
  return null;
}

function storeLocale(locale: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    /* storage may be blocked */
  }
}

export function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = isRTL(locale) ? "rtl" : "ltr";
}

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored && stored !== "en") setLocaleState(stored);
    else applyDocumentLocale("en");
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    storeLocale(next);
    applyDocumentLocale(next);
  }, []);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

/** Shorthand for components: const t = useT(); t("hero.title") */
export function useT() {
  return useContext(I18nContext).t;
}
