"use client";
import { useRouter } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./BrandIcons";
import { PLANS, formatINR } from "@/lib/plans";
import { waLink, WA_MSG_GENERAL } from "@/lib/contact";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useT } from "./i18n/I18nProvider";
import { useCurrency } from "./i18n/CurrencyProvider";

export default function PricingSection() {
  const router = useRouter();
  const t = useT();
  const { format: money } = useCurrency();

  const orderNow = async (planId: string) => {
    if (!isSupabaseConfigured()) {
      router.push("/login");
      return;
    }
    const { data } = await createClient().auth.getSession();
    const callback = `/templates?plan=${planId}`;
    if (data.session?.user) router.push(callback);
    else router.push("/login?callbackUrl=" + encodeURIComponent(callback));
  };

  const planName = (id: string) => t(`pricing.planNames.${id}`);
  const planDelivery = (id: string) => t(`pricing.plans.${id}.delivery`);
  const planFeature = (id: string, i: number) => t(`pricing.plans.${id}.features.f${i}`);
  const planExclusion = (id: string, i: number) => t(`pricing.plans.${id}.exclusions.x${i}`);

  const COMPARISON_ROWS: [string, boolean | string, boolean | string][] = [
    [t("pricing.comparison.rows.r1"), true, t("pricing.comparison.vStarting")],
    [t("pricing.comparison.rows.r2"), true, true],
    [t("pricing.comparison.rows.r3"), true, true],
    [t("pricing.comparison.rows.r4"), true, true],
    [t("pricing.comparison.rows.r5"), true, true],
    [t("pricing.comparison.rows.r6"), true, true],
    [t("pricing.comparison.rows.r7"), true, true],
    [t("pricing.comparison.rows.r8"), t("pricing.comparison.vPredefined"), t("pricing.comparison.vCustom")],
    [t("pricing.comparison.rows.r9"), false, t("pricing.comparison.vScope")],
    [t("pricing.comparison.rows.r10"), t("pricing.comparison.vTemplate"), t("pricing.comparison.vAgreed")],
    [t("pricing.comparison.rows.r11"), false, true],
    [t("pricing.comparison.rows.r12"), t("pricing.comparison.vSelfEdit"), t("pricing.comparison.vRounds")],
  ];

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="text-center max-w-xl mx-auto">
          <p className="eyebrow text-terracotta">{t("pricing.eyebrow")}</p>
          <h2 className="mt-4 font-serif font-light text-4xl md:text-6xl">
            {t("pricing.title")} <span className="italic">{t("pricing.accent")}</span>
          </h2>
          <p className="mt-4 text-charcoal/60">{t("pricing.sub")}</p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-7 max-w-4xl mx-auto">
          {PLANS.map((p, i) => {
            const isBasic = p.id === "basic";

            return (
              <Reveal key={p.id} delay={i * 0.12}>
                <div
                  className={`relative flex h-full flex-col rounded-[2rem] p-8 md:p-10 transition-all duration-500 ${
                    p.popular
                      ? "bg-charcoal text-ivory shadow-[0_25px_60px_rgba(28,25,23,0.22)] scale-[1.02]"
                      : "bg-white text-charcoal border hairline shadow-[0_10px_40px_rgba(28,25,23,0.06)]"
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3.5 left-8 rounded-full bg-champagne px-4 py-1 text-[11px] font-bold tracking-[0.14em] uppercase text-charcoal shadow-sm">
                      {t("pricing.popular")}
                    </span>
                  )}
                  <h3 className="font-serif text-3xl">{planName(p.id)}</h3>
                  <p className={`mt-1.5 text-sm ${p.popular ? "text-ivory/70" : "text-charcoal/65"}`}>
                    {isBasic ? "Instant self-service invitation builder" : "Bespoke custom invitation design service"}
                  </p>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-serif text-4xl md:text-5xl font-light">{money(p.price)}</span>
                    <span className={`text-sm line-through ${p.popular ? "text-ivory/40" : "text-charcoal/40"}`}>
                      {money(p.mrp)}
                    </span>
                  </div>
                  <p className={`mt-1 text-[12px] font-bold tracking-[0.14em] ${p.popular ? "text-champagne" : "text-terracotta"}`}>
                    {isBasic ? "GET DIGITAL INVITATION IN 5 MINS" : planDelivery(p.id).toUpperCase()}
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((_, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[13.5px]">
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.popular ? "text-champagne" : "text-terracotta"}`} />
                        <span className={p.popular ? "text-ivory/80" : "text-charcoal/75"}>{planFeature(p.id, idx)}</span>
                      </li>
                    ))}
                    {p.exclusions.map((_, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-[13px]">
                        <X className={`mt-0.5 h-4 w-4 shrink-0 ${p.popular ? "text-ivory/30" : "text-charcoal/25"}`} />
                        <span className={p.popular ? "text-ivory/40" : "text-charcoal/40"}>{planExclusion(p.id, idx)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Buttons: Basic has 'Get Digital Invitation in 5 Mins'; Custom has 'Order on WhatsApp' */}
                  <div className="mt-8 flex flex-col gap-2.5">
                    {isBasic ? (
                      <button
                        onClick={() => orderNow("basic")}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-charcoal text-ivory py-4 text-sm font-bold hover:bg-espresso transition-all shadow-md hover:scale-[1.01]"
                      >
                        <span>Get Digital Invitation in 5 Mins</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => orderNow("premium")}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ivory text-charcoal py-3.5 text-sm font-bold hover:bg-champagne-light transition-all shadow-md hover:scale-[1.01]"
                        >
                          <span>Get Custom Design ({money(p.price)})</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <a
                          href={waLink(`${WA_MSG_GENERAL} (Custom Design Package: Premium ${formatINR(p.price)})`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 py-3.5 text-sm font-semibold transition-colors hover:border-white/50 text-ivory"
                        >
                          <WhatsAppIcon className="h-4 w-4" /> Order Custom on WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Package comparison */}
        <Reveal className="mt-14 max-w-4xl mx-auto">
          <div className="rounded-[1.6rem] border hairline bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream/50 text-[11px] tracking-[0.14em] text-charcoal/50">
                  <th className="py-4 px-5 text-left font-bold">{t("pricing.comparison.feature")}</th>
                  <th className="py-4 px-5 text-left font-bold">{t("pricing.comparison.basic", { price: money(PLANS[0].price) })}</th>
                  <th className="py-4 px-5 text-left font-bold">{t("pricing.comparison.premium", { price: money(PLANS[1].price) })}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(([label, basic, premium]) => (
                  <tr key={String(label)} className="border-t border-charcoal/8">
                    <td className="py-3 px-5 text-charcoal/80">{label}</td>
                    <td className="py-3 px-5">
                      {typeof basic === "boolean" ? (
                        basic ? <Check className="h-4 w-4 text-olive" /> : <X className="h-4 w-4 text-charcoal/30" />
                      ) : (
                        <span className="text-[13px] text-charcoal/70">{basic}</span>
                      )}
                    </td>
                    <td className="py-3 px-5">
                      {typeof premium === "boolean" ? (
                        premium ? <Check className="h-4 w-4 text-olive" /> : <X className="h-4 w-4 text-charcoal/30" />
                      ) : (
                        <span className="text-[13px] font-semibold text-charcoal">{premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
