import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import { getLanding } from "@/lib/landing-content";
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
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
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
          <Link href="/demos" className="hover:text-terracotta">DEMOS</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">{l.h1.toUpperCase()}</span>
        </nav>
        <h1 className="mt-5 font-serif font-light text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance">
          {l.h1}
        </h1>
        <p className="mt-5 text-[16px] md:text-lg leading-relaxed text-charcoal/70">{l.intro}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/demos"
            className="inline-flex items-center rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-espresso"
          >
            View live demos
          </Link>
          <a
            href={waLink(`${WA_MSG_GENERAL} (Interested in: ${l.h1})`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold bg-white/40"
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
