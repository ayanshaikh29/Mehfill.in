"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { CATALOG } from "@/lib/catalog";
import { Reveal } from "./Reveal";

const CATEGORIES = [
  { id: "all", label: "All Designs (9)" },
  { id: "recommended", label: "⭐ Recommended" },
  { id: "latest", label: "✨ Latest Release" },
  { id: "wedding", label: "Royal Weddings" },
  { id: "nikah", label: "Nikah & Muslim" },
  { id: "reception", label: "Reception & Modern" },
  { id: "botanical", label: "Garden & Floral" },
];

export default function DesignGallery() {
  const [activeCategory, setActiveCategory] = useState("all");

  // Wishlist heart state (persisted to localStorage)
  const [liked, setLiked] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mehfill_liked_templates");
      if (saved) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setLiked(new Set(JSON.parse(saved)));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleLike = (slug: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem("mehfill_liked_templates", JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const filteredTemplates = CATALOG.filter((tpl) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "recommended") {
      return tpl.badge === "Recommended";
    }
    if (activeCategory === "latest") {
      return tpl.badge === "Latest";
    }
    if (activeCategory === "wedding") {
      return (
        tpl.slug === "royal-floral-garden" ||
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
        tpl.slug === "royal-floral-garden" ||
        tpl.slug === "botanical-sage" ||
        tpl.slug === "blush-garden" ||
        tpl.slug === "luxury-ivory-reception"
      );
    }
    return true;
  });

  return (
    <section id="designs" className="relative py-14 sm:py-20 md:py-24 overflow-hidden bg-[#faf6f0]">
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 md:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-5 px-1 sm:px-0">
          <Reveal className="max-w-2xl">
            <h2 className="font-serif font-normal text-2xl sm:text-4xl md:text-5xl text-[#2b2118] tracking-tight leading-tight">
              Popular invitation websites
            </h2>
            <p className="mt-1.5 sm:mt-2 text-[12.5px] sm:text-[14.5px] text-charcoal/70 leading-relaxed max-w-xl">
              Open any design to see the real invitation, with the reply form working, before you pay.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-charcoal/20 bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-[12px] sm:text-[13px] font-semibold text-charcoal hover:bg-charcoal/5 shadow-sm transition-all"
            >
              <span>Explore All Templates</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#822433]" />
            </Link>
          </Reveal>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-1.5 sm:gap-2.5 px-1 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-[12.5px] font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-charcoal text-white shadow-sm scale-[1.02]"
                  : "bg-white/80 border border-[#e3d9cd] text-charcoal/70 hover:bg-white hover:text-charcoal"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Back-to-Back Template Rows (2 Columns on Mobile, 3 Columns on Desktop) ── */}
        <div className="mt-7 sm:mt-10 grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8 justify-items-center">
          {filteredTemplates.map((tpl, i) => (
            <article
              key={tpl.slug}
              className="w-full max-w-[340px] bg-white rounded-2xl sm:rounded-[1.75rem] p-2 sm:p-3.5 md:p-4 border border-[#e7ddcf] shadow-[0_2px_12px_rgba(35,22,12,0.04)] sm:shadow-[0_4px_20px_rgba(35,22,12,0.05)] hover:shadow-[0_14px_34px_rgba(35,22,12,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
            >
              {/* Inner Image Container (9 / 15.5 vertical aspect ratio) */}
              <div className="relative w-full aspect-[9/15.5] rounded-xl sm:rounded-[1.25rem] overflow-hidden bg-[#f0eae1]">
                <Image
                  src={tpl.image}
                  alt={`${tpl.name} — wedding invitation website preview`}
                  fill
                  priority={i < 4}
                  sizes="(max-width: 640px) 190px, (max-width: 1024px) 340px, 340px"
                  quality={88}
                  className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />

                {/* Top-Left Status Pill Badge */}
                {tpl.badge && (
                  <span
                    className={`absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-10 rounded-full px-1.5 sm:px-2.5 py-0.5 text-[7.5px] sm:text-[9.5px] font-bold tracking-wider uppercase text-white shadow-sm ${
                      tpl.badge === "Latest"
                        ? "bg-[#183144]"
                        : tpl.badge === "Recommended"
                        ? "bg-[#822433]"
                        : tpl.badge === "Trending"
                        ? "bg-[#96283b]"
                        : "bg-[#822433]"
                    }`}
                  >
                    {tpl.badge === "Latest" ? "NEW" : tpl.badge.toUpperCase()}
                  </span>
                )}

                {/* Top-Right Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleLike(tpl.slug);
                  }}
                  className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-10 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/95 backdrop-blur-sm shadow-sm sm:shadow-md flex items-center justify-center text-charcoal/70 hover:bg-white hover:scale-110 active:scale-90 transition-all"
                  aria-label="Save to wishlist"
                >
                  <Heart
                    className={`h-3 w-3 sm:h-4 sm:w-4 transition-colors ${
                      liked.has(tpl.slug)
                        ? "fill-[#822433] text-[#822433]"
                        : "text-charcoal/70"
                    }`}
                  />
                </button>
              </div>

              {/* Card Details Area */}
              <div className="pt-2 sm:pt-3.5 pb-0.5 sm:pb-1 flex flex-col flex-1 justify-between">
                <div>
                  {/* Title & Price Row */}
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-1.5">
                    <h3 className="font-serif font-semibold text-[11px] sm:text-[14px] text-charcoal line-clamp-1">
                      {tpl.name}
                    </h3>
                    <div className="shrink-0 text-left sm:text-right whitespace-nowrap">
                      <span className="text-[11px] sm:text-[13.5px] font-bold text-charcoal">
                        ₹{tpl.price?.toLocaleString("en-IN") || "999"}
                      </span>
                      <span className="ml-1 text-[7px] sm:text-[9px] text-charcoal/50 font-normal">
                        excl. GST
                      </span>
                    </div>
                  </div>

                  {/* Sub-Tagline / Theme Palette description */}
                  <p className="mt-0.5 text-[9.5px] sm:text-[11.5px] text-charcoal/55 line-clamp-1">
                    {tpl.tagline}
                  </p>
                </div>

                {/* Bottom Action Buttons (LIVE DEMO & BUY NOW) */}
                <div className="mt-2 sm:mt-3.5 grid grid-cols-2 gap-1 sm:gap-2 pt-1.5 sm:pt-2 border-t border-[#f2ebe0]">
                  <a
                    href={tpl.demoUrl || "/templates"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-charcoal/20 bg-white hover:bg-charcoal/[0.04] py-1 sm:py-2 text-[8px] sm:text-[10.5px] font-bold tracking-wider text-charcoal uppercase transition-all active:scale-95 text-center"
                  >
                    DEMO
                  </a>
                  <Link
                    href={`/dashboard?template=${encodeURIComponent(tpl.slug)}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#822433] hover:bg-[#6c1d29] py-1 sm:py-2 text-[8px] sm:text-[10.5px] font-bold tracking-wider text-white uppercase shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-center"
                  >
                    BUY NOW
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Call to Action strip */}
        <div className="mt-14 text-center">
          <p className="text-[12.5px] tracking-[0.2em] uppercase font-bold text-charcoal/45">
            Preview any design live → personalize with your details → share seamlessly via WhatsApp
          </p>
        </div>

      </div>
    </section>
  );
}
