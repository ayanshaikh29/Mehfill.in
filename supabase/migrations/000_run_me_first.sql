-- ═══════════════════════════════════════════════════════════
--  Mehfill.in — CONSOLIDATED FIX (run this ONE file)
--  Supabase Dashboard → SQL Editor → paste → Run.
--
--  Fixes BOTH live bugs:
--   • "Could not create your order"  → orders lacks coupon_code/discount
--   • "Could not create coupon"      → coupons table missing
--
--  Fully idempotent — safe to run multiple times.
-- ═══════════════════════════════════════════════════════════

-- ── 1. Coupons table ────────────────────────────────────────
create table if not exists coupons (
  id bigint generated always as identity primary key,
  code text not null unique,
  discount_type text not null default 'percent', -- percent | fixed
  discount_value int not null,                   -- 10 = 10% | 200 = ₹200
  min_amount int not null default 0,             -- min order value (₹)
  max_uses int,                                  -- null = unlimited
  used_count int not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  note text default '',
  created_at timestamptz not null default now()
);

alter table coupons enable row level security;
create index if not exists coupons_code_idx on coupons (code);
create index if not exists coupons_active_idx on coupons (active);

-- No public read: validation happens server-side (service role) in
-- /api/coupons/validate; admin CRUD via /api/admin/coupons.

-- ── 2. Orders: coupon + discount columns ────────────────────
-- (create-order ALWAYS inserts these — without them every order fails.)
alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists discount int not null default 0;

-- ── 3. UPI payments: keep parity (manual flow may still record) ──
alter table upi_payments add column if not exists coupon_code text;
alter table upi_payments add column if not exists discount int not null default 0;

-- ── 4. Ensure orders has every column the create-order route writes ──
alter table orders add column if not exists user_id uuid;
alter table orders add column if not exists package text not null default 'basic';
alter table orders add column if not exists template_slug text;
alter table orders add column if not exists amount_paise int;
alter table orders add column if not exists currency text not null default 'INR';
alter table orders add column if not exists razorpay_signature text;
alter table orders add column if not exists payment_method text;
alter table orders add column if not exists verified_at timestamptz;
alter table orders add column if not exists updated_at timestamptz not null default now();

create index if not exists orders_user_idx on orders (user_id);
create index if not exists orders_rzp_idx on orders (razorpay_order_id);

-- Users may read their own orders by user_id.
drop policy if exists "users read own orders by user_id" on orders;
create policy "users read own orders by user_id"
  on orders for select to authenticated
  using (auth.uid() = user_id);

-- ── 5. Invitations (core product record) ────────────────────
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id bigint references orders(id) on delete set null,
  template_slug text not null,
  package text not null default 'basic',
  slug text unique,
  status text not null default 'draft',
  content jsonb not null default '{}'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table invitations enable row level security;
create index if not exists invitations_user_idx on invitations (user_id);
create index if not exists invitations_slug_idx on invitations (slug);
create index if not exists invitations_status_idx on invitations (status);

drop policy if exists "users read own invitations" on invitations;
create policy "users read own invitations"
  on invitations for select to authenticated using (auth.uid() = user_id);

drop policy if exists "users insert own invitations" on invitations;
create policy "users insert own invitations"
  on invitations for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users update own invitations" on invitations;
create policy "users update own invitations"
  on invitations for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "public read published invitations" on invitations;
create policy "public read published invitations"
  on invitations for select to anon using (status = 'published');

-- ── 6. RSVPs ────────────────────────────────────────────────
create table if not exists rsvps (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references invitations(id) on delete cascade,
  guest_name text not null,
  guest_phone text,
  attending text not null default 'yes',
  guest_count int not null default 1,
  message text,
  created_at timestamptz not null default now()
);

alter table rsvps enable row level security;

drop policy if exists "public insert rsvps" on rsvps;
create policy "public insert rsvps"
  on rsvps for insert to anon, authenticated
  with check (exists (select 1 from invitations i where i.id = invitation_id and i.status = 'published'));

drop policy if exists "owner reads rsvps" on rsvps;
create policy "owner reads rsvps"
  on rsvps for select to authenticated
  using (exists (select 1 from invitations i where i.id = rsvps.invitation_id and i.user_id = auth.uid()));

create index if not exists rsvps_inv_idx on rsvps (invitation_id);

-- ── 7. Premium customisation requests ───────────────────────
create table if not exists customisation_requests (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references invitations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id bigint references orders(id) on delete set null,
  status text not null default 'requested',
  brief text not null default '',
  colour_prefs text default '',
  typography_prefs text default '',
  animation_prefs text default '',
  reference_urls text default '',
  admin_notes text default '',
  revision_count int not null default 0,
  max_revisions int not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table customisation_requests enable row level security;

drop policy if exists "owner reads customisation" on customisation_requests;
create policy "owner reads customisation"
  on customisation_requests for select to authenticated using (auth.uid() = user_id);

drop policy if exists "owner inserts customisation" on customisation_requests;
create policy "owner inserts customisation"
  on customisation_requests for insert to authenticated with check (auth.uid() = user_id);

create index if not exists custom_user_idx on customisation_requests (user_id);
create index if not exists custom_status_idx on customisation_requests (status);

-- ── 8. Storage bucket for invitation photos ─────────────────
insert into storage.buckets (id, name, public)
values ('invitation-assets', 'invitation-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read invitation assets" on storage.objects;
create policy "public read invitation assets"
  on storage.objects for select using (bucket_id = 'invitation-assets');

drop policy if exists "auth upload invitation assets" on storage.objects;
create policy "auth upload invitation assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'invitation-assets' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "auth delete own invitation assets" on storage.objects;
create policy "auth delete own invitation assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'invitation-assets' and (storage.foldername(name))[1] = auth.uid()::text);
