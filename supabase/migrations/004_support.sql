-- ═══════════════════════════════════════════════════════════
--  Mehfill.in — AI customer support assistant
--  Run AFTER 000/001/002/003 in Supabase SQL Editor.
--
--  Tables: conversations, messages, tickets, incidents, alerts.
--  SECURITY MODEL (important):
--    * RLS is ENABLED on every table with ZERO public policies.
--    * All reads/writes go through server-side API routes using the
--      service-role key (bypasses RLS) which re-check auth/ownership:
--        - /api/support/*        (customers; optional auth + session binding)
--        - /api/admin/support/*  (requireAdmin allowlist)
--    * Screenshots live in a PRIVATE storage bucket (support-screenshots);
--      only admin routes mint short-lived signed URLs.
--  RETENTION: purge_old_support_data() deletes support rows older than
--  30 days (keep conversation/messages/tickets/alerts; incidents follow
--  their tickets). Schedule via pg_cron if available, or run manually.
-- ═══════════════════════════════════════════════════════════

begin;

-- ── Conversations ────────────────────────────────────────────
create table if not exists support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,                       -- null = anonymous (session-bound)
  session_id text,                    -- client-generated anonymous id
  route text default '',              -- page where chat started
  invitation_id uuid,                 -- optional draft under discussion
  template_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_conversation_owner check (user_id is not null or session_id is not null)
);
create index if not exists support_conversations_user_idx on support_conversations (user_id, updated_at desc);
create index if not exists support_conversations_session_idx on support_conversations (session_id, updated_at desc);
alter table support_conversations enable row level security;

-- ── Messages ─────────────────────────────────────────────────
create table if not exists support_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references support_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  image_path text,                    -- private bucket object (screenshot)
  created_at timestamptz not null default now()
);
create index if not exists support_messages_conversation_idx
  on support_messages (conversation_id, created_at);
alter table support_messages enable row level security;

-- ── Incidents (grouped similar reports for owner alerts) ─────
create table if not exists support_incidents (
  id bigint generated always as identity primary key,
  fingerprint text not null unique,
  category text not null,
  severity text not null check (severity in ('P1','P2','P3','P4')),
  alert_status text not null default 'pending'
    check (alert_status in ('pending','sent','failed','not_required','skipped_duplicate','skipped_no_provider')),
  alert_count int not null default 0,
  notified_at timestamptz,
  first_ticket_at timestamptz not null default now(),
  last_ticket_at timestamptz not null default now()
);
create index if not exists support_incidents_severity_idx on support_incidents (severity, last_ticket_at desc);
alter table support_incidents enable row level security;

-- ── Tickets ──────────────────────────────────────────────────
create table if not exists support_tickets (
  id bigint generated always as identity primary key,
  ticket_ref text not null unique,             -- MF-YY-XXXXXX (app-generated)
  conversation_id uuid references support_conversations(id) on delete set null,
  user_id uuid,
  session_id text,
  category text not null check (category in (
    'question','howto','ui_minor','functional_bug',
    'data_integrity','auth_security','payment','outage')),
  severity text not null check (severity in ('P1','P2','P3','P4')),
  status text not null default 'open'
    check (status in ('open','investigating','waiting_customer','resolved','closed')),
  route text,
  template_slug text,
  description text not null,
  ai_summary text,
  screenshot_path text,               -- private bucket object
  incident_id bigint references support_incidents(id) on delete set null,
  alert_status text
    check (alert_status in ('pending','sent','failed','not_required','skipped_duplicate','skipped_no_provider')),
  customer_notes text[] not null default '{}',
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_ticket_owner check (user_id is not null or session_id is not null)
);
create index if not exists support_tickets_status_idx on support_tickets (status, created_at desc);
create index if not exists support_tickets_severity_idx on support_tickets (severity, created_at desc);
create index if not exists support_tickets_user_idx on support_tickets (user_id, created_at desc);
create index if not exists support_tickets_incident_idx on support_tickets (incident_id);
alter table support_tickets enable row level security;

-- ── Alert delivery log ───────────────────────────────────────
create table if not exists support_alerts (
  id bigint generated always as identity primary key,
  incident_id bigint references support_incidents(id) on delete cascade,
  ticket_id bigint references support_tickets(id) on delete cascade,
  severity text not null check (severity in ('P1','P2','P3','P4')),
  status text not null check (status in ('sent','failed','not_required','skipped_duplicate','skipped_no_provider')),
  subject text not null default '',
  error text,
  created_at timestamptz not null default now()
);
create index if not exists support_alerts_incident_idx on support_alerts (incident_id, created_at desc);
alter table support_alerts enable row level security;

-- ── Private screenshot bucket ────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-screenshots', 'support-screenshots', false,
  2097152,                                   -- 2MB
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;

-- ── 30-day retention ─────────────────────────────────────────
create or replace function purge_old_support_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cutoff timestamptz := now() - interval '30 days';
begin
  delete from support_conversations where created_at < cutoff;
  -- messages cascade with conversations; sweep orphans defensively
  delete from support_messages where created_at < cutoff;
  delete from support_alerts where created_at < cutoff;
  delete from support_tickets where created_at < cutoff;
  delete from support_incidents where last_ticket_at < cutoff;
end $$;

commit;

-- NOTE: NO public policies are created on purpose. If you later add a
-- browser-side query for these tables, you are bypassing the API auth
-- checks — do not do that.
