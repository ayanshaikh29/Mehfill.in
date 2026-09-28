"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, CalendarDays } from "lucide-react";
import { WhatsAppIcon } from "../BrandIcons";
import type { Template } from "@/lib/templates";
import { EventsSection, GallerySection, RSVPSection, DemoFooter } from "@/components/demos/EternalDemo";
import { waLink, WA_MSG_DEMO } from "@/lib/contact";

export default function GenericDemo({ t }: { t: Template }) {
  const dark = t.slug === "eternal";
  return (
    <main className={`min-h-screen ${dark ? "bg-[#141210] text-[#FDF9F3]" : "bg-ivory text-charcoal"}`}>
      <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 md:px-8 py-3">
        <Link href="/" className={`inline-flex items-center gap-2 rounded-full backdrop-blur px-4 py-2 text-[12px] font-semibold border ${dark ? "bg-white/10 border-white/20 text-white" : "bg-white/80 hairline"}`}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Mehfill
        </Link>
        <a href={waLink(WA_MSG_DEMO(t.name))} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold ${dark ? "bg-white text-black" : "bg-charcoal text-ivory"}`}><WhatsAppIcon className="h-3.5 w-3.5" /> Get One Like This</a>
      </div>

      <section className="relative min-h-[88vh] flex flex-col justify-end overflow-hidden">
        <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.8 }} src={t.image} alt={t.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className={`absolute inset-0 ${dark ? "bg-gradient-to-t from-black via-black/30 to-black/40" : "bg-gradient-to-t from-black/75 via-black/20 to-black/25"}`} />
        <div className="relative p-6 md:p-14 text-white">
          <p className="text-[11px] tracking-[0.4em] text-champagne-light font-bold">{t.occasion.toUpperCase()} • {t.name.toUpperCase()}</p>
          <h1 className="mt-3 font-serif font-light text-5xl md:text-8xl leading-none">{t.data.names}</h1>
          <p className="mt-3 text-white/75 tracking-[0.2em] text-sm">{t.data.date}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-4 py-2"><CalendarDays className="h-4 w-4" /> {t.data.date}</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-4 py-2"><MapPin className="h-4 w-4" /> {t.data.venue}</span>
          </div>
        </div>
      </section>

      <EventsSection events={t.data.events} dark={dark} />
      <GallerySection images={t.gallery} />
      <RSVPSection names={t.data.names} />
      <DemoFooter templateName={t.name} />
    </main>
  );
}
