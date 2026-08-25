-- ============================================================
-- Schema Addendum v1.1 — Editing, Featured Ranking, Client Problem
-- Posts. Append this to your schema record; run via Supabase MCP the
-- same way as the original schema.sql, then keep this file in the repo
-- so schema.sql (+ this addendum) stays the real source of truth.
-- ============================================================

-- ---------------------------------------------------------
-- 1. Featured / manual ranking for projects
-- ---------------------------------------------------------
-- No RLS change needed for editing itself — the existing
-- "Developers can update own projects" policy already covers it.
-- `featured` is intentionally NOT settable by developers themselves —
-- it must never be exposed in the edit form / update payload from the
-- client. You set it directly in the Supabase dashboard's Table Editor.

alter table public.projects
  add column featured boolean not null default false;

create index idx_projects_featured on public.projects(featured);


-- ---------------------------------------------------------
-- 2. Client problem posts
-- ---------------------------------------------------------
create table public.problems (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  tags text[] default '{}',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_problems_client on public.problems(client_id);
create index idx_problems_created_at on public.problems(created_at desc);
create index idx_problems_status on public.problems(status);

alter table public.problems enable row level security;

create policy "Public read access to problems"
  on public.problems for select
  using (true);

create policy "Clients can insert own problems"
  on public.problems for insert
  with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'client'
    )
  );

create policy "Clients can update own problems"
  on public.problems for update
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "Clients can delete own problems"
  on public.problems for delete
  using (auth.uid() = client_id);


-- ---------------------------------------------------------
-- 3. Developer "I'm interested" signal on a problem post
-- ---------------------------------------------------------
create table public.problem_interests (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  developer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_interest unique (problem_id, developer_id)
);

alter table public.problem_interests enable row level security;

-- A developer can see their own interest rows; the owning client can
-- see everyone interested in their own problem post.
create policy "View own interest or interest on own problem"
  on public.problem_interests for select
  using (
    auth.uid() = developer_id
    or auth.uid() = (
      select client_id from public.problems where id = problem_id
    )
  );

create policy "Developers can express interest"
  on public.problem_interests for insert
  with check (
    auth.uid() = developer_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'developer'
    )
  );

create policy "Developers can retract own interest"
  on public.problem_interests for delete
  using (auth.uid() = developer_id);


-- ---------------------------------------------------------
-- 4. Let conversations originate from a problem post too
-- ---------------------------------------------------------
alter table public.conversations
  add column problem_id uuid references public.problems(id) on delete set null;

alter table public.conversations
  add constraint one_source_only
  check (project_id is null or problem_id is null);

-- Partial unique index mirroring the existing project-based one, scoped
-- to problem-based conversations so a client can't get duplicate threads
-- with the same developer from the same problem post.
create unique index idx_unique_problem_conversation
  on public.conversations(problem_id, initiator_id, recipient_id)
  where problem_id is not null;
