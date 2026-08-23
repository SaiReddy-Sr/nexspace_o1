# PRD — Dev Portfolio Marketplace (nexspace_o1)

Status: v1 planning · Last updated: 2026-08-23

## 1. Vision

A feed-based social platform for web developers to post live, working web
apps (screenshots/short clips + description + tech tags + live link).
Visitors browse the feed publicly with no login. Developers get discovered
by peers and, eventually, by clients — but **v1 is built and validated
developer-first.**

## 2. v1 Scope Decisions (locked)

These were explicitly decided during planning — do not silently change them:

| Decision | Answer | Why |
|---|---|---|
| Who is seeded first | **Developers** | Feed has no value with zero posts; client side comes later |
| Primary v1 retention loop | **Dev-to-dev visibility & feedback**, not client leads | Clients won't be present at launch — selling "get hired" on day one sets a false expectation |
| Dead/broken live app links | **Ignored for v1** | Accepted tradeoff, not a bug — revisit post-launch |
| Payments / contracts on-platform | **Out of scope entirely for v1** | Pure lead-gen; chat happens, deal happens off-platform |
| Client chat abuse handling | **Basic block/report only, no full moderation system** | Needed the moment dev-to-dev chat ships (week one), not deferred |

## 3. Users

- **Developer** — creates a profile, posts projects (live app + media +
  tags), browses others' work, can message other developers.
- **Client / Visitor** — browses the public feed anonymously; must create a
  lightweight account (magic link) only at the point of messaging a
  developer from a specific project post.

## 4. Core User Flows

1. **Developer onboarding** → signup → select role (developer) → set
   username/bio → land on empty dashboard prompting first post.
2. **Post a project** → compress media client-side → upload to Supabase
   Storage → fill title/description/tags/live URL → publish → appears in
   public feed immediately.
3. **Anonymous browsing** → `/` feed, infinite scroll (10/page) → click a
   post → `/project/[id]` → click live link to test the app.
4. **Client engagement** → on a project page, click "Message developer" →
   if not authenticated, lightweight signup (magic link) → redirected back
   → conversation created, chat drawer opens.
5. **Dev-to-dev messaging** → same chat drawer, triggered from another
   developer's project page → both parties can block/report.

## 5. Tech Stack (fixed constraints)

- Frontend: Next.js (App Router), React, Tailwind CSS
- Backend/DB/Auth/Storage/Realtime: Supabase (Postgres)
- IDE/Agent: Antigravity IDE (Gemini 3.1 Pro High for schema/RLS-sensitive
  work; Flash-tier acceptable for repetitive scaffolding once schema is
  stable; Claude models when weekly quota allows)
- Deploy: Vercel Hobby tier, GitHub-integrated CI/CD

## 6. Free-Tier Architecture Rules (non-negotiable)

1. Client-side image compression (`browser-image-compression`) before
   upload — WebP, max width 1200px, target < 200KB.
2. No Vercel `<Image />` transformation pipeline — plain `<img>` tags
   pointing at Supabase public CDN URLs only.
3. All feed queries paginated via `.range(start, end)`, 10 rows/page. No
   unbounded `select('*')` on `projects`.
4. Supabase Realtime sockets scoped **only** to an open chat drawer
   component; explicitly disconnected (`removeChannel`) on drawer close.
   Never a global/app-wide realtime connection.

## 7. Data Model (summary — full SQL in `schema.sql`)

- `profiles` — id (= auth.users id), role (`developer`|`client`),
  username, bio, avatar_url
- `projects` — developer_id, title, description, tech_tags[], live_url,
  media_url, media_type
- `conversations` — project_id (nullable for pure dev-to-dev), initiator_id,
  recipient_id, conversation_type (`client_to_dev`|`dev_to_dev`),
  last_message_at
- `messages` — conversation_id, sender_id, content, read_at

RLS: public read on `profiles`/`projects`; write restricted to the owning
`auth.uid()`; `conversations`/`messages` readable/writable only by their
two participants. Storage bucket `project-media` is public-read,
write-restricted to the uploading user's own folder.

## 8. Out of Scope for v1

- Payments, escrow, contracts, invoicing
- Automated dead-link detection/cleanup
- Video transcoding/compression pipeline (raw upload with a hard size cap
  only)
- Full trust & safety system (reputation scores, automated moderation,
  admin review queues) — only basic block/report
- Notifications beyond in-app (no email/push in v1)

## 9. Success Signals for v1

- A working developer can go from signup → published post → visible in
  public feed in under 5 minutes.
- At least one real dev-to-dev conversation happens without the platform
  breaking (realtime delivery works, socket cleanup works).
- Feed remains fast/cheap at ~50–100 posts without egress blowing past
  Supabase free tier.

## 10. Open Questions (deliberately parked, not forgotten)

- Long-term monetization if v1 stays pure lead-gen (no commission).
- Whether/when to introduce dead-link checking.
- Whether to eventually gate posting behind minimal review to keep feed
  quality high as volume grows.

## 11. Build Plan

See `implementation_roadmap.md` for the full phase-by-phase plan.
Phase order: scaffold → database → auth/profiles → media upload →
post-a-project → public feed → project detail + client gate → realtime
chat → dev-to-dev messaging → free-tier hardening pass.
