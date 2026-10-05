"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Template } from "@/lib/templates";

export default function TemplateCard({ t, index }: { t: Template; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[1.6rem] bg-white border hairline shadow-[0_10px_40px_rgba(28,25,23,0.07)] hover:shadow-[0_24px_60px_rgba(28,25,23,0.14)] transition-shadow duration-500"
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        <Image
          src={t.image}
          alt={`${t.name} — ${t.occasion} invitation`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={70}
          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />
        <span className="absolute left-4 top-4 rounded-full bg-ivory/90 backdrop-blur px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] uppercase">
          {t.occasion}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
          <p className="font-serif text-3xl leading-none">{t.name}</p>
          <p className="mt-1.5 text-[13px] text-ivory/80">{t.tagline}</p>
        </div>
      </div>
      <div className="p-5 flex items-center justify-between gap-3">
        <p className="text-[13.5px] leading-relaxed text-charcoal/60 line-clamp-2">{t.description}</p>
      </div>
      <div className="px-5 pb-5">
        <Link
          href={`/demos/${t.slug}`}
          className="flex items-center justify-center gap-2 rounded-full bg-charcoal py-3 text-sm font-semibold text-ivory group-hover:bg-terracotta-deep transition-colors"
        >
          View Live Demo <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}
