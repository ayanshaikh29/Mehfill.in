import type { MetadataRoute } from "next";

const BASE = "https://mehfill.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = [
    "",
    "/privacy-policy",
    "/terms-and-conditions",
    "/cookie-policy",
    "/refund-policy",
    "/login",
    "/dashboard",
    "/checkout",
    "/thank-you",
  ];
  return [
    ...statics.map((p) => ({
      url: `${BASE}${p || "/"}`,
      lastModified: new Date("2026-09-28"),
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.6,
    })),
    // Demo templates are part of the public catalogue.
    ...["eternal", "riwaayat", "bloom", "midnight", "moments"].map((slug) => ({
      url: `${BASE}/demos/${slug}`,
      lastModified: new Date("2026-09-28"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
