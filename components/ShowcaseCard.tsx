"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, Eye } from "lucide-react";
import type { Showcase } from "@/lib/showcase";

export default function ShowcaseCard({ s, index }: { s: Showcase; index: number }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col items-center w-full max-w-[310px] mx-auto"
    >
      {/* ── Realistic Phone Mockup Shell ───────────────────────────── */}
      <div className="relative w-full rounded-[3.2rem] p-[9px] sm:p-[10px] bg-gradient-to-b from-[#4a4540] via-[#221f1d] to-[#151312] shadow-[0_20px_50px_rgba(20,16,12,0.25),0_0_0_1px_rgba(255,255,255,0.08)] transition-transform duration-500 group-hover:-translate-y-2">
        {/* Dynamic Island Notch */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 h-[17px] w-[74px] rounded-full bg-black shadow-inner" />

        {/* Screen with 9 / 19.5 aspect ratio */}
        <div
          className="relative w-full overflow-hidden rounded-[2.4rem] bg-[#0c0a09]"
          style={{ aspectRatio: "9 / 19.5" }}
        >
          {imgOk ? (
            <Image
              src={s.image}
              alt={`${s.names} — live invitation cover`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              quality={75}
              onError={() => setImgOk(false)}
              className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
              style={{ background: s.palette.bg, color: s.palette.ink }}
            >
              <p className="font-serif text-3xl">{s.names}</p>
              <p className="mt-2 text-[11px] font-bold tracking-[0.2em]" style={{ color: s.palette.accent }}>
                {s.occasion.toUpperCase()}
              </p>
            </div>
          )}

          {/* Vignette Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />

          {/* Live Badge */}
          <span className="absolute left-3.5 top-8 inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne animate-pulse" />
            {s.badge}
          </span>

          {/* Bottom Title & Actions */}
          <div className="absolute inset-x-0 bottom-0 p-4 text-white z-20">
            <p className="text-[10px] uppercase tracking-[0.2em] text-champagne-light font-bold">
              {s.occasion.split("·")[0].trim()}
            </p>
            <h3 className="font-serif text-xl sm:text-2xl leading-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] mt-0.5">
              {s.names}
            </h3>

            <div className="mt-3 flex flex-col gap-2 pt-1 border-t border-white/15">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md py-2 text-[11.5px] font-bold text-charcoal hover:bg-white shadow transition-all hover:scale-[1.02]"
              >
                <span>Open Live Demo</span>
                <Eye className="h-3.5 w-3.5 text-terracotta" />
              </a>
              <a
                href={`/dashboard?template=${encodeURIComponent(s.catalogSlug || s.slug)}`}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-terracotta py-2 text-[11.5px] font-bold text-white hover:bg-terracotta-deep shadow transition-all hover:scale-[1.02]"
              >
                <span>Choose This Template</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 h-1 w-20 rounded-full bg-white/40 pointer-events-none" />
        </div>
      </div>
    </motion.article>
  );
}
