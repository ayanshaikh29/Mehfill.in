"use client";
// Reusable invitation rendering engine. One component, many templates:
// the catalog supplies palette + variant; customer content drives every
// section. Premium theme overrides merge on top of the base palette.

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Heart,
  Copy,
  Check,
  Share2,
  ChevronDown,
} from "lucide-react";
import type { CatalogTemplate } from "@/lib/catalog";
import {
  formatDateLong,
  formatTime12,
  type InvitationContent,
  type InvitationEvent,
} from "@/lib/invitation";
import { WhatsAppIcon } from "@/components/BrandIcons";

interface Props {
  template: CatalogTemplate;
  content: InvitationContent;
  themeOverrides?: Record<string, string>;
  slug: string;
}

export default function InvitationRenderer({ template, content, themeOverrides, slug }: Props) {
  const palette = useMemo(() => {
    const base = { ...template.palette, ...(themeOverrides || {}) };
    return {
      bg: base.bg,
      ink: base.ink,
      accent: base.accent,
      muted: base.muted,
    };
  }, [template.palette, themeOverrides]);

  const [entered, setEntered] = useState(false);
  const isDark = isDarkColor(palette.bg);

  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  const names = `${content.brideName || "Bride"} & ${content.groomName || "Groom"}`;

  return (
    <main
      className="min-h-screen"
      style={{ background: palette.bg, color: palette.ink }}
    >
      <AnimatePresence>
        {!entered && (
          <CoverScreen
            template={template}
            content={content}
            palette={palette}
            onEnter={() => setEntered(true)}
          />
        )}
      </AnimatePresence>

      {entered && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <HeroSection content={content} palette={palette} isDark={isDark} template={template} />
          <CountdownSection date={content.weddingDate} palette={palette} isDark={isDark} />
          {content.events.filter((e) => e.name).length > 0 && (
            <EventsSection events={content.events.filter((e) => e.name)} palette={palette} isDark={isDark} />
          )}
          <VenueSection content={content} palette={palette} isDark={isDark} />
          {content.gallery.length > 0 && (
            <GallerySection images={content.gallery} palette={palette} isDark={isDark} />
          )}
          {content.rsvp?.enabled !== false && (
            <RsvpSection slug={slug} content={content} palette={palette} isDark={isDark} />
          )}
          <InvitationFooter names={names} palette={palette} isDark={isDark} />
        </motion.div>
      )}
    </main>
  );
}

/* ───────────────────────── Cover ───────────────────────── */

function CoverScreen({
  template,
  content,
  palette,
  onEnter,
}: {
  template: CatalogTemplate;
  content: InvitationContent;
  palette: { bg: string; ink: string; accent: string; muted: string };
  onEnter: () => void;
}) {
  const variant = template.variant;
  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      onClick={onEnter}
      className="fixed inset-0 z-50 cursor-pointer overflow-hidden"
    >
      {variant === "royal" ? (
        <>
          <div className="absolute inset-0" style={{ background: palette.bg }} />
          <motion.div
            exit={{ x: "-100%" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 left-0 w-1/2 border-r"
            style={{
              background: `linear-gradient(135deg, ${palette.accent}33, ${palette.bg})`,
              borderColor: `${palette.accent}44`,
            }}
          />
          <motion.div
            exit={{ x: "100%" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 w-1/2 border-l"
            style={{
              background: `linear-gradient(225deg, ${palette.accent}33, ${palette.bg})`,
              borderColor: `${palette.accent}44`,
            }}
          />
        </>
      ) : (
        <>
          {template.coverImage && (
            <Image
              src={template.coverImage}
              alt="Invitation cover"
              fill
              priority
              sizes="100vw"
              quality={70}
              className="object-cover"
            />
          )}
          <div className="absolute inset-0" style={{ background: `${palette.bg}CC` }} />
          <motion.div
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 border-4"
            style={{ borderColor: `${palette.accent}66` }}
          />
        </>
      )}

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-[11px] tracking-[0.45em]" style={{ color: palette.accent }}>
          YOU&apos;RE INVITED
        </p>
        <h1 className="mt-5 font-serif font-light text-5xl md:text-7xl">
          {content.brideName || "Bride"}{" "}
          <span className="italic" style={{ color: palette.accent }}>
            &
          </span>{" "}
          {content.groomName || "Groom"}
        </h1>
        {content.familyNames && (
          <p className="mt-3 text-sm tracking-[0.2em] opacity-70">{content.familyNames}</p>
        )}
        {content.weddingDate && (
          <p className="mt-3 text-sm tracking-[0.25em] opacity-70">
            {formatDateLong(content.weddingDate).toUpperCase()}
          </p>
        )}
        <div
          className="mt-9 animate-pulse rounded-full border px-8 py-3 text-[12px] tracking-[0.3em] backdrop-blur"
          style={{ borderColor: `${palette.ink}55` }}
        >
          TAP TO OPEN
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function HeroSection({
  content,
  palette,
  isDark,
  template,
}: {
  content: InvitationContent;
  palette: { bg: string; ink: string; accent: string; muted: string };
  isDark: boolean;
  template: CatalogTemplate;
}) {
  return (
    <section className="relative min-h-[92vh] overflow-hidden">
      {template.coverImage && (
        <Image
          src={template.coverImage}
          alt="Celebration"
          fill
          sizes="100vw"
          quality={70}
          className="object-cover"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${palette.bg} 5%, ${palette.bg}66 50%, ${palette.bg}99)`,
        }}
      />
      <div className="relative flex min-h-[92vh] flex-col justify-end p-6 md:p-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <p className="text-[11px] tracking-[0.4em]" style={{ color: palette.accent }}>
            TOGETHER WITH THEIR FAMILIES
          </p>
          <h2 className="mt-3 font-serif font-light text-5xl md:text-8xl leading-none">
            {content.brideName}{" "}
            <span className="italic" style={{ color: palette.accent }}>
              &
            </span>{" "}
            {content.groomName}
          </h2>
          {content.familyNames && (
            <p className="mt-3 text-sm opacity-70">{content.familyNames}</p>
          )}
          {content.message && (
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed opacity-80">{content.message}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            {content.weddingDate && (
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur"
                style={{ background: `${isDark ? "#ffffff" : "#000000"}10`, borderColor: `${palette.ink}22` }}
              >
                <CalendarDays className="h-4 w-4" /> {formatDateLong(content.weddingDate)}
              </span>
            )}
            {content.startTime && (
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur"
                style={{ background: `${isDark ? "#ffffff" : "#000000"}10`, borderColor: `${palette.ink}22` }}
              >
                <Clock className="h-4 w-4" /> {formatTime12(content.startTime)}
              </span>
            )}
            {content.venueName && (
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur"
                style={{ background: `${isDark ? "#ffffff" : "#000000"}10`, borderColor: `${palette.ink}22` }}
              >
                <MapPin className="h-4 w-4" /> {content.venueName}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────── Countdown ───────────────────────── */

function CountdownSection({
  date,
  palette,
  isDark,
}: {
  date: string;
  palette: { bg: string; ink: string; accent: string; muted: string };
  isDark: boolean;
}) {
  const [left, setLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!date) return;
    const target = new Date(date + "T12:00:00").getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);

  if (!date) return null;

  const cell = (v: number, label: string) => (
    <div
      className="min-w-[70px] rounded-2xl border px-3 py-4 text-center"
      style={{ borderColor: `${palette.ink}18`, background: `${isDark ? "#ffffff" : "#000000"}06` }}
    >
      <p className="font-serif text-3xl md:text-4xl" style={{ color: palette.accent }}>
        {String(v).padStart(2, "0")}
      </p>
      <p className="mt-1 text-[10px] tracking-[0.25em] opacity-55">{label}</p>
    </div>
  );

  return (
    <section className="px-5 md:px-14 py-14 text-center" style={{ background: palette.bg }}>
      <p className="text-[11px] tracking-[0.35em] font-bold" style={{ color: palette.accent }}>
        COUNTING DOWN
      </p>
      <h3 className="mt-3 font-serif font-light text-3xl md:text-5xl">Until we celebrate</h3>
      {left ? (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {cell(left.d, "DAYS")}
          {cell(left.h, "HOURS")}
          {cell(left.m, "MINS")}
          {cell(left.s, "SECS")}
        </div>
      ) : (
        <div className="mt-8 flex flex-wrap justify-center gap-3 opacity-40">
          {cell(0, "DAYS")}
          {cell(0, "HOURS")}
          {cell(0, "MINS")}
          {cell(0, "SECS")}
        </div>
      )}
    </section>
  );
}

/* ───────────────────────── Events ───────────────────────── */

function EventsSection({
  events,
  palette,
  isDark,
}: {
  events: InvitationEvent[];
  palette: { bg: string; ink: string; accent: string; muted: string };
  isDark: boolean;
}) {
  return (
    <section className="px-5 md:px-14 py-16" style={{ background: isDark ? palette.bg : palette.bg }}>
      <p className="text-[11px] tracking-[0.35em] font-bold" style={{ color: palette.accent }}>
        CELEBRATIONS
      </p>
      <h3 className="mt-3 font-serif font-light text-4xl md:text-5xl">
        When <span className="italic">&</span> Where
      </h3>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((e) => (
          <div
            key={e.id}
            className="rounded-3xl p-6 border"
            style={{ borderColor: `${palette.ink}14`, background: `${isDark ? "#ffffff" : "#000000"}06` }}
          >
            <p className="font-serif text-2xl" style={{ color: palette.accent }}>
              {e.name}
            </p>
            <p className="mt-2 text-sm opacity-70">
              {[e.date && formatDateLong(e.date), e.time && formatTime12(e.time)]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {e.venue && <p className="mt-1 text-sm font-medium opacity-90">{e.venue}</p>}
            {e.description && <p className="mt-2 text-[13px] opacity-60">{e.description}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Venue ───────────────────────── */

function VenueSection({
  content,
  palette,
  isDark,
}: {
  content: InvitationContent;
  palette: { bg: string; ink: string; accent: string; muted: string };
  isDark: boolean;
}) {
  if (!content.venueName) return null;
  return (
    <section
      className="px-5 md:px-14 py-16"
      style={{ background: isDark ? `${palette.muted}22` : `${palette.muted}55` }}
    >
      <p className="text-[11px] tracking-[0.35em] font-bold" style={{ color: palette.accent }}>
        VENUE
      </p>
      <h3 className="mt-3 font-serif font-light text-4xl md:text-5xl">{content.venueName}</h3>
      {content.venueAddress && (
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed opacity-75">{content.venueAddress}</p>
      )}
      {content.mapsUrl && (
        <a
          href={content.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold"
          style={{ background: palette.accent, color: palette.bg }}
        >
          <MapPin className="h-4 w-4" /> Open in Google Maps
        </a>
      )}
    </section>
  );
}

/* ───────────────────────── Gallery ───────────────────────── */

function GallerySection({
  images,
  palette,
  isDark,
}: {
  images: string[];
  palette: { bg: string; ink: string; accent: string; muted: string };
  isDark: boolean;
}) {
  return (
    <section className="px-5 md:px-14 py-16" style={{ background: palette.bg }}>
      <p className="text-[11px] tracking-[0.35em] font-bold" style={{ color: palette.accent }}>
        MOMENTS
      </p>
      <h3 className="mt-3 font-serif font-light text-4xl md:text-5xl">Glimpses of our story</h3>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
        {images.map((src, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 6) * 0.07 }}
            className="relative block aspect-[4/5] overflow-hidden rounded-2xl"
            style={{ background: `${isDark ? "#ffffff" : "#000000"}08` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Gallery photo ${i + 1}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </motion.span>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── RSVP ───────────────────────── */

function RsvpSection({
  slug,
  content,
  palette,
  isDark,
}: {
  slug: string;
  content: InvitationContent;
  palette: { bg: string; ink: string; accent: string; muted: string };
  isDark: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState("yes");
  const [count, setCount] = useState("1");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    setErrMsg("");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          guestName: name,
          guestPhone: phone,
          attending,
          guestCount: Number(count) || 1,
          message: note,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Could not save your RSVP.");
      }
      setState("done");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  const inputStyle = {
    background: `${isDark ? "#ffffff" : "#000000"}08`,
    borderColor: `${palette.ink}22`,
    color: palette.ink,
  };

  return (
    <section className="px-5 md:px-14 py-16 md:py-24 text-center" style={{ background: palette.bg }}>
      <Heart className="mx-auto h-6 w-6" style={{ color: palette.accent }} />
      <h3 className="mt-4 font-serif font-light text-4xl md:text-5xl">Will you join us?</h3>
      <p className="mt-3 opacity-65">
        Celebrating {content.brideName} &amp; {content.groomName}
      </p>
      {content.rsvp?.message && (
        <p className="mx-auto mt-2 max-w-md text-sm opacity-55">{content.rsvp.message}</p>
      )}

      {state === "done" ? (
        <p
          className="mx-auto mt-8 max-w-md rounded-2xl px-6 py-5 font-serif text-xl italic"
          style={{ background: palette.accent, color: palette.bg }}
        >
          Thank you, {name || "friend"}. We can&apos;t wait to celebrate with you.
        </p>
      ) : (
        <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name *"
            required
            aria-label="Your name"
            className="rounded-full border px-5 py-3.5 text-sm outline-none"
            style={inputStyle}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
            placeholder="WhatsApp number (optional)"
            aria-label="WhatsApp number"
            inputMode="numeric"
            className="rounded-full border px-5 py-3.5 text-sm outline-none"
            style={inputStyle}
          />
          <div className="flex gap-2">
            {["yes", "maybe", "no"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setAttending(opt)}
                className="flex-1 rounded-full border px-4 py-2.5 text-[13px] font-semibold capitalize"
                style={
                  attending === opt
                    ? { background: palette.accent, color: palette.bg, borderColor: palette.accent }
                    : { borderColor: `${palette.ink}22` }
                }
              >
                {opt === "yes" ? "Joyfully yes" : opt === "maybe" ? "Maybe" : "Regretfully no"}
              </button>
            ))}
          </div>
          {attending !== "no" && (
            <div className="relative">
              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                aria-label="Guest count"
                className="w-full appearance-none rounded-full border px-5 py-3.5 text-sm outline-none"
                style={inputStyle}
              >
                {(content.rsvp?.guestOptions || ["1", "2", "3", "4", "5+"]).map((g) => (
                  <option key={g} value={g.replace("+", "") || "1"}>
                    {g} {Number(g.replace("+", "")) > 1 ? "guests" : "guest"}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
            </div>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A message for the couple (optional)"
            rows={2}
            aria-label="Message"
            className="rounded-2xl border px-5 py-3.5 text-sm outline-none resize-none"
            style={inputStyle}
          />
          {errMsg && <p className="text-sm text-center opacity-80">{errMsg}</p>}
          <button
            disabled={state === "busy"}
            className="rounded-full px-7 py-3.5 text-sm font-bold disabled:opacity-60"
            style={{ background: palette.accent, color: palette.bg }}
          >
            {state === "busy" ? "Sending…" : "Send RSVP"}
          </button>
        </form>
      )}
      {content.rsvp?.contactPhone && (
        <p className="mt-4 text-[13px] opacity-55">
          Questions? Call {content.rsvp.contactName || "the family"} at {content.rsvp.contactPhone}
        </p>
      )}
    </section>
  );
}

/* ───────────────────────── Footer + share ───────────────────────── */

function InvitationFooter({
  names,
  palette,
  isDark,
}: {
  names: string;
  palette: { bg: string; ink: string; accent: string; muted: string };
  isDark: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const waText = encodeURIComponent(
    `You're invited! 🎉\n\n${names}\n\nOpen the invitation:\n${typeof window !== "undefined" ? window.location.href : ""}`
  );

  return (
    <footer
      className="px-5 py-14 text-center border-t"
      style={{ background: isDark ? `${palette.muted}33` : `${palette.muted}66`, borderColor: `${palette.ink}12` }}
    >
      <p className="font-serif italic text-2xl">{names}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
          style={{ background: "#25D366", color: "#0b3d24" }}
        >
          <WhatsAppIcon className="h-4 w-4" /> Share on WhatsApp
        </a>
        <button
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold"
          style={{ borderColor: `${palette.ink}33` }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Link"}
        </button>
      </div>
      <p className="mt-8 text-[11px] tracking-[0.3em] opacity-40 flex items-center justify-center gap-2">
        <Share2 className="h-3 w-3" /> CRAFTED WITH MEHFILL.IN
      </p>
    </footer>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

function isDarkColor(hex: string): boolean {
  const h = hex.replace("#", "");
  if (h.length < 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
