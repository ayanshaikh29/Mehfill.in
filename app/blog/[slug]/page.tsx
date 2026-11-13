import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";
import { getLanding } from "@/lib/landing-content";
import { canonical } from "@/lib/seo";

interface Params {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = getBlogPost(slug);
  if (!p) return { title: "Post not found" };
  const url = canonical(`/blog/${p.slug}`);
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: p.title,
      description: p.description,
      url: url,
      publishedTime: p.date,
      siteName: "Mehfill.in",
      locale: "en_IN",
      images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: p.h1 }],
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.description,
      images: ["/og-cover.png"],
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const p = getBlogPost(slug);
  if (!p) notFound();

  const url = canonical(`/blog/${p.slug}`);
  const landing = getLanding(p.relatedSlug);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: canonical("/blog") },
      { "@type": "ListItem", position: 3, name: p.title, item: url },
    ],
  };

  const jsonLd: object[] = [breadcrumb];
  if (p.faqs?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.description,
    datePublished: p.date,
    url,
    mainEntityOfPage: url,
    publisher: { "@type": "Organization", name: "Mehfill.in", url: canonical("/") },
  });

  return (
    <main className="min-h-screen">
      {jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}
      <Navbar />
      <article className="mx-auto max-w-3xl px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45">
          <Link href="/" className="hover:text-terracotta">HOME</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-terracotta">BLOG</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">{p.title.toUpperCase()}</span>
        </nav>
        <time dateTime={p.date} className="mt-6 block text-[12px] font-semibold tracking-[0.14em] text-charcoal/45">
          {new Date(p.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
        </time>
        <h1 className="mt-3 font-serif font-light text-4xl md:text-5xl leading-[1.05] tracking-tight text-balance">
          {p.h1}
        </h1>
        <p className="mt-5 text-[16px] md:text-lg leading-relaxed text-charcoal/70">{p.intro}</p>

        {p.sections.map((s) => (
          <section key={s.h2} className="mt-10">
            <h2 className="font-serif font-light text-2xl md:text-3xl">{s.h2}</h2>
            {s.body.map((para, i) => (
              <p key={i} className="mt-4 leading-relaxed text-charcoal/70">{para}</p>
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

        {p.faqs && p.faqs.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif font-light text-2xl md:text-3xl">Frequently asked questions</h2>
            <div className="mt-5 divide-y divide-charcoal/10 border-y hairline">
              {p.faqs.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="cursor-pointer font-serif text-xl list-none flex items-center justify-between gap-4">
                    {f.q}
                    <span className="shrink-0 rounded-full border hairline px-2.5 py-1 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 pr-10 text-[15px] leading-relaxed text-charcoal/65">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 rounded-2xl border hairline bg-white/60 p-6 md:p-8">
          <h2 className="font-serif font-light text-2xl md:text-3xl">Ready to create yours?</h2>
          <p className="mt-3 leading-relaxed text-charcoal/70">
            Explore {p.relatedLabel} and publish a beautiful invitation link for WhatsApp in minutes.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/${p.relatedSlug}`}
              className="inline-flex items-center rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory hover:bg-espresso"
            >
              {landing ? `Explore ${p.relatedLabel}` : "Explore invitations"}
            </Link>
            <Link
              href="/demos"
              className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold bg-white/60 hover:border-charcoal/30"
            >
              View live demos
            </Link>
          </div>
        </section>
      </article>
      <CTA />
      <Footer />
    </main>
  );
}
