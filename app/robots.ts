import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
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
