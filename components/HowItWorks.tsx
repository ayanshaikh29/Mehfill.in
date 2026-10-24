"use client";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "./Reveal";
import { ArrowRight, Sparkles, Send, Palette, Eye } from "lucide-react";
import { useT } from "./i18n/I18nProvider";

export default function HowItWorks() {
  const t = useT();

  const STEPS = [
    {
      n: "01",
      stepNum: "1. Choose Template",
      title: t("how.s1t"),
      text: t("how.s1d"),
      cta: t("how.s1c"),
      href: "/templates",
      image: "/images/creative/floating-cards.png",
      tag: "Couture Designs",
      icon: Palette,
    },
    {
      n: "02",
      stepNum: "2. Add Your Details",
      title: t("how.s2t"),
      text: t("how.s2d"),
      cta: t("how.s2c"),
      href: "/templates",
      image: "/images/creative/wax-envelope.png",
      tag: "Live Studio Editor",
      icon: Eye,
    },
    {
      n: "03",
      stepNum: "3. Share with Loved Ones",
      title: t("how.s3t"),
      text: t("how.s3d"),
      cta: t("how.s3c"),
      href: "/templates",
      image: "/images/creative/calendar-pad.png",
      tag: "Instant Delivery",
      icon: Send,
    },
  ];

  return (
    <section id="how" className="relative bg-[#faf7f2] border-y hairline py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 md:px-8 relative z-10">
        <Reveal className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3.5 py-1 text-[11px] font-bold tracking-[0.14em] uppercase text-terracotta mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Effortless Process</span>
          </div>
          <h2 className="font-serif font-light text-4xl md:text-6xl">
            {t("how.title")} <span className="italic font-medium text-terracotta-deep">{t("how.accent")}</span>
          </h2>
          <p className="mt-4 text-[15px] md:text-base text-charcoal/65 leading-relaxed">
            From picking a royal design to sending your live invitation on WhatsApp — ready in under 5 minutes.
          </p>
        </Reveal>

        {/* 3 Process Cards with crystal clear visual components */}
        <div className="mt-14 grid md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.12}>
              <div className="relative flex h-full flex-col rounded-[2.2rem] bg-white border hairline p-7 sm:p-8 shadow-[0_10px_30px_rgba(20,16,12,0.05)] hover:shadow-[0_24px_60px_rgba(20,16,12,0.14)] transition-all duration-500 group hover:-translate-y-1">
                {/* Visual Image Banner for step with crisp transparent asset */}
                <div className="relative h-44 w-full mb-6 rounded-2xl bg-gradient-to-b from-[#faf6f0] to-[#f4eee4] flex items-center justify-center p-3 overflow-hidden border hairline shadow-inner">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-[10px] font-bold tracking-[0.14em] uppercase text-charcoal shadow-sm border hairline">
                    {s.tag}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif italic text-3xl font-light text-terracotta">
                    {s.n}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-charcoal/40">
                    {s.stepNum}
                  </span>
                </div>

                <h3 className="font-serif text-2xl text-charcoal mt-1">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] sm:text-[14px] text-charcoal/65 leading-relaxed">
                  {s.text}
                </p>

                <div className="mt-auto pt-6">
                  <Link
                    href={s.href}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-[12.5px] font-bold text-ivory transition-all group-hover:bg-terracotta-deep shadow-sm"
                  >
                    <span>{s.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
