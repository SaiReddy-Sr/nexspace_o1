-- ============================================================
-- Schema Addendum v1.3 — Untracked Tables & Security Fixes
-- Append this to your schema record; run via Supabase MCP or Dashboard.
-- This file tracks tables that were already being used by the app but 
-- were missing from the SQL schema tracking, and importantly, adds RLS 
-- to secure them against unauthorized public access.
-- ============================================================

-- ---------------------------------------------------------
-- 1. NOTIFICATIONS
-- ---------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Ensure RLS is enabled to prevent unauthorized reads/writes
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view own notifications" 
  on public.notifications for select 
  using (auth.uid() = user_id);

create policy "Authenticated users can create notifications" 
  on public.notifications for insert 
  with check (auth.uid() = actor_id);

create policy "Users can update own notifications" 
  on public.notifications for update 
  using (auth.uid() = user_id);

create policy "Users can delete own notifications" 
  on public.notifications for delete 
  using (auth.uid() = user_id);


-- ---------------------------------------------------------
-- 2. PROFILE SYNCS (Tracking / Follows)
-- ---------------------------------------------------------
create table if not exists public.profile_syncs (
  id uuid primary key default gen_random_uuid(),
  synced_profile_id uuid not null references public.profiles(id) on delete cascade,
  syncer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_sync unique (synced_profile_id, syncer_id)
);

create index if not exists idx_profile_syncs_synced on public.profile_syncs(synced_profile_id);
create index if not exists idx_profile_syncs_syncer on public.profile_syncs(syncer_id);

-- Ensure RLS is enabled
alter table public.profile_syncs enable row level security;

-- Policies
create policy "Public read access to profile_syncs" 
  on public.profile_syncs for select 
  using (true);

create policy "Users can sync profiles" 
  on public.profile_syncs for insert 
  with check (auth.uid() = syncer_id);

create policy "Users can unsync profiles" 
  on public.profile_syncs for delete 
  using (auth.uid() = syncer_id);
