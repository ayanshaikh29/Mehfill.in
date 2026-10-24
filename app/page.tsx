import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { canonical } from "@/lib/seo";

// Below-the-fold sections are code-split so the initial bundle stays lean.
// They still server-render (ssr: true); only the client JS is deferred.
const CinematicExperience = dynamic(() => import("@/components/CinematicExperience"));
const DesignGallery = dynamic(() => import("@/components/DesignGallery"));
const HowItWorks = dynamic(() => import("@/components/HowItWorks"));
const Occasions = dynamic(() => import("@/components/Occasions"));
const ForEveryFaith = dynamic(() => import("@/components/ForEveryFaith"));
const WhyMehfill = dynamic(() => import("@/components/WhyMehfill"));
const FeatureShowcase = dynamic(() => import("@/components/FeatureShowcase"));
const Pricing = dynamic(() => import("@/components/Pricing"));
const FAQ = dynamic(() => import("@/components/FAQ"));
import { FAQS } from "@/lib/faq-data";
import SeoCopy from "@/components/SeoCopy";
const BrandMoment = dynamic(() => import("@/components/BrandMoment"));
const CTA = dynamic(() => import("@/components/CTA"));
const Footer = dynamic(() => import("@/components/Footer"));

export const metadata: Metadata = {
  title: "Mehfill.in | Digital Wedding & Event Invitations",
  description:
    "Create beautiful digital wedding, Nikah, birthday and event invitations with Mehfill.in. Explore live demos and get a personalized invitation to share on WhatsApp.",
  alternates: { canonical: canonical("/") },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: canonical("/"),
    siteName: "Mehfill.in",
    title: "Mehfill.in | Digital Wedding & Event Invitations",
    description:
      "Explore beautiful digital wedding and event invitations. Choose a live demo and get your personalized invitation.",
  },
};

// Visible FAQs are in components/FAQ.tsx — this JSON-LD is generated from the
// same array so schema and UI can never drift apart.
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <Navbar />
      <Hero />
      <CinematicExperience />
      <DesignGallery />
      <HowItWorks />
      <Occasions />
      <ForEveryFaith />
      <WhyMehfill />
      <FeatureShowcase />
      <Pricing />
      <FAQ />
      <SeoCopy />
      <BrandMoment />
      <CTA />
      <Footer />
    </main>
  );
}
