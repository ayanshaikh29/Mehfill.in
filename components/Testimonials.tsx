"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle2, MapPin, Users, Sparkles, ExternalLink, ArrowRight, Quote } from "lucide-react";
import { TESTIMONIALS, TRUST_METRICS, type Testimonial } from "@/lib/testimonials";
import { Reveal } from "./Reveal";

const CATEGORIES = [
  { id: "all", label: "All Celebrations" },
  { id: "wedding", label: "Traditional & Palace Weddings" },
  { id: "nikah", label: "Nikah & Walima" },
  { id: "reception", label: "Sangeet & Receptions" },
] as const;

export default function Testimonials() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filtered =
    activeTab === "all"
      ? TESTIMONIALS
      : TESTIMONIALS.filter((t) => t.category === activeTab);

  return (
    <section id="reviews" className="relative py-20 md:py-28 overflow-hidden bg-[#FAF6F0] border-t border-charcoal/10">
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#D87040]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#C8A26A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border hairline px-3.5 py-1.5 shadow-xs backdrop-blur mb-3">
              <Sparkles className="h-3.5 w-3.5 text-terracotta" />
              <span className="text-[12px] font-semibold tracking-wider uppercase text-charcoal/80">
                Real Stories &bull; Real Celebrations
              </span>
            </div>

            <h2 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-charcoal tracking-tight leading-[1.08]">
              Loved by couples. <br className="hidden sm:inline" />
              <span className="italic font-normal font-serif text-[#7A2818]">Adored by guests.</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-charcoal/70 leading-relaxed max-w-xl mx-auto">
              From grand palace weddings in Udaipur to intimate Nikahs and rooftop receptions — see how modern Indian families sent invitations their guests never forgot.
            </p>
          </Reveal>
        </div>

        {/* Trust & Rating Bar */}
        <Reveal delay={0.1}>
          <div className="mt-10 mx-auto max-w-4xl rounded-2xl bg-white/85 border hairline p-4 sm:p-5 shadow-xs backdrop-blur">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-charcoal/10 text-center">
              <div className="pt-2 md:pt-0">
                <div className="flex items-center justify-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <p className="mt-1 font-serif text-xl sm:text-2xl font-bold text-charcoal">
                  {TRUST_METRICS.rating} <span className="text-xs font-sans font-normal text-charcoal/60">/ 5.0</span>
                </p>
                <p className="text-[11px] font-medium text-charcoal/60 uppercase tracking-wider">Overall Rating</p>
              </div>

              <div className="pt-2 md:pt-0">
                <p className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                  {TRUST_METRICS.whatsappShareRate}
                </p>
                <p className="text-[11px] font-medium text-charcoal/60 uppercase tracking-wider">WhatsApp Friendly</p>
                <p className="text-[11px] text-charcoal/50">Zero app install required</p>
              </div>

              <div className="pt-2 md:pt-0">
                <p className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                  {TRUST_METRICS.rsvpResponseRate}
                </p>
                <p className="text-[11px] font-medium text-charcoal/60 uppercase tracking-wider">RSVP Completion</p>
                <p className="text-[11px] text-charcoal/50">Via instant meal & head count</p>
              </div>

              <div className="pt-2 md:pt-0">
                <p className="font-serif text-xl sm:text-2xl font-bold text-[#7A2818]">
                  ₹999 <span className="text-xs font-sans font-normal text-charcoal/60">flat</span>
                </p>
                <p className="text-[11px] font-medium text-charcoal/60 uppercase tracking-wider">Saved ₹40,000+ vs Paper</p>
                <p className="text-[11px] text-charcoal/50">Eco-friendly & instantaneous</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Filter Tabs */}
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => {
              const active = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-charcoal text-ivory shadow-sm"
                      : "bg-white/80 text-charcoal/70 border hairline hover:bg-white hover:text-charcoal"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Reviews Grid */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((item: Testimonial, idx) => (
            <Reveal key={item.id} delay={0.05 * (idx % 3)}>
              <div className="group h-full flex flex-col justify-between rounded-2xl sm:rounded-[1.6rem] bg-white border hairline p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div>
                  {/* Top Header: Couple Avatar + Name + Verified Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-11 w-11 rounded-full flex items-center justify-center font-serif text-sm font-bold tracking-tight shadow-inner ${item.avatarBg}`}
                      >
                        {item.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-serif font-bold text-base sm:text-lg text-charcoal leading-tight">
                            {item.names}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] text-charcoal/60 mt-0.5">
                          <MapPin className="h-3 w-3 text-terracotta shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-semibold shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </span>
                  </div>

                  {/* Stars + Event Occasion Tag */}
                  <div className="mt-4 flex items-center justify-between gap-2 border-b border-charcoal/10 pb-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-charcoal/50 bg-[#FAF6F0] px-2.5 py-1 rounded-full">
                      {item.occasion}
                    </span>
                  </div>

                  {/* Highlight Quote (Key Takeaway) */}
                  <div className="mt-4 rounded-xl bg-[#FAF6F0]/80 border border-amber-900/10 p-3">
                    <p className="font-serif italic text-[14px] sm:text-[15px] text-[#7A2818] font-medium leading-snug">
                      &ldquo;{item.highlight}&rdquo;
                    </p>
                  </div>

                  {/* Detailed Review Prose */}
                  <blockquote className="mt-3 text-[13px] sm:text-[14px] text-charcoal/75 leading-relaxed font-sans">
                    {item.quote}
                  </blockquote>
                </div>

                {/* Card Footer: Template link & Guest count */}
                <div className="mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-charcoal/50 block">Template:</span>
                    <Link
                      href={item.demoUrl}
                      target="_blank"
                      className="font-semibold text-terracotta hover:text-terracotta-deep inline-flex items-center gap-1 group-hover:underline underline-offset-2"
                    >
                      {item.templateName}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  {item.guestCount && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-charcoal/60 bg-cream/80 px-2.5 py-1 rounded-full">
                      <Users className="h-3 w-3 text-charcoal/40" />
                      {item.guestCount}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom Callout & Link */}
        <Reveal delay={0.25}>
          <div className="mt-14 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 rounded-2xl bg-white border hairline p-4 sm:px-8 sm:py-5 shadow-xs">
              <div className="text-center sm:text-left">
                <p className="font-serif text-lg font-bold text-charcoal">
                  Ready to make your celebration unforgettable?
                </p>
                <p className="text-xs sm:text-sm text-charcoal/60">
                  Pick any signature design, customize online, and publish for just ₹999.
                </p>
              </div>

              <Link
                href="/templates"
                className="inline-flex items-center gap-2 rounded-full bg-charcoal text-ivory px-6 py-3 text-xs sm:text-sm font-semibold hover:bg-espresso transition-all shadow-sm shrink-0"
              >
                Explore All Designs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
