"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { waLink } from "@/lib/contact";

function Content() {
  const params = useSearchParams();
  const order = params.get("order");
  return (
    <div className="w-full max-w-lg rounded-[2rem] border hairline bg-white p-8 md:p-10 text-center shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
      <CheckCircle2 className="mx-auto h-12 w-12 text-olive" />
      <h1 className="mt-4 font-serif font-light text-4xl md:text-5xl">Payment received.</h1>
      <p className="mt-3 text-charcoal/60 leading-relaxed">
        Thank you! Your invitation is now in our design queue.
        Share your names, photos and details on WhatsApp so we can begin.
      </p>
      {order && (
        <p className="mx-auto mt-4 w-fit rounded-full bg-cream px-5 py-2 text-[12px] font-bold tracking-[0.12em] text-charcoal/70">
          ORDER {order.slice(-10).toUpperCase()}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-2.5">
        <a
          href={waLink(`Hello! I just paid online for my Mehfill invitation${order ? ` (order ${order})` : ""}. Sharing my celebration details below.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal py-3.5 text-sm font-bold text-ivory hover:bg-espresso"
        >
          <WhatsAppIcon className="h-4 w-4" /> Share details on WhatsApp
        </a>
        <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border hairline py-3.5 text-sm font-bold">
          Back to home <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-ivory flex items-center justify-center px-5">
      <Suspense fallback={<p className="font-serif text-2xl italic">Loading…</p>}>
        <Content />
      </Suspense>
    </main>
  );
}
