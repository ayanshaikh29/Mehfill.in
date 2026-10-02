"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

// Soft "sunlight through leaves" — blurred botanical shadow clusters
// drifting slowly in opposite corners, like the brand reference.

function BranchCluster({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" fill="none" aria-hidden="true" className={className}>
      <g fill="#6b5230">
        <path d="M20 0 C 70 60, 110 140, 130 280" stroke="#6b5230" strokeWidth="5" strokeLinecap="round" />
        {[
          [48, 42, 34, -30],
          [78, 88, 40, 20],
          [60, 140, 30, -45],
          [102, 170, 42, 15],
          [84, 220, 32, -25],
          [118, 250, 36, 30],
          [40, 190, 28, -55],
          [96, 60, 26, 40],
        ].map(([x, y, r, rot], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.45} transform={`rotate(${rot} ${x} ${y})`} />
        ))}
      </g>
    </svg>
  );
}

export default function BotanicalShadows({
  strength = 1,
  className = "",
}: {
  strength?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse), (max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  // Mobile: render the wash statically. Infinite drift + big blurs are the
  // #1 jank source on phone GPUs — static looks identical at a glance.
  const staticMode = reduce || isMobile;
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* warm sunlight wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 18% 8%, rgba(201,168,106,0.16), transparent 70%), radial-gradient(55% 45% at 85% 92%, rgba(201,168,106,0.13), transparent 70%)",
          opacity: strength,
        }}
      />
      {/* top-left cluster */}
      <motion.div
        animate={staticMode ? undefined : { x: [0, 16, 0], y: [0, 12, 0], rotate: [0, 2.5, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 -left-16 w-[220px] sm:w-[300px] md:w-[440px] opacity-[0.14] blur-[4px] md:blur-[7px]"
        style={{ opacity: 0.14 * strength }}
      >
        <BranchCluster className="h-auto w-full" />
      </motion.div>
      {/* bottom-right cluster (mirrored) */}
      <motion.div
        animate={staticMode ? undefined : { x: [0, -14, 0], y: [0, -10, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-16 w-[200px] sm:w-[280px] md:w-[420px] rotate-[160deg] blur-[4px] md:blur-[7px]"
        style={{ opacity: 0.12 * strength }}
      >
        <BranchCluster className="h-auto w-full" />
      </motion.div>
      {/* dappled light blobs */}
      <motion.div
        animate={staticMode ? undefined : { opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[22%] h-28 w-28 sm:h-40 sm:w-40 rounded-full bg-[#e8d5a8]/25 blur-[36px] md:blur-[50px]"
      />
      <div className="absolute bottom-[12%] right-[10%] h-32 w-32 sm:h-48 sm:w-48 rounded-full bg-[#e8d5a8]/20 blur-[40px] md:blur-[60px]" />
    </div>
  );
}
