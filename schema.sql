-- ============================================================
-- Dev Portfolio Marketplace — Supabase Schema + RLS Policies
-- Tables: profiles, projects, conversations, messages
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 1. PROFILES
-- ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('developer', 'client')),
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_admin boolean not null default false
);

create index idx_profiles_role on public.profiles(role);

alter table public.profiles enable row level security;

create policy "Public read access to profiles"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ---------------------------------------------------------
-- 2. PROJECTS
-- ---------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  tech_tags text[] default '{}',
  live_url text,
  media_url text,               -- WebP screenshot / short clip in Supabase Storage
  media_type text default 'image' check (media_type in ('image', 'video')),
  featured boolean not null default false,
  featured_position integer,
  vote_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_projects_developer on public.projects(developer_id);
create index idx_projects_created_at on public.projects(created_at desc);
create index idx_projects_tech_tags on public.projects using gin(tech_tags);
create unique index idx_projects_featured_position on public.projects(featured_position) where featured_position is not null;

alter table public.projects enable row level security;

create policy "Public read access to projects"
  on public.projects for select
  using (true);

create policy "Developers can insert own projects"
  on public.projects for insert
  with check (
    auth.uid() = developer_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'developer'
    )
  );

create policy "Developers can update own projects"
  on public.projects for update
  using (auth.uid() = developer_id)
  with check (auth.uid() = developer_id);

create policy "Developers can delete own projects"
  on public.projects for delete
  using (auth.uid() = developer_id);

create policy "Admins can update any project"
  on public.projects for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create or replace function public.enforce_featured_admin_only()
returns trigger as $$
begin
  if (new.featured is distinct from old.featured
      or new.featured_position is distinct from old.featured_position)
  then
    if not exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    ) then
      raise exception 'Only admins may modify featured status or position';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_enforce_featured_admin_only
  before update on public.projects
  for each row execute function public.enforce_featured_admin_only();


-- ---------------------------------------------------------
-- 3. CONVERSATIONS
-- ---------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  initiator_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  conversation_type text not null default 'client_to_dev'
    check (conversation_type in ('client_to_dev', 'dev_to_dev')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint distinct_participants check (initiator_id <> recipient_id)
);

-- Prevents duplicate threads for the same project/pair
create unique index idx_unique_conversation
  on public.conversations(project_id, initiator_id, recipient_id);

create index idx_conversations_initiator on public.conversations(initiator_id);
create index idx_conversations_recipient on public.conversations(recipient_id);

alter table public.conversations enable row level security;

create policy "Participants can view conversation"
  on public.conversations for select
  using (auth.uid() = initiator_id or auth.uid() = recipient_id);

create policy "Authenticated users can start conversations"
  on public.conversations for insert
  with check (auth.uid() = initiator_id);

create policy "Participants can update conversation"
  on public.conversations for update
  using (auth.uid() = initiator_id or auth.uid() = recipient_id);


-- ---------------------------------------------------------
-- 4. MESSAGES
-- ---------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on public.messages(conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.initiator_id = auth.uid() or c.recipient_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.initiator_id = auth.uid() or c.recipient_id = auth.uid())
    )
  );

-- Auto-bump conversations.last_message_at whenever a new message lands
create or replace function public.touch_conversation()
returns trigger as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();


-- ---------------------------------------------------------
-- 5. STORAGE BUCKET POLICIES (run after creating the bucket
--    named "project-media" in Supabase Dashboard > Storage)
-- ---------------------------------------------------------


-- Authenticated developers can upload only into a folder
-- matching their own user id, e.g. project-media/{auth.uid()}/file.webp
create policy "Developers can upload own media"
  on storage.objects for insert
  with check (
    bucket_id = 'project-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Developers can delete own media"
  on storage.objects for delete
  using (
    bucket_id = 'project-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- ---------------------------------------------------------
-- 6. BLOCKS
-- ---------------------------------------------------------
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint no_self_block check (blocker_id <> blocked_id),
  constraint unique_block unique (blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

create policy "Users can view their own blocks"
  on public.blocks for select
  using (auth.uid() = blocker_id);

create policy "Users can create their own blocks"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

create policy "Users can remove their own blocks"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

grant select, insert, delete on public.blocks to authenticated;


-- ---------------------------------------------------------
-- 7. REPORTS
-- ---------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

grant insert on public.reports to authenticated;


-- ---------------------------------------------------------
-- 8. PROJECT VOTES
-- ---------------------------------------------------------
create table public.project_votes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_vote unique (project_id, voter_id)
);

create index idx_project_votes_project on public.project_votes(project_id);

alter table public.project_votes enable row level security;

create policy "Users can view their own vote"
  on public.project_votes for select
  using (auth.uid() = voter_id);

create policy "Users can cast their own vote"
  on public.project_votes for insert
  with check (auth.uid() = voter_id);

create policy "Users can remove their own vote"
  on public.project_votes for delete
  using (auth.uid() = voter_id);

create or replace function public.sync_project_vote_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.projects set vote_count = vote_count + 1 where id = new.project_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.projects set vote_count = greatest(vote_count - 1, 0) where id = old.project_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_sync_vote_count_insert
  after insert on public.project_votes
  for each row execute function public.sync_project_vote_count();

create trigger trg_sync_vote_count_delete
  after delete on public.project_votes
  for each row execute function public.sync_project_vote_count();

grant select, insert, delete on public.project_votes to authenticated;
revoke all privileges on public.project_votes from anon;