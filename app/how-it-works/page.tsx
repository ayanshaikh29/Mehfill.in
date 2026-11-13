import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import { canonical } from "@/lib/seo";

const SLUG = "how-it-works";

const STEPS = [
  {
    title: "Choose your template",
    text: "Explore our invitation designs and choose the one that matches your celebration. Every template is mobile-friendly, with live demos you can open and feel before deciding — no account needed to browse.",
    cta: { label: "Explore Designs", href: "/templates" },
  },
  {
    title: "Add your details",
    text: "Personalise names, event dates, venue, photos and other supported details in a simple step-by-step editor. Preview exactly what your guests will see, and edit again anytime from your dashboard.",
    cta: { label: "Customise Your Invitation", href: "/templates" },
  },
  {
    title: "Publish & share",
    text: "Preview your invitation, complete the required checkout, publish it and share its unique link with your guests. Payment is verified on our server before publishing unlocks — no invitation is live before payment and publishing succeed.",
    cta: { label: "Create Your Invitation", href: "/templates" },
  },
];

export function generateMetadata(): Metadata {
  const url = canonical(`/${SLUG}`);
  const title = "How It Works — Create Your Digital Invitation";
  const description =
    "How Mehfill.in works: choose your template, add your details, publish and share your digital invitation with a unique link that guests open on any phone.";
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
    name: "How to create a digital invitation with Mehfill.in",
    description:
      "Create a digital wedding or event invitation with Mehfill.in: choose a template, add your details, complete checkout, and publish your shareable link.",
    totalTime: "PT15M",
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
          Choose. Personalise. Publish.
        </h1>
        <p className="mt-5 text-[16px] md:text-lg leading-relaxed text-charcoal/70">
          Creating a Mehfill.in digital invitation takes minutes: pick a design you love, add your
          celebration details in the editor, pay securely, and publish the unique link you can share
          with every guest.
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
          <h2 className="font-serif font-light text-2xl md:text-3xl">Pricing and publishing, honestly stated</h2>
          <p className="mt-3 leading-relaxed text-charcoal/70">
            Basic (₹999) is self-service and publishes the moment your payment succeeds; Premium
            (₹1,500) adds human design review, typically delivered in 2–4 days with two revision
            rounds. Payment is always verified on our server before an invitation can be published.
            Read the{" "}
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
