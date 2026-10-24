"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import PhoneDemoCard from "./PhoneDemoCard";
import { Reveal } from "./Reveal";
import { useT } from "./i18n/I18nProvider";

const CATEGORIES = [
  { id: "all", label: "All Demos (8)" },
  { id: "wedding", label: "Royal Weddings" },
  { id: "nikah", label: "Nikah & Muslim" },
  { id: "reception", label: "Reception & Modern" },
  { id: "botanical", label: "Garden & Floral" },
];

export default function DesignGallery() {
  const t = useT();
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTemplates = CATALOG.filter((tpl) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "wedding") {
      return (
        tpl.slug === "royal-marigold" ||
        tpl.slug === "rose-royale" ||
        tpl.slug === "blush-garden"
      );
    }
    if (activeCategory === "nikah") {
      return tpl.slug === "nikah-emerald" || tpl.slug === "rose-royale";
    }
    if (activeCategory === "reception") {
      return (
        tpl.slug === "luxury-ivory-reception" ||
        tpl.slug === "ivory-editorial" ||
        tpl.slug === "midnight-gold"
      );
    }
    if (activeCategory === "botanical") {
      return (
        tpl.slug === "botanical-sage" ||
        tpl.slug === "blush-garden" ||
        tpl.slug === "luxury-ivory-reception"
      );
    }
    return true;
  });

  return (
    <section id="designs" className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-transparent via-[#fbf7f2] to-transparent">
      {/* Decorative background aura */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <div className="h-[650px] w-[650px] rounded-full bg-champagne/20 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <Reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3.5 py-1 text-[11px] font-bold tracking-[0.14em] uppercase text-terracotta mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Mobile-First Live Demos</span>
            </div>
            <h2 className="font-serif font-light text-4xl md:text-6xl leading-[1.02]">
              {t("gallery.title")} <span className="italic font-medium">{t("gallery.accent")}</span>
            </h2>
            <p className="mt-4 text-[15px] md:text-base text-charcoal/65 leading-relaxed">
              Every Mehfill invitation is designed specifically for mobile screens — experience all 8 signature wedding, Nikah and reception designs in real iPhone presentation.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full border hairline bg-white px-6 py-3 text-sm font-semibold text-charcoal hover:border-charcoal/30 shadow-sm transition-all"
            >
              <span>Explore All Templates</span>
              <ArrowRight className="h-4 w-4 text-terracotta" />
            </Link>
          </Reveal>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center gap-2 md:gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 md:px-5 py-2 text-[12px] md:text-[13px] font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-charcoal text-white shadow-md scale-[1.02]"
                  : "bg-white/80 border hairline text-charcoal/70 hover:bg-white hover:text-charcoal"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── All 8 Demos Presented in Phone Style Mockups ───────────── */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-7 justify-items-center">
          {filteredTemplates.map((template, i) => (
            <PhoneDemoCard
              key={template.slug}
              template={template}
              index={i}
              priority={i < 4}
            />
          ))}
        </div>

        {/* Bottom Call to Action strip */}
        <div className="mt-16 text-center">
          <p className="text-[12.5px] tracking-[0.2em] uppercase font-bold text-charcoal/45">
            Preview any design live → personalize with your details → share seamlessly via WhatsApp
          </p>
        </div>
      </div>
    </section>
  );
}
