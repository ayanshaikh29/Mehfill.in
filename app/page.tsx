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
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const FAQ = dynamic(() => import("@/components/FAQ"));
import SeoCopy from "@/components/SeoCopy";
const BrandMoment = dynamic(() => import("@/components/BrandMoment"));
const CTA = dynamic(() => import("@/components/CTA"));
const Footer = dynamic(() => import("@/components/Footer"));

export const metadata: Metadata = {
  title: "Mehfill.in | Digital Wedding & Event Invitations",
  description:
    "Create beautiful digital wedding and event invitations with Mehfill.in. Modern, elegant and shareable invitations for weddings, engagements, birthdays and special celebrations.",
  alternates: { canonical: canonical("/") },
};

// Visible FAQs are in components/FAQ.tsx — keep this JSON-LD in sync.
// FAQPage schema is only valid because these questions are visible on this page.
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I order an invitation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Watch a live demo, message us on WhatsApp with your celebration details, and pay online or on chat. We design your custom invitation and deliver one beautiful shareable link.",
      },
    },
    {
      "@type": "Question",
      name: "Do you make invitations for all religions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — Hindu, Muslim, Sikh, Christian and interfaith families. Nikah, Pheras, Anand Karaj, Church weddings, Puja, Dawat, Baptism and more, in your language and customs.",
      },
    },
    {
      "@type": "Question",
      name: "What details do you need from me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Names, date, venue, event schedule, photos, and any special wording, blessings or music. Just forward everything on WhatsApp — we handle the rest.",
      },
    },
    {
      "@type": "Question",
      name: "How long does delivery take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Essential in 3 days, Signature in 2 days, Royal in 24–48 hours on priority. Need it urgently for tomorrow's function? Message us — we will try our best.",
      },
    },
    {
      "@type": "Question",
      name: "How do guests open and RSVP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Guests get one link — it opens beautifully on any phone, no app needed. They can view events, locations and confirm RSVP in one tap.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need an account to order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. You can order directly on WhatsApp. An account simply lets you track your orders and revisit your invitations anytime.",
      },
    },
  ],
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
      <Testimonials />
      <FAQ />
      <SeoCopy />
      <BrandMoment />
      <CTA />
      <Footer />
    </main>
  );
}
