"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Cinematic entry: logo reveal film plays fullscreen on every fresh
// page load (desktop film on large screens, portrait film on mobile),
// then the curtain swipes up automatically revealing the site.
export default function IntroReveal() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const done = useRef(false);

  useEffect(() => {
    setSrc(window.innerWidth < 768 ? "/intro-mobile-opt.mp4" : "/intro-desktop-opt.mp4");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
  }, []);

  // Safety net: never trap the visitor if the video stalls.
  useEffect(() => {
    const id = setTimeout(finish, 11000);
    return () => clearTimeout(id);
  }, [finish]);

  // Unmount after the swipe-up completes + hand scroll back.
  useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 1050);
    return () => clearTimeout(id);
  }, [leaving]);

  if (!visible) return null;

  return (
    <motion.div
      aria-hidden={leaving}
      className="fixed inset-0 z-[100] bg-ivory"
      initial={{ y: 0 }}
      animate={{ y: leaving ? "-100%" : 0 }}
      transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
    >
      {src && (
        <video
          key={src}
          src={src}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={finish}
          onError={finish}
          className="h-full w-full object-cover"
        />
      )}
      {!leaving && (
        <button
          onClick={finish}
          className="absolute bottom-15 right-6 rounded-full bg-terracotta px-5 py-2 text-[11px] font-bold tracking-[0.25em] text-ivory transition-colors hover:bg-terracotta-deep"
        >
          SKIP
        </button>
      )}
    </motion.div>
  );
}
