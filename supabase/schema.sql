-- ═══════════════════════════════════════════════════════════
--  Mehfill.in — Supabase schema
--  Supabase dashboard → SQL Editor → New query → paste & Run.
-- ═══════════════════════════════════════════════════════════

-- Page visits (every site + demo visit is logged here)
create table if not exists visits (
  id bigint generated always as identity primary key,
  path text not null default '/',
  created_at timestamptz not null default now()
);

-- Orders (created at checkout, marked paid after Razorpay verify)
create table if not exists orders (
  id bigint generated always as identity primary key,
  user_email text,
  plan text not null,
  amount int not null,
  status text not null default 'created',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

alter table visits enable row level security;
alter table orders enable row level security;

-- Anyone (even logged-out visitors) may LOG a visit. Reads are
-- service-role only (admin dashboard), so no select policy needed.
drop policy if exists "public insert visits" on visits;
create policy "public insert visits"
  on visits for insert to anon, authenticated
  with check (true);

-- Logged-in users may read ONLY their own orders.
drop policy if exists "users read own orders" on orders;
create policy "users read own orders"
  on orders for select to authenticated
  using ((auth.jwt() ->> 'email') = user_email);

-- Helpful indexes
create index if not exists visits_created_idx on visits (created_at desc);
create index if not exists visits_path_idx on visits (path);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);

-- ── Direct UPI payments (manual verification) ───────────────
-- Status stays 'pending' until the owner verifies in /studio.
create table if not exists upi_payments (
  id bigint generated always as identity primary key,
  user_email text,
  plan text not null,
  amount int not null,
  customer_name text not null,
  whatsapp text not null,
  txn_id text not null,
  screenshot_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  -- Registration fields
  email text,
  mobile text,
  city text,
  state text,
  pincode text,
  occasion text,
  event_date text,
  venue_name text,
  venue_address text,
  template_slug text
);

alter table upi_payments enable row level security;

-- Guests may submit their payment details after paying via UPI.
drop policy if exists "public insert upi_payments" on upi_payments;
create policy "public insert upi_payments"
  on upi_payments for insert to anon, authenticated
  with check (true);

-- Logged-in users may read ONLY their own submissions.
drop policy if exists "users read own upi_payments" on upi_payments;
create policy "users read own upi_payments"
  on upi_payments for select to authenticated
  using ((auth.jwt() ->> 'email') = user_email);

create index if not exists upi_created_idx on upi_payments (created_at desc);
create index if not exists upi_status_idx on upi_payments (status);
create index if not exists upi_txn_idx on upi_payments (txn_id);