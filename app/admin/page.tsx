"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  ShoppingBag,
  IndianRupee,
  Clock,
  Menu,
  X,
  LogOut,
  CheckCircle,
  XCircle,
  ExternalLink,
  Users,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/plans";
import { WhatsAppIcon } from "@/components/BrandIcons";

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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user ?? null;
      if (!u) { router.push("/admin/login?callbackUrl=/admin"); return; }
      const me = await fetch("/api/admin/me", { cache: "no-store" }).catch(() => null);
      const meData = me?.ok ? await me.json() : { admin: false };
      if (!meData.admin) {
        router.push("/admin/login?callbackUrl=/admin");
        return;
      }
      setUser(u);
      fetchAll();
      // Near-realtime: re-pull fresh data every 15s so new orders & payments appear without manual refresh.
      interval = setInterval(() => fetchAll(true), 15000);
    });
    return () => { if (interval) clearInterval(interval); };
  }, [router]);

  const fetchAll = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (res.status === 403) { router.push("/admin/login?callbackUrl=/admin"); return; }
      if (!res.ok) throw new Error("overview failed");
      const j = await res.json();

      const orderRows = (j.orders ?? []) as OrderRow[];
      const upiRows = (j.upi ?? []) as UpiRow[];
      const visitRows = (j.visits ?? []) as Visit[];
      const recentRows = (j.recent ?? []) as { created_at: string }[];
      const pathRows = (j.paths ?? []) as { path: string }[];

      setOrders(orderRows);
      setUpi(upiRows);
      setVisits(visitRows);

      const paidRazorpay = orderRows.filter(o => o.status === "paid");
      const paidUpi = upiRows.filter(u => u.status === "paid");
      const rzRevenue = paidRazorpay.reduce((sum, o) => sum + (o.amount || 0), 0);
      const upiRevenue = paidUpi.reduce((sum, u) => sum + (u.amount || 0), 0);
      const pendingUpi = upiRows.filter(u => u.status === "pending").length;

      // Unique customers set across orders + upi
      const customerEmails = new Set<string>();
      orderRows.forEach(o => { if (o.user_email) customerEmails.add(o.user_email.toLowerCase()); });
      upiRows.forEach(u => {
        if (u.email) customerEmails.add(u.email.toLowerCase());
        else if (u.user_email) customerEmails.add(u.user_email.toLowerCase());
      });

      setStats({
        totalVisits: j.totalVisits ?? 0,
        weekVisits: j.weekVisits ?? 0,
        monthVisits: j.monthVisits ?? 0,
        totalOrders: orderRows.length + upiRows.length,
        paidOrders: paidRazorpay.length + paidUpi.length,
        revenue: rzRevenue + upiRevenue,
        pendingCount: pendingUpi,
        totalUsers: customerEmails.size,
      });

      // 7-day daily traffic trend
      const days: { [k: string]: number } = {};
      const dayLabels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const k = d.toISOString().slice(0, 10);
        days[k] = 0;
        dayLabels.push(k);
      }
      recentRows.forEach(r => {
        const k = (r.created_at || "").slice(0, 10);
        if (k in days) days[k]++;
      });
      setDaily(dayLabels.map(k => {
        const d = new Date(k + "T00:00:00");
        return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), count: days[k] };
      }));

      // Top viewed pages
      const counts: { [p: string]: number } = {};
      pathRows.forEach(p => {
        const path = p.path || "/";
        counts[path] = (counts[path] || 0) + 1;
      });
      setTopPages(
        Object.entries(counts)
          .map(([path, count]) => ({ path, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

      // Customer rollup
      const userMap = new Map<string, { email: string; orders: number; spent: number; last: string }>();
      orderRows.forEach(o => {
        const em = (o.user_email || "guest").toLowerCase();
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
      if (res.ok) fetchAll(true);
    } finally {
      setVerifying(null);
    }
  };

  const syncOrder = async (orderId: number, forceMarkPaid = false) => {
    setVerifying(orderId);
    try {
      const res = await fetch("/api/admin/orders/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, forceMarkPaid }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        fetchAll(true);
        if (data.status === "paid") {
          alert(`Order #${orderId} verified as PAID!`);
        } else {
          alert(data.message || `Order #${orderId} status: ${data.status}`);
        }
      } else {
        alert(data.error || "Failed to sync order.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setVerifying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
        <p className="font-serif text-2xl text-[#8B4828]">Loading Mehfill Studio…</p>
      </div>
    );
  }

  const maxDay = Math.max(1, ...daily.map(d => d.count));
  const tabs = [
    { id: "overview" as const, label: "Overview", count: undefined },
    { id: "upi" as const, label: "UPI Verification", count: stats.pendingCount > 0 ? stats.pendingCount : upi.length, alert: stats.pendingCount > 0 },
    { id: "orders" as const, label: "Razorpay Orders", count: orders.length },
    { id: "users" as const, label: "Customers", count: users.length },
    { id: "visits" as const, label: "Live Traffic", count: undefined },
  ];

  const cards = [
    { icon: IndianRupee, label: "Total Revenue", value: formatINR(stats.revenue), sub: "Verified Gross Income" },
    { icon: ShoppingBag, label: "Completed Orders", value: `${stats.paidOrders} / ${stats.totalOrders}`, sub: `${stats.pendingCount} pending verification` },
    { icon: Users, label: "Active Customers", value: String(stats.totalUsers), sub: "Registered accounts" },
    { icon: Eye, label: "Total Site Visits", value: String(stats.totalVisits), sub: `${stats.weekVisits} this week` },
  ];

  const filteredUpi = upi.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.customer_name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.whatsapp || "").includes(q) ||
      (u.txn_id || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="relative min-h-screen bg-[#FBF7F0] text-[#2B1F17] flex flex-col justify-between">
      {/* Background Architectural Palace Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/images/hero/auth_palace_bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-20 brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF7F0]/90 via-[#FBF7F0]/95 to-[#FBF7F0]" />
      </div>

      {/* Luxury Glass Header */}
      <header className="sticky top-0 z-40 bg-[#FBF7F0]/85 backdrop-blur-xl border-b border-[#E8DEC4]/70 shadow-[0_4px_20px_rgba(70,45,25,0.03)]">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="transition-transform hover:scale-[1.02]">
              <span className="relative block w-[124px] sm:w-[140px]" style={{ aspectRatio: "901 / 319" }}>
                <Image
                  src="/logo-transparent.png"
                  alt="Mehfill.in"
                  width={452}
                  height={160}
                  priority
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </span>
            </Link>
            <div className="hidden sm:block border-l border-[#DECFC0] pl-3.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E6D4B]">STUDIO ADMIN</span>
              <p className="font-serif text-sm font-semibold text-[#2B1F17]">Owner Operations</p>
            </div>
            <button
              onClick={() => fetchAll(true)}
              title="Refresh now"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DECFC0] bg-white/70 px-3 py-1 text-[11px] font-bold text-[#695343] hover:border-[#8B4828] hover:text-[#8B4828] transition-all"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25D366]" />
              </span>
              LIVE {lastUpdated ? `· ${lastUpdated.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : ""}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/admin/platform"
              className="rounded-xl border border-[#DECFC0] bg-white/70 px-4 py-2 text-xs font-bold text-[#4A2F1B] hover:bg-white transition-all"
            >
              Invitations
            </Link>
            <Link
              href="/"
              target="_blank"
              className="rounded-xl border border-[#DECFC0] bg-white/70 px-4 py-2 text-xs font-bold text-[#4A2F1B] hover:bg-white transition-all inline-flex items-center gap-1"
            >
              View Site <ArrowUpRight className="h-3 w-3" />
            </Link>
            <button
              onClick={async () => { await createClient().auth.signOut(); router.push("/signed-out"); }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B4828] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#72391F] transition-all"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>

          <button
            className="lg:hidden rounded-xl border border-[#DECFC0] p-2 bg-white/70"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Menu"
          >
            {mobileMenu ? <X className="h-5 w-5 text-[#8B4828]" /> : <Menu className="h-5 w-5 text-[#2B1F17]" />}
          </button>
        </div>

        {/* Tab Pills */}
        <div className="mx-auto max-w-7xl px-5 md:px-8 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold border transition-all ${
                activeTab === t.id
                  ? "bg-[#8B4828] text-white border-[#8B4828] shadow-sm"
                  : "border-[#DECFC0] bg-white/70 text-[#695343] hover:border-[#8B4828] hover:text-[#2B1F17]"
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] ${
                    activeTab === t.id
                      ? "bg-white/20 text-white"
                      : t.alert
                      ? "bg-[#8B4828] text-white font-bold animate-pulse"
                      : "bg-[#EFE8DC] text-[#7A6353]"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile Dropdown */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-[#DECFC0]/60 bg-[#FBF7F0] px-5 py-3 flex gap-2">
            <Link href="/admin/platform" className="rounded-xl border border-[#DECFC0] bg-white px-3 py-1.5 text-xs font-bold text-[#4A2F1B]">Invitations</Link>
            <Link href="/" className="rounded-xl border border-[#DECFC0] bg-white px-3 py-1.5 text-xs font-bold text-[#4A2F1B]">Site</Link>
            <button onClick={async () => { await createClient().auth.signOut(); router.push("/signed-out"); }} className="rounded-xl bg-[#8B4828] px-3 py-1.5 text-xs font-bold text-white">Logout</button>
          </div>
        )}
      </header>

      {/* Main Admin Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 py-8 flex-1 w-full">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((c) => (
                <div key={c.label} className="rounded-[1.6rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6353]">{c.label}</span>
                    <c.icon className="h-4 w-4 text-[#8B4828]" />
                  </div>
                  <p className="mt-3 font-serif text-3xl md:text-4xl text-[#2B1F17]">{c.value}</p>
                  <p className="mt-1 text-[11px] text-[#7A6353]">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Traffic & Top Pages Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Daily Traffic Chart */}
              <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E6D4B]">PAST 7 DAYS</span>
                  <p className="text-xs font-semibold text-[#7A6353]">Visitor Traffic</p>
                </div>
                <div className="h-36 flex items-end gap-3 pt-4 border-b border-[#DECFC0]/40 pb-2">
                  {daily.map((d) => (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-bold text-[#8B4828]">{d.count}</span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#8B4828] to-[#C9A86A] transition-all"
                        style={{ height: `${Math.max(12, (d.count / maxDay) * 100)}%` }}
                      />
                      <span className="text-[10px] font-bold uppercase text-[#7A6353]">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Pages */}
              <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E6D4B]">POPULAR DESTINATIONS</span>
                  <p className="text-xs font-semibold text-[#7A6353]">Top Page Views</p>
                </div>
                <div className="space-y-2.5">
                  {topPages.map((p) => (
                    <div key={p.path} className="flex items-center justify-between rounded-xl bg-[#FAF6EE]/70 px-3.5 py-2.5 border border-[#DECFC0]/40">
                      <span className="font-mono text-xs text-[#2B1F17] truncate max-w-[280px]">{p.path}</span>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#8B4828] shadow-xs">{p.count} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Pending Verification Alert */}
            {stats.pendingCount > 0 && (
              <div className="rounded-[1.6rem] border border-[#F4D9B6] bg-[#FDF3E5] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8B4828] text-white">
                    <Clock className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-semibold text-[#2B1F17]">
                      {stats.pendingCount} UPI Payment{stats.pendingCount > 1 ? "s" : ""} Awaiting Verification
                    </h4>
                    <p className="text-xs text-[#695343]">
                      Customers are waiting for their invitation to unlock. Review transaction receipts promptly.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("upi")}
                  className="rounded-xl bg-[#8B4828] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#72391F]"
                >
                  Verify Now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* UPI PAYMENTS VERIFICATION TAB */}
        {activeTab === "upi" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">MANUAL PAYMENT AUDIT</span>
                <h2 className="mt-1 font-serif text-3xl text-[#2B1F17]">UPI Payment Submissions</h2>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A89484]" />
                <input
                  type="text"
                  placeholder="Search customer, phone, TXN…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#DECFC0] bg-white pl-10 pr-3.5 py-2 text-xs outline-none focus:border-[#8B4828]"
                />
              </div>
            </div>

            {filteredUpi.length === 0 ? (
              <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 p-12 text-center">
                <p className="font-serif text-2xl italic text-[#695343]">No UPI submissions found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUpi.map((u) => {
                  const isPending = u.status === "pending";
                  return (
                    <div
                      key={u.id}
                      className={`rounded-[1.8rem] border p-6 transition-all ${
                        isPending
                          ? "border-[#F4D9B6] bg-white/95 shadow-md ring-2 ring-[#8B4828]/20"
                          : "border-[#DECFC0] bg-white/85 shadow-sm"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-2xl text-[#2B1F17]">{u.customer_name}</h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                u.status === "paid"
                                  ? "bg-[#EDF5E9] text-[#2F6824] border border-[#C5E1BB]"
                                  : u.status === "rejected"
                                  ? "bg-[#FBECE8] text-[#A63C26] border border-[#F3C4B8]"
                                  : "bg-[#FDF3E5] text-[#A6621E] border border-[#F4D9B6]"
                              }`}
                            >
                              {u.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#695343]">
                            {u.email} · {u.mobile}
                          </p>
                          <a
                            href={`https://wa.me/91${u.whatsapp.replace(/\D/g, "").slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#14703c] hover:underline"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5" />
                            WhatsApp: {u.whatsapp} <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>

                        <div className="text-right">
                          <p className="font-serif text-2xl font-bold text-[#8B4828]">{formatINR(u.amount)}</p>
                          <p className="text-[11px] text-[#7A6353] capitalize">{u.plan} Package</p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-[#FAF6EE]/60 p-3.5 rounded-xl border border-[#DECFC0]/40">
                        <p><span className="text-[#7A6353]">Design:</span> <b className="capitalize text-[#2B1F17]">{u.template_slug || "—"}</b></p>
                        <p><span className="text-[#7A6353]">Occasion:</span> <b className="text-[#2B1F17]">{u.occasion || "—"}</b></p>
                        <p><span className="text-[#7A6353]">Event Date:</span> <b className="text-[#2B1F17]">{u.event_date || "—"}</b></p>
                        <p><span className="text-[#7A6353]">Venue:</span> <b className="text-[#2B1F17]">{u.venue_name || "—"}</b></p>
                        <p><span className="text-[#7A6353]">Location:</span> <b className="text-[#2B1F17]">{u.city || ""}{u.city && u.state ? ", " : ""}{u.state || ""} {u.pincode || ""}</b></p>
                        <p className="font-mono"><span className="text-[#7A6353] font-sans">TXN ID:</span> <b className="text-[#8B4828]">{u.txn_id}</b></p>
                        <p><span className="text-[#7A6353]">Submitted:</span> <b className="text-[#2B1F17]">{new Date(u.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</b></p>
                      </div>

                      {u.venue_address && (
                        <p className="mt-2 text-xs text-[#695343]">
                          <b>Address:</b> {u.venue_address}
                        </p>
                      )}

                      {/* Actions & Proof */}
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {u.screenshot_url && (
                          <a
                            href={u.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DECFC0] bg-white px-4 py-2 text-xs font-bold text-[#4A2F1B] hover:bg-[#FBF7F0]"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Payment Screenshot ↗
                          </a>
                        )}

                        {isPending && (
                          <>
                            <button
                              disabled={verifying === u.id}
                              onClick={() => verifyPayment(u.id, "paid")}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-5 py-2 text-xs font-bold text-[#0c3c1e] shadow-sm hover:brightness-95 disabled:opacity-50"
                            >
                              <CheckCircle className="h-4 w-4" /> {verifying === u.id ? "Verifying…" : "Approve & Mark Paid"}
                            </button>
                            <button
                              disabled={verifying === u.id}
                              onClick={() => verifyPayment(u.id, "rejected")}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-[#F3C4B8] bg-[#FBECE8] px-4 py-2 text-xs font-bold text-[#A63C26] hover:bg-[#FAD9D2] disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* RAZORPAY ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">GATEWAY TRANSACTIONS</span>
            <h2 className="mt-1 font-serif text-3xl text-[#2B1F17]">Razorpay Orders ({orders.length})</h2>

            <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md overflow-x-auto shadow-sm">
              <table className="w-full text-xs sm:text-sm min-w-[640px]">
                <thead>
                  <tr className="text-[11px] tracking-wider uppercase text-[#7A6353] bg-[#F7EFE4]/60 border-b border-[#DECFC0]/60">
                    <th className="py-3.5 pl-6 pr-4 font-bold text-left">Date</th>
                    <th className="py-3.5 pr-4 font-bold text-left">Customer</th>
                    <th className="py-3.5 pr-4 font-bold text-left">Package</th>
                    <th className="py-3.5 pr-4 font-bold text-left">Amount</th>
                    <th className="py-3.5 pr-4 font-bold text-left">Status</th>
                    <th className="py-3.5 pr-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-[#DECFC0]/40 hover:bg-[#FAF6EE]/50 transition-colors">
                      <td className="py-3.5 pl-6 text-[#695343]">
                        {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-[#2B1F17]">{o.user_email || "Guest"}</td>
                      <td className="py-3.5 pr-4 capitalize text-[#695343]">{o.plan}</td>
                      <td className="py-3.5 pr-4 font-bold text-[#2B1F17]">{formatINR(o.amount)}</td>
                      <td className="py-3.5 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            o.status === "paid"
                              ? "bg-[#EDF5E9] text-[#2F6824] border border-[#C5E1BB]"
                              : "bg-[#FDF3E5] text-[#A6621E] border border-[#F4D9B6]"
                          }`}
                        >
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 pr-6 text-right">
                        {o.status !== "paid" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              disabled={verifying === o.id}
                              onClick={() => syncOrder(o.id, false)}
                              className="rounded-lg border border-[#DECFC0] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#8B4828] hover:bg-[#FAF6EE] shadow-xs disabled:opacity-50"
                              title="Check status directly with Razorpay API"
                            >
                              {verifying === o.id ? "Checking…" : "Sync Gateway"}
                            </button>
                            <button
                              disabled={verifying === o.id}
                              onClick={() => {
                                if (confirm(`Mark order #${o.id} (₹${o.amount}) as PAID and unlock invitation for ${o.user_email}?`)) {
                                  syncOrder(o.id, true);
                                }
                              }}
                              className="rounded-lg bg-[#25D366] px-2.5 py-1 text-[11px] font-bold text-[#0c3c1e] hover:brightness-95 shadow-xs disabled:opacity-50"
                              title="Mark verified paid"
                            >
                              Mark Paid ✓
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-[#2F6824]">Verified ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">CLIENT DATABASE</span>
            <h2 className="mt-1 font-serif text-3xl text-[#2B1F17]">Registered Customers ({users.length})</h2>

            <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md overflow-x-auto shadow-sm">
              <table className="w-full text-xs sm:text-sm min-w-[640px]">
                <thead>
                  <tr className="text-[11px] tracking-wider uppercase text-[#7A6353] bg-[#F7EFE4]/60 border-b border-[#DECFC0]/60">
                    <th className="py-3.5 pl-6 pr-4 font-bold text-left">Email Address</th>
                    <th className="py-3.5 pr-4 font-bold text-left">Total Orders</th>
                    <th className="py-3.5 pr-4 font-bold text-left">Total Spent</th>
                    <th className="py-3.5 pr-6 font-bold text-left">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.email} className="border-b border-[#DECFC0]/40 hover:bg-[#FAF6EE]/50 transition-colors">
                      <td className="py-3.5 pl-6 font-semibold text-[#2B1F17]">{u.email}</td>
                      <td className="py-3.5 pr-4 text-[#695343]">{u.orders} order{u.orders > 1 ? "s" : ""}</td>
                      <td className="py-3.5 pr-4 font-bold text-[#8B4828]">{formatINR(u.spent)}</td>
                      <td className="py-3.5 pr-6 text-[#7A6353]">
                        {new Date(u.last).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISITS TAB */}
        {activeTab === "visits" && (
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">REALTIME TELEMETRY</span>
            <h2 className="mt-1 font-serif text-3xl text-[#2B1F17]">Recent Page Visits ({visits.length})</h2>

            <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md overflow-x-auto shadow-sm">
              <table className="w-full text-xs sm:text-sm min-w-[480px]">
                <thead>
                  <tr className="text-[11px] tracking-wider uppercase text-[#7A6353] bg-[#F7EFE4]/60 border-b border-[#DECFC0]/60">
                    <th className="py-3.5 pl-6 pr-4 font-bold text-left">Timestamp</th>
                    <th className="py-3.5 pr-6 font-bold text-left">Visited Route</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.slice(0, 50).map((v) => (
                    <tr key={v.id} className="border-b border-[#DECFC0]/40 hover:bg-[#FAF6EE]/50 transition-colors">
                      <td className="py-3 pl-6 text-[#695343]">
                        {new Date(v.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                      </td>
                      <td className="py-3 pr-6 font-mono text-xs text-[#2B1F17] truncate">{v.path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Global Minimal Footer */}
      <footer className="relative z-10 w-full px-6 py-5 text-center text-xs text-[#7A6353]/80 border-t border-[#E8DEC4]/40">
        Mehfill Studio Admin · Operating with real-time financial auditing &amp; payment controls
      </footer>
    </main>
  );
}