"use client";
import { Reveal } from "./Reveal";
import { PlayCircle, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "./BrandIcons";

const STEPS = [
  {
    n: "01",
    icon: PlayCircle,
    title: "Explore the demos",
    text: "Open a live demo above and feel the experience. Tell us which style you loved.",
  },
  {
    n: "02",
    icon: WhatsAppIcon,
    title: "Share details on WhatsApp",
    text: "Send your names, date, venue, photos and events — just forward everything to us on WhatsApp.",
  },
  {
    n: "03",
    icon: Sparkles,
    title: "We craft & deliver",
    text: "We design your custom invitation and deliver it. One beautiful link — share it anywhere.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-cream/70 border-y hairline py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="text-center max-w-xl mx-auto">
          <p className="eyebrow text-terracotta">HOW IT WORKS</p>
          <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl">You share. <span className="italic">We create.</span></h2>
          <p className="mt-4 text-charcoal/60">No forms, no dashboard, no DIY. Just WhatsApp.</p>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative rounded-[1.6rem] bg-ivory border hairline p-8 overflow-hidden group hover:shadow-xl transition-shadow">
                <span className="font-serif italic text-[5rem] leading-none text-sand group-hover:text-champagne-light transition-colors">{s.n}</span>
                <s.icon className="mt-2 h-6 w-6 text-terracotta" />
                <h3 className="mt-4 font-serif text-2xl">{s.title}</h3>
                <p className="mt-2 text-[14px] text-charcoal/60 leading-relaxed">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
