"use client";
import { Reveal } from "./Reveal";

const ITEMS = [
  { title: "Beautiful by Design", text: "Every invitation is thoughtfully designed to feel special — never a template dump." },
  { title: "Made for Your Story", text: "Personalise names, photos, events, music and details. Your story, your way." },
  { title: "Made to Be Shared", text: "One beautiful link. Share it instantly on WhatsApp or anywhere." },
  { title: "A Complete Experience", text: "From the first reveal to RSVP, everything lives in one place." },
];

export default function WhyMehfill() {
  return (
    <section className="py-20 md:py-28 bg-ivory">
      <div className="mx-auto max-w-7xl px-5 md:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-12">
        <div className="lg:sticky lg:top-28 self-start">
          <Reveal>
            <p className="eyebrow text-terracotta">WHY MEHFILL</p>
            <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl leading-[1.03]">Because some moments deserve <span className="italic">more than a message.</span></h2>
            <p className="mt-5 text-charcoal/60 leading-relaxed max-w-md">An invitation should not just tell people where to come. It should make them feel the celebration before they arrive.</p>
          </Reveal>
        </div>
        <div className="divide-y divide-charcoal/10 border-y hairline">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.05}>
              <div className="py-8 grid sm:grid-cols-[auto_1fr] gap-3 sm:gap-8 items-baseline">
                <span className="font-serif italic text-terracotta text-lg">0{i + 1}</span>
                <div>
                  <h3 className="font-serif text-2xl md:text-3xl">{it.title}</h3>
                  <p className="mt-2 text-charcoal/60 leading-relaxed max-w-lg">{it.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
