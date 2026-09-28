"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { WhatsAppIcon } from "../BrandIcons";
import type { Template } from "@/lib/templates";
import { EventsSection, GallerySection, RSVPSection, DemoFooter } from "./EternalDemo";
import { waLink, WA_MSG_DEMO } from "@/lib/contact";

function useCountdown(target: string) {
  const [t, setT] = useState({ d: "00", h: "00", m: "00", s: "00" });
  useEffect(() => {
    const end = new Date("2026-07-18T19:00:00").getTime();
    const id = setInterval(() => {
      const diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setT({
        d: String(d).padStart(2, "0"),
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    }, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

export default function MidnightDemo({ t }: { t: Template }) {
  const c = useCountdown(t.data.date);
  return (
    <main className="min-h-screen bg-[#0e0e0d] text-[#F5F0E6]">
      <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 md:px-8 py-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-4 py-2 text-[12px] font-semibold"><ArrowLeft className="h-3.5 w-3.5" /> Back to Mehfill</Link>
        <a href={waLink(WA_MSG_DEMO(t.name))} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#E8D5A8] text-black px-4 py-2 text-[12px] font-bold"><WhatsAppIcon className="h-3.5 w-3.5" /> Get One Like This</a>
      </div>

      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <motion.img initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2 }} src={t.image} alt="Midnight birthday" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0d] via-[#0e0e0d]/30 to-black/50" />
        <div className="relative p-6 md:p-14">
          <p className="text-[11px] tracking-[0.45em] text-[#E8D5A8] font-bold">25TH BIRTHDAY • MUMBAI</p>
          <h1 className="mt-4 font-serif font-light leading-[0.9] text-[18vw] sm:text-8xl md:text-[9rem]">Aria <span className="italic text-[#E8D5A8]">at</span> Midnight</h1>
          <p className="mt-4 max-w-md text-white/65">Cocktails, vinyl and city lights. Dress dark. Arrive luminous.</p>
          <div className="mt-8 flex gap-3">
            {[["DAYS", c.d], ["HRS", c.h], ["MIN", c.m], ["SEC", c.s]].map(([l, v]) => (
              <div key={l} className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur px-4 py-3 text-center min-w-[72px]">
                <p className="font-serif text-3xl">{v}</p>
                <p className="text-[10px] tracking-[0.25em] text-white/50">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2"><MapPin className="h-4 w-4" /> Soho House, Juhu — 7 PM</span>
          </div>
        </div>
      </section>

      <EventsSection events={t.data.events} dark />
      <GallerySection images={t.gallery} />
      <RSVPSection names={t.data.names} />
      <DemoFooter templateName={t.name} />
    </main>
  );
}
