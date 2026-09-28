"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CalendarDays, ArrowLeft, Heart } from "lucide-react";
import { WhatsAppIcon } from "../BrandIcons";
import MehfillAura from "../effects/MehfillAura";
import type { Template } from "@/lib/templates";
import { waLink, WA_MSG_GENERAL, WA_MSG_DEMO } from "@/lib/contact";

export default function EternalDemo({ t }: { t: Template }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [entered]);

  return (
    <main className="min-h-screen bg-[#141210] text-[#FDF9F3]">
      <AnimatePresence>
        {!entered && (
          <motion.div
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 cursor-pointer"
            onClick={() => setEntered(true)}
          >
            <img
              src="https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=1400&auto=format&fit=crop"
              alt="Antique doors with flowers"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55" />
            <MehfillAura variant="veil" />
            {/* two door panels */}
            <motion.div
              exit={{ x: "-100%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 w-1/2 border-r border-white/20 bg-gradient-to-br from-[#2a2118] to-[#141210]/90 backdrop-blur-[2px]"
            />
            <motion.div
              exit={{ x: "100%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 right-0 w-1/2 border-l border-white/20 bg-gradient-to-bl from-[#2a2118] to-[#141210]/90 backdrop-blur-[2px]"
            />
            <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
              <p className="text-[11px] tracking-[0.45em] text-[#E8D5A8]">YOU&apos;RE INVITED</p>
              <h1 className="mt-4 font-serif font-light text-5xl md:text-7xl">Ayan <span className="italic">&</span> Amara</h1>
              <p className="mt-3 text-sm tracking-[0.25em] text-white/70">14 . 02 . 2027 — UDAIPUR</p>
              <div className="mt-8 animate-pulse rounded-full border border-white/40 px-8 py-3 text-[12px] tracking-[0.3em] backdrop-blur">TAP TO ENTER</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {entered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
          <DemoNav />
          {/* reveal venue */}
          <section className="relative h-[92vh] overflow-hidden">
            <motion.img
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
              src="https://images.unsplash.com/photo-1595407753234-0882f1e77954?q=80&w=1600&auto=format&fit=crop"
              alt="Venue"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-black/20 to-black/40" />
            <div className="relative h-full flex flex-col justify-end p-6 md:p-14">
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-[11px] tracking-[0.4em] text-[#E8D5A8]">TOGETHER WITH THEIR FAMILIES</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-3 font-serif font-light text-5xl md:text-8xl leading-none">Ayan <span className="italic text-[#E8D5A8]">&</span> Amara</motion.h2>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-5 flex flex-wrap gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-4 py-2"><CalendarDays className="h-4 w-4" /> 14 Feb 2027</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-4 py-2"><MapPin className="h-4 w-4" /> The Leela Palace, Udaipur</span>
              </motion.div>
            </div>
          </section>

          <EventsSection events={t.data.events} dark />
          <GallerySection images={t.gallery} />
          <RSVPSection names={t.data.names} />
          <DemoFooter templateName={t.name} />
        </motion.div>
      )}
    </main>
  );
}

export function DemoNav() {
  return (
    <div className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-gradient-to-b from-black/60 to-transparent text-white">
      <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-4 py-2 text-[12px] font-semibold hover:bg-white/20">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Mehfill
      </Link>
      <span className="font-serif italic text-sm opacity-80 hidden sm:block">mehfill.in</span>
      <a href={waLink(WA_MSG_GENERAL)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-4 py-2 text-[12px] font-bold hover:bg-[#E8D5A8]"><WhatsAppIcon className="h-3.5 w-3.5" /> Get One Like This</a>
    </div>
  );
}

export function EventsSection({ events, dark = false }: { events: Template["data"]["events"]; dark?: boolean }) {
  return (
    <section className={`px-5 md:px-14 py-16 md:py-24 ${dark ? "bg-[#141210]" : "bg-ivory"}`}>
      <p className={`text-[11px] tracking-[0.35em] font-bold ${dark ? "text-[#E8D5A8]" : "text-terracotta"}`}>CELEBRATIONS</p>
      <h3 className={`mt-3 font-serif font-light text-4xl md:text-6xl ${dark ? "text-white" : ""}`}>When <span className="italic">&</span> Where</h3>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {events.map((e) => (
          <div key={e.name} className={`rounded-3xl p-6 border ${dark ? "border-white/10 bg-white/[0.04]" : "bg-white hairline"}`}>
            <p className={`font-serif text-2xl ${dark ? "text-[#E8D5A8]" : ""}`}>{e.name}</p>
            <p className={`mt-2 text-sm ${dark ? "text-white/60" : "text-charcoal/60"}`}>{e.date} • {e.time}</p>
            <p className={`mt-1 text-sm font-medium ${dark ? "text-white/85" : ""}`}>{e.venue}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GallerySection({ images }: { images: string[] }) {
  return (
    <section className="bg-[#1C1917] px-5 md:px-14 py-16">
      <h3 className="font-serif font-light text-4xl md:text-5xl text-white">Glimpses</h3>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <motion.img
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            src={src}
            alt={`Gallery ${i + 1}`}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover rounded-2xl"
          />
        ))}
      </div>
    </section>
  );
}

export function RSVPSection({ names }: { names: string }) {
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  return (
    <section className="px-5 md:px-14 py-16 md:py-24 bg-ivory text-charcoal text-center">
      <Heart className="mx-auto h-6 w-6 text-terracotta" />
      <h3 className="mt-4 font-serif font-light text-4xl md:text-6xl">Will you join us?</h3>
      <p className="mt-3 text-charcoal/60">Celebrating {names}</p>
      {done ? (
        <p className="mx-auto mt-8 max-w-md rounded-2xl bg-charcoal text-ivory px-6 py-5 font-serif text-xl italic">Thank you, {name || "friend"}. We can&apos;t wait to celebrate with you.</p>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); setDone(true); }}
          className="mx-auto mt-8 flex max-w-md flex-col sm:flex-row gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="flex-1 rounded-full border hairline bg-white px-5 py-3.5 text-sm outline-none focus:border-terracotta"
          />
          <button className="rounded-full bg-charcoal px-7 py-3.5 text-sm font-bold text-ivory hover:bg-terracotta-deep">RSVP</button>
        </form>
      )}
    </section>
  );
}

export function DemoFooter({ templateName }: { templateName: string }) {
  return (
    <div className="bg-charcoal text-ivory px-5 py-10 text-center">
      <p className="font-serif italic text-xl">Loved this {templateName} experience?</p>
      <p className="mt-2 text-sm text-ivory/60">We will craft one like it — custom-made with your names, photos & details.</p>
      <a href={waLink(WA_MSG_DEMO(templateName))} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ivory text-charcoal px-7 py-3 text-sm font-bold hover:bg-champagne-light"><WhatsAppIcon className="h-4 w-4" /> Get One Like This</a>
      <p className="mt-5 text-[11px] tracking-[0.25em] text-ivory/40">CRAFTED WITH MEHFILL.IN</p>
    </div>
  );
}
