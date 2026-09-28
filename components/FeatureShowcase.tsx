"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Clapperboard, Images, MapPin, Music4, Sparkles, CalendarClock, HeartHandshake } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";

const FEATURES = [
  { icon: Clapperboard, title: "Cinematic Animations", text: "Door opens, camera moves, story begins." },
  { icon: Sparkles, title: "Personalised Details", text: "Names, dates, venues, monograms." },
  { icon: Images, title: "Photo Galleries", text: "Editorial grids with soft transitions." },
  { icon: CalendarClock, title: "Event Timeline", text: "Haldi to reception, beautifully sequenced." },
  { icon: Music4, title: "Music", text: "A score that fades in on entry." },
  { icon: MapPin, title: "Maps & Venue", text: "One tap to reach the celebration." },
  { icon: HeartHandshake, title: "RSVP", text: "Guests confirm in seconds." },
  { icon: WhatsAppIcon, title: "WhatsApp Sharing", text: "One link. Infinite forwards." },
];

export default function FeatureShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-52%"]);

  return (
    <section ref={ref} className="bg-charcoal text-ivory py-20 md:py-28 overflow-hidden grain relative">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow text-champagne">EVERYTHING INSIDE</p>
        <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl max-w-2xl">One link. <span className="italic text-champagne-light">The whole celebration.</span></h2>
      </div>
      <motion.div style={{ x }} className="mt-12 flex gap-5 w-max px-5 md:px-8">
        {FEATURES.map((f) => (
          <div key={f.title} className="w-[260px] md:w-[300px] shrink-0 rounded-[1.5rem] border border-white/12 bg-white/[0.04] backdrop-blur p-7">
            <f.icon className="h-6 w-6 text-champagne" />
            <h3 className="mt-5 font-serif text-2xl">{f.title}</h3>
            <p className="mt-2 text-sm text-ivory/60 leading-relaxed">{f.text}</p>
          </div>
        ))}
      </motion.div>
      <p className="mt-8 px-5 md:px-8 text-[12px] tracking-[0.2em] text-ivory/40 font-semibold max-w-7xl mx-auto">SCROLL → TO EXPLORE</p>
    </section>
  );
}
