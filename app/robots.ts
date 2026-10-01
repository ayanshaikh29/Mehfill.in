import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/studio", "/api/", "/dashboard", "/checkout", "/thank-you", "/login"],
      },
    ],
    sitemap: "https://mehfill.in/sitemap.xml",
  };
}
