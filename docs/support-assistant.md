# AI Customer Support Assistant

In-widget AI support (`components/support/SupportWidget.tsx`) with bug tickets,
owner alerts and an admin issue dashboard. This doc covers deployment,
operations and honest limitations.

## What it does

- **Chat widget** on every public page (hidden on `/admin` and `/studio`,
  positioned above the WhatsApp float). Greets, answers from the built-in
  knowledge base via Groq, accepts screenshots (vision), restores history.
- **Knowledge base** (`lib/support/knowledge-base.ts`) — hand-written
  troubleshooting articles + **runtime facts auto-generated from
  `lib/catalog.ts` and `lib/plans.ts`**, so template names and prices can
  never drift from the live site. Every answer cites `[source: kb-…]`.
- **Bug tickets** (`POST /api/support/tickets`) — classification runs
  **server-side**: deterministic keyword rules first (payment, data loss,
  wrong-template, outage, security → P1/P2 critical), AI only classifies the
  leftovers (and can never assign P1 — its P1 is capped at P2).
- **Owner alerts** (`lib/support/alerts.ts`) — P1/P2 incidents email
  `SUPPORT_ALERT_EMAIL` through the Resend HTTP API. Dedup: one email per
  incident fingerprint; re-email only when severity escalates; retries after
  failed delivery. P3/P4 never email (`not_required`) — they queue in admin.
- **Admin dashboard** — `/admin/support`: filter/search tickets, open detail
  with chat context, expiring screenshot link, incident grouping, alert log,
  status + resolution notes.
- **Customer view** — own tickets via `GET /api/support/tickets`, follow-up
  notes via `PATCH /api/support/tickets/[id]`.

## Setup (in order)

1. **Run migration** `supabase/migrations/004_support.sql` in the Supabase
   SQL Editor (creates tables with RLS enabled + **zero public policies**, the
   private `support-screenshots` bucket, and `purge_old_support_data()`).
2. **Groq** — create an API key at console.groq.com, set `GROQ_API_KEY`
   (server-only). Defaults (verified against Groq vision docs):
   - `GROQ_MODEL` / `GROQ_VISION_MODEL` → `meta-llama/llama-4-scout-17b-16e-instruct`
     (multimodal, 128K, JSON mode; override either; set `GROQ_VISION_MODEL=""`
     to disable image analysis). No key → chat still works: docs-based
     fallback reply + `degraded: true`, tickets unaffected.
   - **This deployment's key** serves a different catalog, verified live
     (chat, vision and JSON mode all tested): `.env.local` overrides to
     `GROQ_MODEL=openai/gpt-oss-120b` (131K, JSON mode ✓) and
     `GROQ_VISION_MODEL=qwen/qwen3.8-27b` (text+image ✓, needs images
     ≥32×32 px). If you rotate the key, re-check `/openai/v1/models` — the
     model list is per-account.
3. **Resend (owner alerts)** — `RESEND_API_KEY` + `SUPPORT_ALERT_EMAIL`
   (+ optional `SUPPORT_ALERT_FROM`, must be a verified sender). Without them
   alerts are recorded as `skipped_no_provider` — the UI never claims an
   alert was sent.
4. **Admin access** — `ADMIN_EMAILS` must include your login (already used by
   other admin APIs).

## Security model

- API keys live in server env only (`GROQ_*`, `RESEND_*`) — never
  `NEXT_PUBLIC_*`, never returned by any API, never written to the DB.
- Chat/tickets call only same-origin `/api/support/*` (CSP `connect-src`
  unchanged). Groq/Resend are called server-side.
- Anonymous users get a `mf_support_session` id (localStorage) bound to their
  conversation/tickets; logged-in ownership wins over session. Customer APIs
  re-check ownership on every read/write.
- Screenshots: **magic-byte validated** (JPEG/PNG/WebP only, ≤2MB via
  `SUPPORT_MAX_IMAGE_BYTES`), stored only in the private bucket with
  short-lived signed URLs (admin only). Chat screenshots are analysed by the
  vision model and **not stored**; only bug-report attachments are stored.
- Assistant replies render through an AST markdown renderer
  (`lib/support/markdown.ts` → `SupportMarkdown.tsx`) — no
  `dangerouslySetInnerHTML` anywhere; model output cannot inject HTML/JS.
- The system prompt forbids: inventing prices (facts come from code), claiming
  a bug is fixed / payment succeeded / alert sent, asking for passwords, OTPs
  or card data.

## Retention

- `purge_old_support_data()` deletes support rows older than **30 days**
  (conversations, messages, alerts, tickets, stale incidents). Schedule with
  pg_cron or run manually. Storage objects in `support-screenshots` are **not**
  auto-deleted — clear the bucket periodically if you need full GDPR-style
  erasure (ticket rows go first, so links die with the purge).

## Operational limits (be honest about these)

- The assistant answers from the packaged knowledge base + your message — it
  does not read the live database (except the caller's own draft summary:
  design, status, missing publish fields, only when logged in and only for
  their own invitation).
- Rate limits: chat 15/min per IP (+50/10min), tickets 5/10min per IP.
  Message ≤2000 chars; ticket description ≤4000.
- Groq downtime → graceful fallback reply (top KB hits offered, ticket flow
  intact). Never a blank error screen.
- Alerts depend on Resend delivery; status is recorded per attempt in
  `support_alerts` (visible in the admin ticket detail).

## Verification

```powershell
npx tsc -p .smoke-tsconfig.json
node scripts/smoke-personalize.cjs     # template guards still pass
node scripts/smoke-support.cjs         # KB sync, classify rules, markdown
                                       # safety, image magic bytes, no-key
                                       # Groq degradation, alert policy
npx tsc --noEmit
npm run build
```

`smoke-support.cjs` asserts prices come from `PLANS` (₹999 / ₹1,500 today)
and template facts from `CATALOG` — if either changes upstream, the KB facts
follow automatically and the test still validates against the code, not
hardcoded copies.
