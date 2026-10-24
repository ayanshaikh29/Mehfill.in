"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, ShieldCheck, Sparkles, Tag, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getPlan, formatINR, type Plan } from "@/lib/plans";
import { getCatalogTemplate, type CatalogTemplate } from "@/lib/catalog";
import { UPI_ID } from "@/lib/payment";
import { useT } from "@/components/i18n/I18nProvider";
import { useCurrency } from "@/components/i18n/CurrencyProvider";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

type Step = "summary" | "done";

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const templateSlug = params.get("template") || "";
  const packageId = params.get("package") || "basic";
  const invitationId = params.get("invitationId") || "";
  const t = useT();
  const { format: money, converted } = useCurrency();

  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<Step>("summary");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [contact, setContact] = useState({
    fullName: "",
    email: "",
    mobile: "",
    whatsapp: "",
  });

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponErr, setCouponErr] = useState("");

  // Manual UPI payment (posts to /api/upi-submit for admin verification)
  const [upiOpen, setUpiOpen] = useState(false);
  const [upiBusy, setUpiBusy] = useState(false);
  const [upiDone, setUpiDone] = useState(false);
  const [upiErr, setUpiErr] = useState("");
  const [upiForm, setUpiForm] = useState({ name: "", email: "", whatsapp: "", txnId: "" });
  const [upiShot, setUpiShot] = useState<File | null>(null);

  const template: CatalogTemplate | undefined = useMemo(
    () => getCatalogTemplate(templateSlug),
    [templateSlug]
  );
  const plan: Plan | undefined = useMemo(() => getPlan(packageId), [packageId]);

  const discount = coupon?.discountAmount ?? 0;
  // A 100% coupon is valid — payable may be ₹0 (no gateway call needed).
  const payable = plan ? Math.max(0, plan.price - discount) : 0;
  const isFree = payable === 0;

  const applyCoupon = async () => {
    if (!plan || !couponInput.trim()) return;
    setCouponBusy(true);
    setCouponErr("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), packageId: plan.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data?.error || "Could not apply coupon.");
      setCoupon({ code: data.coupon.code, discountAmount: data.coupon.discountAmount });
      setCouponInput("");
    } catch (e) {
      setCoupon(null);
      setCouponErr(e instanceof Error ? e.message : "Could not apply coupon.");
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponErr("");
    setCouponInput("");
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      if (!u) {
        router.replace(
          "/login?callbackUrl=" + encodeURIComponent("/checkout?" + params.toString())
        );
        return;
      }
      setContact({
        fullName: (u.user_metadata?.full_name as string) || "",
        email: u.email || "",
        mobile: (u.user_metadata?.mobile as string) || "",
        whatsapp: (u.user_metadata?.mobile as string) || "",
      });
      setUpiForm({
        name: (u.user_metadata?.full_name as string) || "",
        email: u.email || "",
        whatsapp: (u.user_metadata?.mobile as string) || "",
        txnId: "",
      });
      setChecking(false);
    });
  }, [router, params]);

  // Load Razorpay checkout.js once; payment call checks window.Razorpay at click time.
  useEffect(() => {
    if (typeof window === "undefined" || window.Razorpay) return;
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="font-serif text-2xl">{t("checkout.loading")}</p>
      </div>
    );
  }

  if (!template || !plan) {
    return (
      <main className="min-h-screen bg-ivory flex items-center justify-center px-5 text-center">
        <div>
          <p className="font-serif text-3xl italic">{t("checkout.notFound")}</p>
          <Link
            href="/templates"
            className="mt-5 inline-block rounded-full bg-charcoal px-7 py-3.5 text-sm font-bold text-ivory"
          >
            {t("checkout.browse")}
          </Link>
        </div>
      </main>
    );
  }

  const startRazorpay = async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: plan!.id,
          templateSlug: template!.slug,
          couponCode: coupon?.code || undefined,
          invitationId: invitationId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not start payment.");

      // 100% coupon — no gateway needed. The order is already fulfilled
      // server-side, so skip the Razorpay modal and go straight to the editor.
      if (data.free) {
        setStep("done");
        if (data.invitationId) {
          router.push(`/dashboard/edit/${data.invitationId}`);
        } else {
          router.push("/dashboard");
        }
        return;
      }

      if (!window.Razorpay) throw new Error("Payment window failed to load. Please refresh the page and try again.");

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amountPaise,
        currency: data.currency,
        name: "Mehfill.in",
        description: `${t("pricing.planNames." + plan!.id)} — ${template!.name}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: contact.fullName || undefined,
          email: contact.email || undefined,
          contact: contact.whatsapp || undefined,
        },
        theme: { color: "#96522f" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const vRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invitationId: invitationId || undefined,
            }),
          });
          const vData = await vRes.json().catch(() => ({}));
          if (!vRes.ok) {
            setErr(vData?.error || "Payment received but verification failed. Contact support with your payment ID.");
            setStep("summary");
            return;
          }
          setStep("done");
          const targetInviteId = vData.invitationId || invitationId;
          const orderRef = vData.orderId || response.razorpay_order_id;
          if (targetInviteId) {
            router.push(`/thank-you?order=${encodeURIComponent(orderRef || "")}&invitationId=${encodeURIComponent(targetInviteId)}`);
          } else {
            router.push(`/thank-you?order=${encodeURIComponent(orderRef || "")}`);
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", (resp: { error?: { description?: string } }) => {
        setErr(resp?.error?.description || "Payment failed. Please try again.");
        setBusy(false);
      });
      rzp.open();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not start payment.");
      setBusy(false);
    }
  };

  const submitUpi = async () => {
    setUpiErr("");
    const name = upiForm.name.trim();
    const digits = upiForm.whatsapp.replace(/\D/g, "");
    const txnId = upiForm.txnId.trim();
    if (!name) return setUpiErr(t("checkout.upiErrName"));
    if (digits.length !== 10) return setUpiErr(t("checkout.upiErrWa"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(upiForm.email.trim()))
      return setUpiErr(t("checkout.upiErrEmail"));
    if (!txnId) return setUpiErr(t("checkout.upiErrTxn"));
    if (!upiShot) return setUpiErr(t("checkout.upiErrShot"));

    setUpiBusy(true);
    try {
      const fd = new FormData();
      fd.set("plan", plan!.id);
      fd.set("amount", String(payable)); // INR base — server re-verifies it
      fd.set("customer_name", name);
      fd.set("whatsapp", digits);
      fd.set("txn_id", txnId);
      fd.set("email", upiForm.email.trim());
      fd.set("mobile", digits);
      fd.set("template_slug", template!.slug);
      if (coupon?.code) fd.set("coupon_code", coupon.code);
      fd.set("screenshot", upiShot);
      const res = await fetch("/api/upi-submit", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not submit. Please try again.");
      setUpiDone(true);
    } catch (e) {
      setUpiErr(e instanceof Error ? e.message : "Could not submit your payment.");
    } finally {
      setUpiBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-3xl px-5 md:px-8 py-8">
        <Link href="/templates" className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal/70 hover:text-charcoal">
          <ArrowLeft className="h-4 w-4" /> {t("checkout.back")}
        </Link>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-5xl">{t("checkout.title")}</h1>

        {/* Order summary */}
        <div className="mt-6 rounded-2xl border hairline bg-white overflow-hidden">
          <div className="flex gap-4 p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={template.image} alt={template.name} className="h-28 w-24 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold tracking-[0.18em] text-terracotta">
                {plan.id === "premium" ? t("checkout.tierPremium") : t("checkout.tierBasic")}
              </p>
              <p className="mt-1 font-serif text-2xl">{template.name}</p>
              <p className="text-sm text-charcoal/60">{t("checkout.pkgLine", { plan: t(`pricing.planNames.${plan.id}`), delivery: t(`pricing.plans.${plan.id}.delivery`) })}</p>
              <p className="mt-2 text-[13px] text-charcoal/55">{t(`pricing.plans.${plan.id}.tagline`)}</p>
            </div>
            <div className="text-right">
              {discount > 0 && (
                <p className="text-sm text-charcoal/40 line-through">{money(plan.price)}</p>
              )}
              <p className="font-serif text-3xl">{isFree ? t("checkout.free") : money(discount > 0 ? payable : plan.price)}</p>
              {converted && (
                <p className="text-[11.5px] text-charcoal/45">≈ {formatINR(discount > 0 ? payable : plan.price)}</p>
              )}
            </div>
          </div>

          <div className="border-t hairline px-5 py-4 grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] text-charcoal/45">{t("checkout.included")}</p>
              <ul className="mt-2 space-y-1.5">
                {plan.features.slice(0, 8).map((f, idx) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-charcoal/70">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-olive" /> {t(`pricing.plans.${plan.id}.features.f${idx}`)}
                  </li>
                ))}
                {plan.features.length > 8 && (
                  <li className="text-[12px] text-charcoal/45">{t("checkout.more", { n: plan.features.length - 8 })}</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] text-charcoal/45">{t("checkout.notIncluded")}</p>
              <ul className="mt-2 space-y-1.5">
                {plan.exclusions.map((f, idx) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-charcoal/50">
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full border border-charcoal/25" /> {t(`pricing.plans.${plan.id}.exclusions.x${idx}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t hairline px-5 py-4 space-y-3">
            {/* Coupon */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {coupon ? (
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-olive/40 bg-olive/10 px-4 py-2.5 text-sm">
                  <Tag className="h-4 w-4 shrink-0 text-olive" />
                  <span className="font-bold">{coupon.code}</span>
                  <span className="text-charcoal/60">{t("checkout.couponApplied", { price: money(coupon.discountAmount) })}</span>
                  <button onClick={removeCoupon} aria-label={t("checkout.couponRemoveAria")} className="ml-auto rounded-full p-1 hover:bg-charcoal/10">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-1 items-center gap-2 rounded-2xl border hairline bg-ivory px-4 py-2.5">
                    <Tag className="h-4 w-4 shrink-0 text-charcoal/40" />
                    <input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponErr("");
                      }}
                      placeholder={t("checkout.couponPlaceholder")}
                      aria-label={t("checkout.couponPlaceholder")}
                      className="w-full bg-transparent text-sm font-semibold uppercase tracking-wide outline-none"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={couponBusy || !couponInput.trim()}
                    className="rounded-2xl border hairline px-5 py-2.5 text-sm font-bold hover:border-charcoal/30 disabled:opacity-50"
                  >
                    {couponBusy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : t("checkout.couponApply")}
                  </button>
                </>
              )}
            </div>
            {couponErr && <p className="text-[13px] text-terracotta-deep">{couponErr}</p>}

            <div className="flex items-end justify-between pt-1">
              <div className="text-sm text-charcoal/55">
                {t("checkout.total")}
                {coupon && discount > 0 && (
                  <p className="text-[12px] text-olive font-semibold">
                    {t("checkout.couponApplied", { price: money(discount) })}
                  </p>
                )}
                <p className="text-[12px] text-charcoal/45">
                  {t("pricing.notePrefix")}{" "}
                  <Link href="/refund-policy" className="underline underline-offset-2 text-terracotta-deep">{t("pricing.refundPolicy")}</Link>,{" "}
                  <Link href="/terms-and-conditions" className="underline underline-offset-2 text-terracotta-deep">{t("checkout.terms")}</Link> &{" "}
                  <Link href="/privacy-policy" className="underline underline-offset-2 text-terracotta-deep">{t("checkout.privacy")}</Link>
                </p>
              </div>
              <div className="text-right">
                {discount > 0 && (
                  <p className="text-sm text-charcoal/40 line-through">{money(plan.price)}</p>
                )}
                <p className="font-serif text-4xl">{isFree ? t("checkout.free") : money(payable)}</p>
                {converted && <p className="text-[12px] text-charcoal/45">≈ {formatINR(payable)}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Premium notice */}
        {plan.id === "premium" && step === "summary" && (
          <div className="mt-4 rounded-2xl border border-champagne/50 bg-champagne/10 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-charcoal">
              <Sparkles className="h-4 w-4 text-terracotta" /> {t("checkout.premiumNoticeTitle")}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-charcoal/65">
              {t("checkout.premiumNoticeBody")}
            </p>
          </div>
        )}

        {err && (
          <div className="mt-4 rounded-2xl bg-terracotta/10 border border-terracotta/30 px-4 py-3 text-sm text-terracotta-deep">
            <p>{err}</p>
            {(err.includes("UPI") || err.includes("unavailable")) && (
              <div className="mt-3 rounded-xl bg-white/70 border border-terracotta/20 p-4">
                <p className="font-bold text-charcoal">{t("checkout.upiTitle")}</p>
                <p className="mt-1 text-[13px] text-charcoal/65">
                  {t("checkout.upiBody", { amount: formatINR(payable), upiId: UPI_ID })}
                </p>
                <p className="mt-2 text-[12px] text-charcoal/55">
                  {t("checkout.upiThen")}
                </p>
                <a
                  href={`https://wa.me/917499827349?text=${encodeURIComponent(`Hi Mehfill! I paid ${formatINR(payable)} for ${template?.name || "invitation"} (${plan?.name} package) via UPI. Txn ID: `)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-olive py-3 text-sm font-bold text-ivory hover:bg-espresso"
                >
                  {t("checkout.upiWa")}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Step: summary → pay with Razorpay */}
        {step === "summary" && (
          <div className="mt-5 rounded-2xl border hairline bg-white p-6">
            <p className="eyebrow text-terracotta">{t("checkout.paymentEyebrow")}</p>
            <div className="mt-4 space-y-3">
              <button
                onClick={startRazorpay}
                disabled={busy}
                className="w-full rounded-full bg-charcoal py-4 text-sm font-bold text-ivory hover:bg-espresso disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {isFree ? t("checkout.freeActivate") : t("checkout.paySecure", { price: formatINR(payable) })}
              </button>
              <p className="text-center text-[12px] text-charcoal/45">
                {t("checkout.secureNote")}
              </p>
            </div>
          </div>
        )}

        {/* Manual UPI payment — posts to /api/upi-submit for admin verification */}
        {step === "summary" && !isFree && !upiDone && (
          <div className="mt-4 rounded-2xl border hairline bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-charcoal">{t("checkout.upiManualTitle")}</p>
              {upiOpen && (
                <button
                  onClick={() => setUpiOpen(false)}
                  aria-label={t("checkout.couponRemoveAria")}
                  className="rounded-full p-1 hover:bg-charcoal/10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {!upiOpen ? (
              <>
                <p className="mt-1 text-[13px] text-charcoal/60">{t("checkout.upiThen")}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => setUpiOpen(true)}
                    className="flex-1 rounded-full border hairline py-3 text-sm font-bold hover:border-charcoal/30"
                  >
                    {t("checkout.upiAlt")}
                  </button>
                  <a
                    href={`https://wa.me/917499827349?text=${encodeURIComponent(`Hi Mehfill! I paid ${formatINR(payable)} for ${template?.name || "invitation"} (${plan?.name} package) via UPI. Txn ID: `)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-full bg-olive py-3 text-center text-sm font-bold text-ivory hover:bg-espresso"
                  >
                    {t("checkout.upiWa")}
                  </a>
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-bold tracking-[0.15em] text-charcoal/45">{t("checkout.upiName")}</span>
                    <input
                      value={upiForm.name}
                      onChange={(e) => setUpiForm((f) => ({ ...f, name: e.target.value }))}
                      autoComplete="name"
                      className="mt-1 w-full rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-charcoal/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold tracking-[0.15em] text-charcoal/45">{t("checkout.upiWaNumber")}</span>
                    <input
                      value={upiForm.whatsapp}
                      onChange={(e) => setUpiForm((f) => ({ ...f, whatsapp: e.target.value }))}
                      inputMode="numeric"
                      placeholder="98765 43210"
                      className="mt-1 w-full rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-charcoal/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold tracking-[0.15em] text-charcoal/45">{t("checkout.upiEmail")}</span>
                    <input
                      value={upiForm.email}
                      onChange={(e) => setUpiForm((f) => ({ ...f, email: e.target.value }))}
                      type="email"
                      autoComplete="email"
                      className="mt-1 w-full rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-charcoal/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-bold tracking-[0.15em] text-charcoal/45">{t("checkout.upiTxn")}</span>
                    <input
                      value={upiForm.txnId}
                      onChange={(e) => setUpiForm((f) => ({ ...f, txnId: e.target.value }))}
                      placeholder="T2610151234567890"
                      className="mt-1 w-full rounded-2xl border hairline bg-ivory px-4 py-3 font-mono text-sm outline-none focus:border-charcoal/40"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] font-bold tracking-[0.15em] text-charcoal/45">{t("checkout.upiShot")}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setUpiShot(e.target.files?.[0] ?? null)}
                    className="mt-1 block w-full text-sm text-charcoal/60 file:mr-3 file:rounded-full file:border file:border-charcoal/25 file:bg-white file:px-4 file:py-2 file:text-xs file:font-bold file:text-charcoal hover:file:border-charcoal/50"
                  />
                  <span className="mt-1 block text-[11.5px] text-charcoal/45">{t("checkout.upiShotHint")}</span>
                </label>
                {upiErr && (
                  <p className="rounded-xl bg-terracotta/10 px-3 py-2 text-[13px] text-terracotta-deep">{upiErr}</p>
                )}
                <button
                  onClick={submitUpi}
                  disabled={upiBusy}
                  className="w-full rounded-full bg-charcoal py-3.5 text-sm font-bold text-ivory hover:bg-espresso disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {upiBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("checkout.upiSubmitManual")}
                </button>
                <p className="text-[12px] text-charcoal/50">
                  {t("checkout.upiBody", { amount: formatINR(payable), upiId: UPI_ID })}
                </p>
              </div>
            )}
          </div>
        )}

        {step === "summary" && upiDone && (
          <div className="mt-5 rounded-2xl border border-olive/40 bg-olive/10 p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-olive/20">
              <Check className="h-6 w-6 text-olive" />
            </span>
            <h2 className="mt-3 font-serif text-2xl">{t("checkout.upiDoneTitle")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-charcoal/65">{t("checkout.upiDoneBody")}</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-full bg-charcoal px-7 py-3 text-sm font-bold text-ivory hover:bg-espresso"
            >
              {t("checkout.upiGoDash")}
            </Link>
          </div>
        )}

        {step === "done" && (
          <div className="mt-5 rounded-2xl border hairline bg-white p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-olive/15">
              <Check className="h-7 w-7 text-olive" />
            </span>
            <h2 className="mt-4 font-serif font-light text-3xl">{t("checkout.doneTitle")}</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-charcoal/60">
              {t("checkout.doneBody")}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  const t = useT();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ivory flex items-center justify-center">
          <p className="font-serif text-2xl">{t("common.loading")}</p>
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
