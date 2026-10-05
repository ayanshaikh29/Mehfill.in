"use client";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "./Reveal";

const OCCASIONS = [
  { name: "Weddings", sub: "Nikah, Anand Karaj, church & Hindu weddings", img: "/images/occasions/weddings.jpg", href: "/digital-wedding-invitations", alt: "Indian couple — digital wedding invitations by Mehfill" },
  { name: "Birthdays", sub: "First birthdays to fiftieths", img: "/images/occasions/birthdays.jpg", href: "/birthday-invitations", alt: "Birthday celebration — digital birthday invitation" },
  { name: "Engagements", sub: "Ring ceremonies & proposals", img: "/images/occasions/engagements.jpg", href: "/engagement-invitations", alt: "Couple rings — digital engagement invitation" },
  { name: "Haldi & Mehndi", sub: "Joyful pre-wedding festivities", img: "/images/occasions/haldi_mehndi.jpg", href: "/digital-wedding-invitations", alt: "Haldi and Mehndi ceremony — pre-wedding digital invitation" },
  { name: "Anniversaries", sub: "Silver, golden & every year", img: "/images/occasions/anniversaries.jpg", href: "/anniversary-invitations", alt: "Celebrating couple — digital anniversary invitation" },
  { name: "Baby Showers", sub: "Godh Bharai & welcoming ceremonies", img: "/images/occasions/baby_showers.jpg", href: "/digital-invitations", alt: "Baby shower decorations — digital invitation" },
  { name: "Parties", sub: "Festive nights & gatherings", img: "/images/occasions/parties.jpg", href: "/birthday-invitations", alt: "Festive party lights — digital party invitation" },
  { name: "Faith & Prayer", sub: "Puja, Dawat, Baptism, Akhand Path & more", img: "/images/occasions/faith_prayer.jpg", href: "/nikah-invitations", alt: "Prayer ceremony — faith digital invitation" },
  { name: "Corporate Events", sub: "Launches & celebrations at work", img: "/images/occasions/corporate.jpg", href: "/digital-invitations", alt: "Corporate event — digital event invitation" },
];

export default function Occasions() {
  return (
    <section id="occasions" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-terracotta">OCCASIONS</p>
          <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl">For every moment <span className="italic">worth celebrating.</span></h2>
          <p className="mt-4 text-charcoal/60 leading-relaxed">For every religion, every culture, every family — Hindu, Muslim, Sikh, Christian and beyond. If it matters to you, it deserves a Mehfill.</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {OCCASIONS.map((o, i) => (
            <Reveal key={o.name} delay={(i % 3) * 0.07}>
              <Link href={o.href} className="group relative block overflow-hidden rounded-[1.4rem] aspect-[4/5] sm:aspect-[4/4.4]">
                <Image src={o.img} alt={o.alt} fill sizes="(max-width: 768px) 50vw, 33vw" quality={68} className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-serif text-xl md:text-2xl text-ivory">{o.name}</p>
                  <p className="mt-1 text-[12px] md:text-[13px] text-ivory/70">{o.sub}</p>
                </div>
                <span className="absolute top-4 right-4 h-9 w-9 rounded-full bg-ivory/20 backdrop-blur border border-white/30 text-ivory flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
