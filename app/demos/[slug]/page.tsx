import { notFound } from "next/navigation";
import { getTemplate, TEMPLATES } from "@/lib/templates";
import EternalDemo from "@/components/demos/EternalDemo";
import MidnightDemo from "@/components/demos/MidnightDemo";
import BloomDemo from "@/components/demos/BloomDemo";
import GenericDemo from "@/components/demos/GenericDemo";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const t = getTemplate(params.slug);
  if (!t) return { title: "Demo not found — Mehfill.in", robots: { index: false, follow: false } };
  const url = `https://mehfill.in/demos/${t.slug}`;
  const title = `${t.name} — ${t.occasion} Digital Invitation Demo`;
  return {
    title,
    description: `${t.description} Open the live ${t.name} ${t.occasion} invitation demo by Mehfill.in — cinematic reveal, events, gallery & RSVP.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Mehfill.in`,
      description: t.description,
      url,
      siteName: "Mehfill.in",
      locale: "en_IN",
      type: "website",
      images: [{ url: t.image, width: 1200, height: 630, alt: `${t.name} invitation demo` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Mehfill.in`,
      description: t.description,
      images: [t.image],
    },
  };
}

export default function DemoPage({ params }: { params: { slug: string } }) {
  const t = getTemplate(params.slug);
  if (!t) notFound();

  if (t.slug === "eternal") return <EternalDemo t={t} />;
  if (t.slug === "midnight") return <MidnightDemo t={t} />;
  if (t.slug === "bloom") return <BloomDemo t={t} />;
  return <GenericDemo t={t} />;
}
