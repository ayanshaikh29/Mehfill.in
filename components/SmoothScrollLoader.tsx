"use client";
import dynamic from "next/dynamic";

// Lenis smooth-scroll only matters on fine-pointer desktops and must never
// compete with first paint — load it client-side after hydration.
const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });

export default function SmoothScrollLoader() {
  return <SmoothScroll />;
}
