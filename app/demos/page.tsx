import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import ShowcaseCard from "@/components/ShowcaseCard";
import { SHOWCASE } from "@/lib/showcase";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { waLink } from "@/lib/contact";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Live Invitation Demos — Weddings, Birthdays & Engagements",
  description:
    "Open live Mehfill invitation demos — cinematic wedding, Nikah-style, engagement and birthday designs with events, galleries and RSVP. Find the style for your celebration.",
  alternates: { canonical: canonical("/demos") },
  openGraph: {
    title: "Live Invitation Demos | Mehfill.in",
    description: "Cinematic wedding, engagement and birthday invitation demos. Open and feel the experience.",
    url: canonical("/demos"),
    siteName: "Mehfill.in",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "Mehfill live invitation demos" }],
  },
};

export default function DemosIndex() {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
      { "@type": "ListItem", position: 2, name: "Live demos", item: canonical("/demos") },
    ],
  };
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <p className="eyebrow text-terracotta">LIVE DEMOS</p>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-6xl">Open a demo. <span className="italic">Feel the experience.</span></h1>
        <p className="mt-4 max-w-2xl text-charcoal/65 leading-relaxed">
          Real, live invitations — open one and feel it.
        </p>
        <div className="mt-6 md:mt-10 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-7">
          {SHOWCASE.map((s, i) => (
            <ShowcaseCard key={s.slug} s={s} index={i} />
          ))}

          {/* More demos coming soon */}
          <div className="group relative overflow-hidden rounded-[1.6rem] bg-charcoal text-ivory border border-white/10 shadow-[0_10px_40px_rgba(28,25,23,0.12)] p-4 md:p-7 flex flex-col justify-between min-h-[240px] md:min-h-[340px]">
            <div className="absolute inset-0 bg-gradient-to-br from-terracotta/20 via-transparent to-champagne/10 pointer-events-none" />
            <div>
              <span className="inline-block rounded-full bg-champagne/20 border border-champagne/30 backdrop-blur px-2.5 md:px-3.5 py-1 text-[9px] md:text-[11px] font-bold tracking-[0.14em] uppercase text-champagne-light">
                COMING SOON
              </span>
              <h3 className="mt-4 md:mt-6 font-serif font-light text-xl md:text-3xl leading-snug text-ivory">
                More Demos <span className="italic text-champagne-light">Coming Soon</span>
              </h3>
            </div>
            <div className="pt-4 md:pt-6 border-t border-white/10">
              <a
                href={waLink("Hi Mehfill! I want to request a custom invitation theme for my upcoming celebration.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-full bg-ivory py-2.5 md:py-3 text-[11px] md:text-sm font-bold text-charcoal hover:bg-champagne-light transition-colors"
              >
                <WhatsAppIcon className="h-4 w-4" /> Request Custom Design
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <h2 className="font-serif text-2xl md:text-3xl">Explore by celebration</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/digital-wedding-invitations" className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold">Digital Wedding Invitations</Link>
            <Link href="/nikah-invitations" className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold">Nikah Invitations</Link>
            <Link href="/birthday-invitations" className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold">Birthday Invitations</Link>
            <Link href="/engagement-invitations" className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold">Engagement Invitations</Link>
            <Link href="/anniversary-invitations" className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold">Anniversary Invitations</Link>
            <Link href="/haldi-invitations" className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold">Haldi Invitations</Link>
            <Link href="/mehndi-invitations" className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold">Mehndi Invitations</Link>
            <Link href="/event-invitations" className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold">Event Invitations</Link>
          </div>
        </div>
      </div>
      <CTA />
      <Footer />
    </main>
  );
}
