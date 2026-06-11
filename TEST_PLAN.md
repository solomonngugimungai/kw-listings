# Test plan: Notion vs. Asana on the Ridgeglen listing

A 2-week parallel trial to pick which tool replaces Marie's private Trello board, scored against Alan's stated needs. The output is a one-page recommendation to Alan.

## Why this test exists

Alan asked for *"one source that Marie works out of and we get the same view live and can subscribe."* He explicitly asked us to **explore a new tool** — not optimize Trello. This test compares the two strongest candidates given the KW stack (Atlassian, Gmail, Dropbox, Slack):

- **Notion** — flexible database, lower learning curve, weakest calendar sync
- **Asana** — purpose-built PM tool, tightest Slack/Gmail/Calendar integrations, slight learning curve

We're testing on **1842 Ridgeglen Dr, San Jose** — the listing Alan named in his message. Real listing, real tasks, real pain.

---

## Roles & timeline

| Day | Marie | Intern A (Notion) | Intern B (Asana) | Alan |
|---|---|---|---|---|
| 1 | Pick which tool she wants to run Ridgeglen in (after a 30-min demo of each from interns) | Build Notion workspace + Ridgeglen page | Build Asana project + Ridgeglen task list | — |
| 2 | Start working out of her chosen tool | Mirror Marie's daily moves in Notion | Mirror Marie's daily moves in Asana | Subscribe to Ridgeglen in both tools |
| 3–12 | Daily work in her chosen tool | Keep parallel tool in sync; run scenario tests | Keep parallel tool in sync; run scenario tests | Try to answer "when are photos?" in both, time it |
| 13 | 20-min interview with both interns about what worked | Write up scorecard | Write up scorecard | — |
| 14 | — | Deliver 1-page recommendation to Alan | (joint deliverable) | Decides |

**Marie does not double-work.** She runs her listing in one tool. The other intern mirrors her workflow in the parallel tool so we have a real comparison without burning her time.

---

## Setup checklist (Day 1)

### Both tools — common setup

1. Workspace named **"KW Listings"** (or similar — match what Alan would name it).
2. Add members: Marie, Alan, both interns.
3. Connect Slack to channel **#listings-flow** (create the channel if needed).
4. Connect Google Calendar of every team member.
5. Connect Dropbox to the **KW / Listings / Ridgeglen** folder.

### Notion-specific setup

Build two linked databases (the structure from the comparison doc):

```
📋 Listings (database)
   Properties: Address, Nickname, Stage (select), Price, Beds, Baths, Sqft,
               Target Live Date, Cover Photo, Seller, Owner, Dropbox folder URL
   Views:  • Board (group by Stage)
           • Calendar (by Target Live Date)
           • Timeline (Start = Pre-list, End = Closed)
           • Gallery (cover photo)

📅 Tasks (database)
   Properties: Title, Listing (relation → Listings), Due, Duration, Status,
               Category, Assignee
   Views:  • Calendar (by Due)
           • This Week (filter)
           • Per-Listing (linked view embedded in each Listing page)
```

Seed it with the **Ridgeglen tasks** from `supabase/migrations/0002_seed.sql` (pre-listing walkthrough → open house, all 11 of them).

Turn on:
- Notion Calendar app → sync to each team member's Google Calendar
- Slack integration → post on `Stage` property change in Listings database

### Asana-specific setup

1. Create project **"KW Listings"** as a Board project.
2. Sections = stages: **Pre-list / Photos / Staging / MLS / Marketing / Live / Pending / Closed**.
3. Create task template **"New listing"** with the 11 subtasks (the seed task list).
4. Use that template to create the **Ridgeglen** task. Set due dates.
5. Switch to **Timeline view** — confirm the dated subtasks render.
6. Slack: install Asana for Slack → connect to `#listings-flow` → set to notify on status changes.
7. Google Calendar: each member adds the **My Tasks** calendar sync URL to their Google Calendar.
8. Dropbox: connect Dropbox app → attach Ridgeglen photos folder to the task.
9. Alan + interns click **Follow** on the Ridgeglen task.

---

## Test scenarios

Each scenario is run in **both tools** by both interns and scored on the rubric below. Record outcomes in a shared sheet — one row per scenario per tool.

### Scenario 1 — The "when are photos" test

> Replicates Alan's literal complaint: *"I was just looking for when photos were for Ridgeglen."*

**Setup:** Alan opens the tool on his phone (mobile is critical — he's not at a desk).

**Task:** Answer three questions out loud, while a stopwatch runs:
1. When are photos for Ridgeglen?
2. Who's doing them?
3. What's the next thing that needs to happen after photos?

**Pass criteria:** All three answered in under 30 seconds without asking anyone.

---

### Scenario 2 — Real-time co-editing

**Setup:** Marie has the tool open on her laptop. Intern A has it open on theirs. Both on the Ridgeglen view.

**Task:** Marie reschedules "Twilight photos" from Tuesday 5:30pm to Wednesday 5:30pm.

**Measure:**
- Did intern A see the change live? (without refreshing)
- How many seconds delay?
- Did intern A get a notification? In-app? Email? Slack?

**Pass criteria:** Change visible to intern A within 5 seconds; notification lands within 30 seconds.

---

### Scenario 3 — Google Calendar sync (both directions)

**Setup:** Each member's Google Calendar is subscribed to the tool's feed.

**Task A (tool → calendar):** In the tool, add a new task: **"Open house — Sun"**, Sunday 1pm, 3hr duration, on Ridgeglen.

**Measure:** Does it appear in everyone's Google Calendar? How long? Is the title readable ("Ridgeglen: Open house" not "Task #4729")?

**Task B (calendar → tool):** Marie drags the open house event from Sunday 1pm to Sunday 2pm in her Google Calendar.

**Measure:** Does the tool reflect the change? (Spoiler: only Asana does. This is where Notion loses ground.)

**Pass criteria:** Tool → calendar must work. Calendar → tool is a nice-to-have.

---

### Scenario 4 — Subscribe & be notified

**Setup:** Alan subscribes to the Ridgeglen listing/task. He turns off email digests, leaves push on.

**Task:** Marie moves Ridgeglen from **Photos → Staging** AND completes the "Floor plan" task.

**Measure:**
- Did Alan get pinged? Where (email / Slack / push)?
- Was the message useful or generic ("Card updated" doesn't count)?
- Time from action to ping?

**Pass criteria:** Alan gets a Slack notification within 60 seconds with the listing name and what changed.

---

### Scenario 5 — Dropbox attachments

**Task:** Intern attaches the Ridgeglen drone photos folder from Dropbox to the listing.

**Measure:**
- Can the team **preview** the photos in the tool, or just see a link?
- If Marie uploads a new photo to the Dropbox folder, does it appear in the tool without re-attaching?

**Pass criteria:** At minimum, link works and opens to Dropbox. Bonus: inline previews.

---

### Scenario 6 — The Marie test (the only one that really matters)

**Setup:** None — this is observational over the full 2 weeks.

**Questions to answer at end of Week 2:**

1. Did Marie open the new tool every working day? (Y/N per day)
2. Did Marie open her old Trello board after Day 3? (How often?)
3. When asked, did Marie say she preferred the new tool to Trello? (Direct interview)
4. Did Marie add a *second* listing to the new tool unprompted? (Strongest signal of buy-in)
5. What did Marie hate about it?

**Pass criteria:** Marie uses it daily, didn't go back to Trello, and would add another listing without being asked.

---

### Scenario 7 — Stage discipline

**Task:** Mid-week, move Ridgeglen from Staging → MLS → Marketing in quick succession.

**Measure:**
- Does the **Activity feed / Inbox / notification stream** clearly show all three moves in order?
- Can Alan reconstruct the day's progress just by opening the activity feed?

**Pass criteria:** Activity is human-readable, ordered, and tells the story.

---

## Scoring rubric

Score each scenario per tool. Sum at the end.

| Dimension | Score |
|---|---|
| **Worked first try?** | 2 = yes · 1 = with workaround · 0 = no |
| **Marie's reaction** | 2 = "yes good" · 1 = neutral · 0 = "no" / confused |
| **Setup time** | 2 = <5 min · 1 = 5–20 min · 0 = >20 min |
| **Mobile experience** | 2 = great · 1 = OK · 0 = broken |

Max score per scenario: 8. Max total (7 scenarios): 56.

---

## Outside the rubric — the gut checks

These don't get scored but they matter:

- **Does Marie smile or sigh when she opens it?** (Watch her face on Day 5.)
- **When Alan says "where are we on Ridgeglen?" in the hallway**, can you answer from your phone before you reach your desk?
- **Did anyone text Marie this week to ask about a listing date?** (If yes, the tool is failing.)
- **Did the calendar blocks stop?** (The single clearest signal of success.)

---

## Final deliverable (Day 14)

A 1-page summary for Alan in this exact structure:

1. **Recommendation:** "Use [Notion / Asana]. Roll out next week."
2. **Scoring table** (7 rows × 2 tool columns × the 4 dimensions).
3. **Marie's verdict** — direct quote.
4. **Three things that broke** in the trial and how they were fixed.
5. **One slide of cost** (per-seat, per-month, including any Atlassian Premium / Notion Plus charges).
6. **The prototype as a footnote:** "If neither tool sticks long-term, we have a custom prototype at kw-listings.vercel.app showing what a purpose-built KW tool could look like."

Deliver it as a Google Doc Alan can comment on. Not a PowerPoint.

---

## Risks & what to watch for

- **Notion's calendar sync is the failure point.** If Marie reverts to manually blocking calendars in Week 1, the test is over — Notion failed Scenario 3 and that's a dealbreaker.
- **Asana's learning curve is the failure point.** If Marie says "I don't get it" after Day 3, switch to giving her a 1:1 onboarding session before declaring failure.
- **The trial itself can pollute results.** Marie working in two tools at once isn't realistic. That's why she picks one and the intern shadows. Do not break that pattern.
- **Beware the "everyone's just being polite" effect.** End-of-week-2 interviews should be done by the person Marie is *least* likely to want to please. Not Alan, not Solomon — pick the most neutral intern.

---

*Written by Solomon Mungai, KW intern, June 2026.*
