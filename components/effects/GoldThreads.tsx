"use client";
import { motion } from "framer-motion";

// Thin elegant gold hairline curves, drawn on scroll —
// the delicate arcs from the brand reference.

export default function GoldThreads({
  className = "",
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 400 800"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 right-0 h-full w-[220px] md:w-[340px] ${flip ? "-scale-x-100 left-0 right-auto" : ""} ${className}`}
    >
      <motion.path
        d="M360,0 C300,170 250,260 120,400 C40,490 60,620 140,800"
        stroke="#C9A86A"
        strokeWidth="1.2"
        fill="none"
        opacity="0.55"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.path
        d="M395,40 C340,200 290,300 170,430 C100,505 120,640 190,800"
        stroke="#C9A86A"
        strokeWidth="0.8"
        fill="none"
        opacity="0.35"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
