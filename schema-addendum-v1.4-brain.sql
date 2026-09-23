-- ============================================================
-- Schema Addendum v1.4 — Second Brain
-- ============================================================

-- ---------------------------------------------------------
-- 1. COLLECTIONS
-- ---------------------------------------------------------
create table if not exists public.second_brain_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  parent_id uuid references public.second_brain_collections(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.second_brain_collections enable row level security;

create policy "Users can view own collections" on public.second_brain_collections for select using (auth.uid() = user_id);
create policy "Users can insert own collections" on public.second_brain_collections for insert with check (auth.uid() = user_id);
create policy "Users can update own collections" on public.second_brain_collections for update using (auth.uid() = user_id);
create policy "Users can delete own collections" on public.second_brain_collections for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 2. NODES (Notes, Snippets, Bookmarks)
-- ---------------------------------------------------------
create table if not exists public.second_brain_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  collection_id uuid references public.second_brain_collections(id) on delete set null,
  title text not null,
  content text,
  type text not null check (type in ('note', 'snippet', 'project_bookmark')),
  reference_url text, -- URL for bookmarks
  reference_project_id uuid references public.projects(id) on delete set null, -- direct link to a project
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.second_brain_nodes enable row level security;

create policy "Users can view own nodes" on public.second_brain_nodes for select using (auth.uid() = user_id);
create policy "Users can insert own nodes" on public.second_brain_nodes for insert with check (auth.uid() = user_id);
create policy "Users can update own nodes" on public.second_brain_nodes for update using (auth.uid() = user_id);
create policy "Users can delete own nodes" on public.second_brain_nodes for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 3. TAGS
-- ---------------------------------------------------------
create table if not exists public.second_brain_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.second_brain_tags enable row level security;

create policy "Users can view own tags" on public.second_brain_tags for select using (auth.uid() = user_id);
create policy "Users can insert own tags" on public.second_brain_tags for insert with check (auth.uid() = user_id);
create policy "Users can delete own tags" on public.second_brain_tags for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------
-- 4. NODE TAGS (Many-to-Many)
-- ---------------------------------------------------------
create table if not exists public.second_brain_node_tags (
  node_id uuid not null references public.second_brain_nodes(id) on delete cascade,
  tag_id uuid not null references public.second_brain_tags(id) on delete cascade,
  primary key (node_id, tag_id)
);

alter table public.second_brain_node_tags enable row level security;

create policy "Users can view own node tags" on public.second_brain_node_tags for select 
  using (exists (select 1 from public.second_brain_nodes n where n.id = node_id and n.user_id = auth.uid()));

create policy "Users can insert own node tags" on public.second_brain_node_tags for insert 
  with check (exists (select 1 from public.second_brain_nodes n where n.id = node_id and n.user_id = auth.uid()));

create policy "Users can delete own node tags" on public.second_brain_node_tags for delete 
  using (exists (select 1 from public.second_brain_nodes n where n.id = node_id and n.user_id = auth.uid()));
