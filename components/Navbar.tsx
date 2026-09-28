"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import AuthButton from "./AuthButton";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";

const LINKS = [
  { label: "Home", href: "#top" },
  { label: "View Demos", href: "#designs" },
  { label: "How It Works", href: "#how" },
  { label: "Occasions", href: "#occasions" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#cta" },
];

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
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-ivory/85 backdrop-blur-xl border-b hairline shadow-[0_8px_30px_rgba(28,25,23,0.06)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8 py-4">
          <Link href="#top" className="font-serif text-2xl md:text-[1.7rem] tracking-tight leading-none">
            <span className="font-semibold">Mehfill</span>
            <span className="text-terracotta">.in</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-[13.5px] font-medium tracking-wide text-charcoal/70">
            {LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="hover:text-charcoal transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <AuthButton />
            <a
              href={waLink(WA_MSG_GENERAL)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-[13.5px] font-semibold text-ivory hover:bg-espresso transition-all"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Get Your Invitation
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          <button
            aria-label="Menu"
            onClick={() => setOpen(true)}
            className="lg:hidden rounded-full border hairline p-2.5 bg-ivory/70 backdrop-blur"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-charcoal text-ivory flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-serif text-2xl">Mehfill<span className="text-champagne">.in</span></span>
              <button aria-label="Close" onClick={() => setOpen(false)} className="rounded-full border border-white/20 p-2.5">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center px-8 gap-2">
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
                    className="font-serif text-5xl font-light py-2 block hover:text-champagne transition-colors"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="pt-8">
                <a
                  href={waLink(WA_MSG_GENERAL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-ivory text-charcoal px-7 py-3.5 font-semibold"
                >
                  <WhatsAppIcon className="h-4 w-4" /> Get Your Invitation <ArrowUpRight className="h-4 w-4" />
                </a>
                <div className="mt-4">
                  <AuthButton dark />
                </div>
                <p className="mt-6 text-sm text-ivory/50 tracking-wide">More Than an Invitation. An Experience.</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
