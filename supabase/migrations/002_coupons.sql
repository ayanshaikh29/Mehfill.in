-- ═══════════════════════════════════════════════════════════
--  Mehfill.in — discount coupons
--  Run AFTER 001_platform.sql in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════

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

-- Nobody reads coupons directly from the browser.
-- Validation happens server-side in /api/coupons/validate (service role).
-- Admin CRUD goes through /api/admin/coupons (allowlist + service role).

-- Orders remember what coupon/discount was applied.
alter table orders add column if not exists coupon_code text;
alter table orders add column if not exists discount int not null default 0;
alter table upi_payments add column if not exists coupon_code text;
alter table upi_payments add column if not exists discount int not null default 0;
