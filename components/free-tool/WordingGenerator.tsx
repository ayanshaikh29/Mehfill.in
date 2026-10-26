"use client";
import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { WhatsAppIcon } from "@/components/BrandIcons";
import {
  LANGS,
  OCCASIONS,
  TONES,
  composeWording,
  wordingWordCount,
  type WordingLang,
  type WordingOccasion,
  type WordingTone,
} from "@/lib/free-wording";

const inputCls =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-all placeholder:text-charcoal/35 focus:border-terracotta focus:ring-2 focus:ring-terracotta/15";

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs font-semibold transition-all ${
        active
          ? "border-charcoal bg-charcoal text-ivory shadow-sm"
          : "border-charcoal/15 bg-white/70 text-charcoal/70 hover:border-terracotta hover:text-charcoal"
      }`}
    >
      {children}
    </button>
  );
}

export default function WordingGenerator() {
  const [lang, setLang] = useState<WordingLang>("en");
  const [tone, setTone] = useState<WordingTone>("classic");
  const [occasion, setOccasion] = useState<WordingOccasion>("wedding");
  const [bride, setBride] = useState("");
  const [groom, setGroom] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [rsvp, setRsvp] = useState("");
  const [copied, setCopied] = useState(false);

  const text = useMemo(
    () => composeWording(lang, tone, occasion, { bride, groom, date, time, venue, rsvp }),
    [lang, tone, occasion, bride, groom, date, time, venue, rsvp]
  );
  const words = wordingWordCount(text);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,440px)] lg:items-start">
      {/* Controls */}
      <div className="space-y-7">
        <div>
          <span className="eyebrow text-terracotta">1 · Language</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <Pill key={l.id} active={lang === l.id} onClick={() => setLang(l.id)}>
                {l.native} <span className="opacity-50">· {l.label}</span>
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <span className="eyebrow text-terracotta">2 · Occasion</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <Pill key={o.id} active={occasion === o.id} onClick={() => setOccasion(o.id)}>
                {o.label[lang]}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <span className="eyebrow text-terracotta">3 · Tone</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {TONES.map((t) => (
              <Pill key={t.id} active={tone === t.id} onClick={() => setTone(t.id)}>
                {t.label}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <span className="eyebrow text-terracotta">4 · Your details</span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-charcoal/55">Bride&rsquo;s name</span>
              <input value={bride} onChange={(e) => setBride(e.target.value)} className={inputCls} placeholder="e.g. Aisha" maxLength={40} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-charcoal/55">Groom&rsquo;s name</span>
              <input value={groom} onChange={(e) => setGroom(e.target.value)} className={inputCls} placeholder="e.g. Hamza" maxLength={40} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-charcoal/55">Date</span>
              <input value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} placeholder="e.g. Sunday, 14 February 2027" maxLength={60} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-charcoal/55">Time</span>
              <input value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} placeholder="e.g. 7:00 PM onwards" maxLength={40} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-charcoal/55">Venue</span>
              <input value={venue} onChange={(e) => setVenue(e.target.value)} className={inputCls} placeholder="e.g. The Grand Orchid Palace, Nashik" maxLength={120} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-charcoal/55">RSVP line (optional)</span>
              <input value={rsvp} onChange={(e) => setRsvp(e.target.value)} className={inputCls} placeholder="e.g. Kindly RSVP on WhatsApp by 1 Feb" maxLength={80} />
            </label>
          </div>
          <p className="mt-2 text-xs text-charcoal/45">
            Blank date/time/venue/RSVP lines stay out of the message. Add names to replace the
            “Bride” / “Groom” placeholders.
          </p>
        </div>
      </div>

      {/* Output */}
      <div className="lg:sticky lg:top-28 rounded-[1.6rem] border border-charcoal/12 bg-white/80 backdrop-blur-md p-5 md:p-6 shadow-[0_12px_40px_rgba(28,25,23,0.07)]">
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow text-terracotta">Your message</span>
          <span className="text-[11px] font-semibold text-charcoal/45">{words} words</span>
        </div>
        <pre
          dir={lang === "ur" ? "rtl" : "ltr"}
          className="mt-3 max-h-[46vh] overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-[#FAF6EE]/70 border border-charcoal/10 p-4 font-sans text-[13px] leading-relaxed text-charcoal/85"
        >
          {text}
        </pre>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-xs font-bold text-ivory hover:bg-espresso transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#25D366]" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy message"}
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-charcoal/20 bg-white px-6 py-3 text-xs font-bold text-charcoal hover:border-terracotta hover:text-terracotta transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
            Open in WhatsApp
          </a>
        </div>
        <p className="mt-4 border-t border-charcoal/10 pt-4 text-xs text-charcoal/55 leading-relaxed">
          Want something grander than text?{" "}
          <a href="/templates" className="font-semibold text-terracotta underline decoration-terracotta/30 underline-offset-2 hover:decoration-terracotta">
            Pick an invitation design
          </a>{" "}
          and share a full animated invite instead.
        </p>
      </div>
    </div>
  );
}
