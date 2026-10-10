import type { MetadataRoute } from "next";
import { LANDING_PAGES } from "@/lib/landing-content";

const BASE = "https://mehfill.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-01");
  // Public, indexable pages only — private flows (login, dashboard,
  // checkout, thank-you, admin, studio, auth) stay out so crawlers spend
  // budget on pages that should rank.
  const statics: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/demos", priority: 0.8, freq: "weekly" },
    { path: "/about", priority: 0.8, freq: "monthly" },
    { path: "/how-it-works", priority: 0.8, freq: "monthly" },
    { path: "/contact", priority: 0.5, freq: "yearly" },
    { path: "/reviews", priority: 0.5, freq: "weekly" },
    { path: "/privacy-policy", priority: 0.3, freq: "yearly" },
    { path: "/terms-and-conditions", priority: 0.3, freq: "yearly" },
    { path: "/cookie-policy", priority: 0.3, freq: "yearly" },
    { path: "/refund-policy", priority: 0.3, freq: "yearly" },
  ];
  return [
    ...statics.map((p) => ({
      url: `${BASE}${p.path === "/" ? "/" : p.path}`,
      lastModified,
      changeFrequency: p.freq,
      priority: p.priority,
    })),
    // SEO landing pages — high-intent categories with genuinely useful content.
    ...LANDING_PAGES.map((l) => ({
      url: `${BASE}/${l.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    // Static HTML demo invitations (real designs guests open) — only site-1..5.
    ...["site-1", "site-2", "site-3", "site-4", "site-5"].map((s) => ({
      url: `${BASE}/${s}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
