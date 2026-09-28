"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "./Reveal";

export default function CinematicExperience() {
  return (
    <section className="relative bg-charcoal text-ivory overflow-hidden grain">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <Reveal>
            <p className="eyebrow text-champagne">THE MEHFILL DIFFERENCE</p>
            <h2 className="mt-5 font-serif font-light text-4xl md:text-6xl leading-[1.02] text-balance">
              Your invitation should feel like <span className="italic text-champagne-light">an experience.</span>
            </h2>
            <p className="mt-6 text-ivory/60 leading-relaxed max-w-md">
              Not a PDF. Not a forwarded image. A slow cinematic reveal — doors that open, music that fades in, details that unfold as you scroll.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-6">
            {[
              ["01", "Tap to enter"],
              ["02", "Story unfolds"],
              ["03", "RSVP in one tap"],
            ].map(([n, t]) => (
              <div key={n} className="flex items-center gap-3">
                <span className="font-serif italic text-champagne text-xl">{n}</span>
                <span className="text-sm text-ivory/70">{t}</span>
              </div>
            ))}
          </Reveal>
          <Reveal delay={0.25} className="mt-10">
            <Link href="#designs" className="inline-flex items-center gap-2 rounded-full bg-ivory text-charcoal px-7 py-3.5 text-sm font-semibold hover:bg-champagne-light transition-colors">
              See it live <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
            <motion.img
              initial={{ scale: 1.12 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              src="https://images.unsplash.com/photo-1595407753234-0882f1e77954?q=80&w=1200&auto=format&fit=crop"
              alt="Cinematic invitation venue"
              className="aspect-[4/5] sm:aspect-[5/5] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            {/* door open effect overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute inset-x-6 bottom-6 rounded-2xl bg-ivory/95 backdrop-blur text-charcoal p-5"
            >
              <p className="text-[10px] tracking-[0.3em] font-bold text-terracotta">ETERNAL — LIVE DEMO</p>
              <p className="font-serif text-2xl mt-1">Together with their families</p>
              <p className="text-sm text-charcoal/60 mt-1">Ayan & Amara — 14.02.2027, Udaipur</p>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
