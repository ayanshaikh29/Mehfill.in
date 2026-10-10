"use client";
import Link from "next/link";
import { ArrowUpRight, Mail, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import { WhatsAppIcon, InstagramIcon } from "./BrandIcons";
import { waLink, WA_MSG_GENERAL, INSTAGRAM_URL, SOCIAL_PROFILES } from "@/lib/contact";
import EmailLink from "./EmailLink";

const DEMOS = [
  { href: "/site-1", label: "Emerald Nikah" },
  { href: "/site-2", label: "Rose Nikah" },
  { href: "/site-3", label: "Royal Wedding" },
  { href: "/site-4", label: "Cinematic Wedding" },
  { href: "/site-5", label: "Reception" },
];

export default function Footer() {
  return (
    <footer className="border-t hairline bg-cream/50">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-14 grid grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1fr] gap-x-5 gap-y-8 md:gap-10">
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-3xl">Mehfill<span className="text-terracotta">.in</span></p>
          <p className="mt-1 text-[11px] font-bold tracking-[0.24em] text-charcoal/45">DIGITAL WEDDING &amp; EVENT INVITATIONS</p>
          <p className="mt-3 text-sm text-charcoal/60 italic font-serif text-lg">More Than an Invitation. An Experience.</p>
          <p className="mt-3 hidden max-w-xs text-[13px] leading-relaxed text-charcoal/55 md:block">
            Mehfill.in is a digital invitation platform for weddings, events and celebrations across India — digital wedding invitations, Nikah, birthdays, engagements and anniversaries.
          </p>
          <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-charcoal/45">
            Founded by Ayan Shaikh · Nashik, Maharashtra, India
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-col">
            <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
              <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
              <InstagramIcon className="h-4 w-4" /> @mehfill.inn <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            {SOCIAL_PROFILES.facebook && (
              <a href={SOCIAL_PROFILES.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
                <Facebook className="h-4 w-4" /> Facebook <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            {SOCIAL_PROFILES.x && (
              <a href={SOCIAL_PROFILES.x} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
                <Twitter className="h-4 w-4" /> X <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            {SOCIAL_PROFILES.linkedin && (
              <a href={SOCIAL_PROFILES.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
                <Linkedin className="h-4 w-4" /> LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            {SOCIAL_PROFILES.youtube && (
              <a href={SOCIAL_PROFILES.youtube} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
                <Youtube className="h-4 w-4" /> YouTube <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
            <span className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
              <Mail className="h-4 w-4" /> <EmailLink className="hover:text-terracotta" /> <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-charcoal/45">INVITATIONS</p>
          <nav aria-label="Invitation categories" className="mt-3 md:mt-4 flex flex-col gap-2 md:gap-2.5 text-[13px] md:text-[14px] font-medium">
            <Link href="/digital-wedding-invitations" className="hover:text-terracotta">Digital Wedding Invitations</Link>
            <Link href="/nikah-invitations" className="hover:text-terracotta">Nikah Invitations</Link>
            <Link href="/muslim-wedding-invitations" className="hover:text-terracotta">Muslim Wedding Invitations</Link>
            <Link href="/birthday-invitations" className="hover:text-terracotta">Birthday Invitations</Link>
            <Link href="/engagement-invitations" className="hover:text-terracotta">Engagement Invitations</Link>
            <Link href="/anniversary-invitations" className="hover:text-terracotta">Anniversary Invitations</Link>
            <Link href="/haldi-invitations" className="hover:text-terracotta">Haldi Invitations</Link>
            <Link href="/mehndi-invitations" className="hover:text-terracotta">Mehndi Invitations</Link>
            <Link href="/event-invitations" className="hover:text-terracotta">Event Invitations</Link>
            <Link href="/digital-invitations" className="hover:text-terracotta">All Digital Invitations</Link>
          </nav>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-charcoal/45">EXPLORE</p>
          <div className="mt-3 md:mt-4 flex flex-col gap-2 md:gap-2.5 text-[13px] md:text-[14px] font-medium">
            <Link href="/" className="hover:text-terracotta">Home</Link>
            <Link href="/demos" className="hover:text-terracotta">View Live Demos</Link>
            <Link href="/how-it-works" className="hover:text-terracotta">How It Works</Link>
            <Link href="/about" className="hover:text-terracotta">About Mehfill.in</Link>
            <Link href="/contact" className="hover:text-terracotta">Contact</Link>
            <Link href="/reviews" className="hover:text-terracotta">Customer Reviews</Link>
            <Link href="/#pricing" className="hover:text-terracotta">Pricing</Link>
            <Link href="/#faq" className="hover:text-terracotta">FAQ</Link>
            <Link href="/login" className="hover:text-terracotta">Sign in / Account</Link>
          </div>
        </div>
        <div className="col-span-2 md:col-span-4">
          <p className="text-[11px] font-bold tracking-[0.24em] text-charcoal/45">LIVE DEMOS</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-wrap">
            {DEMOS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="rounded-full border hairline bg-white/60 px-4 py-2 text-center text-[12.5px] font-semibold hover:border-terracotta hover:text-terracotta"
              >
                {d.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="col-span-2 md:col-span-4">
          <div className="flex flex-row flex-wrap gap-x-5 gap-y-2 text-[13px] md:text-[14px] font-medium">
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
