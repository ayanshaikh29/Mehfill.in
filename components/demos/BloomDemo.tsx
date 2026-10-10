"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, CalendarDays } from "lucide-react";
import { WhatsAppIcon } from "../BrandIcons";
import type { Template } from "@/lib/templates";
import { EventsSection, RSVPSection, DemoFooter } from "./EternalDemo";
import { waLink, WA_MSG_DEMO } from "@/lib/contact";

export default function BloomDemo({ t }: { t: Template }) {
  return (
    <main className="min-h-screen bg-[#FDF9F3] text-[#1C1917]">
      <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 md:px-8 py-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white/80 border hairline backdrop-blur px-4 py-2 text-[12px] font-semibold"><ArrowLeft className="h-3.5 w-3.5" /> Back to Mehfill.in</Link>
        <a href={waLink(WA_MSG_DEMO(t.name))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-charcoal text-ivory px-4 py-2 text-[12px] font-bold"><WhatsAppIcon className="h-3.5 w-3.5" /> Get One Like This</a>
      </div>

      <section className="pt-24 md:pt-32 pb-10 px-5 md:px-14 max-w-6xl mx-auto text-center">
        <p className="text-[11px] tracking-[0.4em] text-terracotta font-bold">AN ENGAGEMENT IN BLOOM</p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="mt-4 font-serif font-light text-6xl md:text-8xl leading-[0.95]"
        >
          Zoya <span className="italic text-terracotta">&</span> Arham
        </motion.h1>
        <p className="mt-4 text-charcoal/60 tracking-[0.2em] text-sm">09 . 01 . 2027 — THE LODHI, NEW DELHI</p>
      </section>

      <section className="px-5 md:px-14 max-w-6xl mx-auto">
        <motion.div initial={{ clipPath: "inset(8% 6% 8% 6% round 24px)", scale: 0.98 }} whileInView={{ clipPath: "inset(0% 0% 0% 0% round 24px)", scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.1 }} className="relative overflow-hidden rounded-3xl aspect-[16/10] md:aspect-[21/10]">
          <Image src={t.image} alt="Zoya and Arham engagement — Bloom invitation demo" fill priority sizes="(max-width: 1024px) 100vw, 1152px" quality={72} className="object-cover" />
        </motion.div>
        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border hairline bg-white px-4 py-2"><CalendarDays className="h-4 w-4" /> Jan 09, 6 PM</span>
          <span className="inline-flex items-center gap-2 rounded-full border hairline bg-white px-4 py-2"><MapPin className="h-4 w-4" /> The Lodhi, New Delhi</span>
        </div>
      </section>

      <section className="px-5 md:px-14 py-16 max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div className="relative rounded-3xl aspect-[4/5] overflow-hidden">
          <Image src={t.gallery[1]} alt="Couple story — Bloom engagement invitation" fill sizes="(max-width: 768px) 100vw, 50vw" quality={68} className="object-cover" />
        </div>
        <div>
          <p className="text-[11px] tracking-[0.35em] text-terracotta font-bold">OUR STORY</p>
          <h2 className="mt-3 font-serif font-light text-4xl md:text-5xl leading-tight">It began with <span className="italic">chai and a long monsoon walk.</span></h2>
          <p className="mt-4 text-charcoal/60 leading-relaxed">Five years, three cities, one unshakable friendship. Now, with the blessings of our families, we want you beside us as we say yes — officially.</p>
        </div>
      </section>

      <EventsSection events={t.data.events} />

      <section className="px-5 md:px-14 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {t.gallery.map((src, i) => (
            <span key={i} className="relative block rounded-2xl aspect-[4/5] overflow-hidden">
              <Image src={src} alt={`Bloom engagement invitation gallery ${i + 1}`} fill sizes="(max-width: 768px) 50vw, 33vw" quality={65} className="object-cover" />
            </span>
          ))}
        </div>
      </section>

      <RSVPSection names={t.data.names} />
      <DemoFooter templateName={t.name} />
    </main>
  );
}
