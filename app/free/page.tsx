import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { canonical } from "@/lib/seo";
import { ArrowRight, Sparkles, CalendarSearch, UsersRound } from "lucide-react";

const PAGE_URL = canonical("/free");

export const metadata: Metadata = {
  title: "Free Wedding Tools — Invitation Wording & More",
  description:
    "Free tools from Mehfill.in: WhatsApp invitation wording generator in English, Hindi and Urdu, plus more celebration helpers to plan your event.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Free Wedding Tools | Mehfill.in",
    description:
      "Free WhatsApp invitation wording generator (EN · HI · UR) and more celebration helpers.",
    url: PAGE_URL,
    siteName: "Mehfill.in",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "Free wedding tools from Mehfill.in" }],
  },
};

const TOOLS = [
  {
    href: "/free/whatsapp-invitation-wording",
    icon: Sparkles,
    title: "WhatsApp Invitation Wording Generator",
    desc: "Ready-to-send wedding, Nikah, Haldi and Sangeet invitation messages in English, Hindi and Urdu — pick a tone, copy, send.",
    status: "live" as const,
  },
  {
    href: null,
    icon: CalendarSearch,
    title: "Muhurat / Date Finder",
    desc: "Shortlist auspicious dates for your ceremony with family-friendly filters.",
    status: "soon" as const,
  },
  {
    href: null,
    icon: UsersRound,
    title: "Seating & RSVP Calculator",
    desc: "Turn RSVP responses into head-counts and table plans automatically.",
    status: "soon" as const,
  },
];

export default function FreeToolsIndex() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
      { "@type": "ListItem", position: 2, name: "Free Tools", item: PAGE_URL },
    ],
  };
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Navbar />
      <div className="mx-auto max-w-5xl px-5 md:px-8 pt-28 md:pt-36 pb-16">
        <p className="eyebrow text-terracotta">FREE TOOLS</p>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-6xl leading-[1.05]">
          Little tools for <span className="italic">big celebrations</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] md:text-lg leading-relaxed text-charcoal/70">
          No sign-up, no watermarks — free helpers to plan and word your invitation.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            const live = t.status === "live";
            const inner = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 border border-terracotta/20">
                    <Icon className="h-5 w-5 text-terracotta" />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                      live ? "bg-[#EDF5E9] border border-[#C5E1BB] text-[#2F6824]" : "bg-charcoal/5 border border-charcoal/10 text-charcoal/50"
                    }`}
                  >
                    {live ? "Live" : "Coming soon"}
                  </span>
                </div>
                <h2 className="mt-5 font-serif text-xl md:text-2xl leading-snug">{t.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/65">{t.desc}</p>
                {live && (
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-terracotta">
                    Open tool <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </>
            );
            const cls =
              "group flex h-full flex-col rounded-[1.6rem] border border-charcoal/12 bg-white/80 backdrop-blur-md p-6 shadow-[0_10px_36px_rgba(28,25,23,0.06)] transition-all";
            return t.href ? (
              <Link key={t.title} href={t.href} className={cls + " hover:border-terracotta/50 hover:-translate-y-0.5"}>
                {inner}
              </Link>
            ) : (
              <div key={t.title} className={cls + " opacity-70"}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
