"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";
import type { Showcase } from "@/lib/showcase";

export default function ShowcaseCard({ s, index }: { s: Showcase; index: number }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[1.6rem] border hairline bg-white shadow-[0_10px_40px_rgba(28,25,23,0.07)] hover:shadow-[0_24px_60px_rgba(28,25,23,0.14)] transition-shadow duration-500"
    >
      <div className="grid md:grid-cols-2">
        {/* cover — live homepage screenshot, styled fallback if it fails */}
        <div className="relative min-h-[260px] overflow-hidden md:min-h-[340px]" style={{ background: s.palette.bg }}>
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.image}
              alt={`${s.names} — live invitation cover`}
              loading="lazy"
              onError={() => setImgOk(false)}
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
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
          <span className="absolute left-4 top-4 rounded-full bg-champagne px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-charcoal">
            {s.badge}
          </span>
        </div>

        {/* details */}
        <div className="flex flex-col justify-center p-6 md:p-10">
          <p className="eyebrow text-terracotta">{s.occasion.toUpperCase()}</p>
          <h3 className="font-serif mt-3 font-light text-3xl md:text-4xl leading-tight">{s.title}</h3>
          <p className="mt-1 font-serif text-xl italic text-charcoal/70">{s.names}</p>
          <p className="mt-4 text-[14.5px] leading-relaxed text-charcoal/65">{s.description}</p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-charcoal py-3.5 text-sm font-bold text-ivory hover:bg-terracotta-deep transition-colors"
            >
              Open Live Invitation <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href={waLink(`${WA_MSG_GENERAL} (I loved the ${s.names} invitation — please make one like it for me.)`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border hairline py-3.5 text-sm font-semibold hover:border-charcoal/30 transition-colors"
            >
              <WhatsAppIcon className="h-4 w-4" /> Make Mine Like This
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
