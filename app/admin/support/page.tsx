"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  LifeBuoy,
  RefreshCw,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

type TicketRow = {
  id: number;
  ticket_ref: string;
  category: string;
  severity: "P1" | "P2" | "P3" | "P4";
  status: string;
  route: string | null;
  template_slug: string | null;
  description: string;
  ai_summary: string | null;
  screenshot_path: string | null;
  alert_status: string | null;
  incident_id: number | null;
  created_at: string;
  updated_at: string;
  incident?: { id: number; severity: string; alert_status: string; alert_count: number } | null;
};

const STATUSES = ["open", "investigating", "waiting_customer", "resolved", "closed"] as const;
const SEVERITIES = ["P1", "P2", "P3", "P4"] as const;

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  investigating: "Investigating",
  waiting_customer: "Waiting on customer",
  resolved: "Resolved",
  closed: "Closed",
};

const CATEGORY_LABEL: Record<string, string> = {
  question: "General question",
  howto: "How-to support",
  ui_minor: "Minor UI",
  functional_bug: "Functional bug",
  data_integrity: "Data integrity",
  auth_security: "Auth / security",
  payment: "Payment",
  outage: "Outage",
};

const SEV_CLASS: Record<string, string> = {
  P1: "bg-[#fde4e4] text-[#9b1c1c] border-[#f3b9b9]",
  P2: "bg-[#fdeedd] text-[#8a4b04] border-[#f0cba1]",
  P3: "bg-[#fdf6df] text-[#7a6112] border-[#ead9a0]",
  P4: "bg-[#eef0ea] text-[#565848] border-[#d8dbcd]",
};

const STATUS_CLASS: Record<string, string> = {
  open: "bg-[#fdeedd] text-[#8a4b04]",
  investigating: "bg-[#e9eefb] text-[#2f4c9b]",
  waiting_customer: "bg-[#f3edfd] text-[#5a3a9b]",
  resolved: "bg-[#e4f3e6] text-[#1f6b33]",
  closed: "bg-[#eceae7] text-[#57534e]",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminSupportPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [detail, setDetail] = useState<{
    ticket: TicketRow & { description: string; customer_notes: string[]; resolution_notes: string | null };
    messages: { role: string; content: string; created_at: string }[];
    screenshotUrl: string | null;
    incident: Record<string, unknown> | null;
    alertLog: { id: number; status: string; subject: string; error: string | null; created_at: string }[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailErr, setDetailErr] = useState("");
  const openedRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 400);
    return () => clearTimeout(t);
  }, [q]);

  const fetchList = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        if (severity) params.set("severity", severity);
        if (qDebounced) params.set("q", qDebounced);
        const res = await fetch(`/api/admin/support/tickets?${params.toString()}`, { cache: "no-store" });
        if (res.status === 403) {
          router.push("/admin/login?callbackUrl=/admin/support");
          return;
        }
        if (!res.ok) throw new Error("list failed");
        const data = await res.json();
        setTickets(data.tickets || []);
      } catch {
        /* keep previous list on transient errors */
      } finally {
        setLoading(false);
        setReady(true);
      }
    },
    [qDebounced, router, severity, status]
  );

  useEffect(() => {
    let alive = true;
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      if (!data.session) {
        router.push("/admin/login?callbackUrl=/admin/support");
        return;
      }
      const me = await fetch("/api/admin/me", { cache: "no-store" }).catch(() => null);
      const meData = me?.ok ? await me.json() : { admin: false };
      if (!meData.admin) {
        router.push("/admin/login?callbackUrl=/admin/support");
        return;
      }
      void fetchList();
    });
    const iv = setInterval(() => fetchList(true), 30000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [fetchList, router]);

  const openDetail = useCallback(async (id: number) => {
    setSelected(id);
    setDetail(null);
    setDetailErr("");
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDetail(data);
      setNewStatus(data.ticket?.status || "");
      setNotes(data.ticket?.resolution_notes || "");
    } catch {
      setDetailErr("Could not load this ticket.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Deep link: /admin/support?ref=MF-26-ABC123
  useEffect(() => {
    if (!ready || openedRef.current) return;
    let ref: string | null = null;
    try {
      ref = new URLSearchParams(window.location.search).get("ref");
    } catch {
      ref = null;
    }
    if (!ref) return;
    openedRef.current = true;
    // Deferred so setState never runs synchronously inside the effect body.
    const t = setTimeout(() => {
      const match = tickets.find((t) => t.ticket_ref.toLowerCase() === ref!.toLowerCase());
      if (match) void openDetail(match.id);
      else setQ(ref!);
    }, 0);
    return () => clearTimeout(t);
  }, [ready, tickets, openDetail]);

  const saveDetail = useCallback(async () => {
    if (!selected) return;
    setSaving(true);
    setDetailErr("");
    try {
      const res = await fetch(`/api/admin/support/tickets/${selected}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus || undefined, resolution_notes: notes }),
      });
      if (!res.ok) throw new Error();
      await openDetail(selected);
      await fetchList(true);
    } catch {
      setDetailErr("Save failed. Please retry.");
    } finally {
      setSaving(false);
    }
  }, [fetchList, newStatus, notes, openDetail, selected]);

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === "open").length,
      critical: tickets.filter((t) => t.severity === "P1" || t.severity === "P2").length,
    }),
    [tickets]
  );

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBF7F0]">
        <p className="text-sm font-semibold text-[#695343]">Checking admin access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#2B1F17]">
      <header className="sticky top-0 z-40 border-b border-[#E8DEC4]/70 bg-[#FBF7F0]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8">
          <div className="flex items-center gap-2.5">
            <LifeBuoy className="h-5 w-5 text-[#8B4828]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9E6D4B]">SUPPORT</p>
              <p className="font-serif text-sm font-semibold">Customer issue dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] font-semibold text-[#695343] sm:block">
              {counts.open} open · {counts.critical} P1/P2
            </span>
            <button
              type="button"
              onClick={() => fetchList()}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#DECFC0] bg-white/70 px-3 py-1.5 text-[11px] font-bold text-[#695343] hover:border-[#8B4828] hover:text-[#8B4828]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 rounded-full border border-[#DECFC0] bg-white/70 px-3 py-1.5 text-[11px] font-bold text-[#695343] hover:border-[#8B4828]"
            >
              Admin home <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6 md:px-8">
        {/* filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[#9E8B7A]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ref, text, route…"
              className="w-64 rounded-full border border-[#DECFC0] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#8B4828]"
            />
          </div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="rounded-full border border-[#DECFC0] bg-white px-3 py-2 text-sm font-semibold outline-none"
          >
            <option value="">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-full border border-[#DECFC0] bg-white px-3 py-2 text-sm font-semibold outline-none"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          {(q || status || severity) && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setStatus("");
                setSeverity("");
              }}
              className="text-[11px] font-bold text-[#8B4828] underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* list */}
          <section className="space-y-2.5">
            {tickets.length === 0 && !loading && (
              <div className="rounded-2xl border border-[#E8DEC4] bg-white p-8 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-[#5f8a5f]" />
                <p className="text-sm font-semibold text-[#695343]">
                  No tickets match these filters.
                </p>
              </div>
            )}
            {tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => void openDetail(t.id)}
                className={`block w-full rounded-2xl border bg-white px-4 py-3.5 text-left transition-colors ${
                  selected === t.id ? "border-[#8B4828] ring-1 ring-[#8B4828]/30" : "border-[#E8DEC4] hover:border-[#DECFC0]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${SEV_CLASS[t.severity]}`}>
                    {t.severity}
                  </span>
                  <span className="text-xs font-bold tracking-wide text-[#2B1F17]">{t.ticket_ref}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_CLASS[t.status] || ""}`}>
                    {STATUS_LABEL[t.status] || t.status}
                  </span>
                  <span className="rounded-full bg-[#F3EEE4] px-2 py-0.5 text-[10px] font-bold text-[#695343]">
                    {CATEGORY_LABEL[t.category] || t.category}
                  </span>
                  {t.alert_status === "sent" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fde4e4] px-2 py-0.5 text-[10px] font-bold text-[#9b1c1c]">
                      <AlertTriangle className="h-3 w-3" /> owner alerted
                    </span>
                  )}
                  <span className="ml-auto text-[10px] font-semibold text-[#9E8B7A]">{timeAgo(t.created_at)}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-[#4a3c31]">
                  {t.ai_summary || t.description}
                </p>
                <p className="mt-1 truncate text-[11px] text-[#9E8B7A]">
                  {t.route || "unknown route"}
                  {t.template_slug ? ` · ${t.template_slug}` : ""}
                  {t.incident ? ` · incident ×${t.incident.alert_count}` : ""}
                </p>
              </button>
            ))}
          </section>

          {/* detail */}
          <aside className="lg:sticky lg:top-[72px] lg:h-[calc(100vh-96px)]">
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8DEC4] bg-white">
              <div className="flex items-center justify-between border-b border-[#E8DEC4] px-4 py-3">
                <p className="text-sm font-bold">
                  {detail ? detail.ticket.ticket_ref : "Ticket detail"}
                </p>
                {selected && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setDetail(null);
                    }}
                    aria-label="Close detail"
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#9E6D4B] hover:bg-[#F3EEE4]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!selected && (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                  <LifeBuoy className="h-8 w-8 text-[#DECFC0]" />
                  <p className="text-sm font-semibold text-[#695343]">Select a ticket to inspect it.</p>
                  <p className="text-xs text-[#9E8B7A]">
                    P1/P2 incidents email you instantly when configured.
                  </p>
                </div>
              )}

              {selected && detailLoading && (
                <div className="flex flex-1 items-center justify-center p-8">
                  <RefreshCw className="h-5 w-5 animate-spin text-[#9E6D4B]" />
                </div>
              )}

              {selected && detailErr && (
                <p className="m-4 rounded-xl bg-[#fde4e4] px-3 py-2 text-xs font-semibold text-[#9b1c1c]">{detailErr}</p>
              )}

              {selected && detail && (
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${SEV_CLASS[detail.ticket.severity]}`}>
                      {detail.ticket.severity}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_CLASS[detail.ticket.status] || ""}`}>
                      {STATUS_LABEL[detail.ticket.status] || detail.ticket.status}
                    </span>
                    <span className="rounded-full bg-[#F3EEE4] px-2 py-0.5 text-[10px] font-bold text-[#695343]">
                      {CATEGORY_LABEL[detail.ticket.category] || detail.ticket.category}
                    </span>
                    <span className="rounded-full bg-[#F3EEE4] px-2 py-0.5 text-[10px] font-bold text-[#695343]">
                      alert: {detail.ticket.alert_status || "—"}
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#FBF7F0] p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#9E6D4B]">Reported</p>
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#4a3c31]">
                      {detail.ticket.description}
                    </p>
                    <p className="mt-2 text-[11px] text-[#9E8B7A]">
                      {detail.ticket.route || "unknown route"}
                      {detail.ticket.template_slug ? ` · ${detail.ticket.template_slug}` : ""} ·{" "}
                      {new Date(detail.ticket.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {detail.screenshotUrl && (
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#9E6D4B]">Screenshot</p>
                      <a href={detail.screenshotUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={detail.screenshotUrl}
                          alt="Reported screenshot"
                          className="max-h-56 rounded-xl border border-[#E8DEC4] object-contain"
                        />
                      </a>
                    </div>
                  )}

                  {Array.isArray(detail.ticket.customer_notes) && detail.ticket.customer_notes.length > 0 && (
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#9E6D4B]">Customer notes</p>
                      <ul className="space-y-1">
                        {detail.ticket.customer_notes.map((n, i) => (
                          <li key={i} className="rounded-lg bg-[#F3EEE4] px-2.5 py-1.5 text-[12.5px] text-[#4a3c31]">
                            {n}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {detail.messages.length > 0 && (
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#9E6D4B]">Chat context</p>
                      <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-[#E8DEC4] p-2.5">
                        {detail.messages.map((m, i) => (
                          <p
                            key={i}
                            className={`text-[12.5px] leading-snug ${
                              m.role === "user" ? "text-[#2B1F17]" : "text-[#695343] italic"
                            }`}
                          >
                            <span className="font-bold">{m.role === "user" ? "Customer: " : "AI: "}</span>
                            {m.content.slice(0, 400)}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail.alertLog.length > 0 && (
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#9E6D4B]">Alert log</p>
                      <div className="space-y-1">
                        {detail.alertLog.map((a) => (
                          <p key={a.id} className="flex items-center gap-2 text-[11.5px] text-[#4a3c31]">
                            <Clock className="h-3 w-3 text-[#9E8B7A]" />
                            <span className="font-bold">{a.status}</span>
                            <span className="truncate">{a.subject}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 border-t border-[#E8DEC4] pt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#9E6D4B]">Update ticket</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewStatus(s)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                            newStatus === s
                              ? "border-[#8B4828] bg-[#8B4828] text-white"
                              : "border-[#DECFC0] bg-white text-[#695343] hover:border-[#8B4828]"
                          }`}
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Resolution / investigation notes (owner only)"
                      className="w-full resize-none rounded-xl border border-[#DECFC0] bg-[#FBF7F0] px-3 py-2 text-sm outline-none focus:border-[#8B4828]"
                    />
                    <button
                      type="button"
                      onClick={() => void saveDetail()}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-full bg-[#8B4828] px-4 py-2 text-xs font-bold text-white hover:bg-[#6f3a1f] disabled:opacity-50"
                    >
                      {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                      {newStatus === "resolved" ? "Resolve ticket" : "Save changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
