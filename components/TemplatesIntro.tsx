"use client";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { useT } from "./i18n/I18nProvider";
import { useCurrency } from "./i18n/CurrencyProvider";

export function TemplatesIntro() {
  const t = useT();
  const { format: money } = useCurrency();
  const basic = PLANS.find((p) => p.id === "basic")!;
  const premium = PLANS.find((p) => p.id === "premium")!;

  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 pt-28 pb-8">
      <Link href="/" className="text-sm font-semibold text-charcoal/60 hover:text-charcoal">
        {t("templates.back")}
      </Link>
      <p className="eyebrow mt-6 text-terracotta">{t("templates.eyebrow")}</p>
      <h1 className="mt-3 font-serif font-light text-4xl md:text-6xl">
        {t("templates.title")} <span className="italic">{t("templates.accent")}</span>
      </h1>
      <p className="mt-4 max-w-2xl text-charcoal/60">{t("templates.sub")}</p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-2xl">
        {[
          { plan: basic, name: t("pricing.planNames.basic"), note: t("templates.noteBasic") },
          { plan: premium, name: t("pricing.planNames.premium"), note: t("templates.notePremium") },
        ].map(({ plan, name, note }) => (
          <div
            key={plan.id}
            className={`rounded-2xl border p-5 ${
              plan.popular ? "bg-charcoal text-ivory border-charcoal" : "bg-white hairline"
            }`}
          >
            <p className={`text-[11px] font-bold tracking-[0.2em] ${plan.popular ? "text-champagne" : "text-terracotta"}`}>
              {name.toUpperCase()}
            </p>
            <p className="mt-1 font-serif text-3xl">{money(plan.price)}</p>
            <p className={`mt-1 text-[13px] ${plan.popular ? "text-ivory/65" : "text-charcoal/55"}`}>{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PremiumCta() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-5 md:px-8 pb-24">
      <div className="rounded-[1.6rem] border hairline bg-white p-8 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-terracotta" />
        <h2 className="mt-3 font-serif text-3xl">{t("templates.customTitle")}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/60">{t("templates.customSub")}</p>
        <Link
          href="/how-it-works"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-bold text-ivory hover:bg-espresso"
        >
          {t("templates.customCta")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
