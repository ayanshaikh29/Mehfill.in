"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, ShoppingBag, IndianRupee, Clock, Menu, X, LogOut, CheckCircle, XCircle, ExternalLink, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/admin";
import { formatINR } from "@/lib/plans";

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

interface Visit {
  id: number;
  path: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "upi" | "users" | "visits">("overview");
  const [stats, setStats] = useState({ totalVisits: 0, weekVisits: 0, monthVisits: 0, totalOrders: 0, paidOrders: 0, revenue: 0, pendingCount: 0, totalUsers: 0 });
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [upi, setUpi] = useState<UpiRow[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [daily, setDaily] = useState<{ label: string; count: number }[]>([]);
  const [topPages, setTopPages] = useState<{ path: string; count: number }[]>([]);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      if (!u) { router.push("/admin/login?callbackUrl=/admin"); return; }
      if (!isAdminEmail(u.email)) {
        router.push("/admin/login?callbackUrl=/admin");
        return;
      }
      setUser(u);
      fetchAll();
      // Near-realtime: re-pull fresh data every 15s so new orders &
      // payments appear without a manual refresh.
      interval = setInterval(() => fetchAll(true), 15000);
    });
    return () => { if (interval) clearInterval(interval); };
  }, [router]);

  const fetchAll = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const now = Date.now();
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.status === 403) { router.push("/admin/login?callbackUrl=/admin"); return; }
      if (!res.ok) throw new Error("overview failed");
      const j = await res.json();

      const totalRes = { count: j.totalVisits ?? 0 };
      const weekRes = { count: j.weekVisits ?? 0 };
      const monthRes = { count: j.monthVisits ?? 0 };
      const orderRows = (j.orders ?? []) as OrderRow[];
      const upiRows = (j.upi ?? []) as UpiRow[];
      const visitRows = (j.visits ?? []) as Visit[];
      const recentRows = (j.recent ?? []) as { created_at: string }[];
      const pathRows = (j.paths ?? []) as { path: string }[];

      const ordersData = orderRows;
      const upiData = upiRows;
      const visitsData = visitRows;

      setOrders(ordersData);
      setUpi(upiData);
      setVisits(visitsData);

      // Unique users from orders + upi
      const emails = new Set<string>();
      ordersData.forEach(o => o.user_email && emails.add(o.user_email));
      upiData.forEach(o => (o.user_email || o.email) && emails.add((o.user_email || o.email) as string));

      const paid = [...ordersData.filter(o => o.status === "paid"), ...upiData.filter(o => o.status === "paid")];
      const revenue = paid.reduce((s, o) => s + o.amount, 0);
      const pending = ordersData.filter(o => o.status !== "paid").length + upiData.filter(o => o.status === "pending").length;

      setStats({
        totalVisits: totalRes.count ?? 0,
        weekVisits: weekRes.count ?? 0,
        monthVisits: monthRes.count ?? 0,
        totalOrders: ordersData.length + upiData.length,
        paidOrders: paid.length,
        revenue,
        pendingCount: pending,
        totalUsers: emails.size,
      });

      // Daily chart (last 14 days)
      const days: Record<string, number> = {};
      for (const v of recentRows) {
        const d = new Date(v.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        days[d] = (days[d] ?? 0) + 1;
      }
      setDaily(Object.entries(days).map(([label, count]) => ({ label, count })).slice(-14));

      // Top pages
      const pages: Record<string, number> = {};
      for (const v of pathRows) pages[v.path] = (pages[v.path] ?? 0) + 1;
      setTopPages(Object.entries(pages).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 8));

      // Users list (from orders)
      const userMap = new Map<string, { email: string; orders: number; spent: number; last: string }>();
      [...ordersData, ...upiData].forEach(o => {
        const em = o.user_email || (o as UpiRow).email;
        if (!em) return;
        const cur = userMap.get(em) || { email: em, orders: 0, spent: 0, last: o.created_at };
        cur.orders++;
        if (o.status === "paid") cur.spent += o.amount;
        if (new Date(o.created_at) > new Date(cur.last)) cur.last = o.created_at;
        userMap.set(em, cur);
      });
      setUsers([...userMap.values()].sort((a, b) => b.spent - a.spent));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const verifyPayment = async (id: number, status: "paid" | "rejected") => {
    if (!confirm(`Mark payment #${id} as ${status.toUpperCase()}?`)) return;
    setVerifying(id);
    try {
      const res = await fetch("/api/admin/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchAll();
    } finally {
      setVerifying(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-charcoal text-ivory flex items-center justify-center"><div className="font-serif text-2xl">Loading studio…</div></div>;

  const maxDay = Math.max(1, ...daily.map(d => d.count));
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "orders" as const, label: `Razorpay (${orders.length})` },
    { id: "upi" as const, label: `UPI Payments (${upi.length})` },
    { id: "users" as const, label: `Customers (${users.length})` },
    { id: "visits" as const, label: "Visits" },
  ];

  const cards = [
    { icon: Eye, label: "Total visits", value: String(stats.totalVisits) },
    { icon: Clock, label: "Visits · 7d / 30d", value: `${stats.weekVisits} / ${stats.monthVisits}` },
    { icon: ShoppingBag, label: "Payments (paid / total)", value: `${stats.paidOrders} / ${stats.totalOrders}` },
    { icon: IndianRupee, label: "Revenue", value: formatINR(stats.revenue) },
    { icon: Users, label: "Customers", value: String(stats.totalUsers) },
  ];

  return (
    <main className="min-h-screen bg-charcoal text-ivory">
      <header className="sticky top-0 z-40 bg-charcoal/95 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] text-champagne">MEHFILL · STUDIO</p>
              <h1 className="font-serif text-xl">Owner Dashboard</h1>
            </div>
            <button
              onClick={() => fetchAll(true)}
              title="Refresh now (auto-refreshes every 15s)"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-bold text-ivory/70 hover:border-white/40 hover:text-ivory"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
              </span>
              LIVE{lastUpdated ? ` · ${lastUpdated.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" })}` : ""}
            </button>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/" className="rounded-full border border-white/20 px-4 py-2 text-[12px] font-bold">View Site</Link>
            <button onClick={async () => { await createClient().auth.signOut(); router.push("/"); }} className="inline-flex items-center gap-2 rounded-full bg-ivory px-4 py-2 text-[12px] font-bold text-charcoal"><LogOut className="h-3.5 w-3.5" /> Logout</button>
          </div>
          <button className="lg:hidden" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        <div className="mx-auto max-w-7xl px-5 md:px-8 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-bold border transition-all ${activeTab === t.id ? "bg-ivory text-charcoal border-ivory" : "border-white/15 text-ivory/70 hover:border-white/40"}`}>
              {t.label}
            </button>
          ))}
        </div>
        {mobileMenu && (
          <div className="lg:hidden border-t border-white/10 px-5 py-3 flex gap-2">
            <Link href="/" className="rounded-full border border-white/20 px-4 py-2 text-[12px] font-bold">View Site</Link>
            <button onClick={async () => { await createClient().auth.signOut(); router.push("/"); }} className="rounded-full bg-ivory px-4 py-2 text-[12px] font-bold text-charcoal">Logout</button>
          </div>
        )}
      </header>

      <div className="mx-auto max-w-7xl px-5 md:px-8 py-8">
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {cards.map(c => (
                <div key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <c.icon className="h-5 w-5 text-champagne" />
                  <p className="mt-3 font-serif text-2xl md:text-3xl">{c.value}</p>
                  <p className="mt-1 text-[11px] tracking-wide text-ivory/55">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-[12px] font-bold tracking-[0.2em] text-ivory/50">VISITS · LAST 14 DAYS</p>
                {daily.length === 0 ? <p className="mt-4 text-sm text-ivory/50">No visits logged yet.</p> : (
                  <div className="mt-4 flex items-end gap-1.5 h-36">
                    {daily.map(d => (
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
                {topPages.length === 0 ? <p className="mt-4 text-sm text-ivory/50">No data yet.</p> : (
                  <ul className="mt-4 space-y-2.5">
                    {topPages.map(p => (
                      <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate text-ivory/80">{p.path}</span>
                        <span className="shrink-0 rounded-full bg-white/10 px-3 py-0.5 text-[12px] font-bold">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {stats.pendingCount > 0 && (
                  <button onClick={() => setActiveTab("upi")} className="mt-5 w-full rounded-xl bg-champagne/15 px-4 py-3 text-[13px] font-bold text-champagne-light hover:bg-champagne/25">
                    {stats.pendingCount} pending — verify now →
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 overflow-x-auto">
            <p className="text-[12px] font-bold tracking-[0.2em] text-ivory/50">RAZORPAY ORDERS</p>
            {orders.length === 0 ? <p className="mt-4 text-sm text-ivory/50">No Razorpay orders yet. UPI payments appear under the UPI Payments tab.</p> : (
              <table className="mt-4 w-full min-w-[640px] text-left text-sm">
                <thead><tr className="text-[11px] tracking-[0.15em] text-ivory/45">
                  <th className="pb-3 pr-4">DATE</th><th className="pb-3 pr-4">CUSTOMER</th><th className="pb-3 pr-4">PLAN</th><th className="pb-3 pr-4">AMOUNT</th><th className="pb-3">STATUS</th>
                </tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-t border-white/10">
                      <td className="py-3 pr-4 text-ivory/70">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                      <td className="py-3 pr-4">{o.user_email || "Guest"}</td>
                      <td className="py-3 pr-4 capitalize">{o.plan}</td>
                      <td className="py-3 pr-4">{formatINR(o.amount)}</td>
                      <td className="py-3"><span className={`rounded-full px-3 py-1 text-[11px] font-bold ${o.status === "paid" ? "bg-[#25D366]/20 text-[#7be3a3]" : "bg-champagne/20 text-champagne-light"}`}>{o.status.toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "upi" && (
          <div className="rounded-2xl border border-champagne/25 bg-champagne/[0.07] p-6 overflow-x-auto">
            <p className="text-[12px] font-bold tracking-[0.2em] text-champagne-light">UPI PAYMENTS · VERIFY MANUALLY{upi.some(u => u.status === "pending") ? ` · ${upi.filter(u => u.status === "pending").length} PENDING` : ""}</p>
            {upi.length === 0 ? <p className="mt-4 text-sm text-ivory/50">No UPI submissions yet.</p> : (
              <div className="mt-4 space-y-4">
                {upi.map(u => (
                  <div key={u.id} className="rounded-xl border border-white/10 bg-charcoal/60 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-lg">{u.customer_name}</p>
                        <p className="text-[13px] text-ivory/60">{u.email} · {u.mobile}</p>
                        <a href={`https://wa.me/91${u.whatsapp.replace(/\D/g, "").slice(-10)}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[13px] text-champagne-light hover:underline">
                          WhatsApp: {u.whatsapp} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${u.status === "paid" ? "bg-[#25D366]/20 text-[#7be3a3]" : u.status === "rejected" ? "bg-white/10 text-ivory/50" : "bg-champagne/20 text-champagne-light"}`}>{u.status.toUpperCase()}</span>
                    </div>
                    <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1.5 text-[13px]">
                      <p><span className="text-ivory/50">Design:</span> <span className="capitalize">{u.template_slug || "—"}</span></p>
                      <p><span className="text-ivory/50">Occasion:</span> {u.occasion || "—"}</p>
                      <p><span className="text-ivory/50">Event:</span> {u.event_date || "—"}</p>
                      <p><span className="text-ivory/50">Venue:</span> {u.venue_name || "—"}</p>
                      <p><span className="text-ivory/50">City:</span> {u.city || ""}{u.city && u.state ? ", " : ""}{u.state || ""} {u.pincode || ""}</p>
                      <p><span className="text-ivory/50">Plan:</span> <span className="capitalize">{u.plan}</span> · {formatINR(u.amount)}</p>
                      <p className="font-mono"><span className="text-ivory/50 font-sans">TXN:</span> {u.txn_id}</p>
                      <p><span className="text-ivory/50">Date:</span> {new Date(u.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                    </div>
                    {u.venue_address && <p className="mt-1.5 text-[13px] text-ivory/60">Address: {u.venue_address}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {u.screenshot_url && <a href={u.screenshot_url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-1.5 text-[12px] font-bold hover:border-white/50">View screenshot ↗</a>}
                      {u.status === "pending" && (
                        <>
                          <button disabled={verifying === u.id} onClick={() => verifyPayment(u.id, "paid")} className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/20 px-4 py-1.5 text-[12px] font-bold text-[#7be3a3] hover:bg-[#25D366]/30 disabled:opacity-50">
                            <CheckCircle className="h-3.5 w-3.5" /> {verifying === u.id ? "…" : "Mark Paid"}
                          </button>
                          <button disabled={verifying === u.id} onClick={() => verifyPayment(u.id, "rejected")} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-[12px] font-bold text-ivory/60 hover:bg-white/20 disabled:opacity-50">
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-[12px] text-ivory/45">Check the transaction ID in your UPI app history before marking PAID. Opening the UPI app is never proof of payment.</p>
          </div>
        )}

        {activeTab === "users" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 overflow-x-auto">
            <p className="text-[12px] font-bold tracking-[0.2em] text-ivory/50">CUSTOMERS ({users.length})</p>
            {users.length === 0 ? <p className="mt-4 text-sm text-ivory/50">No customers yet.</p> : (
              <table className="mt-4 w-full min-w-[640px] text-left text-sm">
                <thead><tr className="text-[11px] tracking-[0.15em] text-ivory/45">
                  <th className="pb-3 pr-4">EMAIL</th><th className="pb-3 pr-4">ORDERS</th><th className="pb-3 pr-4">SPENT</th><th className="pb-3">LAST ORDER</th>
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.email} className="border-t border-white/10">
                      <td className="py-3 pr-4">{u.email}</td>
                      <td className="py-3 pr-4">{u.orders}</td>
                      <td className="py-3 pr-4">{formatINR(u.spent)}</td>
                      <td className="py-3">{new Date(u.last).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "visits" && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 overflow-x-auto">
            <p className="text-[12px] font-bold tracking-[0.2em] text-ivory/50">RECENT VISITS ({visits.length})</p>
            {visits.length === 0 ? <p className="mt-4 text-sm text-ivory/50">No visits logged yet.</p> : (
              <table className="mt-4 w-full min-w-[480px] text-left text-sm">
                <thead><tr className="text-[11px] tracking-[0.15em] text-ivory/45">
                  <th className="pb-3 pr-4">TIME</th><th className="pb-3">PAGE</th>
                </tr></thead>
                <tbody>
                  {visits.slice(0, 50).map(v => (
                    <tr key={v.id} className="border-t border-white/10">
                      <td className="py-2.5 pr-4 text-ivory/70">{new Date(v.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
                      <td className="py-2.5 truncate">{v.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </main>
  );
}