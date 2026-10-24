import type { Metadata } from "next";
import { CATALOG } from "@/lib/catalog";
import TemplatePicker from "@/components/TemplatePicker";
import { TemplatesIntro, PremiumCta } from "@/components/TemplatesIntro";

export const metadata: Metadata = {
  title: "Invitation Designs",
  description:
    "Browse ready-to-personalise digital wedding invitation designs. Choose a template, customise your details and publish your invitation link in minutes.",
  alternates: { canonical: "https://mehfill.in/templates" },
};

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <TemplatesIntro />
      <TemplatePicker templates={CATALOG} />
      <PremiumCta />
    </main>
  );
}
