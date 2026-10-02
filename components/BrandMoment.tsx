"use client";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import MehfillAura from "./effects/MehfillAura";

// Signature brand moment — mirrors the Mehfill brand portrait:
// ivory light, botanical shadows, falling golden petals, the logo at rest.
export default function BrandMoment() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36 text-center px-5">
      <MehfillAura variant="signature" />
      <Reveal className="relative">
        <p className="eyebrow text-terracotta">MEHFILL.IN</p>
        <motion.img
          src="/logo.png"
          alt="Mehfill.in"
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 w-64 sm:w-80 md:w-[26rem] max-w-full"
        />
        <h2 className="mx-auto mt-10 max-w-3xl font-serif font-light text-4xl md:text-6xl leading-[1.05]">
          Your celebration.<br /><span className="italic">Your story.</span><br />Your Mehfill.
        </h2>
        <div className="mx-auto mt-8 h-px w-24 bg-champagne" />
        <p className="mt-6 text-charcoal/55 tracking-wide text-sm md:text-base">Create. Invite. Celebrate.</p>
      </Reveal>
    </section>
  );
}
