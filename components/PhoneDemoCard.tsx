"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Sparkles } from "lucide-react";
import type { CatalogTemplate } from "@/lib/catalog";

interface PhoneDemoCardProps {
  template: CatalogTemplate;
  index: number;
  priority?: boolean;
}

export default function PhoneDemoCard({ template, index, priority = false }: PhoneDemoCardProps) {
  const [imgOk, setImgOk] = useState(true);
  const tpl = template;

  return (
    <motion.article
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.65, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center"
    >
      {/* ── Realistic iPhone 16 Pro Style Frame ─────────────────────── */}
      <div className="relative w-full max-w-[290px] sm:max-w-[310px] transition-transform duration-500 ease-out group-hover:-translate-y-2">
        {/* Soft Ambient Glow under phone */}
        <div
          aria-hidden
          className="absolute -inset-3 rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none"
          style={{ background: `${tpl.palette.accent}33` }}
        />

        {/* Outer Titanium Bezel */}
        <div className="relative rounded-[3.2rem] p-[9px] sm:p-[10px] bg-gradient-to-b from-[#4a4540] via-[#221f1d] to-[#151312] shadow-[0_20px_50px_rgba(20,16,12,0.28),0_0_0_1px_rgba(255,255,255,0.08)]">
          {/* Side action button & volume buttons */}
          <div aria-hidden className="absolute -left-[3px] top-[95px] h-9 w-[3px] rounded-l bg-[#2e2a27]" />
          <div aria-hidden className="absolute -left-[3px] top-[140px] h-12 w-[3px] rounded-l bg-[#2e2a27]" />
          <div aria-hidden className="absolute -left-[3px] top-[198px] h-12 w-[3px] rounded-l bg-[#2e2a27]" />
          <div aria-hidden className="absolute -right-[3px] top-[150px] h-16 w-[3px] rounded-r bg-[#2e2a27]" />

          {/* Screen Display Area (19.5 : 9 ratio) */}
          <div
            className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#0c0a09] shadow-inner"
            style={{ aspectRatio: "9 / 19.5" }}
          >
            {/* Status Bar */}
            <div className="absolute top-2.5 inset-x-0 z-30 flex items-center justify-between px-5 text-[10px] font-semibold text-white/90 select-none pointer-events-none">
              <span>9:41</span>
              {/* Dynamic Island */}
              <div className="h-[18px] w-[74px] rounded-full bg-black shadow-[inset_0_0_2px_rgba(255,255,255,0.18)] flex items-center justify-end pr-2">
                <span className="h-2 w-2 rounded-full bg-[#151515] ring-1 ring-white/10" />
              </div>
              <div className="flex items-center gap-1 text-[9px]">
                <span>5G</span>
                <span className="inline-block h-2 w-3.5 rounded-sm border border-white/80 bg-white/60" />
              </div>
            </div>

            {/* Template Cover Image / Screen Rendering */}
            {imgOk ? (
              <Image
                src={tpl.image}
                alt={`${tpl.name} — live ${tpl.occasion} invitation on mobile`}
                fill
                priority={priority}
                sizes="(max-width: 640px) 290px, 310px"
                quality={82}
                onError={() => setImgOk(false)}
                className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
              />
            ) : (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                style={{ background: tpl.palette.bg, color: tpl.palette.ink }}
              >
                <Sparkles className="h-8 w-8 mb-3" style={{ color: tpl.palette.accent }} />
                <p className="font-serif text-2xl font-light">{tpl.name}</p>
                <p className="mt-1 text-[11px] font-bold tracking-[0.2em]" style={{ color: tpl.palette.accent }}>
                  {tpl.occasion.toUpperCase()}
                </p>
              </div>
            )}

            {/* Subtle Screen Gloss & Vignette Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/35" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-60" />

            {/* Occasion Badge inside top of screen */}
            <div className="absolute top-11 left-4 z-20">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 px-3 py-1 text-[9.5px] font-bold tracking-[0.14em] uppercase text-white shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-champagne animate-pulse" />
                {tpl.occasion}
              </span>
            </div>

            {/* Special Highlight Badge (Latest, Recommended, Trending, Popular) */}
            {tpl.badge && (
              <div className="absolute top-11 right-4 z-20">
                {tpl.badge === "Latest" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-400/60 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] uppercase text-emerald-200 shadow-md">
                    <Sparkles className="h-2.5 w-2.5 text-champagne animate-pulse" />
                    Latest
                  </span>
                )}
                {tpl.badge === "Recommended" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/80 backdrop-blur-md border border-amber-400/60 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] uppercase text-amber-200 shadow-md">
                    ★ Recommended
                  </span>
                )}
                {tpl.badge === "Trending" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/80 backdrop-blur-md border border-rose-400/60 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] uppercase text-rose-200 shadow-md">
                    🔥 Trending
                  </span>
                )}
                {tpl.badge === "Popular" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-950/80 backdrop-blur-md border border-indigo-400/60 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] uppercase text-indigo-200 shadow-md">
                    👑 Popular
                  </span>
                )}
              </div>
            )}

            {/* Bottom Title & Details Overlay inside Phone Screen */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-4 text-white">
              <h3 className="font-serif text-xl sm:text-2xl leading-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                {tpl.name}
              </h3>
              <p className="mt-1 text-[11.5px] sm:text-[12px] text-white/85 line-clamp-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {tpl.tagline}
              </p>

              {/* Action Buttons directly on phone hover / bottom */}
              <div className="mt-3.5 flex flex-col gap-2 pt-1 border-t border-white/15">
                <a
                  href={tpl.demoUrl || "/templates"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md py-2 text-[11.5px] font-bold text-charcoal hover:bg-white shadow-md transition-all hover:scale-[1.02]"
                >
                  <Eye className="h-3.5 w-3.5 text-terracotta" />
                  Preview Live Demo
                </a>
                <Link
                  href={`/dashboard?template=${encodeURIComponent(tpl.slug)}`}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-terracotta py-2 text-[11.5px] font-bold text-white hover:bg-terracotta-deep shadow-md transition-all hover:scale-[1.02]"
                >
                  Choose Template
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Home Indicator Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 h-1 w-24 rounded-full bg-white/50 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Description below phone for desktop clarity */}
      <div className="mt-4 text-center px-2 max-w-[300px]">
        <p className="text-[12px] text-charcoal/65 leading-relaxed line-clamp-2">
          {tpl.description}
        </p>
      </div>
    </motion.article>
  );
}
