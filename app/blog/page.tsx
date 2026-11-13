import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { canonical } from "@/lib/seo";

const PAGE_URL = canonical("/blog");

export const metadata: Metadata = {
  title: "Blog — Invitation Wording, Tips & Guides",
  description:
    "Guides from Mehfill.in: how to send wedding invitations on WhatsApp, Nikah wording ideas, paper vs digital costs and practical celebration tips.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Mehfill.in Blog — Invitation Guides & Wording Ideas",
    description:
      "Practical guides for Indian celebrations — WhatsApp invitation tips, wording ideas and cost comparisons.",
    url: PAGE_URL,
    siteName: "Mehfill.in",
    locale: "en_IN",
    type: "website",
    images: [{ url: "/og-cover.png", width: 1200, height: 630, alt: "Mehfill.in blog" }],
  },
};

const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: canonical("/") },
    { "@type": "ListItem", position: 2, name: "Blog", item: PAGE_URL },
  ],
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Navbar />
      <article className="mx-auto max-w-3xl px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <nav aria-label="Breadcrumb" className="text-[12px] tracking-[0.14em] font-semibold text-charcoal/45">
          <Link href="/" className="hover:text-terracotta">HOME</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal/70">BLOG</span>
        </nav>
        <h1 className="mt-5 font-serif font-light text-4xl md:text-6xl leading-[1.02] tracking-tight text-balance">
          Guides for every invitation
        </h1>
        <p className="mt-5 text-[16px] md:text-lg leading-relaxed text-charcoal/70">
          Practical advice from the Mehfill studio — wording ideas, WhatsApp etiquette, cost comparisons
          and tips for Indian celebrations of every kind.
        </p>

        <ul className="mt-10 divide-y divide-charcoal/10 border-y hairline">
          {BLOG_POSTS.map((p) => (
            <li key={p.slug} className="py-7">
              <time dateTime={p.date} className="text-[12px] font-semibold tracking-[0.14em] text-charcoal/45">
                {new Date(p.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              <h2 className="mt-2 font-serif font-light text-2xl md:text-3xl leading-snug">
                <Link href={`/blog/${p.slug}`} className="hover:text-terracotta transition-colors">
                  {p.title}
                </Link>
              </h2>
              <p className="mt-2 leading-relaxed text-charcoal/65">{p.description}</p>
              <Link
                href={`/blog/${p.slug}`}
                className="mt-3 inline-block text-sm font-semibold text-terracotta-deep underline decoration-terracotta/30 underline-offset-4 hover:decoration-terracotta"
              >
                Read the guide
              </Link>
            </li>
          ))}
        </ul>
      </article>
      <CTA />
      <Footer />
    </main>
  );
}
