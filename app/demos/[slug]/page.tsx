import { notFound } from "next/navigation";
import Link from "next/link";
import { getTemplate, TEMPLATES } from "@/lib/templates";
import EternalDemo from "@/components/demos/EternalDemo";
import MidnightDemo from "@/components/demos/MidnightDemo";
import BloomDemo from "@/components/demos/BloomDemo";
import GenericDemo from "@/components/demos/GenericDemo";
import { canonical } from "@/lib/seo";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

const DEMO_TITLES: Record<string, string> = {
  eternal: "Eternal Wedding Digital Invitation — Aarav & Amara",
  bloom: "Bloom Engagement Digital Invitation — Zoya & Arham",
  midnight: "Midnight Birthday Digital Invitation — Aria Turns 25",
};

export function generateMetadata({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Next 16: params may be a Promise in some routes — resolve defensively.
  const slug = typeof (params as { slug?: string }).slug === "string"
    ? (params as { slug: string }).slug
    : undefined;
  // For static generation Next calls this with plain params; async case handled in page.
  const t = slug ? getTemplate(slug) : undefined;
  if (!t) return { title: "Demo not found", robots: { index: false, follow: false } };
  const url = canonical(`/demos/${t.slug}`);
  const title = DEMO_TITLES[t.slug] ?? `${t.name} — ${t.occasion} Digital Invitation Demo`;
  const description = `${t.description} Open the live ${t.name} ${t.occasion.toLowerCase()} invitation demo by Mehfill — ${t.data.names}, ${t.data.date} at ${t.data.venue}. Cinematic reveal, events, gallery and RSVP.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Mehfill`,
      description,
      url,
      siteName: "Mehfill.in",
      locale: "en_IN",
      type: "website",
      images: [{ url: t.image, width: 1200, height: 630, alt: `${t.name} ${t.occasion} digital invitation demo — ${t.data.names}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Mehfill`,
      description,
      images: [t.image],
    },
  };
}

function DemoSeoFooter({ slug }: { slug: string }) {
  const t = getTemplate(slug);
  if (!t) return null;
  const url = canonical(`/demos/${t.slug}`);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
      { "@type": "ListItem", position: 2, name: "Live demos", item: canonical("/demos") },
      { "@type": "ListItem", position: 3, name: `${t.name} demo`, item: url },
    ],
  };
  const related = TEMPLATES.filter((x) => x.slug !== t.slug);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section className="border-t hairline bg-cream/50">
        <div className="mx-auto max-w-4xl px-5 md:px-8 py-12">
          <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45">
            <Link href="/" className="hover:text-terracotta">HOME</Link>
            <span className="mx-2">/</span>
            <Link href="/demos" className="hover:text-terracotta">DEMOS</Link>
            <span className="mx-2">/</span>
            <span className="text-charcoal/70">{t.name.toUpperCase()}</span>
          </nav>
          <h2 className="mt-4 font-serif font-light text-3xl md:text-4xl">
            About this {t.occasion.toLowerCase()} invitation demo
          </h2>
          <p className="mt-4 leading-relaxed text-charcoal/70">
            The {t.name} demo shows what a Mehfill {t.occasion.toLowerCase()} invitation feels like —
            {` ${t.data.names}`}, {t.data.date} at {t.data.venue} in {t.data.location}. {t.description} Every
            detail — names, dates, photos, venues and wording — is customised for your own celebration when you order.
          </p>
          <p className="mt-3 leading-relaxed text-charcoal/70">
            This is a design demo with illustrative names and dates, not a real private event. To create yours,
            message us on WhatsApp and we will design your personalised invitation in 1–3 days with revisions included.
          </p>
          <div className="mt-6">
            <p className="text-[11px] font-bold tracking-[0.2em] text-charcoal/45">EXPLORE MORE</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/demos/${r.slug}`}
                  className="rounded-full border hairline bg-white px-5 py-2.5 text-[13px] font-semibold hover:border-charcoal/30"
                >
                  {r.name} — {r.occasion}
                </Link>
              ))}
              <Link href="/digital-wedding-invitations" className="rounded-full border hairline bg-white px-5 py-2.5 text-[13px] font-semibold hover:border-charcoal/30">
                Digital Wedding Invitations
              </Link>
              <Link href="/nikah-invitations" className="rounded-full border hairline bg-white px-5 py-2.5 text-[13px] font-semibold hover:border-charcoal/30">
                Nikah Invitations
              </Link>
              <Link href="/" className="rounded-full border hairline bg-white px-5 py-2.5 text-[13px] font-semibold hover:border-charcoal/30">
                Mehfill home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) notFound();

  return (
    <>
      {t.slug === "eternal" && <EternalDemo t={t} />}
      {t.slug === "midnight" && <MidnightDemo t={t} />}
      {t.slug === "bloom" && <BloomDemo t={t} />}
      {!["eternal", "midnight", "bloom"].includes(t.slug) && <GenericDemo t={t} />}
      <DemoSeoFooter slug={t.slug} />
    </>
  );
}
