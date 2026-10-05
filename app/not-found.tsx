import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This Mehfill page does not exist. Explore digital invitations for weddings and celebrations.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center px-5 text-center">
      <div>
        <p className="eyebrow text-terracotta">404</p>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-6xl">
          This celebration <span className="italic">is elsewhere.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-charcoal/60 leading-relaxed">
          The page you opened does not exist. Explore our digital invitations for weddings,
          Nikah, birthdays and engagements — or open a live demo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-charcoal px-7 py-3.5 text-sm font-semibold text-ivory"
          >
            Back to home
          </Link>
          <Link
            href="/demos"
            className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold"
          >
            View live demos
          </Link>
          <Link
            href="/digital-wedding-invitations"
            className="inline-flex items-center rounded-full border hairline px-7 py-3.5 text-sm font-semibold"
          >
            Digital wedding invitations
          </Link>
        </div>
      </div>
    </main>
  );
}
