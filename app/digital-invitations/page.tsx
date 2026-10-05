import type { Metadata } from "next";
import SeoLanding, { LandingJsonLd } from "@/components/SeoLanding";
import { getLanding } from "@/lib/landing-content";
import { canonical } from "@/lib/seo";

const SLUG = "digital-invitations";

export function generateMetadata(): Metadata {
  const l = getLanding(SLUG)!;
  const url = canonical("/" + SLUG);
  return {
    title: l.title,
    description: l.description,
    alternates: { canonical: url },
    openGraph: {
      title: l.title,
      description: l.description,
      url,
      siteName: "Mehfill.in",
      locale: "en_IN",
      type: "website",
      images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: l.h1 }],
    },
    twitter: {
      card: "summary_large_image",
      title: l.title,
      description: l.description,
      images: ["/og-cover.png"],
    },
  };
}

export default function Page() {
  return (
    <>
      <LandingJsonLd slug={SLUG} />
      <SeoLanding slug={SLUG} />
    </>
  );
}
