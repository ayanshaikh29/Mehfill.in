import type { Metadata } from "next";
import { CATALOG } from "@/lib/catalog";
import TemplatePicker from "@/components/TemplatePicker";
import { TemplatesIntro, PremiumCta } from "@/components/TemplatesIntro";
import { canonical } from "@/lib/seo";

const PAGE_URL = canonical("/templates");

export const metadata: Metadata = {
  title: "Invitation Designs & Templates for Every Event",
  description:
    "Browse ready-to-personalise digital wedding invitation designs. Choose a template, customise your details and publish your invitation link in minutes.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Invitation Designs | Mehfill.in",
    description:
      "Browse ready-to-personalise digital wedding invitation designs. Customise your details and publish your link in minutes.",
    url: PAGE_URL,
    siteName: "Mehfill.in",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "Mehfill invitation designs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invitation Designs | Mehfill.in",
    description:
      "Browse ready-to-personalise digital wedding invitation designs. Customise and publish in minutes.",
    images: ["/og-cover.png"],
  },
};

/** CollectionPage + ItemList so search engines understand /templates is a
 *  catalogue of purchasable designs (each item links its live demo). */
function TemplatesJsonLd() {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Mehfill invitation designs",
    numberOfItems: CATALOG.length,
    itemListElement: CATALOG.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: canonical(t.demoUrl || "/templates"),
      image: canonical(t.image),
      description: t.description,
    })),
  };
  const page = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Invitation Designs — Mehfill.in",
    url: PAGE_URL,
    description:
      "Ready-to-personalise digital wedding invitation designs. Choose a template, add your details and publish your invitation link in minutes.",
    isPartOf: { "@type": "WebSite", name: "Mehfill.in", url: canonical("/") },
    mainEntity: itemList,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
      { "@type": "ListItem", position: 2, name: "Invitation Designs", item: PAGE_URL },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(page) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <TemplatesJsonLd />
      <TemplatesIntro />
      <TemplatePicker templates={CATALOG} />
      <PremiumCta />
    </main>
  );
}
