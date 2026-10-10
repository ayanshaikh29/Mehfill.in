"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import AuthButton from "./AuthButton";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";

const LINKS = [
  { label: "Home", href: "/#top" },
  { label: "View Demos", href: "/#designs" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Occasions", href: "/#occasions" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/contact" },
];

function Wordmark({ className = "", light = false }: { className?: string; light?: boolean }) {
  // Transparent wordmark (no background) — sits cleanly on the floating pill.
  // On dark (mobile menu) render it in ivory via invert so the espresso
  // artwork stays readable on charcoal.
  // NOTE: img is absolute, so parent MUST have an explicit width — otherwise
  // aspect-ratio has nothing to size from and the logo collapses to 0px.
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              Get Your Invitation
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full border border-charcoal/10 bg-white/70 p-2.5 text-charcoal backdrop-blur transition-colors hover:bg-white active:scale-95 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </motion.nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-charcoal text-ivory"
          >
            <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
              <Wordmark light className="w-[132px] sm:w-[150px]" />
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/20 p-2.5 transition-colors hover:bg-white/10 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-1 px-6 py-6 sm:gap-2 sm:px-8">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-1.5 font-serif text-4xl font-light leading-[1.05] transition-colors hover:text-champagne sm:py-2 sm:text-5xl"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="pt-6 sm:pt-8">
                <a
                  href={waLink(WA_MSG_GENERAL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-ivory px-6 py-3 text-sm font-semibold text-charcoal sm:px-7 sm:py-3.5 sm:text-base"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Get Your Invitation <ArrowUpRight className="h-4 w-4" />
                </a>
                <div className="mt-4">
                  <AuthButton dark />
                </div>
                <p className="mt-6 font-serif text-sm italic text-ivory/50 tracking-wide">
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
