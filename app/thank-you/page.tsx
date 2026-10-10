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
      {/* Post-order feedback: after delivery, customers can share an honest
          review — published on /reviews only after verification. */}
      <div className="mt-5 w-full max-w-lg rounded-[1.4rem] border hairline bg-cream/60 p-6 text-center">
        <p className="font-serif text-xl">How was your Mehfill.in experience?</p>
        <p className="mt-2 text-[13px] leading-relaxed text-charcoal/60">
          Once your invitation arrives, share your honest feedback — it helps other families
          and appears on our reviews page after verification.
        </p>
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2.5">
          <a
            href={waLink(`Hello! I would like to share feedback on my Mehfill invitation experience${order ? ` (order ${order})` : ""}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border hairline bg-white px-6 py-3 text-[13px] font-bold hover:border-charcoal/30"
          >
            <WhatsAppIcon className="h-4 w-4" /> Share feedback
          </a>
          <Link href="/reviews" className="inline-flex items-center justify-center gap-2 rounded-full border hairline bg-white px-6 py-3 text-[13px] font-bold hover:border-charcoal/30">
            Read reviews <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-ivory flex flex-col items-center justify-center gap-0 px-5 py-10">
      <Suspense fallback={<p className="font-serif text-2xl italic">Loading…</p>}>
        <Content />
      </Suspense>
    </main>
  );
}
