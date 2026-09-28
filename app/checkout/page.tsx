"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Loader2, QrCode } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PLANS, formatINR } from "@/lib/plans";
import { TEMPLATES } from "@/lib/templates";
import { UPI_ID, upiPayLink, upiQrImage } from "@/lib/payment";
import { WhatsAppIcon } from "@/components/BrandIcons";
import PremiumSelect from "@/components/PremiumSelect";
import { waLink } from "@/lib/contact";

const OCCASIONS = ["Wedding", "Engagement", "Haldi", "Mehndi", "Sangeet", "Birthday", "Anniversary", "Baby Shower", "Housewarming", "Naming Ceremony", "Thread Ceremony", "Retirement", "Corporate Event", "Other"];
const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh", "Chandigarh", "Dadra & Nagar Haveli", "Daman & Diu", "Lakshadweep", "Puducherry"];

interface Item {
  templateId: string;
  planId: string;
  qty: number;
}

function CheckoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState<"details" | "pay" | "done">("details");
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [txn, setTxn] = useState("");
  const [shot, setShot] = useState<File | null>(null);

  const [f, setF] = useState({
    fullName: "", email: "", mobile: "", whatsapp: "",
    city: "", state: "", pincode: "", occasion: "",
    eventDate: "", venueName: "", venueAddress: "",
  });

  const items: Item[] = useMemo(() => {
    try {
      const raw = params.get("cart");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr.filter((x) => x.templateId && x.planId);
      }
      const plan = params.get("plan");
      const template = params.get("template");
      if (plan && template) return [{ templateId: template, planId: plan, qty: Number(params.get("qty") || 1) }];
    } catch { /* ignore */ }
    return [];
  }, [params]);

  const lines = items.map((it) => ({
    ...it,
    plan: PLANS.find((p) => p.id === it.planId),
    template: TEMPLATES.find((t) => t.slug === it.templateId),
  })).filter((l) => l.plan && l.template);

  const total = lines.reduce((s, l) => s + (l.plan?.price || 0) * l.qty, 0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      if (!u) {
        router.replace("/login?callbackUrl=" + encodeURIComponent("/checkout?" + params.toString()));
        return;
      }
      setUser(u);
      setF((prev) => ({
        ...prev,
        fullName: (u.user_metadata?.full_name as string) || "",
        email: u.email || "",
        mobile: (u.user_metadata?.mobile as string) || "",
        whatsapp: (u.user_metadata?.mobile as string) || "",
      }));
      setChecking(false);
    });
  }, [router, params]);

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const detailsValid =
    f.fullName.trim() && /.+@.+\..+/.test(f.email) &&
    f.mobile.replace(/\D/g, "").length === 10 &&
    f.whatsapp.replace(/\D/g, "").length === 10 &&
    f.occasion && f.eventDate && f.venueName.trim() && f.city.trim() && f.state;

  const copyId = async () => {
    try { await navigator.clipboard.writeText(UPI_ID); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txn.trim()) { setErr("Transaction ID is required"); return; }
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("plan", lines.map((l) => l.planId).join("+"));
      fd.set("amount", String(total));
      fd.set("customer_name", f.fullName.trim());
      fd.set("whatsapp", f.whatsapp.trim());
      fd.set("email", f.email.trim());
      fd.set("mobile", f.mobile.trim());
      fd.set("city", f.city.trim());
      fd.set("state", f.state);
      fd.set("pincode", f.pincode.trim());
      fd.set("occasion", f.occasion);
      fd.set("event_date", f.eventDate);
      fd.set("venue_name", f.venueName.trim());
      fd.set("venue_address", f.venueAddress.trim());
      fd.set("template_slug", lines.map((l) => l.templateId).join(","));
      fd.set("txn_id", txn.trim());
      if (shot) fd.set("screenshot", shot);
      const res = await fetch("/api/upi-submit", { method: "POST", body: fd });
      if (!res.ok) throw new Error("save failed");
      try { if (user) localStorage.removeItem(`mehfill_cart_${user.id}`); } catch { /* ignore */ }
      setStep("done");
    } catch {
      setErr("Could not save online — please send your transaction ID on WhatsApp instead.");
    } finally {
      setBusy(false);
    }
  };

  if (checking) return <div className="min-h-screen bg-ivory flex items-center justify-center"><p className="font-serif text-2xl">Loading checkout…</p></div>;

  if (lines.length === 0) {
    return (
      <main className="min-h-screen bg-ivory flex items-center justify-center px-5 text-center">
        <div>
          <p className="font-serif text-3xl italic">Your cart is empty.</p>
          <Link href="/dashboard" className="mt-5 inline-block rounded-full bg-charcoal px-7 py-3.5 text-sm font-bold text-ivory">Back to designs</Link>
        </div>
      </main>
    );
  }

  const note = `Mehfill ${lines.map((l) => l.plan?.name).join("+")} invitation`;

  return (
    <main className="min-h-screen bg-ivory">
      <div className="mx-auto max-w-3xl px-5 md:px-8 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal/70 hover:text-charcoal">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="mt-4 font-serif font-light text-4xl md:text-5xl">Checkout</h1>

        <div className="mt-6 rounded-2xl border hairline bg-white p-5">
          {lines.map((l) => (
            <div key={`${l.templateId}-${l.planId}`} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span><span className="font-bold capitalize">{l.template?.name}</span> · {l.plan?.name} × {l.qty}</span>
              <span className="font-bold">{formatINR((l.plan?.price || 0) * l.qty)}</span>
            </div>
          ))}
          <div className="mt-2 border-t hairline pt-3 flex justify-between font-bold text-lg">
            <span>Total to pay</span><span>{formatINR(total)}</span>
          </div>
        </div>

        {step === "details" && (
          <div className="mt-5 rounded-2xl border hairline bg-white p-6">
            <p className="eyebrow text-terracotta">STEP 1 · YOUR DETAILS</p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <input value={f.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Full name *" className="rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-terracotta" />
              <input value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="Email *" type="email" className="rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-terracotta" />
              <input value={f.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Mobile (10-digit) *" inputMode="numeric" className="rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-terracotta" />
              <input value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="WhatsApp (10-digit) *" inputMode="numeric" className="rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-terracotta" />
              <div className="sm:col-span-2"><PremiumSelect name="occasion" value={f.occasion} options={OCCASIONS.map((o) => ({ value: o, label: o }))} placeholder="Occasion *" onChange={(v) => set("occasion", v)} label="Occasion" /></div>
              <input value={f.eventDate} onChange={(e) => set("eventDate", e.target.value)} type="date" min={new Date().toISOString().split("T")[0]} className="rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-terracotta" />
              <input value={f.venueName} onChange={(e) => set("venueName", e.target.value)} placeholder="Venue name *" className="rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-terracotta" />
              <input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="City *" className="rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-terracotta" />
              <div><PremiumSelect name="state" value={f.state} options={STATES.map((s) => ({ value: s, label: s }))} placeholder="State *" onChange={(v) => set("state", v)} label="State" /></div>
              <input value={f.venueAddress} onChange={(e) => set("venueAddress", e.target.value)} placeholder="Full venue address" className="sm:col-span-2 rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-terracotta" />
              <input value={f.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Pincode" inputMode="numeric" className="rounded-2xl border hairline bg-ivory px-4 py-3 text-sm outline-none focus:border-terracotta" />
            </div>
            <button disabled={!detailsValid} onClick={() => setStep("pay")} className="mt-5 w-full rounded-full bg-charcoal py-4 text-sm font-bold text-ivory hover:bg-espresso disabled:opacity-40">
              Continue to Pay {formatINR(total)}
            </button>
          </div>
        )}

        {step === "pay" && (
          <div className="mt-5 rounded-2xl border hairline bg-white p-6">
            <p className="eyebrow text-terracotta">STEP 2 · PAY VIA UPI</p>
            <p className="mt-2 font-serif font-light text-4xl">{formatINR(total)}</p>
            <p className="mt-1 text-sm text-charcoal/60">Pay using GPay, PhonePe, Paytm or BHIM.</p>
            <a href={upiPayLink(total, note)} className="mt-5 flex items-center justify-center gap-2 rounded-full bg-charcoal py-4 text-[15px] font-bold text-ivory hover:bg-espresso">
              <WhatsAppIcon className="h-5 w-5" /> Pay via UPI
            </a>
            {!qrFailed && (
              <div className="mx-auto mt-4 w-fit rounded-2xl border hairline bg-ivory p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={upiQrImage(total, note)} alt="Scan to pay" width={180} height={180} loading="lazy" onError={() => setQrFailed(true)} className="h-[170px] w-[170px]" />
                <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-[0.15em] text-charcoal/50"><QrCode className="h-3.5 w-3.5" /> SCAN WITH ANY UPI APP</p>
              </div>
            )}
            <div className="mt-4 flex items-center gap-2 rounded-2xl border hairline bg-ivory px-4 py-3">
              <span className="flex-1 truncate font-mono text-sm font-bold">{UPI_ID}</span>
              <button onClick={copyId} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-[12px] font-bold hover:bg-sand">
                {copied ? <Check className="h-3.5 w-3.5 text-olive" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}
              </button>
            </div>

            <form onSubmit={submitTxn} className="mt-5 border-t hairline pt-5 flex flex-col gap-3">
              <p className="font-serif text-xl italic">Already paid? Submit your transaction ID.</p>
              <input required value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="UPI transaction ID (UTR) *" className="rounded-2xl border hairline bg-ivory px-4 py-3.5 text-sm outline-none focus:border-terracotta font-mono" />
              <label className="rounded-2xl border border-dashed hairline bg-ivory px-4 py-3.5 text-sm text-charcoal/60 cursor-pointer">
                {shot ? `Screenshot: ${shot.name}` : "Payment screenshot (optional)"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setShot(e.target.files?.[0] ?? null)} />
              </label>
              {err && <p className="text-sm text-terracotta-deep">{err}</p>}
              <button disabled={busy} className="rounded-full bg-charcoal py-4 text-sm font-bold text-ivory hover:bg-espresso disabled:opacity-60">
                {busy ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Submit for Verification"}
              </button>
              <button type="button" onClick={() => setStep("details")} className="text-[13px] font-semibold text-charcoal/55">← Edit details</button>
            </form>
          </div>
        )}

        {step === "done" && (
          <div className="mt-5 rounded-2xl border hairline bg-white p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-olive/15"><Check className="h-7 w-7 text-olive" /></span>
            <h2 className="mt-4 font-serif font-light text-3xl">Details received.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-charcoal/60">Payment <b>pending verification</b>. We will confirm on WhatsApp and begin your Mehfill.</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2.5 justify-center">
              <a href={waLink(`Hello! I paid ${formatINR(total)} via UPI for my Mehfill invitation. Txn ID: ${txn}. Name: ${f.fullName}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-7 py-3.5 text-sm font-bold text-ivory">
                <WhatsAppIcon className="h-4 w-4" /> Confirm on WhatsApp
              </a>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border hairline px-7 py-3.5 text-sm font-bold">Back to dashboard</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory flex items-center justify-center"><p className="font-serif text-2xl">Loading…</p></div>}>
      <CheckoutInner />
    </Suspense>
  );
}
