"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X, ChevronRight, User, Globe, Loader2 } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import AuthButton from "./AuthButton";
import LanguageSwitcher from "./i18n/LanguageSwitcher";
import CurrencySwitcher from "./i18n/CurrencySwitcher";
import { useT, useI18n } from "./i18n/I18nProvider";
import { useCurrency } from "./i18n/CurrencyProvider";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

const CURRENCY_ORDER: CurrencyCode[] = ["INR", "USD", "GBP", "EUR", "AED", "SAR", "CAD", "AUD", "SGD"];

function Wordmark({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden ${className}`}
      style={{ aspectRatio: "901 / 319" }}
      aria-label="Mehfill.in — home"
      role="img"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Image
        src="/logo-transparent.png"
        alt="Mehfill.in"
        width={452}
        height={160}
        sizes="(max-width: 768px) 140px, 180px"
        draggable={false}
        className={`absolute inset-0 h-full w-full object-contain ${
          light ? "brightness-0 invert-[0.93]" : ""
        }`}
      />
    </span>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);

  const t = useT();
  const { locale, setLocale } = useI18n();
  const { currency, setCurrency } = useCurrency();

  const LINKS = [
    { label: t("nav.home"), href: "/#top" },
    { label: t("nav.designs"), href: "/templates" },
    { label: "Videos", href: "/wedding-invitation-video" },
    { label: t("nav.demos"), href: "/#designs" },
    { label: t("nav.how"), href: "/how-it-works" },
    { label: t("nav.pricing"), href: "/#pricing" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleBusy(true);
      const supabase = createClient();
      const redirectUri = `${window.location.origin}/auth/callback?next=/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
    } catch {
      window.location.href = "/login";
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-5 md:pt-4">
        <motion.nav
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border py-2.5 pl-4 pr-2.5 transition-all duration-500 md:rounded-full md:py-2 md:pl-5 ${
            scrolled
              ? "border-charcoal/10 bg-ivory/85 shadow-[0_12px_40px_rgba(28,25,23,0.12)] backdrop-blur-md md:backdrop-blur-xl"
              : "border-white/40 bg-ivory/60 shadow-[0_8px_30px_rgba(28,25,23,0.06)] backdrop-blur-md md:backdrop-blur-lg"
          }`}
        >
          <Link href="/#top" className="group flex min-w-0 shrink-0 items-center" aria-label="Mehfill.in home">
            <Wordmark className="w-[132px] transition-transform duration-500 group-hover:scale-[1.03] sm:w-[148px] md:w-[168px]" />
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-charcoal/[0.07] bg-white/60 px-1.5 py-1 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="group relative rounded-full px-3.5 py-2 text-[13px] font-semibold tracking-wide text-charcoal/65 transition-colors hover:bg-charcoal/[0.05] hover:text-charcoal"
              >
                {l.label}
                <span
                  aria-hidden
                  className="absolute inset-x-3.5 -bottom-px h-px origin-left scale-x-0 bg-gradient-to-r from-terracotta to-champagne transition-transform duration-300 group-hover:scale-x-100"
                />
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <CurrencySwitcher />
            <AuthButton />
            <a
              href={waLink(WA_MSG_GENERAL)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-charcoal px-5 py-2.5 text-[13.5px] font-semibold text-ivory transition-all hover:bg-espresso hover:shadow-[0_8px_24px_rgba(28,25,23,0.3)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
              <WhatsAppIcon className="h-4 w-4" />
              {t("nav.order")}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          <button
            aria-label={t("nav.menuOpen")}
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full border border-charcoal/10 bg-white/70 p-2.5 text-charcoal backdrop-blur transition-colors hover:bg-white active:scale-95 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </motion.nav>
      </header>

      {/* ── Luxury Mobile Menu Drawer Matching User Reference Exactly ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex flex-col bg-[#141210] text-ivory overflow-y-auto"
          >
            {/* Header: Brand Wordmark + Circular Close Button */}
            <div className="flex shrink-0 items-center justify-between px-6 pt-6 pb-2">
              <Link href="/" onClick={() => setOpen(false)} aria-label="Mehfill.in Home">
                <Wordmark light className="w-[142px] sm:w-[160px]" />
              </Link>
              <button
                aria-label={t("nav.menuClose")}
                onClick={() => setOpen(false)}
                className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white/90 hover:bg-white/10 active:scale-95 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Menu Body */}
            <div className="flex min-h-0 flex-1 flex-col justify-between px-6 py-4">
              
              {/* Nav Links with Right Chevron (>) */}
              <div className="flex flex-col my-auto py-2">
                {LINKS.map((l, i) => (
                  <motion.div
                    key={l.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.03 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between py-3 sm:py-3.5 transition-colors hover:text-champagne"
                    >
                      <span className="font-serif text-[26px] sm:text-[30px] font-normal tracking-wide text-[#f5ede3] group-hover:text-champagne transition-colors">
                        {l.label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-white/35 group-hover:text-champagne group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Actions Section */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="pt-4 border-t border-white/15 flex flex-col gap-2.5 shrink-0 pb-4"
              >
                {/* 1. Google One-Tap Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleBusy}
                  className="w-full flex items-center justify-center gap-2.5 rounded-full border border-white/25 bg-white/[0.08] hover:bg-white/15 py-3 text-sm font-semibold text-white transition-all active:scale-[0.99] disabled:opacity-60 shadow-sm"
                >
                  {googleBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-champagne" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>

                {/* 2. Email Sign In / User Account Pill */}
                <Link
                  href={userEmail ? "/dashboard" : "/login"}
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-white/25 bg-transparent hover:bg-white/5 py-3 text-sm font-semibold text-white transition-all active:scale-[0.99]"
                >
                  <User className="h-4 w-4 text-white/85" />
                  <span>{userEmail ? `My Account (${userEmail.split('@')[0]})` : "Sign In with Email"}</span>
                </Link>

                {/* 3. Language & Currency Split Pill */}
                <div className="w-full rounded-full border border-white/25 grid grid-cols-2 divide-x divide-white/20 bg-white/[0.04] overflow-hidden">
                  {/* Left: Language */}
                  <label className="relative flex items-center justify-center py-2.5 px-3 cursor-pointer hover:bg-white/5 transition-colors">
                    <Globe className="h-3.5 w-3.5 text-white/80 mr-2 shrink-0" />
                    <span className="text-[12.5px] font-semibold text-white mr-1.5">
                      {LOCALE_LABELS[locale]?.native || "English"}
                    </span>
                    <select
                      value={locale}
                      onChange={(e) => setLocale(e.target.value as Locale)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      aria-label="Select language"
                    >
                      {LOCALES.map((l) => (
                        <option key={l} value={l} className="bg-charcoal text-white">
                          {LOCALE_LABELS[l].native} ({LOCALE_LABELS[l].english})
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Right: Currency */}
                  <label className="relative flex items-center justify-center py-2.5 px-3 cursor-pointer hover:bg-white/5 transition-colors">
                    <span className="text-[12px] font-bold text-white/80 mr-1.5">
                      {CURRENCIES[currency]?.symbol || "₹"}
                    </span>
                    <span className="text-[12.5px] font-semibold text-white">
                      {currency} ({CURRENCIES[currency]?.symbol || "₹"})
                    </span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      aria-label="Select currency"
                    >
                      {CURRENCY_ORDER.map((c) => (
                        <option key={c} value={c} className="bg-charcoal text-white">
                          {c} ({CURRENCIES[c]?.symbol || c})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* 4. Get Your Invitation Solid Ivory Button */}
                <Link
                  href="/templates"
                  onClick={() => setOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#f8f5ee] hover:bg-[#eee8dc] text-[#141210] font-semibold py-3.5 text-sm shadow-lg transition-all active:scale-[0.99]"
                >
                  <span>Get Your Invitation</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

                {/* 5. Tagline */}
                <p className="mt-1 text-center font-serif text-[12px] italic text-white/40 tracking-wider">
                  More Than an Invitation. An Experience.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
