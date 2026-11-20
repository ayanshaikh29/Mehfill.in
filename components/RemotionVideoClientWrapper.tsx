"use client";

import dynamic from "next/dynamic";
import React from "react";

const RemotionVideoPlayer = dynamic(
  () => import("@/components/RemotionVideoPlayer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[580px] flex flex-col items-center justify-center p-12 text-center text-charcoal/60">
        <div className="w-12 h-12 border-3 border-terracotta border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-lg">Initializing Remotion 60fps Video Engine...</p>
      </div>
    ),
  }
);

export default function RemotionVideoClientWrapper() {
  return <RemotionVideoPlayer />;
}
