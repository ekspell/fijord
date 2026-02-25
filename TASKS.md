# Fijord Build Tasks

Build these in order. Use the existing design system (DM Sans, same colors, same spacing) and match the other pages we've built.

---

## Task 1: Signal Detail Page

**Route:** /signals/[id]

**Requirements:**
- Breadcrumb: Home > Signals > [Signal title]
- Header: Signal title with colored dot, status badge (Project/stable/new), "Create Epic" button
- Strength indicator: progress bar + "X% signal strength"
- Stats row: X meetings, Y quotes, First detected date
- Tags section: "Related topics" with removable pills + "Add tag" button
- Evidence section: Quotes grouped by meeting, each meeting collapsible with header showing title, date, quote count. Each quote has text (green left border), speaker, timestamp
- Timeline section: Visual timeline showing "Signal detected", "Growing pattern", "Strong signal" events

**Data:** Pull from signals context. Signal has: id, title, strength, status, meetingCount, quoteCount, tags[], firstDetected, quotes[]

**Click handlers:**
- "Create Epic" → opens modal
- Meeting group header → /meeting/[id]
- Tag X → removes tag
- Add tag → shows input

---

## Task 2: Meeting Detail Page

**Route:** /meeting/[id]

**Requirements:**
- Breadcrumb: Home > Meetings > [Meeting title]
- Header: Meeting title, date, duration, action buttons (View transcript, Reprocess, Delete)
- Participants row: Label + participant pills with avatars
- Problems extracted section: List of problem cards with title, ticket count badge, supporting quotes with speaker/timestamp
- Connections section (two-column grid):
  - "Contributing to signals" card with signal items
  - "Feeding epics" card with epic items + "Assign to another epic" button
- Transcript drawer: Slides in from right when "View transcript" clicked. Full transcript with highlighted extracted quotes. Overlay closes drawer.

**Data:** Meeting has: id, title, date, duration, participants[], transcript, problems[], signalIds[], epicIds[]

---

## Task 3: Epic Detail Page

**Route:** /epic/[id]

**Requirements:**
- Breadcrumb: Home > Epics > [Epic title]
- Header: Epic title, status badge (On track/At risk/Blocked), description
- Stats row: X tickets, Y shipped, Z meetings, W quotes
- **Tab navigation:** Discovery | Scope | Roadmap | Brief

### Discovery Tab (default)
- List of meetings feeding this epic
- Each meeting card shows: title, date, quote count, participant count
- "Add meeting" button to assign existing meetings or process new one
- Clicking meeting → /meeting/[id]

### Scope Tab
- Reuse existing Scope page functionality (problems → tickets)
- Problems list with evidence quotes
- Tickets generated from problems
- Export to Linear/Jira buttons

### Roadmap Tab
- Reuse existing Roadmap page functionality (kanban)
- Columns: Backlog, In Progress, Done
- Drag and drop tickets between columns

### Brief Tab (NEW - Task 4)
- See Task 4 below

**Data:** Epic has: id, title, description, status, owner, startDate, ticketCount, shippedCount, meetingIds[], quoteCount

---

## Task 4: Brief Tab

**Location:** Inside Epic detail page, Brief tab

**NOTE:** The Brief page styling already exists. This task is about wiring it up to real data and AI generation.

**Requirements:**
- Connect existing Brief UI to epic data
- AI generates content based on all evidence in the epic
- Wire up the following sections to pull from real data:
  - Problem statement (AI-generated summary)
  - Evidence/quotes section
  - Stats row (quote count, ticket count, etc.)
  - Related tickets/solutions
  - Open questions
- "Regenerate Brief" button triggers new AI summary
- "Copy to clipboard" copies formatted text
- "Export" button at bottom
- Brief auto-updates when new meetings/quotes are added to the epic
- Editable sections (user can override AI-generated text)
- Last updated timestamp

**Data flow:**
- Pull all meetings assigned to this epic
- Pull all quotes from those meetings
- Pull all tickets generated from those quotes
- Feed to AI to generate summary sections
- Cache the generated brief, regenerate on demand or when evidence changes

---

## Task 5: Create Epic Modal

**Trigger:** "Create Epic" button on signals page, signal detail, or epics page

**Requirements:**
- Modal overlay with form:
  - Title (required) — pre-filled if coming from signal
  - Description (optional)
  - Status dropdown: On track (default), At risk, Blocked
  - Owner (defaults to current user)
  - Assign meetings (optional multi-select)
- "Create" and "Cancel" buttons
- After creation → navigate to /epic/[newId]

---

## Task 6: Feedback System

**Requirements:**

### Floating feedback button
- Bottom-right corner on all pages
- Small "Feedback" button
- Opens modal with:
  - "How's Fijord working for you?"
  - Three emoji buttons: 😍 Useful | 😐 Meh | 😕 Confusing
  - After selection, show follow-up questions based on choice
  - Optional email field: "Can we follow up?"
  - Submit button

### Post-generation prompt
- Trigger: 8 seconds after tickets appear on Scope page
- Slide-in banner at bottom (not modal)
- "First time? We'd love your gut reaction."
- Same emoji options, then follow-up questions
- Only show once per user (localStorage flag)
- Dismissible with X

### Follow-up questions by response:

**If 😍 Useful:**
- "What stood out most?" (text)
- "Would you use this again?" [Definitely / Maybe / Probably not]

**If 😐 Meh:**
- "What were you hoping to see?" (text)
- "What would make this more useful?" (text)

**If 😕 Confusing:**
- "Where did you get stuck?" (text)
- "What did you expect to happen?" (text)

**Storage:** Save to Upstash Redis with timestamp, page URL, and all responses

---

## Task 7: Authentication (Supabase)

**Requirements:**

### Auth Provider
- Use Supabase Auth
- Support: Email/password, Google OAuth, Magic link
- Store user in Supabase: id, email, name, avatar, createdAt

### Routes
- `/login` — Login page with email + Google options
- `/signup` — Signup page
- `/forgot-password` — Password reset flow

### Protected Routes
All routes except these should require auth:
- `/` (landing page for logged-out users)
- `/login`
- `/signup`
- `/forgot-password`
- `/share/[meetingId]/[ticketId]` (public backlinks)

### Auth State
- Store session in context
- Persist across refreshes
- Show user avatar + name in sidebar
- Logout button in user dropdown

### Redirects
- Logged out + visiting protected route → `/login`
- Logged in + visiting `/login` → `/home` (dashboard)
- After signup → `/home` with welcome state

---

## Task 8: Paywall & Pricing

**Requirements:**

### Pricing Tiers
```
STARTER (Free):
- Unlimited meeting recordings
- 2 weeks product memory
- AI chat
- 3 epics
- Basic integrations (Linear, Calendar, Figma)
- No Briefs
- No Signals

PRO ($14/user/month):
- Unlimited meeting recordings
- Unlimited product memory
- AI chat
- Unlimited epics
- All integrations (Slack, Linear, Gmail, Figma, Notion, Calendar, Teams, Trello)
- Briefs
- Signals
```

### Free Trial
- All new users get 7 days of Pro access
- No credit card required
- Show countdown: "6 days left of Pro trial" in sidebar or header
- On day 7: "Your Pro trial ends today" banner
- After trial expires: Downgrade to Starter automatically
- If user already created >3 epics during trial: epics remain but can't create new ones
- If user accessed Signals/Briefs during trial: show "Upgrade to continue using Signals/Briefs"

### Implementation
- Use Stripe for payments
- Store subscription status in Supabase: tier, stripeCustomerId, currentPeriodEnd
- Webhook to handle subscription changes

### Paywall Triggers
- **Epic limit:** After 3 epics on Starter, show upgrade modal when creating 4th epic
- **Briefs access:** Show upgrade modal when trying to view Brief tab on Starter
- **Signals access:** Show upgrade modal when trying to access Signals on Starter
- **Integration attempt:** Show upgrade modal when trying to connect Pro-only integrations on Starter
- **Product memory:** After 2 weeks, old meetings become inaccessible on Starter (prompt to upgrade)

### Upgrade Modal
- Show current usage vs limits
- Highlight what they'll unlock
- "Upgrade to Pro" button → Stripe Checkout
- "Maybe later" dismisses

### Pricing Page
- Route: `/pricing`
- Show all tiers with feature comparison
- Current plan highlighted
- Upgrade/downgrade buttons
- FAQ section

---

## Task 9: Empty States & Demo Mode

**Requirements:**

### Empty States (for every section)

**Home dashboard:**
- No meetings: Illustration + "Process your first meeting to get started" + primary CTA
- No signals: "Signals will appear as patterns emerge across your meetings"
- No epics: "Create your first epic or wait for a signal to grow"

**Signals page:**
- No signals: Illustration + "No signals detected yet. Process a few meetings and we'll find the patterns." + "Process a meeting" CTA

**Signal detail:**
- No quotes: "No evidence collected yet."

**Epics page:**
- No epics: Illustration + "No epics yet" + "Create your first epic" CTA

**Epic detail tabs:**
- Discovery empty: "No meetings assigned yet. Add meetings to start gathering evidence." + "Add meeting" button
- Scope empty: "No problems extracted. Add meetings to Discovery first." + arrow pointing to Discovery tab
- Roadmap empty: "No tickets yet. Extract problems in Scope to generate tickets."
- Brief empty: "Not enough data to generate a brief. Add more evidence to Discovery."

**Meeting detail:**
- No problems: "No problems found in this meeting. Try reprocessing." + "Reprocess" button
- No signals: "This meeting hasn't contributed to any signals yet."
- No epics: "Not assigned to any epics." + "Assign to epic" button

### Loading States
Add skeleton loaders for:
- Card lists (pulse animation on gray rectangles)
- Stats/metrics
- Transcript content
- Brief content

### Error States
- API error: Toast with "Something went wrong. Try again." + retry button
- Empty transcript submitted: "Couldn't extract content. Make sure your transcript has dialogue."
- Export failed: "Failed to export to [Linear/Jira]. Check your API key in settings."

### Demo Mode Toggle
- Store in localStorage: `fijord_demo_mode`
- **Demo mode ON:** Pre-populated with realistic data:
  - 8 meetings (various dates, participants)
  - 4 signals (different strengths)
  - 3 epics (different statuses)
  - Rich quotes and evidence
- **Demo mode OFF:** User's real data (or empty for new users)
- **Toggle:** Click logo 5 times rapidly to switch modes
- Show subtle toast when mode changes: "Demo mode enabled" / "Demo mode disabled"

---

## Task 10: UX Completeness Audit

**Go through every page and verify:**

### Click Audit
For every button, link, card, and interactive element:
- Does it have a click handler?
- Does the destination exist?
- If modal, is modal built?
- If action, does action work?

Flag dead ends → either wire up or show "Coming soon" toast

### Navigation Consistency
- All sidebar nav items link to real pages
- Active states highlight correctly on every page
- Recent meetings list pulls from real data
- Epics list in sidebar matches Epics page
- Breadcrumbs work and link correctly

### Form Validation
- Required fields marked and validated
- Error messages appear inline
- Submit buttons disable during loading
- Success feedback (toast or redirect)

### Responsive Check
Test every page at:
- Desktop: 1440px, 1280px, 1024px
- Tablet: 768px
- Mobile: 375px

Sidebar should collapse to hamburger menu on mobile.

### Keyboard Navigation
- Tab order makes sense
- Enter triggers primary actions
- Escape closes modals/drawers
- Focus states visible

---

## Design System Reference

**Colors:**
```
--bg-cream: #FAF9F6
--bg-card: #FFFFFF
--border: #E8E6E1
--border-hover: #D0CEC9
--text-primary: #1A1A1A
--text-secondary: #6B6B6B
--text-muted: #9B9B9B
--accent-green: #3D5A3D
--accent-green-light: #E8F0E8
--accent-green-hover: #2E472E
--accent-yellow: #D97706
--accent-yellow-light: #FEF3C7
--accent-red: #DC2626
--accent-red-light: #FEE2E2
--accent-blue: #2563EB
--accent-blue-light: #DBEAFE
```

**Typography (DM Sans):**
- Page title: 26px, font-weight 500
- Section headers: 16px, font-weight 500
- Card titles: 15-16px, font-weight 500
- Body text: 14px, font-weight 400
- Small text/labels: 12-13px, font-weight 400
- Nav labels: 11px, font-weight 600, uppercase, letter-spacing 0.5px

**Spacing:**
- Card padding: 20px
- Card gap: 12px
- Card border-radius: 12px
- Section margin-bottom: 32px
- Sidebar width: 240px

**Patterns:**
- Use existing sidebar component
- Drawer pattern for transcripts (slide from right, overlay behind)
- Toast notifications for success/error states
- Skeleton loaders while data loads
