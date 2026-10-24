"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Menu,
  X,
  Plus,
  ArrowRight,
  Copy,
  Check,
  Eye,
  Pencil,
  Sparkles,
  Loader2,
  Link2,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  CreditCard,
  ShieldCheck,
  Layers,
  LogOut,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { PLANS } from "@/lib/plans";
import { getCatalogTemplate, CATALOG } from "@/lib/catalog";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { displayName } from "@/lib/displayName";
import { formatDateLong } from "@/lib/invitation";
import { useCurrency } from "@/components/i18n/CurrencyProvider";

type Tab = "invitations" | "orders" | "browse";

type InvitationRow = {
  id: string;
  template_slug: string;
  package: string;
  slug: string | null;
  status: string;
  content: Partial<import("@/lib/invitation").InvitationContent>;
  wedding_date?: string;
  created_at: string;
  order_id?: number | null;
};

type OrderRow = {
  id: number;
  created_at: string;
  plan: string;
  amount: number;
  status: string;
  txn_id?: string;
  razorpay_payment_id?: string;
  template_slug?: string;
};

type CustomRow = {
  id?: number;
  invitation_id?: string;
  status?: string;
  invitations?: { id?: string };
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
          <p className="font-serif text-2xl text-[#8B4828]">Loading your dashboard…</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTemplate = searchParams.get("template") || "";
  const { format: money } = useCurrency();
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [tab, setTab] = useState<Tab>("invitations");
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customs, setCustoms] = useState<CustomRow[]>([]);
  const [fetching, setFetching] = useState(false);
  const [creatingDraft, setCreatingDraft] = useState(false);

  // Resolve selected design from URL query (handles catalog slugs & aliases)
  const selectedTemplate = requestedTemplate ? getCatalogTemplate(requestedTemplate) : null;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (!data.session?.user) {
        const cb = requestedTemplate ? `/dashboard?template=${encodeURIComponent(requestedTemplate)}` : "/dashboard";
        router.push(`/login?callbackUrl=${encodeURIComponent(cb)}`);
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        const cb = requestedTemplate ? `/dashboard?template=${encodeURIComponent(requestedTemplate)}` : "/dashboard";
        router.push(`/login?callbackUrl=${encodeURIComponent(cb)}`);
      }
    });
    return () => subscription.unsubscribe();
  }, [router, requestedTemplate]);

  const startOrResumeDraft = async (templateSlug: string) => {
    const existing = invitations.find(
      (i) => i.template_slug === templateSlug && i.status === "draft"
    );
    if (existing) {
      router.push(`/dashboard/edit/${existing.id}`);
      return;
    }

    setCreatingDraft(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.invitationId) {
        router.push(`/dashboard/edit/${data.invitationId}`);
      } else {
        alert(data.error || "Could not initialize design draft. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setCreatingDraft(false);
    }
  };

  const loadAll = useCallback(async () => {
    setFetching(true);
    try {
      const [invRes, customRes, ordRes] = await Promise.all([
        fetch("/api/invitations", { cache: "no-store" }),
        fetch("/api/customisation", { cache: "no-store" }).catch(() => null),
        fetch("/api/my-orders", { cache: "no-store" }).catch(() => null),
      ]);
      if (invRes.ok) {
        const d = await invRes.json();
        setInvitations(d.invitations || []);
      }
      if (customRes?.ok) {
        const d = await customRes.json();
        setCustoms(d.requests || []);
      }
      const unified: OrderRow[] = ordRes?.ok
        ? (await ordRes.json()).orders?.map(
            (o: {
              id: number;
              plan?: string;
              package?: string;
              amount: number;
              status: string;
              created_at: string;
              template_slug?: string | null;
              razorpay_payment_id?: string | null;
            }) => ({
              id: o.id,
              plan: o.package || o.plan || "",
              amount: o.amount,
              status: o.status,
              created_at: o.created_at,
              template_slug: o.template_slug || undefined,
              razorpay_payment_id: o.razorpay_payment_id || undefined,
              txn_id: o.razorpay_payment_id || undefined,
            })
          ) || []
        : [];
      const supabase = createClient();
      const email = user?.email || "";
      const { data: upiRows } = email
        ? await supabase
            .from("upi_payments")
            .select("*")
            .or(`email.eq.${email},user_email.eq.${email}`)
            .order("created_at", { ascending: false })
        : { data: null };
      const norm = (s: string) =>
        s === "pending_verification" ? "pending" : s === "verified" ? "paid" : s;
      const legacy: OrderRow[] = (upiRows || []).filter((u) => {
        const uDay = new Date(u.created_at).toDateString();
        return !unified.some(
          (o) =>
            norm(o.status) === norm(String(u.status || "")) &&
            o.amount === (u.amount ?? -1) &&
            new Date(o.created_at).toDateString() === uDay
        );
      });
      setOrders(
        [...unified, ...legacy].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
    } catch {
      /* keep empty */
    } finally {
      setFetching(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center">
        <p className="font-serif text-2xl text-[#8B4828]">Loading your dashboard…</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "invitations", label: "My Invitations", count: invitations.length },
    { id: "orders", label: "Orders & Receipts", count: orders.length },
    { id: "browse", label: "Browse Catalog" },
  ];

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
          className="object-cover object-top opacity-25 brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FBF7F0]/90 via-[#FBF7F0]/95 to-[#FBF7F0]" />
      </div>

      {/* Luxury Glass Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-[#FBF7F0]/85 backdrop-blur-xl border-b border-[#E8DEC4]/60 shadow-[0_4px_20px_rgba(70,45,25,0.03)]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8 py-3.5">
          <Link href="/" className="flex items-center transition-transform hover:scale-[1.02]" aria-label="Mehfill.in — home">
            <span
              className="relative block w-[132px] shrink-0 overflow-hidden sm:w-[148px] md:w-[160px]"
              style={{ aspectRatio: "901 / 319" }}
            >
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

          {/* Desktop Tab Navigation */}
          <div className="hidden lg:flex items-center rounded-full bg-white/80 p-1 border border-[#DECFC0]/60 shadow-sm">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all ${
                  tab === t.id
                    ? "bg-[#8B4828] text-white shadow-sm"
                    : "text-[#695343] hover:text-[#2B1F17]"
                }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      tab === t.id ? "bg-white/20 text-white" : "bg-[#EFE8DC] text-[#7A6353]"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-[11px] uppercase tracking-wider text-[#9E6D4B] font-semibold">Welcome</span>
              <span className="text-xs font-bold text-[#2B1F17]">{displayName(user)}</span>
            </div>
            <button
              onClick={async () => { await createClient().auth.signOut(); router.push("/signed-out"); }}
              className="flex items-center gap-1.5 rounded-full border border-[#DECFC0] bg-white/70 px-4 py-2 text-[12px] font-bold text-[#7A6353] hover:border-[#8B4828] hover:text-[#8B4828] transition-all"
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
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-[#DECFC0]/60 bg-[#FBF7F0] px-5 py-4 flex flex-col gap-2.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setMobileMenu(false); }}
                className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-left text-xs font-bold ${
                  tab === t.id ? "bg-[#8B4828] text-white" : "bg-white/60 text-[#4A2F1B]"
                }`}
              >
                <span>{t.label}</span>
                {t.count !== undefined && <span>{t.count}</span>}
              </button>
            ))}
            <div className="border-t border-[#DECFC0]/40 pt-2 flex items-center justify-between">
              <span className="text-xs text-[#7A6353]">{user?.email}</span>
              <button
                onClick={async () => { await createClient().auth.signOut(); router.push("/signed-out"); }}
                className="rounded-full bg-[#8B4828] px-4 py-1.5 text-[11px] font-bold text-white"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Dashboard Body */}
      <div className="relative z-10 pt-28 pb-16 px-5 md:px-8 flex-1">
        <div className="mx-auto max-w-7xl">
          {/* Highlighted Selected Template (from Landing Page / Showcase) */}
          {selectedTemplate && (
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#DECFC0] bg-white/80 backdrop-blur-xl p-6 md:p-8 shadow-[0_12px_40px_rgba(110,75,45,0.08)]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedTemplate.image}
                    alt={selectedTemplate.name}
                    className="h-28 w-20 md:h-36 md:w-28 rounded-2xl object-cover shadow-md flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#8B4828] px-3 py-1 text-[11px] font-bold text-white tracking-wide uppercase">
                        Selected Design
                      </span>
                      <span className="text-xs font-semibold text-[#8B4828]">Base Price: ₹999</span>
                    </div>
                    <h2 className="mt-2 font-serif text-3xl md:text-4xl text-[#2B1F17]">{selectedTemplate.name}</h2>
                    <p className="mt-1 text-xs sm:text-sm text-[#695343] max-w-lg">{selectedTemplate.tagline}</p>
                    <p className="mt-2 text-xs text-[#8B4828] font-medium flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 text-[#2F6824]" />
                      Personalize all details step-by-step &amp; preview before payment
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => startOrResumeDraft(selectedTemplate.slug)}
                    disabled={creatingDraft}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#8B4828] px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_6px_20px_rgba(139,72,40,0.3)] hover:bg-[#72391F] transition-all disabled:opacity-50"
                  >
                    {creatingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Continue with This Design
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <a
                    href={`/site-${selectedTemplate.slug.startsWith("luxury-ivory-reception") ? "8" : selectedTemplate.slug === "royal-marigold" ? "1" : selectedTemplate.slug === "rose-royale" ? "2" : selectedTemplate.slug === "nikah-emerald" ? "3" : selectedTemplate.slug === "midnight-gold" ? "4" : selectedTemplate.slug === "botanical-sage" ? "5" : selectedTemplate.slug === "blush-garden" ? "6" : "7"}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#DECFC0] bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-[#FBF7F0]"
                  >
                    <Eye className="h-4 w-4" /> Preview Live Demo
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Welcome Greeting & Quick Stats */}
          {tab !== "browse" && (
            <section className="mb-10 overflow-hidden rounded-[2rem] border border-[#DECFC0]/80 bg-white/70 backdrop-blur-xl shadow-sm">
              <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">
                    CLIENT WORKSPACE
                  </span>
                  <h1 className="mt-1 font-serif font-light text-3xl md:text-5xl leading-tight text-[#2B1F17]">
                    Welcome, <span className="italic font-normal text-[#8B4828]">{displayName(user).split(" ")[0]}</span>
                  </h1>
                  <p className="mt-2 max-w-lg text-xs sm:text-sm text-[#695343] leading-relaxed">
                    {invitations.length === 0
                      ? "Your celebration starts here — pick a design, personalize your details, and bring your invitation to life."
                      : invitations.some((i) => i.status !== "published")
                        ? "You have draft invitations ready to be published. Finish adding photos and details anytime."
                        : "All your invitations are live and active! Share the links with family and friends."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => setTab("browse")}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#8B4828] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#72391F] transition-all"
                    >
                      <Plus className="h-4 w-4" /> Create New Invitation
                    </button>
                    {invitations.length > 0 && (
                      <button
                        onClick={() => setTab("invitations")}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#DECFC0] bg-white/80 px-5 py-3 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-white"
                      >
                        <Layers className="h-4 w-4 text-[#8B4828]" /> My Invitations ({invitations.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 md:w-[340px]">
                  {[
                    { label: "Invitations", value: invitations.length, icon: Layers },
                    { label: "Live Pages", value: invitations.filter((i) => i.status === "published").length, icon: Eye },
                    { label: "Orders", value: orders.length, icon: CreditCard },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl border border-[#DECFC0]/60 bg-white/90 p-4 text-center shadow-xs">
                      <s.icon className="mx-auto h-4 w-4 text-[#8B4828] opacity-80 mb-1" />
                      <p className="font-serif text-3xl font-normal text-[#2B1F17]">{s.value}</p>
                      <p className="mt-0.5 text-[10px] font-bold tracking-[0.1em] text-[#7A6353] uppercase">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Active Tab View */}
          {tab === "invitations" && (
            <InvitationsView
              invitations={invitations}
              customs={customs}
              fetching={fetching}
              onBrowse={() => setTab("browse")}
              onReload={loadAll}
            />
          )}
          {tab === "orders" && <OrdersView orders={orders} onBrowse={() => setTab("browse")} />}
          {tab === "browse" && <BrowseView onSelectTemplate={startOrResumeDraft} creatingDraft={creatingDraft} />}
        </div>
      </div>

      {/* Global Minimal Footer */}
      <footer className="relative z-10 w-full px-6 py-5 text-center text-xs text-[#7A6353]/80 border-t border-[#E8DEC4]/40">
        Crafted with love by <Link href="/" className="font-semibold text-[#8B4828] hover:underline">Mehfill.in</Link> · Beautiful digital wedding invitations
      </footer>
    </main>
  );
}

/* ───────────────────── My Invitations View ───────────────────── */

function InvitationsView({
  invitations,
  customs,
  fetching,
  onBrowse,
  onReload,
}: {
  invitations: InvitationRow[];
  customs: CustomRow[];
  fetching: boolean;
  onBrowse: () => void;
  onReload?: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 2-step confirmation state: null | { inv: InvitationRow; step: 1 | 2; busy: boolean; error: string }
  const [deleteTarget, setDeleteTarget] = useState<{
    inv: InvitationRow;
    step: 1 | 2;
    busy: boolean;
    error: string;
  } | null>(null);

  const customFor = (invId: string) =>
    customs.find((c) => c.invitation_id === invId || c.invitations?.id === invId);

  const copy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setDeleteTarget((prev) => (prev ? { ...prev, busy: true, error: "" } : null));
    try {
      const res = await fetch(`/api/invitations/${deleteTarget.inv.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Could not delete invitation.");
      }
      setDeleteTarget(null);
      if (onReload) onReload();
    } catch (e) {
      setDeleteTarget((prev) =>
        prev ? { ...prev, busy: false, error: e instanceof Error ? e.message : "Failed to delete." } : null
      );
    }
  };

  if (fetching && invitations.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-[#8B4828]" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#DECFC0] bg-white/80 backdrop-blur-xl px-6 py-16 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7EFE4] border border-[#EADBCA]">
          <Sparkles className="h-7 w-7 text-[#8B4828]" />
        </span>
        <h2 className="mt-5 font-serif text-3xl italic text-[#2B1F17]">No invitations yet</h2>
        <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-[#695343] leading-relaxed">
          Choose a design from our luxury catalog, customize the couple&apos;s story and events, and share with your guests.
        </p>

        <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3 text-left">
          {[
            { step: "01", title: "Select a Design", desc: "Browse 8 handcrafted themes designed for Indian weddings." },
            { step: "02", title: "Personalize", desc: "Add names, dates, events, photo gallery, music & RSVP." },
            { step: "03", title: "Publish & Share", desc: "Preview live, complete order (₹999), and send on WhatsApp." },
          ].map((s) => (
            <div key={s.step} className="rounded-2xl border border-[#DECFC0]/60 bg-white/90 p-4">
              <p className="font-serif text-2xl text-[#8B4828]">{s.step}</p>
              <p className="mt-1 font-semibold text-xs sm:text-sm text-[#2B1F17]">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[#7A6353]">{s.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onBrowse}
          className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#8B4828] px-8 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#72391F] transition-all"
        >
          Browse Designs <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">YOUR CELEBRATIONS</span>
          <h2 className="mt-1 font-serif text-3xl md:text-4xl text-[#2B1F17]">My Invitations</h2>
        </div>
        <button
          onClick={onBrowse}
          className="inline-flex items-center gap-2 rounded-xl bg-[#8B4828] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#72391F] transition-all"
        >
          <Plus className="h-4 w-4" /> New Invitation
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {invitations.map((inv) => {
          const t = getCatalogTemplate(inv.template_slug);
          const url = inv.slug ? `https://mehfill.in/i/${inv.slug}` : null;
          const custom = customFor(inv.id);
          const content = inv.content || {};
          const isLive = inv.status === "published";
          const isPaid = Boolean((inv as any).isPaid);

          return (
            <article key={inv.id} className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-4 p-5 sm:p-6">
                {t && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={t.image} alt={t.name} className="h-32 w-24 rounded-2xl object-cover flex-shrink-0 shadow-sm" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-2xl truncate text-[#2B1F17]">
                      {content.brideName || "Bride"} &amp; {content.groomName || "Groom"}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        isLive
                          ? "bg-[#EDF5E9] text-[#2F6824] border border-[#C5E1BB]"
                          : isPaid
                          ? "bg-[#EAF0F8] text-[#1B4E8B] border border-[#BBD2ED]"
                          : "bg-[#FDF3E5] text-[#A6621E] border border-[#F4D9B6]"
                      }`}
                    >
                      {isLive ? "LIVE" : isPaid ? "READY TO PUBLISH" : "DRAFT"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-[#695343]">
                    {t?.name} · <span className="capitalize">{inv.package === "premium" ? "Premium" : "Basic"}</span>
                  </p>
                  {content.weddingDate && (
                    <p className="mt-1 text-xs text-[#7A6353] flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-[#8B4828]" />
                      {formatDateLong(content.weddingDate)}
                    </p>
                  )}
                  {url && isLive && (
                    <p className="mt-1.5 font-mono text-[11px] text-[#8B4828] truncate">{url}</p>
                  )}

                  {inv.package === "premium" && (
                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#F7EFE4] px-2.5 py-0.5 text-[10px] font-bold text-[#8B4828]">
                      <Sparkles className="h-3 w-3" />
                      {custom
                        ? `Brief: ${String(custom.status).replace(/_/g, " ")}`
                        : "Premium brief pending"}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-[#DECFC0]/60 bg-[#FAF6EE]/50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/edit/${inv.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#8B4828] px-4 py-2 text-xs font-bold text-white hover:bg-[#72391F] transition-all"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit Details
                  </Link>

                  {!isPaid && (
                    <Link
                      href={`/checkout?template=${inv.template_slug}&package=${inv.package || "basic"}&invitationId=${inv.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#2B1F17] px-4 py-2 text-xs font-bold text-white hover:bg-[#4A2F1B] transition-all"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Complete Order (₹999)
                    </Link>
                  )}

                  {url && isLive && (
                    <>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#DECFC0] bg-white px-3.5 py-2 text-xs font-semibold hover:border-[#8B4828] text-[#2B1F17]"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Live
                      </a>
                      <button
                        onClick={() => copy(url, inv.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#DECFC0] bg-white px-3.5 py-2 text-xs font-semibold hover:border-[#8B4828] text-[#2B1F17]"
                      >
                        {copiedId === inv.id ? <Check className="h-3.5 w-3.5 text-[#2F6824]" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedId === inv.id ? "Copied" : "Copy Link"}
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`You're invited! 🎉\n\n${content.brideName} & ${content.groomName}\n\nOpen our wedding invitation:\n${url}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366]/15 text-[#14703c] px-3.5 py-2 text-xs font-bold hover:bg-[#25D366]/25"
                      >
                        <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </>
                  )}
                </div>

                {/* 2-step delete button */}
                <button
                  type="button"
                  onClick={() => setDeleteTarget({ inv, step: 1, busy: false, error: "" })}
                  className="inline-flex items-center gap-1 rounded-xl p-2 text-xs font-semibold text-[#A89484] hover:text-[#C53030] hover:bg-[#FBEBEB] transition-colors"
                  title="Delete Invitation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* 2-Step Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-[#DECFC0] bg-white p-6 sm:p-8 shadow-2xl text-center">
            {/* Step 1: First Confirmation */}
            {deleteTarget.step === 1 && (
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030]">
                  <AlertTriangle className="h-7 w-7 text-[#C53030]" />
                </div>
                <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-widest text-[#C53030]">
                  Step 1 of 2 · Delete Invitation
                </span>
                <h3 className="mt-1 font-serif text-2xl sm:text-3xl text-[#2B1F17]">
                  Are you sure?
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#695343] leading-relaxed">
                  Do you really want to delete the invitation for{" "}
                  <b>
                    {deleteTarget.inv.content?.brideName || "Bride"} &amp;{" "}
                    {deleteTarget.inv.content?.groomName || "Groom"}
                  </b>
                  ? This will remove your draft details and photos.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-xl border border-[#DECFC0] bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-[#FAF6EE]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget((prev) => (prev ? { ...prev, step: 2 } : null))}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C53030] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#9B2C2C] shadow-sm"
                  >
                    Yes, continue <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Final Confirmation */}
            {deleteTarget.step === 2 && (
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9B2C2C] text-white shadow-md">
                  <Trash2 className="h-7 w-7" />
                </div>
                <span className="mt-3 inline-block text-[11px] font-bold uppercase tracking-widest text-[#9B2C2C]">
                  Final Step 2 of 2 · Confirmation
                </span>
                <h3 className="mt-1 font-serif text-2xl sm:text-3xl text-[#2B1F17]">
                  Are you absolutely sure?
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#9B2C2C] bg-[#FFF5F5] border border-[#FED7D7] rounded-xl p-3 leading-relaxed">
                  ⚠️ <b>This action cannot be undone.</b>
                  {deleteTarget.inv.status === "published"
                    ? " Your live invitation link will be taken offline permanently."
                    : " All your entered wedding events, gallery photos, and drafts will be permanently deleted."}
                </p>

                {deleteTarget.error && (
                  <p className="mt-3 text-xs text-[#C53030] font-semibold">{deleteTarget.error}</p>
                )}

                <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
                  <button
                    type="button"
                    disabled={deleteTarget.busy}
                    onClick={() => setDeleteTarget(null)}
                    className="rounded-xl border border-[#DECFC0] bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-[#4A2F1B] hover:bg-[#FAF6EE] disabled:opacity-50"
                  >
                    No, keep my invitation
                  </button>
                  <button
                    type="button"
                    disabled={deleteTarget.busy}
                    onClick={handleExecuteDelete}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C53030] px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#822727] shadow-md disabled:opacity-50"
                  >
                    {deleteTarget.busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Yes, permanently delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────── Orders & Receipts View ───────────────────── */

function OrdersView({ orders, onBrowse }: { orders: OrderRow[]; onBrowse: () => void }) {
  const { format: money } = useCurrency();
  if (orders.length === 0) {
    return (
      <div className="rounded-[2rem] border border-[#DECFC0] bg-white/80 backdrop-blur-xl px-6 py-20 text-center shadow-sm">
        <Package className="mx-auto h-12 w-12 text-[#A89484]" />
        <p className="mt-4 font-serif text-2xl italic text-[#695343]">No orders placed yet</p>
        <p className="mt-1 text-xs text-[#7A6353]">When you purchase or verify a wedding invitation, your invoices appear here.</p>
        <button
          onClick={onBrowse}
          className="mt-6 rounded-xl bg-[#8B4828] px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#72391F]"
        >
          Browse Designs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">FINANCIAL RECEIPTS</span>
          <h2 className="mt-1 font-serif text-3xl md:text-4xl text-[#2B1F17]">Orders &amp; Payments</h2>
        </div>
      </div>

      <div className="rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md overflow-x-auto shadow-sm">
        <table className="w-full text-xs sm:text-sm min-w-[640px]">
          <thead>
            <tr className="text-[11px] tracking-wider uppercase text-[#7A6353] bg-[#F7EFE4]/60 border-b border-[#DECFC0]/60">
              <th className="py-3.5 pl-6 pr-4 font-bold text-left">Date</th>
              <th className="py-3.5 pr-4 font-bold text-left">Package</th>
              <th className="py-3.5 pr-4 font-bold text-left">Design</th>
              <th className="py-3.5 pr-4 font-bold text-left">Amount</th>
              <th className="py-3.5 pr-4 font-bold text-left">Transaction ID</th>
              <th className="py-3.5 pr-6 font-bold text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-[#DECFC0]/40 hover:bg-[#FAF6EE]/50 transition-colors">
                <td className="py-4 pl-6 text-[#695343]">
                  {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="py-4 pr-4 capitalize font-semibold text-[#2B1F17]">{o.plan}</td>
                <td className="py-4 pr-4 capitalize text-[#695343]">{o.template_slug || "—"}</td>
                <td className="py-4 pr-4 font-semibold text-[#2B1F17]">{money(o.amount)}</td>
                <td className="py-4 pr-4 font-mono text-[11px] text-[#7A6353]">{o.txn_id || o.razorpay_payment_id || "—"}</td>
                <td className="py-4 pr-6">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      o.status === "paid"
                        ? "bg-[#EDF5E9] text-[#2F6824] border border-[#C5E1BB]"
                        : o.status === "rejected" || o.status === "failed"
                        ? "bg-[#FBECE8] text-[#A63C26] border border-[#F3C4B8]"
                        : "bg-[#FDF3E5] text-[#A6621E] border border-[#F4D9B6]"
                    }`}
                  >
                    {String(o.status).replace(/_/g, " ").toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-[#7A6353]">
        UPI payments are verified within a few hours. Once confirmed, publishing your invitation unlocks immediately.
      </p>
    </div>
  );
}

/* ───────────────────── Browse Catalog View ───────────────────── */

function BrowseView({
  onSelectTemplate,
  creatingDraft,
}: {
  onSelectTemplate: (slug: string) => void;
  creatingDraft: boolean;
}) {
  const { format: money } = useCurrency();
  return (
    <div>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9E6D4B]">LUXURY INVITATION THEMES</span>
      <h2 className="mt-1 font-serif text-3xl md:text-4xl text-[#2B1F17] mb-8">Choose a new design</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATALOG.map((t) => (
          <article key={t.slug} className="group rounded-[1.8rem] border border-[#DECFC0] bg-white/90 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-lg transition-all">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.image}
                alt={t.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3 rounded-full bg-white/85 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-[#8B4828]">
                From {money(PLANS[0].price)}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-serif text-2xl text-[#2B1F17]">{t.name}</h3>
              <p className="mt-1 text-xs text-[#695343] line-clamp-2">{t.tagline}</p>

              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => onSelectTemplate(t.slug)}
                  disabled={creatingDraft}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#8B4828] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#72391F] transition-all disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Start With This Design
                </button>
                <a
                  href={`/site-${t.slug.startsWith("luxury-ivory-reception") ? "8" : t.slug === "royal-marigold" ? "1" : t.slug === "rose-royale" ? "2" : t.slug === "nikah-emerald" ? "3" : t.slug === "midnight-gold" ? "4" : t.slug === "botanical-sage" ? "5" : t.slug === "blush-garden" ? "6" : "7"}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#DECFC0] bg-white/70 py-2 text-xs font-semibold text-[#4A2F1B] hover:bg-white"
                >
                  <Eye className="h-3.5 w-3.5" /> View Demo Website
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
