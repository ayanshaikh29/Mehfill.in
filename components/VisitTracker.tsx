"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Paths that must NEVER pollute customer analytics.
const EXCLUDED = ["/admin", "/studio"];

// Module-level guard: skips the React StrictMode double-fire in dev
// (same path logged twice within a few seconds = one real view).
let lastLogged = { path: "", at: 0 };

// Logs every REAL page view to /api/track (fire-and-forget, never breaks the site).
export default function VisitTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path) return;
    if (EXCLUDED.some((p) => path === p || path.startsWith(p + "/"))) return;
    const now = Date.now();
    if (lastLogged.path === path && now - lastLogged.at < 5000) return;
    lastLogged = { path, at: now };
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, [path]);
  return null;
}
