import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import { canonical } from "@/lib/seo";
import Link from "next/link";
import { Film, Music, Smartphone, Zap } from "lucide-react";
import RemotionVideoClientWrapper from "@/components/RemotionVideoClientWrapper";

export const metadata: Metadata = {
  title: "Wedding Invitation Video Maker — Cinematic WhatsApp Video",
  description:
    "Create beautiful animated wedding invitation videos online with music, couple illustrations, and floral animations. Instant live preview & fast HD MP4 delivery for WhatsApp.",
  alternates: { canonical: canonical("/wedding-invitation-video") },
  openGraph: {
    title: "Wedding Invitation Video Maker | Mehfill.in",
    description:
      "Design personalized digital wedding invitation videos with floral animations, shehnai music, and multi-event schedules for WhatsApp.",
    url: canonical("/wedding-invitation-video"),
    siteName: "Mehfill.in",
    locale: "en_IN",
    type: "video.other",
    images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "Mehfill Wedding Invitation Video" }],
  },
};

export default function WeddingInvitationVideoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Mehfill Cinematic Wedding Invitation Video",
    description:
      "Customizable animated wedding invitation video for WhatsApp with floral aesthetics, royal calligraphy, and background music.",
    brand: {
      "@type": "Brand",
      name: "Mehfill.in",
    },
    offers: {
      "@type": "Offer",
      price: "1499",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: canonical("/wedding-invitation-video"),
    },
  };

  return (
    <main className="min-h-screen bg-ivory">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* Hero & Interactive Video Player Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 border-b hairline">
        <RemotionVideoClientWrapper />
      </section>

      {/* Video Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="eyebrow text-terracotta mb-2">WHY CHOOSE VIDEO INVITATIONS</p>
          <h2 className="font-serif font-light text-3xl sm:text-5xl text-charcoal">
            The Magic of Movement, Music &amp; Tradition
          </h2>
          <p className="mt-4 text-charcoal/70 text-sm sm:text-base leading-relaxed">
            Standard static PDF and image cards often go unnoticed in busy WhatsApp chats. A crafted 1080p vertical video captures emotion the moment it begins to play.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 border hairline hover:border-terracotta/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-5">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2">
              9:16 Mobile First
            </h3>
            <p className="text-sm text-charcoal/65 leading-relaxed">
              Engineered specifically for full-screen playback on iPhone, Android, WhatsApp Status and Instagram Reels.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 border hairline hover:border-terracotta/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-5">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2">
              Emotional Soundtracks
            </h3>
            <p className="text-sm text-charcoal/65 leading-relaxed">
              Paired with soulful Shehnai melodies, Sufi acoustics, or your favorite romantic background track.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 border hairline hover:border-terracotta/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-5">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2">
              Layered Floral Art
            </h3>
            <p className="text-sm text-charcoal/65 leading-relaxed">
              Every flower petal, lantern glow, and calligraphy flourish is rendered independently with smooth spring physics.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-2xl p-6 border hairline hover:border-terracotta/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-medium text-charcoal mb-2">
              Fast 24h Turnaround
            </h3>
            <p className="text-sm text-charcoal/65 leading-relaxed">
              Preview your design online instantly. Final polished video MP4 with your custom audio delivered within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Process / How it works */}
      <section className="bg-charcoal text-ivory py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-champagne font-bold">
              3-STEP WORKFLOW
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl mt-3 font-light text-ivory">
              From Live Customization to WhatsApp Ready
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-terracotta font-serif text-3xl font-light">01</span>
              <h3 className="font-serif text-xl mt-3 text-ivory">Personalize Online</h3>
              <p className="mt-2 text-sm text-ivory/60 leading-relaxed">
                Use the live player above to enter names, dates, events and see your animation update in real-time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-terracotta font-serif text-3xl font-light">02</span>
              <h3 className="font-serif text-xl mt-3 text-ivory">Audio &amp; Photos Review</h3>
              <p className="mt-2 text-sm text-ivory/60 leading-relaxed">
                Connect with our team on WhatsApp. Share your preferred music track and high-resolution couple photographs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-terracotta font-serif text-3xl font-light">03</span>
              <h3 className="font-serif text-xl mt-3 text-ivory">Receive Full HD MP4</h3>
              <p className="mt-2 text-sm text-ivory/60 leading-relaxed">
                We export a crisp 1080×1920 MP4 file under 15MB, optimized for zero compression loss on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-serif text-3xl sm:text-4xl text-center text-charcoal font-light mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: "Can I use my own songs or audio in the video?",
              a: "Yes! You can choose any song, romantic Bollywood track, instrumental shehnai, or traditional nasheed. Just send us the audio link or file on WhatsApp after ordering.",
            },
            {
              q: "What format will I receive the final video in?",
              a: "You receive an ultra-crisp 1080×1920 (9:16 vertical) MP4 video encoded with H.264, optimized to play instantly on all mobile phones without buffering.",
            },
            {
              q: "Can we include photos of the bride and groom?",
              a: "Absolutely. Our design team integrates high-resolution portrait photos into the couple revelation scene with smooth zoom and vignette overlays.",
            },
            {
              q: "How many revisions are included?",
              a: "Two rounds of revisions are included free of charge to ensure names, dates, timings, and venue spellings are 100% perfect.",
            },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border hairline">
              <h3 className="font-serif text-lg font-medium text-charcoal">{faq.q}</h3>
              <p className="mt-2 text-sm text-charcoal/65 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-charcoal/60 mb-4">
            Looking for an interactive wedding website instead of or alongside your video?
          </p>
          <Link
            href="/digital-wedding-invitations"
            className="text-sm font-semibold text-terracotta hover:underline underline-offset-4"
          >
            Explore Interactive Wedding Invitation Websites &rarr;
          </Link>
        </div>
      </section>

      <CTA />
      <Footer />
    </main>
  );
}
