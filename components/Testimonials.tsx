"use client";

import Link from "next/link";
import { Star, CheckCircle2, MapPin, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
import { TESTIMONIALS, type Testimonial } from "@/lib/testimonials";

function ReviewCard({ item }: { item: Testimonial }) {
  return (
    <div className="w-[300px] sm:w-[330px] shrink-0 rounded-2xl bg-white border hairline p-4 sm:p-4.5 shadow-xs hover:shadow-md hover:border-terracotta/30 transition-all duration-200 flex flex-col justify-between select-none">
      <div>
        {/* Header: Avatar, Name, Location & Stars */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center font-serif text-[11px] font-bold shrink-0 shadow-inner ${item.avatarBg}`}
            >
              {item.initials}
            </div>
            <div className="min-w-0">
              <h4 className="font-serif font-bold text-[14px] text-charcoal truncate leading-tight">
                {item.names}
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-charcoal/55 truncate mt-0.5">
                <MapPin className="h-2.5 w-2.5 text-terracotta shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-full shrink-0">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Verified
          </span>
        </div>

        {/* Stars */}
        <div className="mt-2.5 flex items-center gap-0.5 text-amber-500">
          {[...Array(item.rating)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-500" />
          ))}
          <span className="text-[11px] font-medium text-charcoal/50 ml-1.5 font-sans">
            {item.occasion}
          </span>
        </div>

        {/* Short & Punchy Review Quote */}
        <p className="mt-2 text-[12.5px] sm:text-[13px] text-charcoal/80 leading-snug line-clamp-3 italic">
          &ldquo;{item.shortQuote}&rdquo;
        </p>
      </div>

      {/* Card Footer: Template link */}
      <div className="mt-3 pt-2.5 border-t border-charcoal/5 flex items-center justify-between text-[11px]">
        <Link
          href={item.demoUrl}
          target="_blank"
          className="font-medium text-terracotta hover:text-terracotta-deep inline-flex items-center gap-1 group/link"
        >
          <span>Template: {item.templateName}</span>
          <ExternalLink className="h-2.5 w-2.5 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
        <span className="text-charcoal/40 font-mono text-[10px]">{item.date}</span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const row1 = TESTIMONIALS.slice(0, 5);
  const row2 = TESTIMONIALS.slice(5, 10);

  // Duplicate 4x (20 cards per track) so ultrawide screens loop seamlessly at -50% translation
  const marqueeRow1 = [...row1, ...row1, ...row1, ...row1];
  const marqueeRow2 = [...row2, ...row2, ...row2, ...row2];

  return (
    <section id="reviews" className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-[#FAF6F0] border-t border-charcoal/10">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8 text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/90 border hairline px-3 py-1 shadow-xs backdrop-blur mb-2.5">
          <Sparkles className="h-3 w-3 text-terracotta" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-charcoal/80">
            Real Stories &bull; 4.9 ★ Rated by 140+ Indian Families
          </span>
        </div>

        <h2 className="font-serif font-light text-2xl sm:text-3xl md:text-4xl text-charcoal tracking-tight leading-tight">
          Loved by couples. <span className="italic font-normal font-serif text-[#7A2818]">Adored by guests.</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-charcoal/65 max-w-lg mx-auto">
          Hover to pause &bull; Genuine experiences from palace weddings, Nikahs, and receptions across India.
        </p>
      </div>

      {/* Endless Marquee Container */}
      <div className="relative w-full overflow-hidden marquee-pause">
        {/* Left and Right Smooth Edge Gradient Fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#FAF6F0] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#FAF6F0] to-transparent z-10" />

        {/* Row 1: Scrolling Left */}
        <div className="flex gap-3 sm:gap-4 marquee-track-slow w-max py-1.5">
          {marqueeRow1.map((item, idx) => (
            <ReviewCard key={`r1-${item.id}-${idx}`} item={item} />
          ))}
        </div>

        {/* Row 2: Scrolling Right */}
        <div className="flex gap-3 sm:gap-4 marquee-track-reverse w-max py-1.5 mt-3 sm:mt-4">
          {marqueeRow2.map((item, idx) => (
            <ReviewCard key={`r2-${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>

      {/* Bottom Compact Trust Strip */}
      <div className="mt-8 text-center px-4">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 rounded-full bg-white/80 border hairline px-4 sm:px-6 py-2 shadow-xs text-xs text-charcoal/75">
          <span className="font-semibold text-charcoal flex items-center gap-1">
            <span className="text-amber-500">★★★★★</span> 4.9/5 Rating
          </span>
          <span className="text-charcoal/30 hidden sm:inline">&bull;</span>
          <span>100% WhatsApp Friendly</span>
          <span className="text-charcoal/30 hidden sm:inline">&bull;</span>
          <span className="text-[#7A2818] font-semibold">Saved ₹40,000+ vs Paper</span>
          <span className="text-charcoal/30 hidden sm:inline">&bull;</span>
          <Link
            href="/templates"
            className="font-bold text-terracotta hover:text-terracotta-deep inline-flex items-center gap-1 underline underline-offset-2"
          >
            All 9 Designs <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
