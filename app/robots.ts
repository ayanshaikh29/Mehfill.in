import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI / LLM crawlers are welcome on public pages (GEO).
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Meta-WebIndexer",
          "Meta-WebFetcher",
          "Applebot-Extended",
          "Cohere-ai",
          "YouBot",
        ],
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/studio",
          "/studio/",
          "/api/",
          "/dashboard",
          "/dashboard/",
          "/checkout",
          "/checkout/",
          "/thank-you",
          "/thank-you/",
          "/login",
          "/login/",
          "/auth/",
        ],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/studio",
          "/studio/",
          "/api/",
          "/dashboard",
          "/dashboard/",
          "/checkout",
          "/checkout/",
          "/thank-you",
          "/thank-you/",
          "/login",
          "/login/",
          "/auth/",
          "/*?cart=*",
          "/*?plan=*",
        ],
      },
    ],
    sitemap: "https://mehfill.in/sitemap.xml",
  };
}
