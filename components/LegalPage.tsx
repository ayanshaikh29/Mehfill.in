"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Shared shell for all legal/policy pages — MEHFILL branding, readable,
// mobile-first, accessible heading structure.
export default function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-3xl px-5 md:px-8 py-10 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal/70 hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Mehfill
        </Link>
        <p className="eyebrow mt-8 text-terracotta">{eyebrow}</p>
        <h1 className="mt-3 font-serif font-light text-4xl md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-charcoal/55">Last updated: {updated}</p>
        <div className="legal-prose mt-8 rounded-[1.6rem] border hairline bg-white p-6 md:p-10">
          {children}
        </div>
        <p className="mt-6 text-center font-serif italic text-charcoal/50">
          More Than an Invitation. An Experience.
        </p>
      </div>
      <style jsx global>{`
        .legal-prose h2 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 500;
          margin: 2rem 0 0.75rem;
          line-height: 1.3;
        }
        .legal-prose h2:first-child {
          margin-top: 0;
        }
        .legal-prose p,
        .legal-prose li {
          font-size: 0.95rem;
          line-height: 1.75;
          color: rgba(28, 25, 23, 0.78);
        }
        .legal-prose p {
          margin: 0.75rem 0;
        }
        .legal-prose ul {
          list-style: disc;
          padding-left: 1.4rem;
          margin: 0.75rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .legal-prose a {
          color: #96522f;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .legal-prose code {
          background: #faf5eb;
          border: 1px solid rgba(28, 25, 23, 0.12);
          border-radius: 0.4rem;
          padding: 0.1rem 0.4rem;
          font-size: 0.85em;
        }
      `}</style>
    </main>
  );
}
