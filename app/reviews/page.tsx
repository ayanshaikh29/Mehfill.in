import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import EmailLink from "@/components/EmailLink";
import Testimonials from "@/components/Testimonials";
import { canonical } from "@/lib/seo";
import { waLink } from "@/lib/contact";

const SLUG = "reviews";

export function generateMetadata(): Metadata {
  const url = canonical(`/${SLUG}`);
  const title = "Customer Reviews — Real Feedback from Families | Mehfill.in";
  const description =
    "Read real feedback and verified experiences from couples and families across India who celebrated with Mehfill digital wedding invitations.";
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
      images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "Mehfill.in customer reviews" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-cover.png"],
    },
  };
}

const FAQS = [
  {
    q: "How are Mehfill.in reviews collected?",
    a: "Every review is submitted directly by hosts and couples after their celebration through WhatsApp or email. We verify their order details and template before featuring their story.",
  },
  {
    q: "How can I leave a review after my celebration?",
    a: "After your celebration, message us on WhatsApp or email with your names, event type, rating and a few lines about your experience. Celebration photos and screenshots of guest reactions are warmly welcomed!",
  },
  {
    q: "Can I try a template demo before ordering?",
    a: "Yes! All 9 signature designs have full live demos with music, animations, maps, and RSVP forms that you can test right in your mobile browser before personalising your own.",
  },
];

function JsonLd() {
  const url = canonical(`/${SLUG}`);
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
      { "@type": "ListItem", position: 2, name: "Customer Reviews", item: url },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-[#FAF6F0]">
      <JsonLd />
      <Navbar />

      <header className="mx-auto max-w-4xl px-5 md:px-8 pt-28 md:pt-36 pb-6 text-center">
        <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45 justify-center flex items-center">
          <Link href="/" className="hover:text-terracotta">HOME</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">REVIEWS</span>
        </nav>
        <p className="eyebrow mt-4 text-terracotta">STORIES OF CELEBRATION</p>
        <h1 className="mt-3 font-serif font-light text-4xl md:text-6xl leading-[1.05] tracking-tight text-balance text-charcoal">
          Real words from <span className="italic font-normal text-[#7A2818]">real celebrations</span>
        </h1>
        <p className="mt-4 text-base md:text-lg leading-relaxed text-charcoal/70 max-w-2xl mx-auto">
          From palace mandaps in Rajasthan to Sufi nights in Lucknow and coastal receptions — explore how families loved their Mehfill digital invitations.
        </p>
      </header>

      {/* Interactive Filterable Reviews Component */}
      <Testimonials />

      <article className="mx-auto max-w-4xl px-5 md:px-8 py-16">
        <section className="rounded-2xl bg-white border hairline p-8 md:p-10 shadow-xs text-center">
          <h2 className="font-serif font-light text-3xl md:text-4xl text-charcoal">
            Celebrated with Mehfill? Share your story!
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm md:text-base leading-relaxed text-charcoal/70">
            Received compliments on your invitation? We would love your honest feedback. Send us your name,
            wedding date, rating and a few lines about your experience on WhatsApp:
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={waLink("Hello Mehfill team! I received my invitation and would like to share my review and feedback.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-espresso transition-all shadow-sm"
            >
              Share Review on WhatsApp
            </a>
            <span className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold bg-white/60">
              <EmailLink className="hover:text-terracotta" />
            </span>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif font-light text-3xl md:text-4xl text-charcoal">Frequently Asked Questions</h2>
          <div className="mt-6 divide-y divide-charcoal/10 border-y hairline">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer font-serif text-xl md:text-2xl list-none flex items-center justify-between gap-4 text-charcoal">
                  {f.q}
                  <span className="shrink-0 rounded-full border hairline px-2.5 py-1 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 pr-10 text-[15px] leading-relaxed text-charcoal/65">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      <CTA />
      <Footer />
    </main>
  );
}
