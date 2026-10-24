# Mehfill.in — Self-Service Invitation Platform: Setup & Deployment

## What changed (summary)

Mehfill.in is now a two-package self-service invitation platform:

| Package | Price | Workflow |
|---|---|---|
| **Basic** | ₹999 | Customer picks a design, personalises via a 7-step editor, publishes instantly |
| **Premium** | ₹1,500 | Same editor + customisation brief → admin designs → preview → revisions → publish |

Customer journey: `/templates` (explore) → Select Design → login (selection preserved via URL) →
`/checkout` (Razorpay or UPI) → `/dashboard/edit/[id]` (personalise) → publish → public link
`https://mehfill.in/i/<slug>` → share on WhatsApp.

## One-time setup

### 1. Run the database migration

Supabase dashboard → **SQL Editor** → New query → paste and run
`supabase/migrations/000_run_me_first.sql`, then
`supabase/migrations/003_invitations_rls_hardening.sql`.

000 creates: `invitations`, `rsvps`, `customisation_requests` tables, extends `orders`,
adds RLS policies and the `invitation-assets` storage bucket.
(Existing `schema.sql` stays as the base schema — run it first on fresh projects.)

**003 (security hardening)** removes the owner-side INSERT/UPDATE policies on
`invitations` so customers can no longer self-publish or self-upgrade via the
browser Supabase client — all writes go through the authenticated
`/api/invitations/*` routes (service-role). Run it on existing projects too.

### 2. Environment variables (`.env.local`)

Existing Supabase vars stay unchanged. New optional Razorpay vars:

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx        # test mode first
RAZORPAY_KEY_SECRET=xxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxx         # optional, for /api/razorpay/webhook
```

**Until Razorpay keys are added**, checkout automatically falls back to the existing
manual-UPI flow (transaction ID + screenshot → owner verifies in /admin). No broken states.

### 3. Razorpay (when ready)

1. Create account → complete KYC → get API keys (test keys work end-to-end).
2. Add keys to Vercel env vars → redeploy.
3. Razorpay Dashboard → Settings → Webhooks → URL `https://mehfill.in/api/razorpay/webhook`
   → events `payment.captured`, `payment.failed` → secret = `RAZORPAY_WEBHOOK_SECRET`.
4. Test with test cards/UPI, then swap to live keys.

**We do not guarantee Razorpay approval** — until live keys exist, UPI remains the
production payment path.

### 4. Deploy

Standard Vercel push (no config changes needed — `next.config.ts` rewrites/headers are
compatible). After deploy, verify:

- `/templates` loads and cards show both packages
- `/i/<slug>` works after publishing (direct URL + refresh, no login)
- RSVP submits persist (check `rsvps` table)
- CSP already allows `checkout.razorpay.com` + `api.razorpay.com`

## Architecture notes

- **Reusable engine**: `components/invitation/InvitationRenderer.tsx` renders ANY
  published invitation from DB JSON. Templates live in `lib/catalog.ts` (6 designs,
  3 visual variants: royal / botanical / ivory), each declaring `fields` (supported
  editable fields — Basic editor never exposes more than the template supports).
- **Static demos (site-1..7)** stay untouched as showcase/preview; "Preview Demo" on
  each card links to the live static site. Purchased designs render through the engine.
- **Payment security**: signature verification server-side (`lib/razorpay.ts`),
  orders flip `created → paid` exactly once (idempotent, guarded `.eq("status","created")`),
  webhook is a verified backup. Secrets never reach the client.
- **Authorization**: invitation reads/writes are owner-scoped at the RLS layer +
  re-checked in every route; only `status='published'` rows are publicly readable.
- **Admin**: `/admin` (existing) + new `/admin/platform` for invitations
  (publish/unpublish/suspend) and premium customisation status transitions.
- **UPI verification** (`/api/admin/verify-payment`) now also flips the unified
  `orders` row and auto-creates the customer's invitation draft.

## Owner decisions still required

1. **Razorpay credentials** (test + live) — see above.
2. **Premium SLA**: "2–4 days typical, 2 revisions" is written in pricing/terms —
   confirm these numbers are what you'll honour.
3. **Refund windows**: refund policy states 7 working days for duplicates/refunds —
   confirm.
4. **Legal review**: policies were de-placeholdered (individual operator: Ayan Shaikh,
   Nashik) but still need a professional legal/CA pass before scale.
5. **Contact number**: privacy policy no longer lists a placeholder phone — add one
   only if you want it public.

## Key routes

| Route | Purpose |
|---|---|
| `/templates` | Public design gallery + package selection |
| `/checkout?template=X&package=basic\|premium` | Order summary → Razorpay/UPI |
| `/dashboard` | My Invitations · Orders · Browse |
| `/dashboard/edit/[id]` | 7-step personalisation wizard + preview + publish |
| `/i/[slug]` | Public invitation (guests, no login) |
| `/admin/platform` | Admin: invitations + premium customisation |
| `/api/razorpay/*` | create-order · verify · webhook |
| `/api/invitations/*` | CRUD · publish · photo upload |
| `/api/rsvp` | Guest RSVP (persisted, owner-visible) |
| `/api/customisation` | Premium brief submit/status |
