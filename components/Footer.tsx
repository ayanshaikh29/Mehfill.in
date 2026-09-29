"use client";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { WhatsAppIcon, InstagramIcon } from "./BrandIcons";
import { waLink, WA_MSG_GENERAL, INSTAGRAM_URL, CONTACT_EMAIL } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="border-t hairline bg-cream/50">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 grid sm:grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1fr] gap-10">
        <div>
          <p className="font-serif text-3xl">Mehfill<span className="text-terracotta">.in</span></p>
          <p className="mt-3 text-sm text-charcoal/60 italic font-serif text-lg">More Than an Invitation. An Experience.</p>
          <div className="mt-5 flex flex-col gap-2.5">
            <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
              <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
              <InstagramIcon className="h-4 w-4" /> @mehfill.inn <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
              <Mail className="h-4 w-4" /> {CONTACT_EMAIL} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-charcoal/45">EXPLORE</p>
          <div className="mt-4 flex flex-col gap-2.5 text-[14px] font-medium">
            <Link href="#designs" className="hover:text-terracotta">View Demos</Link>
            <Link href="#occasions" className="hover:text-terracotta">Occasions</Link>
            <Link href="#how" className="hover:text-terracotta">How It Works</Link>
            <Link href="#pricing" className="hover:text-terracotta">Pricing</Link>
            <Link href="#faq" className="hover:text-terracotta">FAQ</Link>
            <Link href="#cta" className="hover:text-terracotta">Contact</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-charcoal/45">CONTACT</p>
          <div className="mt-4 flex flex-col gap-2.5 text-[14px] font-medium">
            <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer" className="hover:text-terracotta">WhatsApp Us</a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-terracotta break-all">{CONTACT_EMAIL}</a>
            <Link href="/login" className="hover:text-terracotta">Sign in / Account</Link>
            <Link href="#top" className="hover:text-terracotta">Back to top ↑</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-charcoal/45">LEGAL</p>
          <div className="mt-4 flex flex-col gap-2.5 text-[14px] font-medium">
            <Link href="/privacy-policy" className="hover:text-terracotta">Privacy Policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-terracotta">Terms &amp; Conditions</Link>
            <Link href="/refund-policy" className="hover:text-terracotta">Refund Policy</Link>
            <Link href="/cookie-policy" className="hover:text-terracotta">Cookie Policy</Link>
            <button
              onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
              className="text-left hover:text-terracotta"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-5 flex flex-col sm:flex-row justify-between gap-2 text-[12.5px] text-charcoal/50">
          <span>© 2026 Mehfill.in. All rights reserved.</span>
          <span className="font-serif italic">Create. Invite. Celebrate.</span>
        </div>
      </div>
    </footer>
  );
}
