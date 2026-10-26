import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import WordingGenerator from "@/components/free-tool/WordingGenerator";
import { canonical } from "@/lib/seo";
import { ArrowRight } from "lucide-react";

const PAGE_URL = canonical("/free/whatsapp-invitation-wording");

export const metadata: Metadata = {
  title: "WhatsApp Invitation Wording Generator — Free (EN · HI · UR)",
  description:
    "Free tool: generate ready-to-send wedding, Nikah, Haldi, Mehndi and Sangeet invitation messages for WhatsApp in English, Hindi and Urdu. Copy instantly or open in WhatsApp.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "WhatsApp Invitation Wording Generator | Mehfill.in",
    description:
      "Pick a language, occasion and tone — get a ready-to-send WhatsApp invitation message in seconds. Free, no sign-up.",
    url: PAGE_URL,
    siteName: "Mehfill.in",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "Free WhatsApp invitation wording generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Invitation Wording Generator | Mehfill.in",
    description:
      "Ready-to-send wedding invitation messages for WhatsApp — English, Hindi and Urdu. Free.",
    images: ["/og-cover.png"],
  },
};

const FAQS = [
  {
    q: "Is the invitation wording generator free?",
    a: "Yes — completely free, unlimited use, no sign-in required. Pick a language, occasion and tone, add your details and copy the message.",
  },
  {
    q: "Which languages are supported?",
    a: "English, Hindi and Urdu. The Urdu output is right-to-left, ready to paste into WhatsApp as-is.",
  },
  {
    q: "Which occasions can I write for?",
    a: "Wedding, Nikah, Haldi, Mehndi, Sangeet, Reception, Engagement and Save-the-Date — each with four tones from classic and formal to short and modern.",
  },
  {
    q: "How do I send it on WhatsApp?",
    a: "Use the Copy button, or tap Open in WhatsApp to pick a chat directly. If you want something grander than text, choose an invitation design and share a full animated invite instead.",
  },
];

function ToolJsonLd() {
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "WhatsApp Wedding Invitation Wording Generator",
    url: PAGE_URL,
    description:
      "Free browser tool that generates ready-to-send wedding and event invitation messages for WhatsApp in English, Hindi and Urdu.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    inLanguage: ["en", "hi", "ur"],
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    author: { "@type": "Organization", name: "Mehfill.in", url: canonical("/") },
  };
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
      { "@type": "ListItem", position: 2, name: "Free Tools", item: canonical("/free") },
      { "@type": "ListItem", position: 3, name: "WhatsApp Invitation Wording Generator", item: PAGE_URL },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}

export default function WordingToolPage() {
  return (
    <main className="min-h-screen">
      <ToolJsonLd />
      <Navbar />
      <article className="mx-auto max-w-6xl px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45">
          <Link href="/" className="hover:text-terracotta">HOME</Link>
          <span className="mx-2">/</span>
          <Link href="/free" className="hover:text-terracotta">FREE TOOLS</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">WORDING GENERATOR</span>
        </nav>

        <p className="eyebrow mt-6 text-terracotta">FREE TOOL · NO SIGN-UP</p>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-6xl leading-[1.05] tracking-tight text-balance">
          WhatsApp Invitation Wording <span className="italic">Generator</span>
        </h1>
        <p className="mt-5 max-w-2xl text-[16px] md:text-lg leading-relaxed text-charcoal/70">
          Pick a language, occasion and tone — add your names, date and venue — and get a
          ready-to-send invitation message in seconds. English, Hindi and Urdu. Copy it, or
          open it straight in WhatsApp.
        </p>

        <div className="mt-12">
          <WordingGenerator />
        </div>

        <section className="mt-16 max-w-3xl">
          <h2 className="font-serif font-light text-3xl md:text-4xl">How it works</h2>
          <ol className="mt-5 space-y-3 text-[15px] leading-relaxed text-charcoal/70">
            <li><b className="text-charcoal">1. Choose language, occasion and tone.</b> Eight occasions — wedding, Nikah, Haldi, Mehndi, Sangeet, reception, engagement and save-the-date — in English, Hindi or Urdu.</li>
            <li><b className="text-charcoal">2. Add your details.</b> Names, date, time, venue and an optional RSVP line. Blank fields simply stay out of the message.</li>
            <li><b className="text-charcoal">3. Copy or open in WhatsApp.</b> The message is composed in real time as you type — no watermarks, no sign-up.</li>
          </ol>
        </section>

        <section className="mt-14 max-w-3xl">
          <h2 className="font-serif font-light text-3xl md:text-4xl">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-charcoal/10 border-y hairline">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="font-serif text-xl md:text-2xl">{f.q}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-charcoal/65">{f.a}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[15px] text-charcoal/65">
            Ready for more than a message?{" "}
            <Link href="/templates" className="inline-flex items-center gap-1 font-semibold text-terracotta underline decoration-terracotta/30 underline-offset-2 hover:decoration-terracotta">
              Browse invitation designs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </section>
      </article>
      <CTA />
      <Footer />
    </main>
  );
}
