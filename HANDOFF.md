# Fjord — Handoff Notes (Feb 12, 2026)

## What We Built Today

### 1. Ticket Detail Back Navigation (user feedback fix)
- Added a left arrow icon + green accent color to the breadcrumb on ticket detail view
- "← Scope > FJD-101" and "← Roadmap > FJD-101" are now clearly clickable
- Pattern is consistent across both Scope and Roadmap drill-in

### 2. Save-to-Roadmap Flow Improvements (user feedback fix)
- Added hint text "Select tickets to add to your roadmap" above ticket cards (disappears once a ticket is checked)
- Enlarged checkboxes (h-4 w-4 with thicker border) for visibility
- "Save to roadmap" button gets a green glow/shadow when tickets are selected
- After saving: clears selection, shows toast "3 tickets added to Roadmap" with clickable **View Roadmap →** link
- User stays on Scope page instead of being auto-switched to Roadmap

### 3. Toast System Upgrade
- Toast now supports an optional action (label + onClick callback)
- Action renders as a clickable green link with arrow (e.g. "View Roadmap →")
- Toasts with actions stay visible longer (4s vs 2.5s)
- Toast icon changed from gray to accent green

## Previous Session (Feb 10, 2026)

### Built
- Global toast notification system for "coming soon" placeholders
- Error recovery on failed ticket generation (click to retry)
- Delete tickets from roadmap with confirmation modal
- Typography & spacing polish (48px headings, 40px global gap, 120px Discovery offset, 1100px max-width)
- UI cleanup (removed stat pills, roadmap action bars, file upload, disabled Record button)
- Deployed to Vercel at **https://fijord.app**
- Created `PROJECT-STATUS.md`

## What's Working

- Full end-to-end pipeline: paste transcript → processing animation → 3-column Scope board
- Click ticket → generate full detail (Sonnet 4.5) → two-column detail view with inline editing
- Clear back navigation from ticket detail to parent view (Scope or Roadmap)
- Save selected tickets to roadmap with success toast + "View Roadmap →" action
- Roadmap: drag-and-drop kanban (Now/Next/Later), delete with confirmation, ticket detail
- All text fields inline-editable (title, description, problem statement, acceptance criteria)
- Acceptance criteria checkboxes with persistence
- Transcript drawer highlighting quotes in context
- Color-coded problem threading across Evidence/Problems/Tickets columns
- Roadmap persisted to localStorage (`fjord-roadmap-v3`)
- Toast system with optional action links
- Error state with retry on failed ticket generation
- Live at **https://fijord.app**

## What's Next

- **Authentication**: Supabase Auth selected as provider — needs sign-in method decision (Google, email/password, etc.) and implementation
- **Database**: Supabase Postgres to replace localStorage — persist transcripts, tickets, roadmaps per user
- **Multi-tenancy**: Each user sees only their own data
- **Payments**: Stripe integration for subscriptions
- **Linear/Jira export**: UI exists (buttons + selection), backend needs wiring
- **File upload**: Parse .txt/.md/.pdf/.docx transcripts
- **Recording**: Granola or similar integration
- **Error boundaries**: React error boundaries for crash recovery
- **Rate limiting**: Protect API routes from abuse

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth provider | **Supabase Auth** | Bundles auth + database in one platform, avoiding multiple vendor integrations |
| Deployment | **Vercel** at fijord.app | Native Next.js support, easy domain setup, auto-SSL |
| Heading typography | **48px / weight 300 / -1px tracking** | Clean, modern look — consistent across all pages |
| Content max-width | **1100px** on all pages | Consistent left/right padding across Discovery, Scope, and Roadmap |
| Coming-soon features | **Toast notifications** | Lets users know features exist without cluttering UI with disabled states |
| Roadmap chrome | **Removed action bars** | Stripped header buttons and bottom bar to simplify the view |
| Save-to-roadmap UX | **Toast + stay on page** | User stays on Scope after saving; toast with "View Roadmap →" link lets them navigate when ready |

## File Map

```
app/
  page.tsx              — Discovery landing (transcript input + processing animation)
  results.tsx           — 3-column Scope view (Evidence, Problems, Tickets)
  roadmap.tsx           — Now/Next/Later kanban with drag-and-drop
  ticket-detail.tsx     — Full ticket detail view (two-column, inline editable)
  nav-context.tsx       — React Context: tabs, results, roadmap, toast system (with action links)
  transcript-drawer.tsx — Slide-out transcript panel with quote highlighting
  layout.tsx            — Root layout with NavProvider + TopNav
  globals.css           — Tailwind v4 theme tokens + animations
  components/
    top-nav.tsx         — Sticky top nav (Discovery, Scope, Roadmap)
    editable-fields.tsx — EditableText, EditableTextarea, EditableList, EditablePriority
  api/
    process/route.ts         — Extract problems from transcript (Haiku 4.5)
    generate-solution/       — Generate solution + work items per problem (Haiku 4.5)
    generate-ticket/         — Generate full ticket detail (Sonnet 4.5)
lib/
  types.ts              — Shared TypeScript types
PROJECT-STATUS.md       — Full product status inventory
```
