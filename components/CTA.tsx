"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import MehfillAura from "./effects/MehfillAura";
import EmailLink from "./EmailLink";
import { useT } from "./i18n/I18nProvider";

export default function CTA() {
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const t = useT();
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const staticGlow = reduce || isMobile;
  return (
    <section id="cta" className="px-4 md:px-8 pb-20 md:pb-28">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-charcoal text-ivory grain px-6 py-16 md:p-20 text-center">
        <motion.div
          animate={staticGlow ? undefined : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[280px] w-[420px] md:h-[420px] md:w-[720px] rounded-full bg-champagne/20 blur-[80px] md:blur-[120px]"
        />
        <MehfillAura variant="dark" />
        <p className="eyebrow text-champagne relative">{t("cta.eyebrow")}</p>
        <h2 className="relative mx-auto mt-5 max-w-2xl font-serif font-light text-4xl md:text-6xl leading-tight">
          {t("cta.title")} <span className="italic text-champagne-light">{t("cta.accent")}</span>
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-ivory/60">{t("cta.sub")}</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/templates"
            className="group inline-flex items-center gap-2 rounded-full bg-ivory px-8 py-4 text-sm font-bold text-charcoal hover:bg-champagne-light transition-colors"
          >
            {t("cta.primary")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a href="/#designs" className="inline-flex items-center rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-ivory hover:border-white/40 transition-colors">
            {t("cta.secondary")}
          </a>
        </div>
        <p className="relative mt-6 text-[12px] tracking-[0.18em] text-ivory/40 font-semibold">{t("cta.strip")}</p>
        <p className="relative mt-3 text-sm text-ivory/55">
          {t("cta.preferEmail")} <EmailLink className="font-semibold text-champagne-light hover:text-ivory" />
        </p>
      </Reveal>
    </section>
  );
}
