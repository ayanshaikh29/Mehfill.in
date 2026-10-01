"use client";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";
import MehfillAura from "./effects/MehfillAura";
import { useRef } from "react";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const phoneX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const phoneY = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  const bgX = useTransform(sx, [-0.5, 0.5], [18, -18]);
  const bgY = useTransform(sy, [-0.5, 0.5], [12, -12]);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section id="top" ref={ref} onMouseMove={onMove} className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24">
      {/* ambient background */}
      <motion.div style={{ x: bgX, y: bgY }} className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-champagne/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-40 h-[420px] w-[420px] rounded-full bg-terracotta/15 blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 h-[300px] w-[500px] rounded-full bg-sage/20 blur-[100px]" />
      </motion.div>
      <MehfillAura variant="hero" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-8 items-center">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="eyebrow text-terracotta"
          >
            DIGITAL CELEBRATIONS
          </motion.p>
          <h1 className="mt-5 font-serif font-light leading-[0.98] tracking-tight text-[13.5vw] sm:text-6xl md:text-7xl xl:text-[5.4rem] text-balance">
            <span className="block overflow-hidden">
              <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                More Than an
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span className="block italic font-medium" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
                Invitation.
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                An Experience.
              </motion.span>
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-6 max-w-md text-[15.5px] md:text-lg leading-relaxed text-charcoal/65"
          >
            Beautiful digital invitations for every faith and family — Hindu, Muslim, Sikh, Christian weddings, birthdays, engagements & every celebration. Custom-made for you, just share your details on WhatsApp.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="#designs" className="group inline-flex items-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-espresso transition-colors">
              View Live Demos <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border hairline px-7 py-3.5 text-sm font-semibold hover:border-charcoal/30 bg-white/40 backdrop-blur transition-colors">
              <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 flex items-center gap-5 text-[12px] tracking-[0.18em] font-semibold text-charcoal/45"
          >
            <span>WEDDINGS</span><span className="h-1 w-1 rounded-full bg-champagne" />
            <span>BIRTHDAYS</span><span className="h-1 w-1 rounded-full bg-champagne" />
            <span>ENGAGEMENTS</span>
          </motion.div>
        </div>

        {/* phone visual */}
        <div className="relative mx-auto w-full max-w-[420px]">
          <motion.div style={{ x: phoneX, y: phoneY }} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto w-[270px] sm:w-[300px] rounded-[2.8rem] border-[10px] border-charcoal bg-charcoal shadow-[0_40px_90px_rgba(28,25,23,0.28)] overflow-hidden"
            >
              <div className="relative aspect-[9/19] overflow-hidden rounded-[2rem] bg-[#0f0e0d]">
                <img
                  src="/images/hero/hero_wedding.jpg"
                  alt="Eternal wedding invitation preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />
                <div className="absolute top-3 left-1/2 -translate-x-1/2 h-6 w-24 rounded-full bg-black/90" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-center text-ivory">
                  <p className="text-[10px] tracking-[0.35em] text-champagne-light">YOU&apos;RE INVITED</p>
                  <p className="mt-2 font-serif text-3xl leading-none">Aarav <span className="italic">&</span> Amara</p>
                  <p className="mt-2 text-[11px] tracking-[0.2em] opacity-80">14 . 02 . 2027 — UDAIPUR</p>
                  <div className="mx-auto mt-4 w-fit rounded-full border border-white/30 px-5 py-2 text-[11px] tracking-[0.2em] backdrop-blur">TAP TO ENTER</div>
                </div>
              </div>
            </motion.div>

            {/* floating cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -left-4 sm:-left-10 top-16 rounded-2xl bg-white/90 backdrop-blur border hairline shadow-xl px-4 py-3"
            >
              <p className="text-[10px] tracking-[0.25em] text-terracotta font-bold">RSVP • LIVE</p>
              <p className="font-serif text-lg leading-tight mt-1">214 guests<br />already in</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.95 }}
              className="absolute -right-3 sm:-right-8 bottom-20 rounded-2xl bg-charcoal text-ivory shadow-xl px-4 py-3"
            >
              <p className="text-[10px] tracking-[0.25em] text-champagne font-bold">CINEMATIC REVEAL</p>
              <p className="font-serif text-lg italic mt-1">doors open…</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* marquee */}
      <div className="relative mt-16 md:mt-20 border-y hairline bg-cream/60 py-4 overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-10 font-serif text-lg md:text-xl italic text-charcoal/60 w-max"
        >
          {Array(2).fill(["Weddings", "Nikah", "Haldi", "Mehndi", "Anand Karaj", "Birthdays", "Engagements", "Anniversaries", "Baby Showers", "Baptism", "Puja", "Dawat", "Walima", "Sangeet", "Reception"].join("  •  ")).map((s, i) => (
            <span key={i} className="pr-10">{s}  • </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
