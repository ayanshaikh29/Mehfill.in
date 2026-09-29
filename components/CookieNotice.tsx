"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const KEY = "mehfill_cookie_choice";

// Honest notice: Mehfill uses ONLY strictly-necessary storage
// (login session, cart, this choice). No analytics, no trackers.
// One dismiss button + policy link + footer can re-open it.
export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        const id = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(id);
      }
    } catch {
      setVisible(true);
    }
    const reopen = () => setVisible(true);
    window.addEventListener("open-cookie-settings", reopen);
    return () => window.removeEventListener("open-cookie-settings", reopen);
  }, []);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ essential: true, at: new Date().toISOString() }));
    } catch {
      // private mode — notice will simply reappear next visit
    }
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-xl rounded-3xl border hairline bg-white/95 p-5 shadow-[0_20px_60px_rgba(28,25,23,0.25)] backdrop-blur sm:bottom-6"
    >
      <p className="font-serif text-xl">A note on cookies.</p>
      <p className="mt-1.5 text-sm leading-relaxed text-charcoal/70">
        We use only strictly-necessary storage — your login session, your cart, and this choice.
        No analytics, no advertising trackers.{" "}
        <Link href="/cookie-policy" className="font-semibold text-terracotta-deep underline underline-offset-2">
          Cookie Policy
        </Link>
      </p>
      <div className="mt-4 flex gap-2.5">
        <button
          onClick={dismiss}
          autoFocus
          className="flex-1 rounded-full bg-charcoal py-3 text-sm font-bold text-ivory hover:bg-espresso"
        >
          Understood
        </button>
        <Link
          href="/privacy-policy"
          className="rounded-full border hairline px-6 py-3 text-sm font-bold hover:border-charcoal/40"
        >
          Privacy
        </Link>
      </div>
    </div>
  );
}
