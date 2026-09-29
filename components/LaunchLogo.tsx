"use client";

import { motion } from "framer-motion";

// Wordmark display for the square logo.png (which carries large empty
// padding above/below the artwork). We center-crop to the wordmark band
// with object-cover + multiply blend so it melts into the ivory background.
export default function LaunchLogo({
  reduceMotion = false,
  instant = false,
}: {
  reduceMotion?: boolean;
  instant?: boolean;
}) {
  const noAnim = reduceMotion || instant;

  return (
    <motion.div
      initial={noAnim ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: noAnim ? 0 : [0, -7, 0] }}
      transition={
        noAnim
          ? { duration: 0.3 }
          : {
              opacity: { duration: 1, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
            }
      }
      className="relative mx-auto w-72 sm:w-96 md:w-[30rem]"
    >
      {/* soft golden halo */}
      <div
        aria-hidden
        className="launch-halo absolute left-1/2 top-1/2 -z-10 h-[120%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201,168,106,0.28), rgba(232,213,168,0.12) 55%, transparent 70%)",
        }}
      />

      {/* mihrab arch frame — draws itself in */}
      <svg viewBox="0 0 400 300" className="block h-auto w-full" aria-hidden>
        <motion.path
          d="M50 272 V150 C50 78 122 36 200 36 C278 36 350 78 350 150 V272"
          fill="none"
          stroke="#c9a86a"
          strokeWidth="1.6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: noAnim ? 0.3 : 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M66 272 V150 C66 90 130 52 200 52 C270 52 334 90 334 150 V272"
          fill="none"
          stroke="#c9a86a"
          strokeWidth="1"
          opacity="0.55"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.55 }}
          transition={{ duration: noAnim ? 0.3 : 2, delay: noAnim ? 0 : 0.4, ease: "easeInOut" }}
        />
        {/* base line */}
        <motion.line
          x1="30"
          y1="272"
          x2="370"
          y2="272"
          stroke="#c9a86a"
          strokeWidth="1.6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: noAnim ? 0.3 : 1.2, delay: noAnim ? 0 : 0.8 }}
        />
        {/* apex diamond */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: noAnim ? 0 : 1.8 }}
          style={{ transformOrigin: "200px 36px" }}
        >
          <rect x="195.5" y="31.5" width="9" height="9" transform="rotate(45 200 36)" fill="#c9a86a" />
        </motion.g>
        {/* base diamonds */}
        <rect x="26" y="268" width="8" height="8" transform="rotate(45 30 272)" fill="#c9a86a" opacity="0.8" />
        <rect x="366" y="268" width="8" height="8" transform="rotate(45 370 272)" fill="#c9a86a" opacity="0.8" />
      </svg>

      {/* cropped wordmark, optically centered in the arch */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: noAnim ? 0.3 : 1.1, delay: noAnim ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-[72%] overflow-hidden"
          style={{ aspectRatio: "2.6 / 1" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Mehfill.in"
            width={640}
            height={246}
            className="absolute inset-0 h-full w-full object-cover mix-blend-multiply"
            draggable={false}
          />
          {/* shimmer sweep */}
          {!reduceMotion && <span aria-hidden className="launch-shimmer" />}
        </motion.div>
      </div>

      <style jsx>{`
        .launch-halo {
          animation: halo-breathe 5s ease-in-out infinite;
        }
        @keyframes halo-breathe {
          0%,
          100% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.06);
          }
        }
        .launch-shimmer {
          position: absolute;
          inset: -20%;
          background: linear-gradient(
            105deg,
            transparent 42%,
            rgba(255, 255, 255, 0.75) 50%,
            transparent 58%
          );
          animation: shimmer-sweep 4.5s ease-in-out infinite;
          mix-blend-mode: soft-light;
        }
        @keyframes shimmer-sweep {
          0% {
            transform: translateX(-60%);
          }
          55%,
          100% {
            transform: translateX(60%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .launch-halo,
          .launch-shimmer {
            display: none;
          }
        }
      `}</style>
    </motion.div>
  );
}
