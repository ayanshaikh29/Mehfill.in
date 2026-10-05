import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import { TEMPLATES } from "@/lib/templates";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Live Invitation Demos — Weddings, Birthdays & Engagements",
  description:
    "Open live Mehfill invitation demos — cinematic wedding, Nikah-style, engagement and birthday designs with events, galleries and RSVP. Find the style for your celebration.",
  alternates: { canonical: canonical("/demos") },
  openGraph: {
    title: "Live Invitation Demos | Mehfill",
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
          Real invitation designs your guests would open — weddings, engagements and birthdays.
          Each demo includes events, galleries and RSVP. Love one? We customise it with your names, dates and photos.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {TEMPLATES.map((t) => (
            <Link key={t.slug} href={`/demos/${t.slug}`} className="group relative overflow-hidden rounded-[1.6rem] bg-white border hairline shadow-sm hover:shadow-xl transition-shadow">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={t.image}
                  alt={`${t.name} — ${t.occasion} digital invitation demo by Mehfill`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={70}
                  className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                  <p className="font-serif text-3xl">{t.name}</p>
                  <p className="mt-1 text-[13px] text-ivory/80">{t.tagline}</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-charcoal/60 line-clamp-2">{t.description}</p>
                <span className="mt-3 inline-block rounded-full bg-charcoal px-5 py-2.5 text-[12px] font-bold text-ivory">Open demo</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12 rounded-[1.6rem] border hairline bg-cream/60 p-6 md:p-8">
          <h2 className="font-serif text-2xl md:text-3xl">Static invitation showcases</h2>
          <p className="mt-2 text-charcoal/65">Our handcrafted Nikah and wedding showcases — full cinematic pages:</p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {["site-1", "site-2", "site-3", "site-4"].map((s, i) => (
              <Link key={s} href={`/${s}`} className="rounded-full bg-charcoal px-5 py-2.5 text-[13px] font-semibold text-ivory">
                {["Emerald Nikah — Hamza & Maryam", "Rose Nikah — Arham & Zoya", "Royal Wedding showcase", "Cinematic Wedding showcase"][i]}
              </Link>
            ))}
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
          </div>
        </div>
      </div>
      <CTA />
      <Footer />
    </main>
  );
}
