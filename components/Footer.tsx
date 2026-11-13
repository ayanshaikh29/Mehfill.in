"use client";
import Link from "next/link";
import { ArrowUpRight, Mail, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import { WhatsAppIcon, InstagramIcon } from "./BrandIcons";
import { waLink, WA_MSG_GENERAL, INSTAGRAM_URL, SOCIAL_PROFILES } from "@/lib/contact";
import EmailLink from "./EmailLink";
import { useT } from "./i18n/I18nProvider";

const DEMOS = [
  { href: "/site-1", label: "Emerald Nikah" },
  { href: "/site-2", label: "Rose Nikah" },
  { href: "/site-3", label: "Royal Wedding" },
  { href: "/site-4", label: "Cinematic Wedding" },
  { href: "/site-5", label: "Reception" },
  { href: "/site-6", label: "Garden Wedding" },
  { href: "/site-7", label: "Royal Mandap" },
];

export default function Footer() {
  const t = useT();
  return (
    <footer className="border-t hairline bg-cream/50">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-14 grid grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1fr] gap-x-5 gap-y-8 md:gap-10">
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-3xl">Mehfill<span className="text-terracotta">.in</span></p>
          <p className="mt-1 text-[11px] font-bold tracking-[0.24em] text-charcoal/45">{t("footer.brandEyebrow")}</p>
          <p className="mt-3 text-sm text-charcoal/60 italic font-serif text-lg">{t("footer.tagline")}</p>
          <p className="mt-3 hidden max-w-xs text-[13px] leading-relaxed text-charcoal/55 md:block">
            {t("footer.blurb")}
          </p>
          <p className="mt-2 max-w-xs text-[12px] leading-relaxed text-charcoal/45">
            {t("footer.founder")}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-col">
            <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-terracotta">
              <WhatsAppIcon className="h-4 w-4" /> {t("footer.chatWa")} <ArrowUpRight className="h-3.5 w-3.5" />
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
          <p className="text-[11px] font-bold tracking-[0.24em] text-charcoal/45">{t("footer.invitations")}</p>
          <nav aria-label="Invitation categories" className="mt-3 md:mt-4 flex flex-col gap-2 md:gap-2.5 text-[13px] md:text-[14px] font-medium">
            <Link href="/digital-wedding-invitations" className="hover:text-terracotta">{t("footer.cWedding")}</Link>
            <Link href="/nikah-invitations" className="hover:text-terracotta">{t("footer.cNikah")}</Link>
            <Link href="/muslim-wedding-invitations" className="hover:text-terracotta">{t("footer.cMuslim")}</Link>
            <Link href="/birthday-invitations" className="hover:text-terracotta">{t("footer.cBirthday")}</Link>
            <Link href="/engagement-invitations" className="hover:text-terracotta">{t("footer.cEngagement")}</Link>
            <Link href="/anniversary-invitations" className="hover:text-terracotta">{t("footer.cAnniversary")}</Link>
            <Link href="/haldi-invitations" className="hover:text-terracotta">{t("footer.cHaldi")}</Link>
            <Link href="/mehndi-invitations" className="hover:text-terracotta">{t("footer.cMehndi")}</Link>
            <Link href="/event-invitations" className="hover:text-terracotta">{t("footer.cEvent")}</Link>
            <Link href="/baby-shower-invitations" className="hover:text-terracotta">Baby Shower</Link>
            <Link href="/digital-invitations" className="hover:text-terracotta">{t("footer.cAll")}</Link>
          </nav>
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-[0.24em] text-charcoal/45">{t("footer.explore")}</p>
          <div className="mt-3 md:mt-4 flex flex-col gap-2 md:gap-2.5 text-[13px] md:text-[14px] font-medium">
            <Link href="/" className="hover:text-terracotta">{t("footer.fHome")}</Link>
            <Link href="/demos" className="hover:text-terracotta">{t("footer.fDemos")}</Link>
            <Link href="/how-it-works" className="hover:text-terracotta">{t("footer.fHow")}</Link>
            <Link href="/about" className="hover:text-terracotta">{t("footer.fAbout")}</Link>
            <Link href="/contact" className="hover:text-terracotta">{t("footer.fContact")}</Link>
            <Link href="/reviews" className="hover:text-terracotta">{t("footer.fReviews")}</Link>
            <Link href="/blog" className="hover:text-terracotta">Blog</Link>
            <Link href="/#pricing" className="hover:text-terracotta">{t("footer.fPricing")}</Link>
            <Link href="/#faq" className="hover:text-terracotta">{t("footer.fFaq")}</Link>
            <Link href="/login" className="hover:text-terracotta">{t("footer.fAccount")}</Link>
          </div>
        </div>
        <div className="col-span-2 md:col-span-4">
          <p className="text-[11px] font-bold tracking-[0.24em] text-charcoal/45">{t("footer.liveDemos")}</p>
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
            <Link href="/privacy-policy" className="hover:text-terracotta">{t("footer.privacy")}</Link>
            <Link href="/terms-and-conditions" className="hover:text-terracotta">{t("footer.terms")}</Link>
            <Link href="/refund-policy" className="hover:text-terracotta">{t("footer.refunds")}</Link>
            <Link href="/cookie-policy" className="hover:text-terracotta">{t("footer.cookies")}</Link>
            <button
              onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
              className="text-left hover:text-terracotta"
            >
              {t("footer.cookieSettings")}
            </button>
          </div>
        </div>
      </div>
      <div className="border-t hairline">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-5 flex flex-col sm:flex-row justify-between gap-2 text-[12.5px] text-charcoal/50">
          <span>{t("footer.rights")}</span>
          <span className="font-serif italic">{t("footer.createLine")}</span>
        </div>
      </div>
    </footer>
  );
}
