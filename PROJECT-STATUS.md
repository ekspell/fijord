# Fjord — Project Status

## What's Built & Working

### Single-Shot Pipeline
Paste a transcript → AI extracts problems → generates solutions in parallel → displays results on a 3-column board. Total pipeline takes ~10-20 seconds.

- **`/api/process`** — Extracts problems, quotes, and meeting metadata (Haiku 4.5)
- **`/api/generate-solution`** — Generates one solution + 2-5 work items per problem, run in parallel (Haiku 4.5)
- **`/api/generate-ticket`** — Generates full ticket detail on click (Sonnet 4.5)
- All routes have retry logic (3 attempts, exponential backoff) and JSON truncation detection

### Discovery Page (`app/page.tsx`)
- Transcript paste area with "Process transcript" button
- Real-time 4-step progress animation during processing
- Auto-advances to Scope tab on completion

### Scope View (`app/results.tsx`)
- 3-column board: Evidence → Problems → Suggested Tickets
- Color-coded problem threading across columns
- Click a problem to filter all columns to that problem
- Click a ticket card to generate and view full detail
- Ticket selection checkboxes + "Save to roadmap" button
- Transcript drawer on quote click (highlights quote in context)
- Error state with "click to retry" on failed ticket generation

### Roadmap (`app/roadmap.tsx`)
- 3-column drag-and-drop kanban: Now / Next / Later
- Tickets mapped by priority (High → Now, Med → Next, Low → Later)
- Delete ticket with confirmation modal
- Click ticket to view/edit full detail
- Empty state with CTA to process a transcript
- Persisted to localStorage (`fjord-roadmap-v3`)

### Ticket Detail (`app/ticket-detail.tsx`)
- Two-column layout: main content + sidebar
- All fields inline-editable: title, problem statement, description, acceptance criteria
- Acceptance criteria checkboxes (checked state persisted)
- Priority dropdown, status badge
- User quotes sidebar with transcript drawer
- Edits propagate back to parent (Scope or Roadmap)

### Shared Infrastructure
- **Nav Context** (`app/nav-context.tsx`) — React Context managing active tab, results, solutions, transcript, roadmap state, and a global toast system
- **Transcript Drawer** (`app/transcript-drawer.tsx`) — Slide-out panel that parses transcripts, highlights matched quotes with smart matching, and shows scroll direction indicator
- **Editable Fields** (`app/components/editable-fields.tsx`) — Reusable inline-edit components: EditableText, EditableTextarea, EditableList, EditablePriority
- **Top Nav** (`app/components/top-nav.tsx`) — Sticky nav with Discovery/Scope/Roadmap tabs, tab enablement logic, logo, avatar

---

## What's Incomplete or Stubbed Out

| Feature | Status | Notes |
|---------|--------|-------|
| Record meeting | Disabled button with "coming soon" toast | Placeholder for Granola integration |
| Send to Linear | Disabled button with "coming soon" toast | UI ready, no backend |
| Send to Jira | Disabled button with "coming soon" toast | UI ready, no backend |
| File upload | Removed from UI | Was drag-and-drop for .txt/.md/.pdf/.docx |

---

## What's Needed Before This Is a Sellable Product

### Must-Have

**Authentication & Accounts**
- User signup/login (e.g. Clerk, NextAuth, Auth0)
- Session management
- Multi-user support — each user sees only their own data

**Database**
- Replace localStorage with a real database (e.g. Supabase, PlanetScale, Neon)
- Persist transcripts, problems, tickets, and roadmaps per user
- Data survives across browsers/devices

**API Security**
- Rate limiting on all API routes
- Per-user usage tracking (each request burns Anthropic API credits)
- Input validation and sanitization beyond basic empty-string checks

**Payments**
- Stripe integration for subscriptions or usage-based billing
- Paywall / free tier logic

**Error Handling**
- React error boundaries to catch rendering crashes
- User-facing error messages with retry options on all views (not just ticket cards)
- Offline detection

### Should-Have

**Monitoring & Analytics**
- Error tracking (e.g. Sentry)
- Usage analytics (e.g. PostHog, Mixpanel)

**Integrations**
- Linear export (API exists, just needs wiring)
- Jira export
- File upload (.txt, .md, .pdf, .docx parsing)

**Legal**
- Terms of service
- Privacy policy
- Data handling documentation (transcripts may contain sensitive info)

### Nice-to-Have

- Team/workspace support
- Meeting recording (Granola or similar)
- Data export (CSV, JSON)
- Keyboard shortcuts
- Undo/redo on edits
