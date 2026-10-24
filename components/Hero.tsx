"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Volume2, ShieldCheck, Heart, Users } from "lucide-react";
import MehfillAura from "./effects/MehfillAura";
import { useEffect, useRef, useState } from "react";
import { useT } from "./i18n/I18nProvider";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const t = useT();
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(mq.matches && window.innerWidth >= 1024);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const enableParallax = finePointer && !reduce;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const phoneX = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const phoneY = useTransform(sy, [-0.5, 0.5], [-8, 8]);
  const floatX1 = useTransform(sx, [-0.5, 0.5], [16, -16]);
  const floatY1 = useTransform(sy, [-0.5, 0.5], [12, -12]);
  const floatX2 = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const floatY2 = useTransform(sy, [-0.5, 0.5], [-14, 14]);

  const onMove = (e: React.MouseEvent) => {
    if (!enableParallax) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section id="top" ref={ref} onMouseMove={onMove} className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 h-[260px] w-[260px] rounded-full bg-champagne/20 blur-[80px] md:-top-32 md:-right-32 md:h-[480px] md:w-[480px] md:blur-[120px]" />
        <div className="absolute top-1/3 -left-24 h-[240px] w-[240px] rounded-full bg-terracotta/15 blur-[80px] md:-left-40 md:h-[420px] md:w-[420px] md:blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 h-[200px] w-[280px] rounded-full bg-sage/20 blur-[70px] md:h-[300px] md:w-[500px] md:blur-[100px]" />
      </div>

      <MehfillAura variant="hero" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-8 items-center">
        {/* Left Column: Headline & Action */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3.5 py-1 text-[11px] font-bold tracking-[0.14em] uppercase text-terracotta mb-4"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t("hero.badge")}</span>
          </motion.div>

          <h1 className="font-serif font-light leading-[0.98] tracking-tight text-[13.5vw] sm:text-6xl md:text-7xl xl:text-[5.4rem] text-balance">
            <span className="block overflow-hidden">
              <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                {t("hero.l1")}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span className="block italic font-medium text-terracotta-deep" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
                {t("hero.l2")}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                {t("hero.l3")}
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="mt-6 max-w-md text-[15.5px] md:text-lg leading-relaxed text-charcoal/65"
          >
            {t("hero.sub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.7 }}
            className="mt-8 flex flex-wrap items-center gap-3.5"
          >
            <Link href="/templates" className="group inline-flex items-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-espresso transition-all shadow-lg hover:shadow-xl">
              Get Your Digital Invitation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#designs" className="inline-flex items-center gap-2 rounded-full border hairline px-7 py-3.5 text-sm font-semibold hover:border-charcoal/30 bg-white/70 backdrop-blur transition-all shadow-sm">
              View All Demos
            </a>
          </motion.div>

          {/* Ultra Crisp Trust Stats Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-8 pt-6 border-t border-charcoal/10 flex flex-wrap items-center gap-2.5 sm:gap-3"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border hairline px-3.5 py-1.5 shadow-sm backdrop-blur">
              <div className="h-6 w-6 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta">
                <Users className="h-3.5 w-3.5" />
              </div>
              <span className="text-[12px] font-bold text-charcoal">50K+ Happy Couples</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border hairline px-3.5 py-1.5 shadow-sm backdrop-blur">
              <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <span className="text-[12px] font-bold text-charcoal">100% Private & Verified</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border hairline px-3.5 py-1.5 shadow-sm backdrop-blur">
              <div className="h-6 w-6 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Heart className="h-3.5 w-3.5 fill-rose-500" />
              </div>
              <span className="text-[12px] font-bold text-charcoal">Couture Templates</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Clean Single iPhone Mockup with Floating Elements */}
        <div className="relative mx-auto w-full max-w-[440px] flex items-center justify-center py-6">
          <motion.div
            style={enableParallax ? { x: phoneX, y: phoneY } : undefined}
            className="relative z-10 w-full flex justify-center"
          >
            {/* ── Single iPhone Mockup (Clean single frame without duplication) ── */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-[280px] sm:w-[310px] group transition-transform duration-500 hover:-translate-y-1.5"
            >
              {/* Single Phone Graphic */}
              <div className="relative w-full aspect-[238/562] drop-shadow-[0_30px_70px_rgba(20,16,12,0.32)]">
                <Image
                  src="/images/creative/single-phone-mockup.png"
                  alt="Aarav & Meera Wedding Invitation by Mehfill.in"
                  fill
                  priority
                  sizes="(max-width: 640px) 280px, 310px"
                  quality={92}
                  className="object-contain"
                />

                {/* Subtle Overlay Live Button inside Phone */}
                <div className="absolute inset-x-0 bottom-7 text-center z-20 px-4">
                  <a
                    href="/site-7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-white/60 px-5 py-2 text-[11px] font-bold tracking-[0.14em] uppercase text-charcoal shadow-lg backdrop-blur hover:bg-white hover:scale-105 transition-all"
                  >
                    Open Live Demo →
                  </a>
                </div>
              </div>
            </motion.div>

            {/* ── Floating Component 1: Luxury Wax-Sealed Envelope ── */}
            <motion.div
              style={enableParallax ? { x: floatX1, y: floatY1 } : undefined}
              initial={{ opacity: 0, x: -30, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.75, duration: 0.8 }}
              className="absolute -left-6 sm:-left-12 -bottom-4 sm:-bottom-8 z-20 w-36 sm:w-48 pointer-events-none drop-shadow-[0_20px_35px_rgba(20,16,12,0.25)]"
            >
              <Image
                src="/images/creative/wax-envelope.png"
                alt="Luxury wax seal wedding envelope"
                width={360}
                height={360}
                className="w-full h-auto object-contain transform -rotate-6"
                priority
              />
            </motion.div>

            {/* ── Floating Component 2: Desk Calendar Easel ── */}
            <motion.div
              style={enableParallax ? { x: floatX2, y: floatY2 } : undefined}
              initial={{ opacity: 0, x: 30, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.85, duration: 0.8 }}
              className="absolute -right-4 sm:-right-10 top-10 sm:top-14 z-20 w-32 sm:w-44 pointer-events-none drop-shadow-[0_20px_35px_rgba(20,16,12,0.22)]"
            >
              <Image
                src="/images/creative/calendar-pad.png"
                alt="Save the Date Calendar Easel Stand"
                width={340}
                height={340}
                className="w-full h-auto object-contain transform rotate-6"
                priority
              />
            </motion.div>

            {/* ── Floating Component 3: Audio Player Pill ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.8 }}
              className="absolute -right-2 sm:-right-6 bottom-12 sm:bottom-16 z-20 rounded-full bg-white/95 backdrop-blur-md border hairline shadow-[0_12px_30px_rgba(20,16,12,0.18)] p-2 pr-4 flex items-center gap-3 transform rotate-2 pointer-events-none"
            >
              <div className="h-8 w-8 rounded-full bg-terracotta flex items-center justify-center text-white shadow-sm">
                <Volume2 className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-charcoal leading-none">Our Story Audio</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="h-1 w-16 rounded-full bg-charcoal/15 overflow-hidden">
                    <div className="h-full w-2/3 bg-terracotta rounded-full" />
                  </div>
                  <span className="text-[9px] font-mono text-charcoal/50">3:24</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Marquee ticker with occasions */}
      <div className="relative mt-16 md:mt-20 border-y hairline bg-cream/60 py-4 overflow-hidden">
        <div className="marquee-track flex w-max whitespace-nowrap gap-10 font-serif text-lg md:text-xl italic text-charcoal/60">
          {Array(2).fill(["Weddings", "Nikah", "Haldi", "Mehndi", "Anand Karaj", "Birthdays", "Engagements", "Anniversaries", "Baby Showers", "Housewarming", "Walima", "Sangeet", "Reception"].join("  •  ")).map((s, i) => (
            <span key={i} className="pr-10">{s}  • </span>
          ))}
        </div>
      </div>
    </section>
  );
}
