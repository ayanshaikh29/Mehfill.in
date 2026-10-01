import type { MetadataRoute } from "next";
import { TEMPLATES } from "@/lib/templates";

const BASE = "https://mehfill.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Public, indexable pages only — private flows (login, dashboard,
  // checkout, thank-you, admin, studio) stay out so crawlers spend
  // budget on pages that should rank.
  const statics: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/privacy-policy", priority: 0.3, freq: "yearly" },
    { path: "/terms-and-conditions", priority: 0.3, freq: "yearly" },
    { path: "/cookie-policy", priority: 0.3, freq: "yearly" },
    { path: "/refund-policy", priority: 0.3, freq: "yearly" },
  ];
  return [
    ...statics.map((p) => ({
      url: `${BASE}${p.path}`,
      lastModified: now,
      changeFrequency: p.freq,
      priority: p.priority,
    })),
    // Demo templates are part of the public catalogue.
    ...TEMPLATES.map((t) => ({
      url: `${BASE}/demos/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
