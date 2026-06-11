# Listing-flow tool comparison

A short evaluation of project-management tools against Alan's stated needs, written as part of the listing-flow problem he raised.

## What Alan actually said he wanted

From his message, reduced to testable criteria:

| # | Criterion | Why it matters |
|---|---|---|
| **A** | One source of truth Marie works out of | "right now tasks are all over the place" |
| **B** | Team gets the same live view | "we can have a real time view on things" |
| **C** | Subscribe to a listing | "we get the same view live and can subscribe" |
| **D** | Visible timeline / dates | "there is no timeline in there" (Trello) |
| **E** | Calendar integration | replaces Marie manually blocking calendars |
| **F** | Real estate fit | listings have predictable stages (pre-list → photos → MLS → live → pending → closed) |
| **G** | Low onboarding friction | Marie is the bottleneck; if she won't switch, nothing else matters |
| **H** | Mobile usable | Marie is in the field; she's not at a desk during showings |

---

## Tools I evaluated

I tested each by modeling **the Ridgeglen listing** (4 bd / 3 ba, Photos stage) with its real task list (pre-listing walkthrough, stager visit, exterior + drone, interior, twilight, floor plan, marketing copy, MLS entry, sign install, broker tour, open house).

### Scoring

✅ strong · ⚠️ partial / requires workaround · ❌ missing

| Tool | A: 1 source | B: Live view | C: Subscribe | D: Timeline | E: Calendar | F: RE fit | G: Onboarding | H: Mobile |
|---|---|---|---|---|---|---|---|---|
| **Trello** (current) | ⚠️ | ⚠️ | ⚠️ | ❌ | ⚠️ | ❌ | ✅ | ✅ |
| **Asana** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| **ClickUp** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ |
| **Monday.com** | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| **Notion** | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | ⚠️ | ⚠️ | ⚠️ |
| **Airtable** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ |
| **Brivity** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| **Open To Close** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ |

---

## Notes on each tool

### Trello (the current state)
What's wrong isn't really Trello — it's that Marie's board is private and nobody else can see it. Trello has:
- ❌ no built-in timeline / Gantt (paid power-ups add one but it's clunky)
- ⚠️ calendar sync exists but is per-board and limited
- ✅ very low friction — Marie already uses it
- ❌ no "subscribe to card from outside the org" without paid users

**Fixable failure mode:** if you just shared Marie's Trello board with the team and turned on the Calendar power-up, you'd solve maybe 50% of Alan's pain for $0 in onboarding cost. Worth raising as the "do nothing dramatic" baseline.

### Asana
The strongest generalist. Has list, board, and **Timeline** (Gantt) views built in. Project-level subscriptions ("Follow") notify on every change. Two-way Google Calendar sync. Project templates exist but no real-estate-specific ones — you'd build the listing pipeline template once.
- Free tier covers 15 users with most features
- **Risk:** Marie has to learn a new tool. Asana is more abstract than Trello.

### ClickUp
Feature-superset of Asana. Has every view Alan would ever ask for (board, list, Gantt, calendar, workload, mind map). Watchers + notifications are first-class.
- **Risk:** "too many knobs" — most teams that pick ClickUp end up using 20% of it and onboarding takes weeks. Marie is the bottleneck and ClickUp is the highest-friction option in this list.

### Monday.com
Closest to Trello visually but with proper timelines and shared views. Per-item subscriptions ("Subscribe" button on a row) match Alan's literal ask exactly. Real-estate templates exist in their template gallery.
- Per-seat pricing gets expensive past ~5 users.
- Strong mobile.

### Notion
Tempting because everyone has it. But:
- ❌ no native calendar sync to Google
- ⚠️ databases can do kanban + timeline but timeline view is weak
- ❌ realtime presence is good for docs, not great for "Marie moved a card and I got pinged"

**Verdict:** Notion is a docs tool that grew a database, not a PM tool. Skip for this use case.

### Airtable
Genuinely powerful — could build exactly the data model the prototype uses. Interface Designer would let you ship custom dashboards.
- ❌ Marie is not going to learn Airtable. This is a dev-built tool.

### Brivity (real estate–specific)
Built for residential brokerages. Has listing pipelines, transaction timelines, seller portals, and Google Calendar sync out of the box. KW-friendly.
- Has the real-estate vocabulary built in (escrow, contingencies, disclosures).
- ⚠️ Paid only. Pricing is per-user, by quote.
- ⚠️ It's a CRM + transaction manager + PM bundled together. You may pay for surfaces you don't use.

### Open To Close (real estate–specific)
Transaction-management focused, very close to what Alan described in spirit. Has subscriber views, calendar sync, listing checklists shipped as templates.
- ⚠️ Same caveat as Brivity: paid, sales-led, harder to trial.

---

## What I'd recommend, in order

1. **Two-week trial: Asana**, with a "Listings" project using Timeline view + per-listing project subscriptions. It's the lowest-risk move that solves A–E for free and is the path that any KW office could replicate. **Marie owns the Asana board** — that's the principle Alan articulated.
2. **If Asana works but feels generic, evaluate Brivity** next. Pay for the real-estate fit (criterion F) only after proving the workflow change sticks with a free tool.
3. **The custom prototype** (this repo) stays in your back pocket as: "and if we ever want this purpose-built and free, here's what it looks like." It's also a portfolio piece for me regardless of what the team picks.

### What I would not recommend
- **Notion** — wrong tool category.
- **ClickUp** — too many features; Marie won't adopt it.
- **Airtable** — needs a developer to maintain.

---

## Test plan for the trial

If you go with Asana:

1. Marie creates a "Listings" Asana project with a custom task template containing the 11 standard listing tasks (the same ones seeded into the prototype repo).
2. Each listing = a section in that project. Tasks within = dated subtasks.
3. Marie's Google Calendar is two-way synced (Asana setting).
4. Interns and Alan are added as project members and **Follow** specific listings.
5. **Test it on Ridgeglen for two weeks.** Did Alan still have to ask when photos were? Did Marie open Trello once? Those are the only two questions that matter at the end of the trial.

---

*Written by Solomon Mungai, KW intern, June 2026.*
