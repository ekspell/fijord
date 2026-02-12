# Fjord — Handoff Notes (Feb 10, 2026)

## What We Built Today

### 1. Global Toast Notification System
Added a `showToast()` function to NavContext that renders a bottom-center toast with auto-dismiss (2.5s). Used across the app for "coming soon" placeholders on Record, Linear, and Jira buttons.

### 2. Error Recovery on Ticket Generation
Both Scope and Roadmap views now show a "Failed to load — click to retry" state on ticket cards when `/api/generate-ticket` fails, with a red icon indicator.

### 3. Delete Tickets from Roadmap
Added an X button (visible on hover) to each roadmap ticket card. Clicking it opens a confirmation modal ("Are you sure you want to delete?") before removing the ticket.

### 4. Typography & Spacing Polish
- All page headings standardized: 48px, weight 300, -1px letter-spacing
- Added font weight 300 (light) to DM Sans
- Global header gap set to 40px below top nav divider (`pt-10` on `<main>`)
- Discovery page heading sits 120px below divider (80px extra padding)
- All pages aligned to `max-w-[1100px]`

### 5. UI Cleanup
- Removed stat pills (quotes/problems/tickets) from Scope page header
- Replaced `↓` with `↳` on problem card quote counts
- Removed "Export to Linear" / "+ New call" buttons and bottom action bar from Roadmap
- Disabled "Record meeting" button with "coming soon" label
- Removed file upload drop zone from Discovery page
- Fixed six-dot typo in processing step copy

### 6. Deployment
- Deployed to Vercel at **https://fijord.app**
- Set up `ANTHROPIC_API_KEY` as environment variable on Vercel
- Local repo linked to `fijord` Vercel project

### 7. Documentation
- Created `PROJECT-STATUS.md` — full inventory of features, stubs, and production gaps
- Exported morning session transcript for YC application

## What's Working

- Full end-to-end pipeline: paste transcript → processing animation → 3-column Scope board
- Click ticket → generate full detail (Sonnet 4.5) → two-column detail view with inline editing
- Roadmap: drag-and-drop kanban (Now/Next/Later), delete with confirmation, ticket detail
- All text fields inline-editable (title, description, problem statement, acceptance criteria)
- Acceptance criteria checkboxes with persistence
- Transcript drawer highlighting quotes in context
- Color-coded problem threading across Evidence/Problems/Tickets columns
- Roadmap persisted to localStorage (`fjord-roadmap-v3`)
- Global toast for coming-soon feature placeholders
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

## File Map

```
app/
  page.tsx              — Discovery landing (transcript input + processing animation)
  results.tsx           — 3-column Scope view (Evidence, Problems, Tickets)
  roadmap.tsx           — Now/Next/Later kanban with drag-and-drop
  ticket-detail.tsx     — Full ticket detail view (two-column, inline editable)
  nav-context.tsx       — React Context: tabs, results, roadmap, toast system
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
