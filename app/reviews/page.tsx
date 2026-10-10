import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import EmailLink from "@/components/EmailLink";
import { canonical } from "@/lib/seo";
import { waLink } from "@/lib/contact";

const SLUG = "reviews";

export function generateMetadata(): Metadata {
  const url = canonical(`/${SLUG}`);
  const title = "Customer Reviews — Real Feedback | Mehfill.in";
  const description =
    "Verified customer reviews for Mehfill.in digital wedding and event invitations. Real feedback from delivered orders — published only after verification.";
  return {
    title: "Customer Reviews — Real Feedback",
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
    q: "Where are Mehfill.in customer reviews?",
    a: "Mehfill.in is a newly launching platform, so verified customer reviews are still being collected. As orders are delivered, reviews from real customers will be published on this page with the customer's name and event type.",
  },
  {
    q: "How can I leave a review after my order?",
    a: "After you receive your invitation, message us on WhatsApp or email with your name, event type, rating and a few lines about your experience. You may also share a photo from the celebration. Every submission is read by our team before anything is published.",
  },
  {
    q: "Are published reviews moderated?",
    a: "Yes. Only genuine feedback from verified orders is published, and never automatically. We do not publish incentivised, anonymous, or unverifiable submissions, and we never invent reviews, ratings or customer counts.",
  },
];

function JsonLd() {
  const url = canonical(`/${SLUG}`);
  // NOTE: no AggregateRating / Review schema here — there are no verified
  // reviews yet, and schema must never claim ratings that don't exist.
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
    <main className="min-h-screen">
      <JsonLd />
      <Navbar />
      <article className="mx-auto max-w-4xl px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45">
          <Link href="/" className="hover:text-terracotta">HOME</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">REVIEWS</span>
        </nav>
        <p className="eyebrow mt-5 text-terracotta">CUSTOMER REVIEWS</p>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance">
          Reviews from real celebrations
        </h1>
        <p className="mt-5 text-[16px] md:text-lg leading-relaxed text-charcoal/70">
          Mehfill.in is a newly launching digital invitation platform, and verified customer
          reviews are still being collected. This page is where genuine reviews from delivered
          orders will appear — each with the customer&apos;s name and event type, published only
          after verification. We will never invent reviews, ratings or customer counts.
        </p>

        <div className="mt-8 rounded-[1.4rem] border hairline bg-cream/60 p-6 md:p-8 text-center">
          <p className="font-serif italic text-2xl text-charcoal/70">
            No verified reviews yet — yours could be the first story here.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-charcoal/60">
            In the meantime, open a <Link href="/demos" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">live demo</Link>{" "}
            to judge our work directly, or read <Link href="/about" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">about Mehfill.in</Link>.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">How was your Mehfill.in experience?</h2>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            Received your invitation? We would love your honest feedback. Send us your name,
            event type, a star rating and a few lines about your experience — a celebration photo
            is welcome but optional. Message us on WhatsApp or email:
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={waLink("Hello! I received my Mehfill.in invitation and would like to share my feedback. My name, event type and rating are below, followed by my review.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-espresso"
            >
              Share feedback on WhatsApp
            </a>
            <span className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold bg-white/40">
              <EmailLink className="hover:text-terracotta" />
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-charcoal/55">
            Please note: submissions are moderated and only genuine feedback from verified orders
            is published. See our <Link href="/privacy-policy" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">privacy policy</Link>{" "}
            for how your information is handled.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">Questions, answered</h2>
          <div className="mt-6 divide-y divide-charcoal/10 border-y hairline">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer font-serif text-xl md:text-2xl list-none flex items-center justify-between gap-4">
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
