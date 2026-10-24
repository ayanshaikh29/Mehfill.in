"use client";
import { useRouter } from "next/navigation";
import { Check, Eye, Sparkles } from "lucide-react";
import type { CatalogTemplate } from "@/lib/catalog";
import { useT } from "./i18n/I18nProvider";

export default function TemplatePicker({ templates }: { templates: CatalogTemplate[] }) {
  const router = useRouter();
  const t = useT();

  const select = (slug: string) => {
    router.push(`/dashboard?template=${encodeURIComponent(slug)}`);
  };

  const FEATURES = ["templates.feat1", "templates.feat2", "templates.feat3", "templates.feat4"];

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-7 justify-items-center">
        {templates.map((tpl, i) => (
          <article
            key={tpl.slug}
            className="group relative flex flex-col items-center w-full max-w-[300px]"
          >
            {/* Phone Bezel */}
            <div className="relative w-full rounded-[3rem] p-[9px] bg-gradient-to-b from-[#4a4540] via-[#221f1d] to-[#151312] shadow-[0_20px_50px_rgba(20,16,12,0.22),0_0_0_1px_rgba(255,255,255,0.08)] transition-transform duration-500 group-hover:-translate-y-2">
              {/* Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 h-[17px] w-[70px] rounded-full bg-black shadow-inner" />

              {/* Screen Area (9 / 19.5 aspect ratio) */}
              <div
                className="relative w-full overflow-hidden rounded-[2.3rem] bg-[#0c0a09]"
                style={{ aspectRatio: "9 / 19.5" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tpl.image}
                  alt={`${tpl.name} — ${tpl.occasion} invitation design`}
                  loading={i < 4 ? "eager" : "lazy"}
                  className="h-full w-full object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                {/* Occasion Badge */}
                <span className="absolute left-3.5 top-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] uppercase text-white">
                  {tpl.occasion}
                </span>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white z-20">
                  <h3 className="font-serif text-xl sm:text-2xl leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {tpl.name}
                  </h3>
                  <p className="mt-1 text-[11.5px] text-white/80 line-clamp-1">
                    {tpl.tagline}
                  </p>

                  <div className="mt-3 flex flex-col gap-2 pt-1 border-t border-white/15">
                    {tpl.demoUrl && (
                      <a
                        href={tpl.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md py-2 text-[11px] font-bold text-charcoal hover:bg-white shadow transition-all"
                      >
                        <Eye className="h-3.5 w-3.5 text-terracotta" /> {t("templates.previewDemo")}
                      </a>
                    )}
                    <button
                      onClick={() => select(tpl.slug)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-charcoal py-2 text-[11px] font-bold text-ivory hover:bg-terracotta-deep shadow transition-all"
                    >
                      <Sparkles className="h-3 w-3 text-champagne" /> Choose This Template
                    </button>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 h-1 w-20 rounded-full bg-white/40 pointer-events-none" />
              </div>
            </div>

            {/* Template Features list below phone */}
            <div className="mt-3 w-full px-2">
              <ul className="space-y-1">
                {FEATURES.slice(0, 2).map((key) => (
                  <li key={key} className="flex items-center gap-1.5 text-[11.5px] text-charcoal/65">
                    <Check className="h-3 w-3 text-olive shrink-0" /> {t(key)}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
