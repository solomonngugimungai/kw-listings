# KW Listings — one source of truth for the listing flow

A project-management tool built for the **Keller Williams listing flow**. Replaces the Trello-then-Google-Sheet-then-calendar-block tangle with a single live workspace.

Built as an intern project for Alan Wang & Marie. The thesis is simple:

> Marie works out of one tool. The rest of us see the same thing live and can subscribe to listings we care about.

**See also:**
- [`TOOL_COMPARISON.md`](TOOL_COMPARISON.md) — an evaluation of off-the-shelf tools (Trello, Asana, ClickUp, Monday, Notion, Airtable, Brivity, Open To Close) scored against Alan's stated needs
- [`TEST_PLAN.md`](TEST_PLAN.md) — a 2-week parallel trial of Notion vs. Asana on the Ridgeglen listing, with scenarios, scoring rubric, and the 1-page deliverable for Alan

---

## What's in it

- **Kanban board** — drag a listing through *Pre-list → Photos → Staging → MLS → Marketing → Live → Pending → Closed*. Everyone sees the move in real time.
- **Per-listing timeline** — every dated task (photos, broker tour, open house, MLS entry) in one scrolling list, grouped by day. Check things off as they happen.
- **Live calendar** — every task as a calendar event. Subscribe to the **iCal feed** from Google Calendar and stop blocking each others' calendars manually.
- **Subscribe to a listing** — get pinged when Marie moves a stage, completes a task, or comments. Watching a listing replaces the "wait, when are photos for Ridgeglen?" Slack messages.
- **Live activity feed** — audit trail of every move, every reschedule, every comment. Updates in real time via Supabase.
- **Discussion threads** — comments per listing so questions live where the work is.

Stack: **Next.js 16** (App Router, Turbopack) · **Supabase** (Postgres + Auth + Realtime) · **Tailwind v4** · **@dnd-kit** · **ics** (RFC-5545 calendar feed).

---

## Run it locally

### 1. Install

```bash
git clone https://github.com/<your-user>/kw-listings.git
cd kw-listings
npm install
```

### 2. Create a free Supabase project

Go to [supabase.com/dashboard](https://supabase.com/dashboard) and click **New project**. Pick any region; remember the DB password.

### 3. Run the migrations

In the Supabase dashboard open **SQL Editor**, paste and run:

1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — schema, RLS policies, triggers, realtime publication
2. [`supabase/migrations/0002_seed.sql`](supabase/migrations/0002_seed.sql) — six demo listings (including **Ridgeglen**) with realistic task timelines

### 4. Wire up your env

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste your project's URL and **anon** key from **Project Settings → API** in the Supabase dashboard.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Sign up some users (for subscribe + comments)

In your Supabase dashboard → **Authentication → Users → Add user**. Add yourself, Marie, and Alan as test users. Sign in inside the app to subscribe to listings and post comments.

> Without users, the board, calendar, and activity feed all still work — you just can't subscribe or comment.

---

## How to demo this to Alan

1. **Open the board** — show 6 listings spread across stages. Point at "Ridgeglen" sitting in *Photos*.
2. **Open a second browser window** side by side. Both show the same board.
3. **Drag Ridgeglen from *Photos* → *Staging*** in window 1. Window 2 updates instantly. Toast confirms in both.
4. **Click into Ridgeglen.** Walk through:
   - The dated timeline (every task that would have been a calendar block)
   - The **Subscribe** button → Alan can subscribe and stop hunting for photo dates
   - The comment thread — replaces the texts
5. **Open the Calendar tab** — every task as an event. Click **iCal feed** and paste into Google Calendar → "Other calendars → From URL". Tasks now show in Alan's calendar without Marie manually blocking time.
6. **Open the Activity tab.** Have someone in another window check off a task. Watch it appear live.

---

## Architecture

```
src/
├─ app/
│  ├─ page.tsx                  → Kanban board (home)
│  ├─ listings/[id]/page.tsx    → Detail (hero + timeline + comments)
│  ├─ calendar/page.tsx         → Month calendar of every task
│  ├─ activity/page.tsx         → Live audit log
│  ├─ api/ical/[token]/route.ts → iCal feed (?all or listing-id)
│  └─ layout.tsx
├─ components/
│  ├─ BoardClient.tsx           → dnd-kit board + realtime channel
│  ├─ ListingCard.tsx           → Draggable card with progress bar
│  ├─ TaskTimeline.tsx          → Day-grouped task list
│  ├─ CommentThread.tsx         → Realtime comment list
│  ├─ ActivityFeed.tsx          → Realtime audit log component
│  ├─ CalendarGrid.tsx          → Month view
│  ├─ Sidebar.tsx               → Nav rail
│  └─ ...
├─ lib/
│  ├─ supabase/{client,server,middleware}.ts
│  ├─ types.ts                  → Listing/Task/Activity shapes + stage theming
│  ├─ format.ts                 → Currency, date, time-ago helpers
│  └─ env.ts                    → Detect "Supabase not configured" state
└─ middleware.ts                → Supabase session refresh
supabase/migrations/
├─ 0001_init.sql                → Tables, RLS, triggers, realtime
└─ 0002_seed.sql                → Demo listings + tasks
```

### Data model

| Table | Purpose |
| --- | --- |
| `profiles` | Users + display info (joined from `auth.users`) |
| `listings` | One row per property. Stage column drives the kanban. |
| `tasks` | Dated work items. The calendar and timeline read from here. |
| `comments` | Discussion threaded per listing. |
| `subscriptions` | (listing, user) — who's watching what. |
| `activity` | Append-only audit log. Triggers fill it automatically. |

Postgres triggers append to `activity` on every stage change, task creation, task completion, due-date change, and new comment. The activity feed and live indicator subscribe to that table — that's what gives the realtime "things just happened" feel.

### iCal feed

`GET /api/ical/all` returns every task as a `text/calendar` response. `GET /api/ical/<listing-id>` returns one listing's tasks. Subscribe in Google Calendar → **Other calendars → Subscribe from URL** and paste the URL.

---

## Roadmap (if Alan likes it)

- [ ] Slack notifications for subscribers (Supabase webhook → Slack)
- [ ] Photo attachments per task (Supabase Storage)
- [ ] Document checklists (disclosures, prelim, etc.) per listing
- [ ] Per-stage SLA: "if a listing sits in MLS > 2 days, flag"
- [ ] Multi-tenant (one workspace per KW office)

---

## Made by

Built by Solomon Mungai as a response to Alan's listing-flow ask during the Keller Williams internship. June 2026.
