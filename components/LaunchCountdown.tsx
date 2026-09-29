"use client";

import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CountdownParts } from "@/lib/launch";
import { pad2, LAUNCH_LABEL } from "@/lib/launch";
import LaunchLogo from "./LaunchLogo";

// ─── Champagne-gold particle field (pure CSS) ────────────────────────────────
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  left: (i * 53 + 7) % 100,
  size: 3 + ((i * 7) % 4),
  duration: 9 + ((i * 13) % 8),
  delay: -((i * 17) % 12),
  drift: ((i * 29) % 40) - 20,
}));

function Particles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="launch-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Twinkling star sparkles ─────────────────────────────────────────────────
const SPARKLES = [
  { left: "12%", top: "22%" },
  { left: "88%", top: "28%" },
  { left: "18%", top: "68%" },
  { left: "82%", top: "72%" },
  { left: "8%", top: "46%" },
  { left: "93%", top: "52%" },
];

function Sparkles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {SPARKLES.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="launch-twinkle absolute h-3 w-3 text-champagne"
          style={{ left: s.left, top: s.top, animationDelay: `${i * 0.7}s` }}
          fill="currentColor"
        >
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Slow-rotating mandala backdrop ──────────────────────────────────────────
function Mandala() {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 600 600" className="launch-mandala h-[150vmin] w-[150vmin] text-champagne opacity-[0.10]">
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="300" cy="300" r="290" />
          <circle cx="300" cy="300" r="250" />
          <circle cx="300" cy="300" r="150" />
          {petals.map((r) => (
            <ellipse
              key={r}
              cx="300"
              cy="170"
              rx="34"
              ry="120"
              transform={`rotate(${r} 300 300)`}
            />
          ))}
          {petals.map((r) => (
            <circle key={`d-${r}`} cx="300" cy="52" r="4" fill="currentColor" stroke="none" transform={`rotate(${r} 300 300)`} />
          ))}
        </g>
      </svg>
    </div>
  );
}

// ─── Botanical leaf shadows ──────────────────────────────────────────────────
function BotanicalShadows() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.10]"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 800"
    >
      <g fill="none" stroke="#7c7a5a" strokeWidth="1.5">
        <path d="M-40 800 C 120 620, 180 480, 120 300 C 200 420, 260 560, 220 720" />
        <path d="M-20 780 C 90 640, 150 520, 110 380" opacity="0.6" />
        <ellipse cx="105" cy="450" rx="26" ry="10" fill="#7c7a5a" stroke="none" opacity="0.5" transform="rotate(-35 105 450)" />
        <ellipse cx="130" cy="540" rx="30" ry="11" fill="#7c7a5a" stroke="none" opacity="0.4" transform="rotate(-30 130 540)" />
        <ellipse cx="95" cy="620" rx="24" ry="9" fill="#7c7a5a" stroke="none" opacity="0.45" transform="rotate(-40 95 620)" />
        <path d="M1240 0 C 1080 180, 1020 320, 1080 500 C 1000 380, 940 240, 980 80" />
        <ellipse cx="1095" cy="350" rx="26" ry="10" fill="#7c7a5a" stroke="none" opacity="0.5" transform="rotate(35 1095 350)" />
        <ellipse cx="1070" cy="260" rx="30" ry="11" fill="#7c7a5a" stroke="none" opacity="0.4" transform="rotate(30 1070 260)" />
        <ellipse cx="1105" cy="180" rx="24" ry="9" fill="#7c7a5a" stroke="none" opacity="0.45" transform="rotate(40 1105 180)" />
      </g>
    </svg>
  );
}

// ─── Filigree corner flourishes ──────────────────────────────────────────────
function Corners() {
  const base = "pointer-events-none absolute h-10 w-10 sm:h-14 sm:w-14 border-champagne/70";
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-4 sm:inset-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.6 }}
    >
      <span className={`${base} left-0 top-0 border-l border-t`} />
      <span className={`${base} right-0 top-0 border-r border-t`} />
      <span className={`${base} bottom-0 left-0 border-b border-l`} />
      <span className={`${base} bottom-0 right-0 border-b border-r`} />
    </motion.div>
  );
}

// ─── Ornamental divider: line — diamond — line ───────────────────────────────
function Divider({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className="flex items-center gap-3"
      initial={{ opacity: 0, scaleX: 0.6 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.9, delay }}
    >
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-champagne sm:w-20" />
      <span className="block h-1.5 w-1.5 rotate-45 bg-champagne" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-champagne sm:w-20" />
    </motion.div>
  );
}

// ─── Countdown card with rolling digit ───────────────────────────────────────
function TimeCell({
  value,
  label,
  index,
  reduceMotion,
  live,
}: {
  value: string;
  label: string;
  index: number;
  reduceMotion: boolean;
  live: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.0 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex w-[68px] flex-col items-center overflow-hidden rounded-2xl border border-charcoal/10 bg-white/50 py-3 shadow-[0_10px_30px_rgba(201,168,106,0.18)] backdrop-blur-sm sm:w-[92px] sm:py-4"
    >
      {/* gold top tick */}
      <span aria-hidden className="absolute inset-x-6 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-champagne to-transparent" />
      <span
        className="font-serif relative flex h-[44px] items-center justify-center text-4xl font-medium tabular-nums text-charcoal sm:h-[56px] sm:text-5xl"
        style={{ fontVariantNumeric: "tabular-nums" }}
        suppressHydrationWarning
      >
        {!live || reduceMotion ? (
          value
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        )}
      </span>
      <span className="mt-1 text-[9px] font-bold tracking-[0.3em] text-smoke sm:text-[10px]">
        {label}
      </span>
    </motion.div>
  );
}

function LaunchCountdownInner({ parts }: { parts: CountdownParts }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  // Hydration guard: server + first client render must be byte-identical.
  // The seconds tick between SSR and hydration, so render deterministic
  // placeholders until mounted, then switch to live values client-side.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const fade = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ivory px-6 py-14 text-center">
      {/* warm vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% 38%, rgba(201,168,106,0.16), transparent 65%), radial-gradient(ellipse 70% 50% at 50% 110%, rgba(124,122,90,0.10), transparent 70%)",
        }}
      />
      {!reduceMotion && <Mandala />}
      <BotanicalShadows />
      {!reduceMotion && <Particles />}
      {!reduceMotion && <Sparkles />}
      <Corners />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        {/* top eyebrow */}
        <motion.p
          {...fade(0.15)}
          className="eyebrow mb-6 text-[10px] text-terracotta sm:text-xs"
        >
          YOU&rsquo;RE INVITED TO THE BEGINNING
        </motion.p>

        <LaunchLogo reduceMotion={reduceMotion} />

        {/* tagline */}
        <motion.p
          {...fade(0.7)}
          className="font-serif mt-7 text-xl italic text-espresso sm:text-2xl"
        >
          More Than an Invitation.
          <br />
          An Experience.
        </motion.p>

        <motion.div {...fade(0.9)} className="mt-7">
          <Divider />
        </motion.div>

        <motion.p
          {...fade(1.0)}
          className="eyebrow mt-5 text-[10px] text-smoke sm:text-xs"
        >
          OUR STORY BEGINS IN
        </motion.p>

        {/* countdown cards */}
        <div
          role="timer"
          aria-live="off"
          aria-label={
            mounted
              ? `${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds until launch`
              : "Countdown to launch"
          }
          className="mt-5 flex items-start justify-center gap-2 sm:gap-3"
        >
          <TimeCell value={mounted ? pad2(parts.days) : "00"} label="DAYS" index={0} reduceMotion={reduceMotion} live={mounted} />
          <TimeCell value={mounted ? pad2(parts.hours) : "00"} label="HOURS" index={1} reduceMotion={reduceMotion} live={mounted} />
          <TimeCell value={mounted ? pad2(parts.minutes) : "00"} label="MINS" index={2} reduceMotion={reduceMotion} live={mounted} />
          <TimeCell value={mounted ? pad2(parts.seconds) : "00"} label="SECS" index={3} reduceMotion={reduceMotion} live={mounted} />
        </div>

        {/* launch date pill */}
        <motion.div
          {...fade(1.5)}
          className="mt-7 inline-flex items-center gap-2.5 rounded-full border border-champagne/50 bg-champagne/10 px-5 py-2"
        >
          <span aria-hidden className="block h-1.5 w-1.5 rotate-45 bg-terracotta" />
          <span className="text-[11px] font-bold tracking-[0.28em] text-terracotta sm:text-xs">
            {LAUNCH_LABEL}
          </span>
          <span aria-hidden className="block h-1.5 w-1.5 rotate-45 bg-terracotta" />
        </motion.div>

        <motion.p
          {...fade(1.7)}
          className="mt-5 text-[10px] font-semibold tracking-[0.35em] text-smoke sm:text-[11px]"
        >
          CREATE &nbsp;•&nbsp; INVITE &nbsp;•&nbsp; CELEBRATE
        </motion.p>
      </div>

      <style jsx>{`
        .launch-particle {
          position: absolute;
          bottom: -8px;
          border-radius: 9999px;
          background: radial-gradient(circle, #e8d5a8 0%, #c9a86a 60%, transparent 70%);
          opacity: 0.55;
          animation-name: launch-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes launch-float {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          15% { opacity: 0.55; }
          50% { transform: translate3d(var(--drift, 0px), -52vh, 0); opacity: 0.4; }
          100% { transform: translate3d(calc(var(--drift, 0px) * -0.5), -105vh, 0); opacity: 0; }
        }
        .launch-twinkle {
          opacity: 0.2;
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.7) rotate(0deg); }
          50% { opacity: 0.9; transform: scale(1.15) rotate(20deg); }
        }
        .launch-mandala {
          animation: mandala-spin 90s linear infinite;
        }
        @keyframes mandala-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .launch-particle,
          .launch-twinkle,
          .launch-mandala {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

const LaunchCountdown = memo(LaunchCountdownInner);
export default LaunchCountdown;
