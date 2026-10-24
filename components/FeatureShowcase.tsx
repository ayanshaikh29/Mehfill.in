"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Clapperboard, Images, MapPin, Music4, Sparkles, CalendarClock, HeartHandshake } from "lucide-react";

const FEATURES = [
  { icon: Clapperboard, title: "Cinematic Animations", text: "Door opens, camera moves, story begins." },
  { icon: Sparkles, title: "Personalised Details", text: "Names, dates, venues, monograms." },
  { icon: Images, title: "Photo Galleries", text: "Editorial grids with soft transitions." },
  { icon: CalendarClock, title: "Event Timeline", text: "Haldi to reception, beautifully sequenced." },
  { icon: Music4, title: "Background Music", text: "A royal score that fades in on entry." },
  { icon: MapPin, title: "Maps & Venue", text: "One tap to reach the celebration." },
  { icon: HeartHandshake, title: "Instant RSVP", text: "Guests confirm attendance in seconds." },
  { icon: Sparkles, title: "WhatsApp & Link Sharing", text: "One link. Infinite forwards to all your guests." },
];

export default function FeatureShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const xDesktop = useTransform(scrollYProgress, [0, 1], ["4%", "-48%"]);
  const enableParallax = isDesktop && !reduce;

  return (
    <section ref={ref} className="bg-charcoal text-ivory py-20 md:py-28 overflow-hidden grain relative">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="eyebrow text-champagne">EVERYTHING INSIDE</p>
            <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl max-w-2xl">
              One link. <span className="italic text-champagne-light">The whole celebration.</span>
            </h2>
          </div>

          {/* Crisp Vector Venue Location Pill */}
          <div className="inline-flex items-center gap-3 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-5 py-2.5 shadow-sm">
            <div className="h-8 w-8 rounded-full bg-champagne/20 flex items-center justify-center text-champagne">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-ivory">Google Maps Integrated</p>
              <p className="text-[10px] text-ivory/60">One-tap guest navigation</p>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        style={enableParallax ? { x: xDesktop } : undefined}
        className="mt-12 flex gap-5 w-max max-w-full px-5 md:px-8 overflow-x-auto snap-x snap-mandatory no-scrollbar lg:overflow-visible"
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="w-[260px] md:w-[300px] shrink-0 snap-start rounded-[1.8rem] border border-white/12 bg-white/[0.04] p-7 backdrop-blur-sm hover:border-champagne/40 transition-colors"
          >
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
              <f.icon className="h-5 w-5 text-champagne" />
            </div>
            <h3 className="mt-5 font-serif text-2xl">{f.title}</h3>
            <p className="mt-2 text-sm text-ivory/65 leading-relaxed">{f.text}</p>
          </div>
        ))}
      </motion.div>

      <div className="mt-8 px-5 md:px-8 flex items-center justify-between max-w-7xl mx-auto">
        <p className="text-[12px] tracking-[0.2em] text-ivory/40 font-semibold">SCROLL → TO EXPLORE</p>
      </div>
    </section>
  );
}
