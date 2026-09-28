"use client";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./BrandIcons";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";

const FAITHS = [
  {
    name: "Muslim",
    ceremonies: "Nikah · Walima · Dawat · Aqeeqah",
    text: "Duas, Urdu or English wording, and every rasam — set with respect.",
  },
  {
    name: "Hindu",
    ceremonies: "Pheras · Puja · Griha Pravesh · Mundan",
    text: "Shlokas, muhurat, gotra and family names — composed with care.",
  },
  {
    name: "Sikh",
    ceremonies: "Anand Karaj · Akhand Path · Naam Karan",
    text: "Ik Onkar blessings and Gurmukhi warmth woven into your story.",
  },
  {
    name: "Christian",
    ceremonies: "Church Wedding · Baptism · First Communion",
    text: "Verses, vows and joyful celebration — elegant and heartfelt.",
  },
];

export default function ForEveryFaith() {
  return (
    <section className="relative overflow-hidden border-y hairline bg-charcoal text-ivory grain">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-champagne">FOR EVERY FAITH</p>
          <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl leading-[1.02]">
            Every faith. Every tradition. <span className="italic text-champagne-light">One Mehfill.</span>
          </h2>
          <p className="mt-4 text-ivory/60 leading-relaxed">
            Hindu, Muslim, Sikh, Christian — and every interfaith family in between.
            Tell us your customs, language and blessings; we will craft them into your invitation.
          </p>
        </Reveal>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {FAITHS.map((f, i) => (
            <Reveal key={f.name} delay={(i % 4) * 0.07}>
              <div className="h-full rounded-[1.4rem] border border-white/12 bg-white/[0.04] p-7 backdrop-blur transition-colors hover:border-champagne/40">
                <p className="font-serif text-2xl md:text-[1.7rem] text-champagne-light">{f.name}</p>
                <p className="mt-2 text-[12.5px] font-bold tracking-[0.08em] text-ivory/85">{f.ceremonies}</p>
                <p className="mt-3 text-sm leading-relaxed text-ivory/55">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-5 rounded-[1.4rem] border border-champagne/25 bg-champagne/10 px-7 py-6">
          <p className="text-center sm:text-left font-serif text-xl md:text-2xl italic">
            Interfaith celebration? We will honour <span className="text-champagne-light">both sides</span>, beautifully.
          </p>
          <a
            href={waLink(WA_MSG_GENERAL)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ivory px-6 py-3 text-sm font-bold text-charcoal hover:bg-champagne-light transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4" /> Tell us your tradition
          </a>
        </Reveal>
      </div>
    </section>
  );
}
