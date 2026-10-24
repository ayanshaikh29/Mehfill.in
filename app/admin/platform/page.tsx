"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Tag,
  Plus,
  Trash2,
  Power,
  Layers,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Check,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type InvRow = {
  id: string;
  owner_email: string | null;
  template_slug: string;
  package: string;
  slug: string | null;
  status: string;
  bride: string;
  groom: string;
  wedding_date: string;
  created_at: string;
};

type CustomRow = {
  id: number;
  status: string;
  brief: string;
  colour_prefs: string;
  admin_notes: string;
  revision_count: number;
  max_revisions: number;
  created_at: string;
  invitations?: { slug: string | null; content?: Record<string, unknown> };
};

const CUSTOM_STATUSES = [
  "requested",
  "in_progress",
  "preview_ready",
  "revision_requested",
  "approved",
  "published",
  "cancelled",
];

type CouponRow = {
  id: number;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_amount: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
  note: string;
  created_at: string;
};

export default function AdminPlatformPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<"invitations" | "customisation" | "coupons">("invitations");
  const [invitations, setInvitations] = useState<InvRow[]>([]);
  const [requests, setRequests] = useState<CustomRow[]>([]);
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New coupon form state
  const [ncCode, setNcCode] = useState("");
  const [ncType, setNcType] = useState<"percent" | "fixed">("percent");
  const [ncValue, setNcValue] = useState("");
  const [ncMin, setNcMin] = useState("");
  const [ncMaxUses, setNcMaxUses] = useState("");
  const [ncExpiry, setNcExpiry] = useState("");
  const [ncNote, setNcNote] = useState("");
  const [ncErr, setNcErr] = useState("");
  const [ncBusy, setNcBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [a, b, c] = await Promise.all([
        fetch("/api/admin/invitations", { cache: "no-store" }),
        fetch("/api/admin/customisation", { cache: "no-store" }),
        fetch("/api/admin/coupons", { cache: "no-store" }),
      ]);
      if (a.ok) setInvitations((await a.json()).invitations || []);
      if (b.ok) setRequests((await b.json()).requests || []);
      if (c.ok) setCoupons((await c.json()).coupons || []);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (!u) {
        router.push("/admin/login?callbackUrl=/admin/platform");
        return;
      }
      const me = await fetch("/api/admin/me", { cache: "no-store" }).catch(() => null);
      const meData = me?.ok ? await me.json() : { admin: false };
      if (!meData.admin) {
        router.push("/admin/login?callbackUrl=/admin/platform");
        return;
      }
      setReady(true);
      load();
    });
  }, [router, load]);

  const invAction = async (id: string, action: "publish" | "unpublish" | "suspend") => {
    await fetch("/api/admin/invitations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    load();
  };

  const customAction = async (id: number, status: string) => {
    await fetch("/api/admin/customisation", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  };

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setNcErr("");
    setNcBusy(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: ncCode,
          discountType: ncType,
          discountValue: Number(ncValue),
          minAmount: ncMin ? Number(ncMin) : undefined,
          maxUses: ncMaxUses ? Number(ncMaxUses) : undefined,
          expiresAt: ncExpiry ? new Date(ncExpiry).toISOString() : undefined,
          note: ncNote,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not create coupon.");
      setNcCode(""); setNcValue(""); setNcMin(""); setNcMaxUses(""); setNcExpiry(""); setNcNote("");
      load();
    } catch (err) {
      setNcErr(err instanceof Error ? err.message : "Could not create coupon.");
    } finally {
      setNcBusy(false);
    }
  };

  const toggleCoupon = async (id: number, active: boolean) => {
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    load();
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this coupon?")) return;
    await fetch("/api/admin/coupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
        <p className="font-serif text-2xl text-[#8B4828]">Loading platform console…</p>
      </div>
    );
  }

  const filteredInvitations = invitations.filter((i) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (i.bride || "").toLowerCase().includes(q) ||
      (i.groom || "").toLowerCase().includes(q) ||
      (i.owner_email || "").toLowerCase().includes(q) ||
      (i.slug || "").toLowerCase().includes(q)
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
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DECFC0] bg-white/70 px-4 py-2 text-xs font-bold text-[#4A2F1B] hover:bg-white transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Studio Dashboard
            </Link>
            <div className="hidden sm:block border-l border-[#DECFC0] pl-3.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E6D4B]">OPERATIONS HUB</span>
              <p className="font-serif text-sm font-semibold text-[#2B1F17]">Platform Invitations &amp; Customization</p>
            </div>
          </div>

          <button
            onClick={load}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#DECFC0] bg-white px-4 py-2 text-xs font-bold text-[#4A2F1B] hover:border-[#8B4828] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin text-[#8B4828]" : ""}`} /> Refresh
          </button>
        </div>

        {/* Tab Pills */}
        <div className="mx-auto max-w-7xl px-5 md:px-8 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {(["invitations", "customisation", "coupons"] as const).map((t) => {
            const count = t === "invitations" ? invitations.length : t === "customisation" ? requests.length : coupons.length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold border capitalize transition-all ${
                  tab === t
                    ? "bg-[#8B4828] text-white border-[#8B4828] shadow-sm"
                    : "border-[#DECFC0] bg-white/70 text-[#695343] hover:border-[#8B4828]"
                }`}
              >
                {t === "invitations" ? "Invitations Directory" : t === "customisation" ? "Customisation Briefs" : "Promotional Coupons"}
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] ${
                    tab === t ? "bg-white/20 text-white" : "bg-[#EFE8DC] text-[#7A6353]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Body */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8 py-8 flex-1 w-full">
        {/* INVITATIONS DIRECTORY TAB */}
        {tab === "invitations" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">DATABASE RECORDS</span>
                <h2 className="mt-1 font-serif text-3xl text-[#2B1F17]">All Platform Invitations ({invitations.length})</h2>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A89484]" />
                <input
                  type="text"
                  placeholder="Filter couple, email, slug…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#DECFC0] bg-white pl-10 pr-3.5 py-2 text-xs outline-none focus:border-[#8B4828]"
                />
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md overflow-x-auto shadow-sm">
              <table className="w-full min-w-[860px] text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-[11px] tracking-wider uppercase text-[#7A6353] bg-[#F7EFE4]/60 border-b border-[#DECFC0]/60">
                    <th className="py-3.5 pl-6 pr-4 font-bold">Couple</th>
                    <th className="py-3.5 pr-4 font-bold">Client Email</th>
                    <th className="py-3.5 pr-4 font-bold">Design Theme</th>
                    <th className="py-3.5 pr-4 font-bold">Package</th>
                    <th className="py-3.5 pr-4 font-bold">Live URL</th>
                    <th className="py-3.5 pr-4 font-bold">Status</th>
                    <th className="py-3.5 pr-6 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.map((i) => (
                    <tr key={i.id} className="border-b border-[#DECFC0]/40 hover:bg-[#FAF6EE]/50 transition-colors">
                      <td className="py-4 pl-6">
                        <p className="font-semibold text-[#2B1F17]">{i.bride || "—"} &amp; {i.groom || "—"}</p>
                        <p className="text-[11px] text-[#7A6353]">{i.wedding_date || "No date set"}</p>
                      </td>
                      <td className="py-4 pr-4 text-[#695343]">{i.owner_email || "Guest User"}</td>
                      <td className="py-4 pr-4 capitalize font-semibold text-[#2B1F17]">{i.template_slug}</td>
                      <td className="py-4 pr-4 capitalize text-[#695343]">{i.package}</td>
                      <td className="py-4 pr-4 font-mono text-xs">
                        {i.slug ? (
                          <a href={`/i/${i.slug}`} target="_blank" rel="noopener noreferrer" className="text-[#8B4828] font-bold hover:underline inline-flex items-center gap-1">
                            /i/{i.slug} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[#A89484]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            i.status === "published"
                              ? "bg-[#EDF5E9] text-[#2F6824] border border-[#C5E1BB]"
                              : i.status === "suspended"
                              ? "bg-[#FBECE8] text-[#A63C26] border border-[#F3C4B8]"
                              : "bg-[#FDF3E5] text-[#A6621E] border border-[#F4D9B6]"
                          }`}
                        >
                          {i.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-2">
                          {i.status !== "published" ? (
                            <button
                              onClick={() => invAction(i.id, "publish")}
                              className="inline-flex items-center gap-1 rounded-xl bg-[#25D366]/20 px-3 py-1 text-xs font-bold text-[#14703c] hover:bg-[#25D366]/30 transition-all"
                            >
                              <Eye className="h-3 w-3" /> Publish
                            </button>
                          ) : (
                            <button
                              onClick={() => invAction(i.id, "unpublish")}
                              className="inline-flex items-center gap-1 rounded-xl border border-[#DECFC0] bg-white px-3 py-1 text-xs font-bold text-[#695343] hover:bg-[#FAF6EE] transition-all"
                            >
                              <EyeOff className="h-3 w-3" /> Unpublish
                            </button>
                          )}
                          <button
                            onClick={() => invAction(i.id, "suspend")}
                            className="rounded-xl border border-[#F3C4B8] bg-[#FBECE8] px-3 py-1 text-xs font-bold text-[#A63C26] hover:bg-[#FAD9D2] transition-all"
                          >
                            Suspend
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredInvitations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#7A6353]">
                        No matching invitations found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOMISATION BRIEFS TAB */}
        {tab === "customisation" && (
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">BESPOKE CLIENT SERVICE</span>
            <h2 className="mt-1 font-serif text-3xl text-[#2B1F17]">Premium Customisation Requests ({requests.length})</h2>

            {requests.length === 0 ? (
              <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 p-12 text-center">
                <p className="font-serif text-2xl italic text-[#695343]">No customisation requests submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((r) => (
                  <article key={r.id} className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[#8B4828]" />
                          <h3 className="font-serif text-2xl text-[#2B1F17]">Customisation #{r.id}</h3>
                          <span className="rounded-full bg-[#FAF6EE] border border-[#DECFC0] px-2.5 py-0.5 text-[10px] font-bold text-[#8B4828] uppercase">
                            Revisions: {r.revision_count}/{r.max_revisions}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#7A6353]">
                          Submitted {new Date(r.created_at).toLocaleString("en-IN")}
                          {r.invitations?.slug && (
                            <> · <a className="text-[#8B4828] font-bold hover:underline" href={`/i/${r.invitations.slug}`} target="_blank" rel="noopener noreferrer">View Invitation ↗</a></>
                          )}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#FAF6EE] border border-[#DECFC0] px-3 py-1 text-xs font-bold text-[#8B4828] capitalize">
                        Status: {r.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="mt-4 rounded-xl bg-[#FAF6EE]/70 p-4 border border-[#DECFC0]/50">
                      <p className="text-xs font-semibold text-[#7A6353] uppercase tracking-wider mb-1">Customer Brief:</p>
                      <p className="text-xs sm:text-sm text-[#2B1F17] whitespace-pre-wrap">{r.brief}</p>
                    </div>

                    {r.colour_prefs && (
                      <p className="mt-2 text-xs text-[#695343]">
                        <b>Preferred Colours:</b> {r.colour_prefs}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-[#DECFC0]/40 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase text-[#7A6353] mr-2">Change Status:</span>
                      {CUSTOM_STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => customAction(r.id, s)}
                          disabled={s === r.status}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold border capitalize transition-all ${
                            s === r.status
                              ? "bg-[#8B4828] text-white border-[#8B4828] shadow-xs"
                              : "border-[#DECFC0] bg-white text-[#695343] hover:border-[#8B4828]"
                          }`}
                        >
                          {s.replace(/_/g, " ")}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROMOTIONAL COUPONS TAB */}
        {tab === "coupons" && (
          <div className="space-y-6">
            {/* Create New Coupon Form */}
            <form onSubmit={createCoupon} className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-[#8B4828]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">CAMPAIGN MANAGER</span>
              </div>
              <h3 className="font-serif text-2xl text-[#2B1F17] mb-4">Create Promotional Discount Code</h3>

              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">Coupon Code *</label>
                  <input
                    required
                    value={ncCode}
                    onChange={(e) => setNcCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WEDDING50"
                    className="w-full rounded-xl border border-[#DECFC0] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#2B1F17] outline-none focus:border-[#8B4828]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">Discount Value *</label>
                  <div className="flex gap-2">
                    <select
                      value={ncType}
                      onChange={(e) => setNcType(e.target.value as "percent" | "fixed")}
                      className="rounded-xl border border-[#DECFC0] bg-[#FAF6EE] px-2.5 py-2.5 text-xs sm:text-sm font-bold outline-none"
                    >
                      <option value="percent">% Off</option>
                      <option value="fixed">₹ Off</option>
                    </select>
                    <input
                      required
                      value={ncValue}
                      onChange={(e) => setNcValue(e.target.value.replace(/\D/g, ""))}
                      placeholder={ncType === "percent" ? "10" : "200"}
                      inputMode="numeric"
                      className="w-full rounded-xl border border-[#DECFC0] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none focus:border-[#8B4828]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">Min. Order Amount (₹)</label>
                  <input
                    value={ncMin}
                    onChange={(e) => setNcMin(e.target.value.replace(/\D/g, ""))}
                    placeholder="Optional (e.g. 999)"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-[#DECFC0] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none focus:border-[#8B4828]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">Max Redemptions</label>
                  <input
                    value={ncMaxUses}
                    onChange={(e) => setNcMaxUses(e.target.value.replace(/\D/g, ""))}
                    placeholder="Blank = Unlimited"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-[#DECFC0] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none focus:border-[#8B4828]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={ncExpiry}
                    onChange={(e) => setNcExpiry(e.target.value)}
                    className="w-full rounded-xl border border-[#DECFC0] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none focus:border-[#8B4828]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7A6353] mb-1">Internal Campaign Note</label>
                  <input
                    value={ncNote}
                    onChange={(e) => setNcNote(e.target.value)}
                    placeholder="e.g. Diwali festive campaign discount"
                    className="w-full rounded-xl border border-[#DECFC0] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#2B1F17] outline-none focus:border-[#8B4828]"
                  />
                </div>
              </div>

              {ncErr && <p className="mt-3 text-xs font-semibold text-[#A63C26]">{ncErr}</p>}

              <button
                type="submit"
                disabled={ncBusy}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#8B4828] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#72391F] transition-all disabled:opacity-50"
              >
                {ncBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create Coupon
              </button>
            </form>

            {/* Coupons Table */}
            <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md overflow-x-auto shadow-sm">
              <table className="w-full min-w-[760px] text-left text-xs sm:text-sm">
                <thead>
                  <tr className="text-[11px] tracking-wider uppercase text-[#7A6353] bg-[#F7EFE4]/60 border-b border-[#DECFC0]/60">
                    <th className="py-3.5 pl-6 pr-4 font-bold">Code</th>
                    <th className="py-3.5 pr-4 font-bold">Discount</th>
                    <th className="py-3.5 pr-4 font-bold">Min. Order</th>
                    <th className="py-3.5 pr-4 font-bold">Redeemed</th>
                    <th className="py-3.5 pr-4 font-bold">Expires</th>
                    <th className="py-3.5 pr-4 font-bold">Status</th>
                    <th className="py-3.5 pr-6 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => {
                    const expired = c.expires_at && new Date(c.expires_at).getTime() < Date.now();
                    return (
                      <tr key={c.id} className="border-b border-[#DECFC0]/40 hover:bg-[#FAF6EE]/50 transition-colors">
                        <td className="py-4 pl-6 font-mono font-bold text-xs sm:text-sm text-[#8B4828]">{c.code}</td>
                        <td className="py-4 pr-4 font-semibold text-[#2B1F17]">
                          {c.discount_type === "percent" ? `${c.discount_value}% Off` : `₹${c.discount_value} Off`}
                        </td>
                        <td className="py-4 pr-4 text-[#695343]">{c.min_amount ? `₹${c.min_amount}` : "No minimum"}</td>
                        <td className="py-4 pr-4 text-[#695343]">
                          {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : " (Unlimited)"}
                        </td>
                        <td className="py-4 pr-4 text-[#695343]">
                          {c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-IN") : "Never"}
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              !c.active
                                ? "bg-[#FBECE8] text-[#A63C26] border border-[#F3C4B8]"
                                : expired
                                ? "bg-[#FAF6EE] text-[#7A6353] border border-[#DECFC0]"
                                : "bg-[#EDF5E9] text-[#2F6824] border border-[#C5E1BB]"
                            }`}
                          >
                            {!c.active ? "DISABLED" : expired ? "EXPIRED" : "ACTIVE"}
                          </span>
                        </td>
                        <td className="py-4 pr-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleCoupon(c.id, !c.active)}
                              className="inline-flex items-center gap-1 rounded-xl border border-[#DECFC0] bg-white px-3 py-1 text-xs font-bold text-[#4A2F1B] hover:bg-[#FAF6EE]"
                            >
                              <Power className="h-3 w-3" /> {c.active ? "Disable" : "Enable"}
                            </button>
                            <button
                              onClick={() => deleteCoupon(c.id)}
                              className="rounded-xl border border-[#F3C4B8] bg-[#FBECE8] p-1.5 text-[#A63C26] hover:bg-[#FAD9D2]"
                              aria-label="Delete coupon"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#7A6353]">
                        No coupons found. Create your first promotional code above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-5 text-center text-xs text-[#7A6353]/80 border-t border-[#E8DEC4]/40">
        Mehfill Operations Console · Studio Platform Management
      </footer>
    </main>
  );
}
