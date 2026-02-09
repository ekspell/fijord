# Fjord — Handoff Notes (Feb 8, 2026)

## What We Built Today

### 1. Single-Shot Pipeline (transcript in, kanban board out)
Replaced the old progressive drill-down flow (click problem → generate solution → click work item → generate ticket) with a single-shot experience. User pastes a transcript, sees a processing animation with real progress, and lands on a 3-column board.

### 2. Chained API Calls with Real Progress
- `/api/process` extracts problems from the transcript (Haiku 4.5)
- `/api/generate-solution` runs in parallel for every problem (Haiku 4.5)
- Progress steps update live with real data ("Found 3 problems", "6 tickets created")
- Total pipeline takes ~10-20 seconds depending on transcript length

### 3. 3-Column Results View (Scope)
After processing, the user sees three columns:
- **Evidence**: All quotes from the transcript, styled with left border
- **Problems**: Grouped pain points with amber cards and quote counts
- **Suggested Tickets**: Clickable ticket cards with ID, priority badge, and link to parent problem

### 4. Ticket Detail Page
Clicking a ticket card calls `/api/generate-ticket` (Sonnet 4.5) and shows a full ticket view:
- Two-column layout: main card + right sidebar
- Problem statement, description, acceptance criteria (3-5 items)
- User quotes, details panel, source transcript link

### 5. Top Nav with Context-Driven Tabs
- Removed the sidebar navigation
- Added sticky top nav: Discovery, Scope, Roadmap
- Nav state managed via React Context (`NavProvider` / `useNav`)
- Tab auto-advances from Discovery → Scope when processing completes

### 6. Discovery Landing Page
- Moved from `/meeting/new` to `/` (root route)
- Transcript paste area, "Record using Granola" button, file drop zone
- Error display for failed API calls

## What's Working

- Paste transcript → real processing animation → 3-column results
- Click ticket card → loading indicator → full ticket detail view
- Back navigation from ticket detail to results (state preserved)
- Top nav auto-switches to Scope after processing
- AI filters out small talk and requires evidence-backed problems
- Concise ticket generation (2-3 sentence descriptions, 3-5 acceptance criteria)
- JSON truncation detection on all API routes (`stop_reason` check)

## What's Next

- **Roadmap tab**: Build the Now / Next / Later kanban view (data structure exists in the HTML prototype)
- **Design Brief**: AI-generated design brief from transcript (screen exists in prototype)
- **Transcript viewer**: Slide-out panel that highlights quotes in context
- **File upload**: Wire the drop zone to actually parse .txt/.md/.pdf/.docx files
- **Granola integration**: Connect the "Record using Granola" button
- **Export**: "Save to roadmap" and "Export to Linear" functionality
- **Persistence**: Currently all state is in-memory; add database or local storage
- **Error recovery**: If one solution generation fails, still show partial results

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| One API call vs. chained calls | **Chained** (`/process` → `/generate-solution` × N in parallel) | Reliability (smaller JSON per call), real progress feedback, speed through parallelism |
| Navigation pattern | **Top nav with context**, no sidebar | Simpler for the target user (small startups, solo entrepreneurs). Sidebar was too complex for MVP |
| Model selection | **Haiku 4.5** for extraction + solutions, **Sonnet 4.5** for full ticket detail | Haiku is fast and cheap for structured extraction; Sonnet gives higher quality for the detailed ticket the user reads carefully |
| State management | **In-page state** (no database) | Ship fast for MVP; all data flows from transcript → results in one session |
| Results layout | **3-column board** (Evidence → Problems → Tickets) | Matches the "wow moment" the founders wanted — transcript in, kanban out |
| Tab auto-advance | **Discovery → Scope** on completion | Makes the flow feel like forward progress; user doesn't need to click a tab |

## File Map

```
app/
  page.tsx              — Discovery landing (transcript input + processing animation)
  results.tsx           — 3-column Scope view (Evidence, Problems, Tickets)
  ticket-detail.tsx     — Full ticket detail view (two-column layout)
  nav-context.tsx       — React Context for active tab state
  layout.tsx            — Root layout with NavProvider + TopNav
  globals.css           — Tailwind v4 theme tokens
  components/
    top-nav.tsx         — Sticky top nav (Discovery, Scope, Roadmap)
  api/
    process/route.ts    — Extract problems from transcript (Haiku 4.5)
    generate-solution/  — Generate solution + work items per problem (Haiku 4.5)
    generate-ticket/    — Generate full ticket detail (Sonnet 4.5)
lib/
  types.ts              — Shared TypeScript types
```

## Rollback

Git tag `v1-progressive-pipeline` preserves the old progressive drill-down flow if needed.
