"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./BrandIcons";
import { PLANS, formatINR } from "@/lib/plans";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function PricingSection() {
  const router = useRouter();

  const orderNow = async () => {
    if (!isSupabaseConfigured()) {
      router.push("/login");
      return;
    }
    const { data } = await createClient().auth.getSession();
    if (data.session?.user) router.push("/dashboard");
    else router.push("/login?callbackUrl=" + encodeURIComponent("/dashboard"));
  };

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="text-center max-w-xl mx-auto">
          <p className="eyebrow text-terracotta">PRICING</p>
          <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl">Simple pricing, <span className="italic">unforgettable result.</span></h2>
          <p className="mt-4 text-charcoal/60">Launching offer prices for early celebrations. Sign in, pick your design, pay via UPI — or order on WhatsApp.</p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-[1.6rem] border p-8 ${
                  p.popular
                    ? "bg-charcoal text-ivory border-charcoal shadow-[0_24px_60px_rgba(28,25,23,0.25)]"
                    : "bg-white hairline"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-champagne px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] text-charcoal">
                    MOST POPULAR
                  </span>
                )}
                <p className={`font-serif text-2xl ${p.popular ? "text-champagne-light" : ""}`}>{p.name}</p>
                <p className={`mt-1 text-sm ${p.popular ? "text-ivory/60" : "text-charcoal/55"}`}>{p.blurb}</p>
                <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <p className="font-serif font-light text-5xl leading-none">{formatINR(p.price)}</p>
                  <div className="pb-0.5">
                    <p className={`text-sm line-through ${p.popular ? "text-ivory/45" : "text-charcoal/40"}`}>{formatINR(p.mrp)}</p>
                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${p.popular ? "bg-champagne text-charcoal" : "bg-olive/15 text-olive"}`}>
                      {Math.round((1 - p.price / p.mrp) * 100)}% OFF
                    </span>
                  </div>
                </div>
                <p className={`mt-2 text-[11px] font-bold tracking-[0.2em] ${p.popular ? "text-champagne" : "text-terracotta"}`}>LAUNCHING OFFER</p>
                <p className={`mt-1 text-[12px] font-bold tracking-[0.14em] ${p.popular ? "text-champagne" : "text-terracotta"}`}>
                  {p.delivery.toUpperCase()}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px]">
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.popular ? "text-champagne" : "text-terracotta"}`} />
                      <span className={p.popular ? "text-ivory/80" : "text-charcoal/75"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-col gap-2.5">
                  <button
                    onClick={orderNow}
                    className={`inline-flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-colors ${
                      p.popular ? "bg-ivory text-charcoal hover:bg-champagne-light" : "bg-charcoal text-ivory hover:bg-espresso"
                    }`}
                  >
                    {`Choose ${p.name} — ${formatINR(p.price)}`}
                  </button>
                  <a
                    href={waLink(`${WA_MSG_GENERAL} (Plan: ${p.name} ${formatINR(p.price)})`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 rounded-full border py-3.5 text-sm font-semibold transition-colors ${
                      p.popular ? "border-white/25 hover:border-white/50" : "hairline hover:border-charcoal/30"
                    }`}
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Order on WhatsApp
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <a
            href={waLink("Hello! I saw your pricing on Mehfill.in. Is the cost negotiable? I would like a better price for my invitation.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-6 py-3 text-sm font-bold text-[#14703c] hover:bg-[#25D366]/20"
          >
            <WhatsAppIcon className="h-4 w-4" /> Prices negotiable — chat on WhatsApp for a better deal
          </a>
        </div>
        <p className="mt-4 text-center text-[13px] text-charcoal/50">Pay directly via UPI — no gateway fees · GST invoice on request</p>
      </div>
    </section>
  );
}
