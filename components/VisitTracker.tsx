"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Logs every page view to /api/track (fire-and-forget, never breaks the site).
export default function VisitTracker() {
  const path = usePathname();
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, [path]);
  return null;
}
