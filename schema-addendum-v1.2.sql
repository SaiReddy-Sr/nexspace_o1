-- ============================================================
-- Schema Addendum v1.2 — Database Performance Indexes
-- Append this to your schema record; run via Supabase MCP or Dashboard.
-- ============================================================

-- ---------------------------------------------------------
-- 1. Indexes for Reports Table
-- ---------------------------------------------------------
-- Improves query performance when filtering reports by reporter or the reported user.
create index if not exists idx_reports_reporter on public.reports(reporter_id);
create index if not exists idx_reports_reported_user on public.reports(reported_user_id);

-- ---------------------------------------------------------
-- 2. Indexes for Problem Interests Table
-- ---------------------------------------------------------
-- Improves query performance when a developer views all problems they are interested in.
-- (The existing unique constraint on (problem_id, developer_id) already covers problem_id lookups).
create index if not exists idx_problem_interests_developer on public.problem_interests(developer_id);

-- ---------------------------------------------------------
-- 3. Indexes for Blocks Table
-- ---------------------------------------------------------
-- Improves query performance when a user checks their blocked users list.
create index if not exists idx_blocks_blocker on public.blocks(blocker_id);
create index if not exists idx_blocks_blocked on public.blocks(blocked_id);
