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
  if (!t) return { title: "Demo not found — Mehfill.in" };
  return {
    title: `${t.name} — ${t.occasion} Demo | Mehfill.in`,
    description: t.description,
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
