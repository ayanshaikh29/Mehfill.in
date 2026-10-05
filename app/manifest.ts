import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mehfill — Digital Invitations for Weddings & Celebrations",
    short_name: "Mehfill",
    description:
      "Beautiful digital invitation experiences for weddings, Nikah, birthdays, engagements and anniversaries in India.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF9F3",
    theme_color: "#FDF9F3",
    lang: "en-IN",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
