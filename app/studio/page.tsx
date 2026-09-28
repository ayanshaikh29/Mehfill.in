import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Eye, ShoppingBag, IndianRupee, Clock } from "lucide-react";
import { createClient, isBackendConfigured, isAdminEmail } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import StudioLogin from "@/components/StudioLogin";
import SignOutButton from "@/components/SignOutButton";
import VerifyButton from "@/components/VerifyButton";
import { formatINR } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Hidden + unlisted: never link this page anywhere public.
export const metadata: Metadata = {
  title: "Studio — Mehfill.in",
  robots: { index: false, follow: false },
};

interface OrderRow {
  id: number;
  user_email: string | null;
  plan: string;
  amount: number;
  status: string;
  created_at: string;
}

interface UpiRow {
  id: number;
  user_email: string | null;
  plan: string;
  amount: number;
  customer_name: string;
  whatsapp: string;
  txn_id: string;
  screenshot_url: string | null;
  status: string;
  created_at: string;
  // Registration fields
  email: string | null;
  mobile: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  occasion: string | null;
  event_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  template_slug: string | null;
}

export default async function StudioPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return <StudioLogin />;
  if (!isAdminEmail(user.email)) {
    return (
      <main className="min-h-screen bg-charcoal text-ivory flex items-center justify-center px-5 text-center">
        <div>
          <p className="font-serif text-4xl italic">This studio is private.</p>
          <p className="mt-2 text-sm text-ivory/55">Signed in as {user.email} — no owner access.</p>
          <div className="mt-6 flex justify-center gap-3">
            <SignOutButton dark />
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[13px] font-bold">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Stats (graceful when backend isn't connected yet) ──
  let totalVisits = 0;
  let weekVisits = 0;
  let monthVisits = 0;
  let orders: OrderRow[] = [];
  let upi: UpiRow[] = [];
  let daily: { label: string; count: number }[] = [];
  let topPages: { path: string; count: number }[] = [];
  const connected = isBackendConfigured();

  if (connected) {
    try {
      const admin = createAdminClient();
      const now = Date.now();
      const [{ count: total }, { count: week }, { count: month }] = await Promise.all([
        admin.from("visits").select("*", { count: "exact", head: true }),
        admin.from("visits").select("*", { count: "exact", head: true }).gte("created_at", new Date(now - 7 * 864e5).toISOString()),
        admin.from("visits").select("*", { count: "exact", head: true }).gte("created_at", new Date(now - 30 * 864e5).toISOString()),
      ]);
      totalVisits = total ?? 0;
      weekVisits = week ?? 0;
      monthVisits = month ?? 0;

      const { data: orderRows } = await admin
        .from("orders")
        .select("id, user_email, plan, amount, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      orders = (orderRows as OrderRow[]) ?? [];

      const { data: upiRows } = await admin
        .from("upi_payments")
        .select("id, user_email, plan, amount, customer_name, whatsapp, txn_id, screenshot_url, status, created_at, email, mobile, city, state, pincode, occasion, event_date, venue_name, venue_address, template_slug")
        .order("created_at", { ascending: false })
        .limit(50);
      upi = (upiRows as UpiRow[]) ?? [];

      const { data: recent } = await admin
        .from("visits")
        .select("path, created_at")
        .gte("created_at", new Date(now - 14 * 864e5).toISOString())
        .order("created_at", { ascending: false })
        .limit(3000);
      const days: Record<string, number> = {};
      const pages: Record<string, number> = {};
      for (const v of recent ?? []) {
        const d = new Date(v.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        days[d] = (days[d] ?? 0) + 1;
        pages[v.path] = (pages[v.path] ?? 0) + 1;
      }
      daily = Object.entries(days).map(([label, count]) => ({ label, count })).slice(-14);
      topPages = Object.entries(pages)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    } catch {
      // Show empty dashboard rather than crash.
    }
  }

  const paid = orders.filter((o) => o.status === "paid");
  const upiPaid = upi.filter((o) => o.status === "paid");
  const upiPending = upi.filter((o) => o.status === "pending");
  const revenue = paid.reduce((s, o) => s + o.amount, 0) + upiPaid.reduce((s, o) => s + o.amount, 0);
  const pending = orders.filter((o) => o.status !== "paid").length + upiPending.length;
  const maxDay = Math.max(1, ...daily.map((d) => d.count));

  const cards = [
    { icon: Eye, label: "Total visits", value: String(totalVisits) },
    { icon: Clock, label: "Visits · last 7 / 30 days", value: `${weekVisits} / ${monthVisits}` },
    { icon: ShoppingBag, label: "Orders (paid / total)", value: `${paid.length} / ${orders.length}` },
    { icon: IndianRupee, label: "Revenue collected", value: formatINR(revenue) },
  ];

  return (
    <main className="min-h-screen bg-charcoal text-ivory">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.3em] text-champagne">MEHFILL · STUDIO</p>
            <h1 className="mt-1 font-serif font-light text-3xl md:text-4xl">Owner dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[13px] font-bold">
              <ArrowLeft className="h-4 w-4" /> Site
            </Link>
            <SignOutButton dark />
          </div>
        </div>

        {!connected && (
          <div className="mt-6 rounded-2xl border border-champagne/30 bg-champagne/10 p-6 text-sm leading-relaxed text-ivory/80">
            <p className="font-bold text-champagne-light">Backend not connected yet.</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Create a free project at supabase.com → copy URL + anon + service-role keys into <code>.env.local</code> (see <code>.env.example</code>).</li>
              <li>Run <code>supabase/schema.sql</code> in the Supabase SQL Editor.</li>
              <li>Supabase → Authentication → enable Google sign-in (needs a Google Cloud OAuth client).</li>
              <li>Razorpay dashboard → API keys into <code>.env.local</code> for payments.</li>
              <li>Set your email in <code>ADMIN_EMAILS</code>.</li>
            </ol>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <c.icon className="h-5 w-5 text-champagne" />
              <p className="mt-3 font-serif text-3xl">{c.value}</p>
              <p className="mt-1 text-[12px] tracking-wide text-ivory/55">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-[12px] font-bold tracking-[0.2em] text-ivory/50">VISITS · LAST 14 DAYS</p>
            {daily.length === 0 ? (
              <p className="mt-4 text-sm text-ivory/50">No visits logged yet.</p>
            ) : (
              <div className="mt-4 flex items-end gap-1.5 h-36">
                {daily.map((d) => (
                  <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5" title={`${d.label}: ${d.count}`}>
                    <div className="w-full rounded-t bg-champagne/80" style={{ height: `${Math.max(4, (d.count / maxDay) * 110)}px` }} />
                    <span className="text-[9px] text-ivory/40">{d.label.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-[12px] font-bold tracking-[0.2em] text-ivory/50">TOP PAGES</p>
            {topPages.length === 0 ? (
              <p className="mt-4 text-sm text-ivory/50">No data yet.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {topPages.map((p) => (
                  <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-ivory/80">{p.path}</span>
                    <span className="shrink-0 rounded-full bg-white/10 px-3 py-0.5 text-[12px] font-bold">{p.count}</span>
                  </li>
                ))}
              </ul>
            )}
            {pending > 0 && (
              <p className="mt-5 rounded-xl bg-champagne/15 px-4 py-3 text-[13px] text-champagne-light">
                {pending} unpaid / pending order{pending > 1 ? "s" : ""} need{pending > 1 ? "" : "s"} follow-up on WhatsApp.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-champagne/25 bg-champagne/[0.07] p-6 overflow-x-auto">
          <p className="text-[12px] font-bold tracking-[0.2em] text-champagne-light">UPI PAYMENTS · VERIFY MANUALLY</p>
          {upi.length === 0 ? (
            <p className="mt-4 text-sm text-ivory/50">No UPI submissions yet. After someone pays to your UPI ID and submits their transaction ID, it appears here as PENDING.</p>
          ) : (
            <table className="mt-4 w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="text-[11px] tracking-[0.15em] text-ivory/45">
                  <th className="pb-3 pr-4 font-bold">DATE</th>
                  <th className="pb-3 pr-4 font-bold">CUSTOMER</th>
                  <th className="pb-3 pr-4 font-bold">DESIGN</th>
                  <th className="pb-3 pr-4 font-bold">OCCASION</th>
                  <th className="pb-3 pr-4 font-bold">CITY / STATE</th>
                  <th className="pb-3 pr-4 font-bold">TXN ID</th>
                  <th className="pb-3 pr-4 font-bold">PLAN / AMT</th>
                  <th className="pb-3 pr-4 font-bold">STATUS</th>
                  <th className="pb-3 font-bold">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {upi.map((u) => (
                  <tr key={u.id} className="border-t border-white/8">
                    <td className="py-3 pr-4 text-ivory/70">{new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td className="py-3 pr-4">
                      <p className="text-ivory/85 font-semibold">{u.customer_name}</p>
                      {u.email && <p className="text-[11px] text-ivory/55">{u.email}</p>}
                      <a href={`https://wa.me/91${u.whatsapp.replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-champagne-light hover:underline">{u.whatsapp}</a>
                      {u.screenshot_url && (
                        <a href={u.screenshot_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-[12px] text-ivory/60 hover:underline">screenshot ↗</a>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-ivory/80 capitalize">{u.template_slug || "—"}</td>
                    <td className="py-3 pr-4 text-ivory/80 capitalize">{u.occasion || "—"}</td>
                    <td className="py-3 pr-4 text-ivory/80">
                      {u.city && `${u.city}`}
                      {u.city && u.state && ", "}
                      {u.state && `${u.state}`}
                    </td>
                    <td className="py-3 pr-4 font-mono text-[12px] text-ivory/80">{u.txn_id}</td>
                    <td className="py-3 pr-4 capitalize">{u.plan} · {formatINR(u.amount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${u.status === "paid" ? "bg-[#25D366]/20 text-[#7be3a3]" : u.status === "rejected" ? "bg-white/10 text-ivory/50" : "bg-champagne/20 text-champagne-light"}`}>
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      {u.status === "pending" ? (
                        <div className="flex gap-2">
                          <VerifyButton id={u.id} action="paid" />
                          <VerifyButton id={u.id} action="rejected" />
                        </div>
                      ) : (
                        <span className="text-[12px] text-ivory/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-4 text-[12px] text-ivory/45">Check the transaction ID in your UPI app (GPay/PhonePe history) before marking PAID. Opening the UPI app is never proof of payment.</p>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 overflow-x-auto">
          <p className="text-[12px] font-bold tracking-[0.2em] text-ivory/50">ORDERS · LATEST 50</p>
          {orders.length === 0 ? (
            <p className="mt-4 text-sm text-ivory/50">No orders yet. Share your demos — orders will appear here with revenue.</p>
          ) : (
            <table className="mt-4 w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-[11px] tracking-[0.15em] text-ivory/45">
                  <th className="pb-3 pr-4 font-bold">DATE</th>
                  <th className="pb-3 pr-4 font-bold">CUSTOMER</th>
                  <th className="pb-3 pr-4 font-bold">PLAN</th>
                  <th className="pb-3 pr-4 font-bold">AMOUNT</th>
                  <th className="pb-3 font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/8">
                    <td className="py-3 pr-4 text-ivory/70">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td className="py-3 pr-4 text-ivory/85">{o.user_email || "Guest (WhatsApp)"}</td>
                    <td className="py-3 pr-4 capitalize">{o.plan}</td>
                    <td className="py-3 pr-4">{formatINR(o.amount)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${o.status === "paid" ? "bg-[#25D366]/20 text-[#7be3a3]" : "bg-champagne/20 text-champagne-light"}`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
