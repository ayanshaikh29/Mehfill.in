"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  detectCurrency,
  formatMoney,
  isCurrencyCode,
  storeCurrency,
  type CurrencyCode,
} from "@/lib/currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Formats an INR base amount for display in the selected currency. */
  format: (amountInINR: number) => string;
  /** True when the visitor sees something other than INR. */
  converted: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "INR",
  setCurrency: () => undefined,
  format: (n) => `₹${n}`,
  converted: false,
});

export default function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");

  useEffect(() => {
    // Deferred so the sync-detection setState never runs during the effect
    // commit itself (keeps the React compiler lint happy + avoids one
    // extra synchronous re-render).
    const id = setTimeout(() => {
      const detected = detectCurrency();
      if (detected !== "INR") setCurrencyState(detected);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (!isCurrencyCode(code)) return;
    setCurrencyState(code);
    storeCurrency(code);
  }, []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      setCurrency,
      format: (amountInINR) => formatMoney(amountInINR, currency),
      converted: currency !== "INR",
    }),
    [currency, setCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
