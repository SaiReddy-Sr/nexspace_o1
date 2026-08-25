# PRD Addendum v1.1 — Editing, Featured Ranking, Client Problem Posts

Status: locked · appended after v1 (Phases 0–9) was planned/built.

## New decisions (locked)

| Decision | Answer | Why |
|---|---|---|
| Project editing | Developers can edit their own posted projects | No schema change needed — existing RLS already covers it |
| "Ranking" | Manual/curated only (`projects.featured` boolean) | No engagement tracking (views/likes) exists yet; automatic ranking would need new instrumentation this wasn't worth building for v1.1 |
| Who sets `featured` | You, directly in the Supabase dashboard | Not exposed to developers in the edit form — must never be accepted from client-submitted update payloads |
| Client problem posts | New, separate `/requests` section — NOT mixed into the main project feed | Keeps the "browse developer work" feed and "clients asking for help" feed conceptually distinct for visitors |
| Who starts the conversation on a problem post | **Client still initiates** — developers signal interest first via a lightweight "I'm Interested" action, client picks who to message | Preserves the original anti-spam design goal (chats are always client-initiated) instead of letting problem posts become an unsolicited-pitch magnet |

## Schema changes (see `schema-addendum-v1.1.sql`)

- `projects.featured` (boolean, default false) — manual curation flag
- `problems` — new table for client-posted requests, public read, insert
  restricted to `role = 'client'`
- `problem_interests` — new table, one row per developer expressing
  interest in a problem, visible to that developer and to the problem's
  owning client only
- `conversations.problem_id` — new nullable column so a conversation can
  originate from either a project OR a problem (never both — enforced by
  a check constraint), with its own partial unique index to prevent
  duplicate threads

## New pages (Phases 10–11)

- Project edit form (developer-only, own projects only)
- `/requests` — public list of open client problem posts
- `/requests/new` — client-only problem-posting form
- `/requests/[id]` — problem detail; shows "I'm Interested" to developers,
  shows the interested-developer list + "Start Conversation" to the
  owning client

## Explicitly still out of scope

- Automatic/engagement-based ranking (would need view/like tracking —
  revisit only if `featured` manual curation turns out to be
  insufficient at scale)
- Any UI for reviewing `reports` (still Supabase-dashboard-only, per the
  original v1 PRD)
- Payments/budgets on problem posts — a problem post is a description of
  need, not a paid job listing, consistent with v1's lead-gen-only stance
