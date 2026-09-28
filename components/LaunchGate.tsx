"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LaunchCountdown from "./LaunchCountdown";
import { getCountdownParts, isLaunched } from "@/lib/launch";

type Phase = "checking" | "countdown" | "transition" | "revealed";

// Test overrides: ?launch=preview forces the countdown, ?launch=live forces
// the real site. No param -> real time logic.
function getTestOverride(): "preview" | "live" | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("launch");
  return v === "preview" ? "preview" : v === "live" ? "live" : null;
}

// now() with server-clock correction: offset = serverNow - clientNowAtFetch.
function useNowMs() {
  const [offset, setOffset] = useState(0);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const t0 = Date.now();
        const res = await fetch("/api/time", { cache: "no-store" });
        if (!res.ok) return;
        const { now } = (await res.json()) as { now: number };
        if (cancelled || typeof now !== "number") return;
        const rtt = Date.now() - t0;
        // Assume symmetric latency; server time ≈ now + rtt/2 at receipt.
        setOffset(now + rtt / 2 - Date.now());
      } catch {
        // Offline / failed fetch -> fall back to device clock (still UTC-based,
        // hence timezone-independent).
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now() + offset), 1000);
    return () => clearInterval(id);
  }, [offset]);

  // Re-sync immediately when offset first arrives.
  useEffect(() => {
    setNowMs(Date.now() + offset);
  }, [offset]);

  return nowMs;
}

export default function LaunchGate({ children }: { children: React.ReactNode }) {
  const nowMs = useNowMs();
  const [override] = useState<"preview" | "live" | null>(() => getTestOverride());
  const [phase, setPhase] = useState<Phase>("checking");
  const [transitionKey, setTransitionKey] = useState(0);

  const launched = useMemo(() => {
    if (override === "preview") return false;
    if (override === "live") return true;
    return isLaunched(nowMs);
  }, [nowMs, override]);

  const parts = useMemo(() => getCountdownParts(nowMs), [nowMs]);

  // checking -> countdown | revealed (failsafe: post-launch visitors never
  // see the countdown, even on first ever visit).
  useEffect(() => {
    if (phase !== "checking") return;
    const id = setTimeout(() => setPhase(launched ? "revealed" : "countdown"), 150);
    return () => clearTimeout(id);
  }, [phase, launched]);

  // countdown -> transition exactly at launch; transition auto-reveals.
  useEffect(() => {
    if (phase === "countdown" && launched) {
      setTransitionKey((k) => k + 1);
      setPhase("transition");
    }
  }, [phase, launched]);

  useEffect(() => {
    if (phase !== "transition") return;
    const id = setTimeout(() => setPhase("revealed"), 2800);
    return () => clearTimeout(id);
  }, [phase]);

  // Lock scroll while gated; restore after reveal.
  useEffect(() => {
    if (phase === "revealed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  const revealed = phase === "revealed";
  if (revealed) return <>{children}</>;

  return (
    <>
      {/* Keep the real site mounted but inert behind the gate so the reveal
          is instant with zero reload. */}
      <div aria-hidden={!revealed} inert={!revealed}>
        {children}
      </div>

      <AnimatePresence>
        {!revealed && (
          <motion.div
            key={phase === "transition" ? `transition-${transitionKey}` : "countdown"}
            className="fixed inset-0 z-[90] overflow-y-auto bg-ivory"
            initial={{ opacity: phase === "checking" ? 0 : 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {phase === "transition" ? (
              <div className="grain relative flex min-h-dvh flex-col items-center justify-center bg-ivory px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="MEHFILL.in" className="mx-auto h-16 w-auto object-contain" width={320} height={80} />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="font-serif mt-8 text-4xl font-medium text-charcoal sm:text-5xl"
                >
                  The Wait Is Over.
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="mt-4 text-xs font-semibold tracking-[0.3em] text-smoke"
                >
                  WELCOME TO MEHFILL
                </motion.p>
              </div>
            ) : (
              <LaunchCountdown parts={parts} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
