"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { CountdownParts } from "@/lib/launch";
import { pad2, LAUNCH_LABEL } from "@/lib/launch";

// ─── Champagne-gold particle field (pure CSS, ~18 dots) ──────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 53 + 7) % 100,
  size: 3 + ((i * 7) % 4),
  duration: 9 + ((i * 13) % 8),
  delay: -((i * 17) % 12),
  drift: ((i * 29) % 40) - 20,
}));

function Particles({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return null;
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

// ─── Botanical leaf shadows (inline SVG, very subtle) ────────────────────────
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

function TimeCell({ value, label, index }: { value: string; label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.0 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
    >
      <div
        suppressHydrationWarning
        className="font-serif text-5xl font-medium tabular-nums text-charcoal sm:text-6xl md:text-7xl"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>
      <div className="mt-2 text-[10px] font-semibold tracking-[0.35em] text-smoke">
        {label}
      </div>
    </motion.div>
  );
}

function LaunchCountdownInner({ parts }: { parts: CountdownParts }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const anim = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
    : undefined;

  return (
    <div className="grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-ivory px-6 py-16 text-center">
      {/* soft vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% 38%, rgba(201,168,106,0.16), transparent 65%), radial-gradient(ellipse 70% 50% at 50% 110%, rgba(124,122,90,0.10), transparent 70%)",
        }}
      />
      <BotanicalShadows />
      <Particles reduceMotion={reduceMotion} />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        {/* logo */}
        <motion.div
          {...anim}
          initial={anim ? undefined : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="MEHFILL.in"
            className="mx-auto h-16 w-auto object-contain sm:h-20"
            width={320}
            height={80}
          />
        </motion.div>

        {/* tagline */}
        <motion.p
          {...anim}
          initial={anim ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif mt-6 text-xl italic text-espresso sm:text-2xl"
        >
          More Than an Invitation.
          <br />
          An Experience.
        </motion.p>

        <motion.div
          {...anim}
          initial={anim ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="mt-10 flex items-center gap-4"
        >
          <span className="h-px w-10 bg-champagne/60 sm:w-16" />
          <span className="eyebrow text-smoke">OUR STORY BEGINS IN</span>
          <span className="h-px w-10 bg-champagne/60 sm:w-16" />
        </motion.div>

        {/* countdown */}
        <div
          role="timer"
          aria-live="off"
          aria-label={`${parts.days} days, ${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds until launch`}
          className="mt-6 flex items-start justify-center gap-3 sm:gap-6"
          suppressHydrationWarning
        >
          <TimeCell value={pad2(parts.days)} label="DAYS" index={0} />
          <span aria-hidden className="font-serif pt-1 text-4xl text-champagne sm:text-5xl md:text-6xl">:</span>
          <TimeCell value={pad2(parts.hours)} label="HOURS" index={1} />
          <span aria-hidden className="font-serif pt-1 text-4xl text-champagne sm:text-5xl md:text-6xl">:</span>
          <TimeCell value={pad2(parts.minutes)} label="MINS" index={2} />
          <span aria-hidden className="font-serif pt-1 text-4xl text-champagne sm:text-5xl md:text-6xl">:</span>
          <TimeCell value={pad2(parts.seconds)} label="SECS" index={3} />
        </div>

        <motion.p
          {...anim}
          initial={anim ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.5 }}
          className="mt-8 text-xs font-semibold tracking-[0.3em] text-terracotta"
        >
          {LAUNCH_LABEL}
        </motion.p>

        <motion.p
          {...anim}
          initial={anim ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.7 }}
          className="mt-4 text-[11px] font-medium tracking-[0.25em] text-smoke"
        >
          CREATE. INVITE. CELEBRATE.
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
        @media (prefers-reduced-motion: reduce) {
          .launch-particle { display: none; }
        }
      `}</style>
    </div>
  );
}

const LaunchCountdown = memo(LaunchCountdownInner);
export default LaunchCountdown;
