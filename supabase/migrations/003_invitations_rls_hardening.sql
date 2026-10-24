-- 003_invitations_rls_hardening.sql
-- Run in Supabase SQL Editor (after 000/001/002).
--
-- Problem: the owner-side UPDATE policy on `invitations` allowed the
-- authenticated owner to modify ANY column — including `status`
-- (self-publish without payment) and `package` (basic → premium upgrade).
-- Payment gating was only enforced by the service-role API routes.
--
-- Fix: owners keep SELECT (private read) but all INSERT/UPDATE/DELETE go
-- through server-side API routes using the service-role key (which bypasses
-- RLS). Published invitations stay publicly readable via the anon SELECT
-- policy. This closes the self-publish / self-upgrade hole without breaking
-- the existing API-driven flow (dashboard + editor already write only via
-- /api/invitations/*).

begin;

-- Drop the permissive owner write policies (names may vary — drop by pattern).
drop policy if exists "Owners can update own invitations" on public.invitations;
drop policy if exists "Owners can insert invitations" on public.invitations;
drop policy if exists "owners_update" on public.invitations;
drop policy if exists "owners_insert" on public.invitations;
drop policy if exists "invitations_owner_update" on public.invitations;
drop policy if exists "invitations_owner_insert" on public.invitations;

-- Keep (or recreate) safe read policies.
-- Owner private read:
drop policy if exists "Owners can read own invitations" on public.invitations;
create policy "Owners can read own invitations"
  on public.invitations for select
  to authenticated
  using (auth.uid() = user_id);

-- Public read of published invitations (anon + authenticated non-owners):
drop policy if exists "Published invitations are public" on public.invitations;
drop policy if exists "Public can read published invitations" on public.invitations;
create policy "Published invitations are public"
  on public.invitations for select
  to anon, authenticated
  using (status = 'published');

-- Status sanity: only known states (app-level convention made durable).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'invitations_status_check'
  ) then
    alter table public.invitations
      add constraint invitations_status_check
      check (status in ('draft','published','suspended','deleted'));
  end if;
end $$;

commit;

-- NOTE for developers: after this migration, NEVER write invitations from the
-- browser Supabase client — always use the authenticated /api/invitations/*
-- routes (they use the service-role client and re-check ownership).
