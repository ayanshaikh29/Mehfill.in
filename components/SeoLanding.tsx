import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import { getLanding } from "@/lib/landing-content";
import { getCatalogTemplate } from "@/lib/catalog";
import { PLANS } from "@/lib/plans";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";
import { canonical } from "@/lib/seo";

export function LandingJsonLd({ slug }: { slug: string }) {
  const l = getLanding(slug);
  if (!l) return null;
  const url = canonical(`/${l.slug}`);
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: l.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
      { "@type": "ListItem", position: 2, name: l.h1, item: url },
    ],
  };
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: l.h1,
    description: l.description,
    brand: { "@type": "Brand", name: "Mehfill.in" },
    url,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: String(Math.min(...PLANS.map((p) => p.price))),
      highPrice: String(Math.max(...PLANS.map((p) => p.price))),
      offerCount: PLANS.length,
      offers: PLANS.map((p) => ({
        "@type": "Offer",
        name: p.name,
        price: String(p.price),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url,
      })),
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
    </>
  );
}

const STEPS = [
  { n: "01", title: "Pick a design", text: "Browse live demos and choose a template you love — no account needed to explore." },
  { n: "02", title: "Make it yours", text: "Add names, dates, venues, photos and wording in a step-by-step editor. Preview exactly what guests will see." },
  { n: "03", title: "Publish & share", text: "Pay securely and publish your unique link, then send it on WhatsApp. Basic goes live instantly." },
];

function TemplateGrid({ slug }: { slug: string }) {
  const l = getLanding(slug);
  if (!l?.templateSlugs?.length) return null;
  const templates = l.templateSlugs.map(getCatalogTemplate).filter(Boolean);
  if (!templates.length) return null;
  return (
    <section className="mt-12" aria-labelledby="sample-templates">
      <h2 id="sample-templates" className="font-serif font-light text-3xl md:text-4xl">
        Sample templates to start from
      </h2>
      <p className="mt-4 leading-relaxed text-charcoal/70">
        Every design is fully editable — names, dates, venues, photos and wording. Open a live demo to feel
        the experience before you choose.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {templates.map(
          (t) =>
            t && (
              <Link
                key={t.slug}
                href={t.demoUrl || "/templates"}
                className="group overflow-hidden rounded-2xl border hairline bg-white/60 hover:border-charcoal/30 transition-colors"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand">
                  <Image
                    src={t.image}
                    alt={`${t.name} — ${t.tagline}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-xl">{t.name}</h3>
                  <p className="mt-1 text-sm text-charcoal/60">{t.tagline}</p>
                </div>
              </Link>
            )
        )}
      </div>
      <div className="mt-5">
        <Link href="/templates" className="text-sm font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta">
          See all invitation designs
        </Link>
      </div>
    </section>
  );
}

function HowItWorksSteps() {
  return (
    <section className="mt-12" aria-labelledby="how-it-works-heading">
      <h2 id="how-it-works-heading" className="font-serif font-light text-3xl md:text-4xl">
        How it works — three simple steps
      </h2>
      <ol className="mt-6 grid gap-5 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li key={s.n} className="rounded-2xl border hairline bg-white/60 p-5">
            <span className="text-[12px] font-semibold tracking-[0.16em] text-terracotta">{s.n}</span>
            <h3 className="mt-2 font-serif text-xl">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-charcoal/65">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-charcoal/55">
        Full walkthrough on the{" "}
        <Link href="/how-it-works" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4">
          how it works page
        </Link>
        .
      </p>
    </section>
  );
}

function PricingBlock() {
  return (
    <section className="mt-12" aria-labelledby="pricing-heading">
      <h2 id="pricing-heading" className="font-serif font-light text-3xl md:text-4xl">
        Simple, one-time pricing
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.id} className="rounded-2xl border hairline bg-white/60 p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-2xl">{p.name}</h3>
              <span className="font-serif text-3xl text-terracotta-deep">₹{p.price}</span>
            </div>
            <p className="mt-1 text-sm text-charcoal/60">{p.delivery}</p>
            <ul className="mt-4 grid gap-2">
              {p.features.slice(0, 5).map((f) => (
                <li key={f} className="flex gap-3 text-sm leading-relaxed text-charcoal/70">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-charcoal/60">
        One-time payment per invitation — no subscriptions.{" "}
        <Link href="/#pricing" className="font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4">
          Compare all features
        </Link>
        .
      </p>
    </section>
  );
}

export default function SeoLanding({ slug }: { slug: string }) {
  const l = getLanding(slug);
  if (!l) return null;

  return (
    <main className="min-h-screen">
      <Navbar />
      <article className="mx-auto max-w-4xl px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45">
          <Link href="/" className="hover:text-terracotta">HOME</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">{l.h1.toUpperCase()}</span>
        </nav>
        <h1 className="mt-5 font-serif font-light text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance">
          {l.h1}
        </h1>
        <p className="mt-5 text-[16px] md:text-lg leading-relaxed text-charcoal/70">{l.intro}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/templates"
            className="inline-flex items-center rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-espresso"
          >
            Browse templates
          </Link>
          <Link
            href="/demos"
            className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold bg-white/40 hover:border-charcoal/30"
          >
            View live demos
          </Link>
          <a
            href={waLink(`${WA_MSG_GENERAL} (Interested in: ${l.h1})`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold bg-white/40 hover:border-charcoal/30"
          >
            Chat on WhatsApp
          </a>
        </div>

        {l.sections.map((s) => (
          <section key={s.h2} className="mt-12">
            <h2 className="font-serif font-light text-3xl md:text-4xl">{s.h2}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed text-charcoal/70">{p}</p>
            ))}
            {s.list && (
              <ul className="mt-4 grid gap-2.5">
                {s.list.map((item) => (
                  <li key={item} className="flex gap-3 text-charcoal/75 leading-relaxed">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <HowItWorksSteps />
        <TemplateGrid slug={slug} />
        <PricingBlock />

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl md:text-4xl">Questions, answered</h2>
          <div className="mt-6 divide-y divide-charcoal/10 border-y hairline">
            {l.faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer font-serif text-xl md:text-2xl list-none flex items-center justify-between gap-4">
                  {f.q}
                  <span className="shrink-0 rounded-full border hairline px-2.5 py-1 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 pr-10 text-[15px] leading-relaxed text-charcoal/65">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif font-light text-3xl">Explore related invitations</h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {l.relatedSlugs.map((r) => {
              const rel = getLanding(r);
              if (!rel) return null;
              return (
                <Link
                  key={r}
                  href={`/${r}`}
                  className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold hover:border-charcoal/30"
                >
                  {rel.h1}
                </Link>
              );
            })}
            <Link
              href="/demos"
              className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold hover:border-charcoal/30"
            >
              All live demos
            </Link>
            <Link
              href="/"
              className="rounded-full border hairline bg-white/60 px-5 py-2.5 text-[13px] font-semibold hover:border-charcoal/30"
            >
              Mehfill.in home
            </Link>
          </div>
        </section>
      </article>
      <CTA />
      <Footer />
    </main>
  );
}
