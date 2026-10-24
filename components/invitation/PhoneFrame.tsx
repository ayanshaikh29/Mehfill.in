"use client";
import { useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

/**
 * Premium iPhone-style device frame for the invitation editor preview.
 * Renders the live invitation (same /i/<slug>?preview=1 renderer as the public
 * URL) inside a realistic phone shell with rounded edges, Dynamic Island-style
 * notch, subtle shadow — plus full-screen mode.
 *
 * The area around the phone is backed by responsive artwork: a 9:16 portrait
 * image on small screens and a 16:9 landscape image on md+ (/preview-bg/),
 * with a subtle dark overlay. If an image is missing it simply hides and the
 * flat charcoal backdrop remains — never a broken icon.
 *
 * The iframe is keyed on `src`, so every save-then-preview remounts it and
 * always shows the freshest server-rendered HTML — no stale caches.
 */

/** Responsive backdrop behind the phone mockup (editor preview only — never
 *  part of the published invitation). */
export function PreviewBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
      {/* 9:16 portrait art — mobile viewports (<768px) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/preview-bg/portrait-9x16.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center md:hidden scale-105"
      />
      {/* 16:9 landscape art — desktop viewports (>=768px) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/preview-bg/landscape-16x9.jpg"
        alt=""
        className="absolute inset-0 hidden h-full w-full object-cover object-center md:block scale-105"
      />

      {/* Atmospheric Royal Wedding Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#14100c]/60 via-[#14100c]/30 to-[#14100c]/75 backdrop-blur-[2px]" />

      {/* Mehfill Watermark Branding at Top Center */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-0 flex flex-col items-center opacity-85 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-transparent.png"
          alt="Mehfill"
          className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="mt-1 font-serif text-[13px] sm:text-[15px] tracking-[0.25em] uppercase text-[#F8F3EA]/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] font-light">
          Mehfill Studio
        </span>
      </div>

      {/* Top Left Floral Accent (Desktop only) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/editor/floral-corner.png"
        alt=""
        className="absolute -top-6 -left-6 w-36 sm:w-56 h-auto object-contain opacity-75 drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] pointer-events-none hidden sm:block -rotate-12"
      />

      {/* Top Right Floral Accent (Desktop only) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/editor/floral-corner.png"
        alt=""
        className="absolute -top-6 -right-6 w-36 sm:w-56 h-auto object-contain opacity-75 drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)] pointer-events-none hidden sm:block scale-x-[-1] rotate-12"
      />

      {/* Bottom Subtle Ambient Warm Glow */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-[#ECCF98]/10 blur-[100px] pointer-events-none" />
    </div>
  );
}

export function PhoneFrame({
  src,
  fullScreen,
  onFullScreenChange,
  toolbar,
}: {
  src: string;
  fullScreen?: boolean;
  onFullScreenChange?: (v: boolean) => void;
  toolbar?: React.ReactNode;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [nonce, setNonce] = useState(0);

  const iframeKey = `${src}#${nonce}`;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-[#141210]">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 text-ivory">
          <button
            onClick={() => onFullScreenChange?.(false)}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold"
          >
            <Minimize2 className="h-3.5 w-3.5" /> Exit full screen
          </button>
          <div className="flex items-center gap-2">
            {toolbar}
            <button
              onClick={() => setNonce((k) => k + 1)}
              className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold"
            >
              Reload
            </button>
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <PreviewBackdrop />
          <div className="relative z-10 flex h-full items-stretch justify-center p-0 sm:p-4">
            {/* iPhone shell (full-screen preview is always the mobile view) */}
            <div className="relative h-full w-full max-w-[430px] rounded-none sm:rounded-[2.6rem] overflow-hidden border-0 sm:border-[10px] border-[#1f1c19] shadow-[0_30px_80px_rgba(0,0,0,.55)] bg-black">
              <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-10 h-6 w-28 rounded-full bg-black" />
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={src}
                title="Invitation full-screen preview"
                className="h-full w-full border-0 bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[1040px] overflow-hidden rounded-[1.8rem] border border-white/10">
      <PreviewBackdrop />

      <div className="relative z-10 flex flex-col items-center gap-4 px-4 py-8 md:py-12">
        {/* ── iPhone shell ─────────────────────────────────────────── */}
        <div className="relative">
          {/* Outer glow / shadow */}
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[3.4rem] bg-gradient-to-b from-white/10 via-white/5 to-transparent blur-xl"
          />
          {/* Body */}
          <div className="relative w-[320px] rounded-[2.9rem] bg-gradient-to-b from-[#3a3632] via-[#1f1c19] to-[#2a2622] p-[11px] shadow-[0_28px_70px_rgba(0,0,0,.5),0_0_0_1px_rgba(255,255,255,.06)]">
            {/* Side buttons (realistic detail) */}
            <div aria-hidden className="absolute -left-[3px] top-[110px] h-14 w-[3px] rounded-l bg-[#2e2a26]" />
            <div aria-hidden className="absolute -left-[3px] top-[180px] h-14 w-[3px] rounded-l bg-[#2e2a26]" />
            <div aria-hidden className="absolute -right-[3px] top-[140px] h-20 w-[3px] rounded-r bg-[#2e2a26]" />
            {/* Screen */}
            <div className="relative overflow-hidden rounded-[2.2rem] bg-black" style={{ aspectRatio: "9 / 19.5" }}>
              {/* Dynamic Island */}
              <div
                aria-hidden
                className="absolute left-1/2 top-[9px] z-20 h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-black shadow-[inset_0_0_2px_rgba(255,255,255,.15)]"
              >
                <div className="absolute right-[10px] top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-[#0d1a24] ring-1 ring-[#1a2e3a]" />
              </div>
              {/* Home indicator */}
              <div
                aria-hidden
                className="absolute bottom-[6px] left-1/2 z-20 h-[4px] w-[110px] -translate-x-1/2 rounded-full bg-black/35"
              />
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={src}
                title="Invitation iPhone preview"
                className="h-full w-full border-0 bg-white"
              />
            </div>
          </div>
        </div>

        {onFullScreenChange && (
          <button
            onClick={() => onFullScreenChange(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-bold text-ivory/80 hover:text-ivory"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Full screen
          </button>
        )}
      </div>
    </div>
  );
}
