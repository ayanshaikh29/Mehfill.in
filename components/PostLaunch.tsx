"use client";

import { useEffect, useState } from "react";
import { isLaunched } from "@/lib/launch";

// Renders children only after launch (polls every 30s; gate handles the
// exact-second transition — this is just to avoid loading heavy post-launch
//-only UI like the intro film underneath the countdown).
export default function PostLaunch({ children }: { children: React.ReactNode }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    const check = () => {
      if (typeof window !== "undefined") {
        const q = new URLSearchParams(window.location.search).get("launch");
        if (q === "preview") {
          setLive(false);
          return;
        }
        if (q === "live") {
          setLive(true);
          return;
        }
        // Dev convenience: localhost / `next dev` always treated as live.
        const host = window.location.hostname;
        if (
          host === "localhost" ||
          host === "127.0.0.1" ||
          host === "[::1]" ||
          process.env.NODE_ENV === "development"
        ) {
          setLive(true);
          return;
        }
      }
      setLive(isLaunched(Date.now()));
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, []);

  if (!live) return null;
  return <>{children}</>;
}
