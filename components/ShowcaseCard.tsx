"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Showcase } from "@/lib/showcase";

export default function ShowcaseCard({ s, index }: { s: Showcase; index: number }) {
  const [imgOk, setImgOk] = useState(true);
  const stagger = index % 2 === 1 ? "md:mt-12" : "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-[1.6rem] border hairline bg-white shadow-[0_10px_40px_rgba(28,25,23,0.07)] hover:shadow-[0_24px_60px_rgba(28,25,23,0.14)] transition-shadow duration-500 ${stagger}`}
    >
      {/* vertical portrait cover — phone-first invitation preview */}
      <div className="relative aspect-[4/5] overflow-hidden" style={{ background: s.palette.bg }}>
        {imgOk ? (
          <Image
            src={s.image}
            alt={`${s.names} — live invitation cover`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={70}
            onError={() => setImgOk(false)}
            className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ color: s.palette.ink }}>
            <span
              className="flex h-20 w-20 items-center justify-center rounded-full border font-serif text-3xl"
              style={{ borderColor: s.palette.accent, color: s.palette.accent }}
            >
              {s.names.split("&").map((w) => w.trim()[0]).join(" · ")}
            </span>
            <p className="font-serif mt-5 text-4xl">{s.names}</p>
            <p className="mt-2 text-[12px] font-bold tracking-[0.3em]" style={{ color: s.palette.accent }}>
              {s.occasion.toUpperCase()}
            </p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
        <span className="absolute left-3 md:left-4 top-3 md:top-4 inline-flex items-center gap-1.5 rounded-full bg-champagne px-2.5 md:px-3.5 py-1 md:py-1.5 text-[9px] md:text-[11px] font-bold tracking-[0.14em] text-charcoal">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute hidden h-full w-full animate-ping rounded-full bg-charcoal opacity-60 sm:inline-flex" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-charcoal" />
          </span>
          {s.badge}
        </span>
        <span className="absolute right-3 md:right-5 top-3 md:top-4 hidden font-serif text-sm md:text-lg italic text-ivory/80 md:block">
          {s.occasion.split("·")[0].trim()}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3 md:p-5 text-ivory">
          <p className="font-serif mt-1.5 text-lg md:text-3xl leading-tight drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">{s.names}</p>
        </div>
      </div>

      {/* details — minimalist: single open button */}
      <div className="p-3 md:p-5">
        <a
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap rounded-full bg-charcoal py-2.5 md:py-3.5 text-[11px] md:text-sm font-bold text-ivory hover:bg-terracotta-deep transition-colors"
        >
          <span className="md:hidden">Open Invitation</span>
          <span className="hidden md:inline">Open Live Invitation</span>
          <ArrowUpRight className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
        </a>
      </div>
    </motion.article>
  );
}
