"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";
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
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-champagne px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-charcoal">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute hidden h-full w-full animate-ping rounded-full bg-charcoal opacity-60 sm:inline-flex" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-charcoal" />
          </span>
          {s.badge}
        </span>
        <span className="absolute right-5 top-4 font-serif text-lg italic text-ivory/80">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
          <p className="text-[11px] font-bold tracking-[0.28em] text-champagne-light">{s.occasion.toUpperCase()}</p>
          <p className="font-serif mt-1.5 text-3xl leading-none">{s.names}</p>
        </div>
      </div>

      {/* details */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif font-light text-2xl leading-tight">{s.title}</h3>
        <p className="mt-3 text-[14px] leading-relaxed text-charcoal/60">{s.description}</p>
        <div className="mt-5 flex flex-col gap-2.5 pt-1">
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal py-3.5 text-sm font-bold text-ivory hover:bg-terracotta-deep transition-colors"
          >
            Open Live Invitation <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href={waLink(`${WA_MSG_GENERAL} (I loved the ${s.names} invitation — please make one like it for me.)`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border hairline py-3.5 text-sm font-semibold hover:border-charcoal/30 transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4" /> Make Mine Like This
          </a>
        </div>
      </div>
    </motion.article>
  );
}
