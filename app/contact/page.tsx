import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import EmailLink from "@/components/EmailLink";
import { WhatsAppIcon, InstagramIcon } from "@/components/BrandIcons";
import { canonical } from "@/lib/seo";
import { CONTACT_EMAIL, INSTAGRAM_URL, waLink, WA_MSG_GENERAL } from "@/lib/contact";

const SLUG = "contact";

export function generateMetadata(): Metadata {
  const url = canonical(`/${SLUG}`);
  const title = "Contact Mehfill.in — WhatsApp, Email & Support";
  const description =
    "Contact Mehfill.in for orders and support — chat on WhatsApp, send an email, or follow our Instagram. Every order is confirmed personally.";
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
      images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "Contact Mehfill.in — digital invitation support" }],
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
      { "@type": "ListItem", position: 2, name: "Contact", item: url },
    ],
  };
  const orgWithContact = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://mehfill.in/#organization",
    name: "Mehfill.in",
    url: "https://mehfill.in/",
    logo: "https://mehfill.in/logo.png",
    description:
      "Mehfill.in is a digital invitation platform for weddings, events and celebrations.",
    founder: {
      "@type": "Person",
      name: "Ayan Shaikh",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nashik",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: "+91-7499827349",
      email: CONTACT_EMAIL,
      areaServed: "IN",
      availableLanguage: ["en", "hi", "ur"],
    },
    sameAs: [INSTAGRAM_URL],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgWithContact) }} />
    </>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <JsonLd />
      <Navbar />
      <article className="mx-auto max-w-4xl px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45">
          <Link href="/" className="hover:text-terracotta">HOME</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">CONTACT</span>
        </nav>
        <p className="eyebrow mt-5 text-terracotta">CONTACT MEHFILL.IN</p>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance">
          Talk to us — we reply personally
        </h1>
        <p className="mt-5 text-[16px] md:text-lg leading-relaxed text-charcoal/70">
          Mehfill.in is an online studio founded by Ayan Shaikh, based in Nashik, Maharashtra
          and serving customers across India. There is no call centre and no ticket queue —
          message us and a real person responds. Every order is confirmed personally on
          WhatsApp or email before design begins.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.4rem] border hairline bg-white p-6 hover:border-charcoal/30 transition-colors">
            <WhatsAppIcon className="h-6 w-6 text-terracotta" />
            <h2 className="mt-3 font-serif text-2xl">WhatsApp</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
              Fastest for orders and support. Share your names, date, venue and photos — just
              forward everything to us.
            </p>
            <p className="mt-3 text-sm font-bold">
              <a href="tel:+917499827349" className="hover:text-terracotta">+91 74998 27349</a>
            </p>
            <a
              href={waLink(WA_MSG_GENERAL)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-full bg-charcoal px-5 py-2.5 text-[12px] font-bold text-ivory"
            >
              Chat on WhatsApp
            </a>
          </div>
          <div className="rounded-[1.4rem] border hairline bg-white p-6">
            <p className="font-serif text-2xl" aria-hidden>@</p>
            <h2 className="mt-3 font-serif text-2xl">Email</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
              For detailed queries, feedback and review submissions. Write anytime from your inbox.
            </p>
            <p className="mt-4 text-sm font-semibold">
              <EmailLink className="text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta" />
            </p>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-[1.4rem] border hairline bg-white p-6 hover:border-charcoal/30 transition-colors"
          >
            <InstagramIcon className="h-6 w-6 text-terracotta" />
            <h2 className="mt-3 font-serif text-2xl">Instagram</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
              Follow our official page for new designs, demos and announcements.
            </p>
            <span className="mt-4 inline-block rounded-full border hairline px-5 py-2.5 text-[12px] font-bold">
              @mehfill.inn
            </span>
          </a>
        </div>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">What to include when you write</h2>
          <ul className="mt-4 grid gap-2.5">
            {[
              "The occasion — wedding, Nikah, engagement, birthday, anniversary or event",
              "Names, date and venue (city is enough to start)",
              "Which demo style you loved, if any — links help",
              "Photos you want in the invitation, whenever ready",
              "Your order ID, if you have already paid online",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-charcoal/75 leading-relaxed">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">Good to know</h2>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            Payments are made by direct UPI transfer and verified manually — we confirm back to
            you before design starts, so a message from you always gets an answer. For policies,
            see our <Link href="/privacy-policy" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">privacy policy</Link>
            {" "}and <Link href="/refund-policy" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">refund policy</Link>.
            Learn <Link href="/about" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">about Mehfill.in</Link>
            {" "}or read <Link href="/how-it-works" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">how ordering works</Link>.
          </p>
        </section>
      </article>
      <CTA />
      <Footer />
    </main>
  );
}
