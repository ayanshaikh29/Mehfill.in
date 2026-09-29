"use client";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import MehfillAura from "./effects/MehfillAura";
import { WhatsAppIcon } from "./BrandIcons";
import { waLink, WA_MSG_GENERAL, CONTACT_EMAIL } from "@/lib/contact";

export default function CTA() {
  return (
    <section id="cta" className="px-4 md:px-8 pb-20 md:pb-28">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-charcoal text-ivory grain px-6 py-16 md:p-20 text-center">
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[720px] rounded-full bg-champagne/20 blur-[120px]"
        />
        <MehfillAura variant="dark" />
        <p className="eyebrow text-champagne relative">GET YOURS</p>
        <h2 className="relative mx-auto mt-5 max-w-2xl font-serif font-light text-4xl md:text-6xl leading-tight">Liked a demo? <span className="italic text-champagne-light">Message us.</span></h2>
        <p className="relative mx-auto mt-4 max-w-md text-ivory/60">Share your names, date, venue & photos on WhatsApp — we&apos;ll craft your Mehfill invitation.</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-ivory px-8 py-4 text-sm font-bold text-charcoal hover:bg-champagne-light transition-colors">
            <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
          </a>
          <a href="#designs" className="inline-flex items-center rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-ivory hover:border-white/40 transition-colors">
            View Demos Again
          </a>
        </div>
        <p className="relative mt-6 text-[12px] tracking-[0.18em] text-ivory/40 font-semibold">CUSTOM-MADE • PERSONAL • READY TO SHARE</p>
        <p className="relative mt-3 text-sm text-ivory/55">
          Prefer email? <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-champagne-light hover:text-ivory">{CONTACT_EMAIL}</a>
        </p>
      </Reveal>
    </section>
  );
}
