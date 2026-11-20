import type { MetadataRoute } from "next";
import { LANDING_PAGES } from "@/lib/landing-content";
import { BLOG_POSTS } from "@/lib/blog-posts";

const BASE = "https://mehfill.in";

export default function sitemap(): MetadataRoute.Sitemap {
  // Reflects deploy time so crawlers see fresh lastmod after each release.
  const lastModified = new Date();
  // Public, indexable pages only — private flows (login, dashboard,
  // checkout, thank-you, admin, studio, auth) and policy pages (noindexed)
  // stay out so crawlers spend budget on pages that should rank.
  const statics: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/templates", priority: 0.9, freq: "weekly" },
    { path: "/demos", priority: 0.8, freq: "weekly" },
    { path: "/wedding-invitation-video", priority: 0.9, freq: "weekly" },
    { path: "/about", priority: 0.8, freq: "monthly" },
    { path: "/how-it-works", priority: 0.8, freq: "monthly" },
    { path: "/contact", priority: 0.5, freq: "yearly" },
    { path: "/reviews", priority: 0.5, freq: "weekly" },
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
    // Free tools — link magnets (indexable tool pages, per off-page plan).
    { url: `${BASE}/free`, lastModified, changeFrequency: "monthly" as const, priority: 0.7 },
    {
      url: `${BASE}/free/whatsapp-invitation-wording`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    // Blog — long-tail content engine.
    { url: `${BASE}/blog`, lastModified, changeFrequency: "weekly" as const, priority: 0.7 },
    ...BLOG_POSTS.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Static HTML demo invitations (real designs guests open).
    ...["site-1", "site-2", "site-3", "site-4", "site-5", "site-6", "site-7", "site-8", "site-9"].map((s) => ({
      url: `${BASE}/${s}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
