import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import { canonical } from "@/lib/seo";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";

const SLUG = "how-it-works";

const STEPS = [
  {
    title: "Explore invitations on the website",
    text: "Open our live demos and invitation collections — digital wedding invitations, Nikah, engagements, birthdays, anniversaries and events. Find the style that feels like your celebration. No account needed to browse.",
    cta: { label: "Explore Invitations", href: "/demos" },
  },
  {
    title: "Choose your plan",
    text: "Pick Essential (₹999, delivery in 3 days), Signature (₹1,700, delivery in 2 days) or Royal (₹2,500, priority 24–48 hours). Every plan includes design revisions and transparent pricing on the website — no hidden charges.",
    cta: { label: "See Pricing", href: "/#pricing" },
  },
  {
    title: "Share your celebration details",
    text: "Message us on WhatsApp with your names, date, venue, event schedule, photos and any special wording, blessings or music. Just forward everything — we organise it into your invitation.",
    cta: { label: "Chat on WhatsApp", href: waLink(WA_MSG_GENERAL), external: true },
  },
  {
    title: "Pay securely and get confirmed",
    text: "Pay directly by UPI transfer and submit your transaction ID on this website. We verify every payment manually and confirm your order personally on WhatsApp or email before design begins.",
    cta: { label: "Contact Us", href: "/contact" },
  },
  {
    title: "Review the design and request changes",
    text: "We design your custom invitation and share a preview. Request revisions — 1 in Essential, 3 in Signature, 7 days of revisions in Royal — until you love it.",
    cta: { label: "About Our Craft", href: "/about" },
  },
  {
    title: "Receive your link and share it",
    text: "Get one beautiful link for your invitation — events, maps, photos, music and RSVP included. Share it on WhatsApp with every guest; it opens on any phone with no app needed.",
    cta: { label: "View Demo", href: "/site-1" },
  },
];

export function generateMetadata(): Metadata {
  const url = canonical(`/${SLUG}`);
  const title = "How It Works — Order Your Digital Invitation";
  const description =
    "How ordering a Mehfill.in digital invitation works: explore demos, choose a plan, share details on WhatsApp, pay by UPI, review the design, and share your link.";
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Mehfill.in",
      locale: "en_IN",
      type: "website",
      images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "How Mehfill.in digital invitations work" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-cover.png"],
    },
  };
}

function JsonLd() {
  const url = canonical(`/${SLUG}`);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
      { "@type": "ListItem", position: 2, name: "How It Works", item: url },
    ],
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to order a digital invitation from Mehfill.in",
    description:
      "Order a custom digital wedding or event invitation from Mehfill.in: explore demos, choose a plan, share details, pay, review the design, and share your link.",
    totalTime: "P3D",
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.text,
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
    </>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen">
      <JsonLd />
      <Navbar />
      <article className="mx-auto max-w-4xl px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45">
          <Link href="/" className="hover:text-terracotta">HOME</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">HOW IT WORKS</span>
        </nav>
        <p className="eyebrow mt-5 text-terracotta">HOW IT WORKS</p>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance">
          From demo to doorbell in six steps
        </h1>
        <p className="mt-5 text-[16px] md:text-lg leading-relaxed text-charcoal/70">
          Ordering a Mehfill.in digital invitation is a guided, done-for-you service — you explore
          and choose on this website, and our designers handle the rest with personal support on
          WhatsApp at every step.
        </p>

        <div className="mt-10 grid gap-4">
          {STEPS.map((s, i) => (
            <section key={s.title} className="rounded-[1.4rem] border hairline bg-white p-6 md:p-8">
              <p className="font-serif italic text-terracotta text-lg">Step {i + 1}</p>
              <h2 className="mt-1 font-serif font-light text-2xl md:text-3xl">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-charcoal/70">{s.text}</p>
              {"external" in s.cta && s.cta.external ? (
                <a
                  href={s.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-ivory hover:bg-espresso"
                >
                  {s.cta.label}
                </a>
              ) : (
                <Link
                  href={s.cta.href}
                  className="mt-4 inline-block rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-ivory hover:bg-espresso"
                >
                  {s.cta.label}
                </Link>
              )}
            </section>
          ))}
        </div>

        <section className="mt-12 rounded-[1.4rem] border hairline bg-cream/60 p-6 md:p-8">
          <h2 className="font-serif font-light text-2xl md:text-3xl">Delivery and revisions, honestly stated</h2>
          <p className="mt-3 leading-relaxed text-charcoal/70">
            Essential delivers in 3 days, Signature in 2 days, Royal in 24–48 hours on priority —
            with 1, 3, and 7 days of revisions respectively. Festival and wedding-season rush may
            take longer; we tell you upfront before confirmation. Read the{" "}
            <Link href="/refund-policy" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">refund &amp; cancellation policy</Link>
            {" "}and <Link href="/about" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">about Mehfill.in</Link>{" "}
            for the full picture.
          </p>
        </section>
      </article>
      <CTA />
      <Footer />
    </main>
  );
}
