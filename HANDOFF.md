# Fjord — Handoff Notes

## Latest Session: February 17, 2026

### What we built today

**Landing page polish**
- Landing page shows on every visit (not gated by localStorage)
- Animated strikethroughs on hero text using `text-decoration-color` transition (works across line wraps)
- Fixed checkmark rendering (`&check;` → Unicode `\u2713`)
- Integration cards (Fireflies, Granola, Otter) in a single row with 24px gaps
- Fijord logo click returns to landing from anywhere
- Copy tweaks: removed em dash from testimonial, "When" → "If", "create tickets in Linear" → "create tickets"

**Demo transcript**
- "Use a demo transcript" link inside the textarea placeholder (accent-colored, underlined)
- Realistic PM discovery call (~3300 chars): onboarding friction, broken search, notification overload
- Produces 3 problems, ~20 tickets

**Feedback system**
- Floating "Feedback" button (bottom-right, bounce animation, hidden on landing)
- Modal with 3 reaction paths (Useful / Meh / Confusing), each with tailored follow-up questions
- Optional email field for follow-up
- Stored in Upstash Redis via `POST /api/feedback` (no TTL — kept permanently)
- Trigger-based: pops up after 2 user interactions on Scope (scope generation = 1, then ticket detail or save to staging triggers it)

**Session persistence**
- Result, solutions, transcript persist in `sessionStorage` — Scope data survives tab switches within a session
- Staging data also in `sessionStorage`
- Landing page always shows on refresh

**Navigation changes**
- "Roadmap" tab renamed to **"Staging"**
- "Save to staging" navigates directly to Staging tab (no longer just a toast)
- Removed "Evidence → Problems → Work" breadcrumb from Scope page

### What's working

- Full flow: landing → paste/demo transcript → process → 3-column Scope → ticket detail → save to staging → export to Linear/Jira
- Feedback collection end-to-end (modal → API → Upstash Redis)
- Session persistence within a browser tab
- Share links for individual tickets
- Fireflies API integration for pulling transcripts
- Demo transcript for users without a transcript on hand
- Fijord logo navigates home from any page
- Live at **https://fijord.app**

### What's next

- Monitor feedback in Upstash Redis dashboard as users start testing
- `FeedbackBanner` component exists in `feedback-modal.tsx` but is unused (replaced by trigger-based approach) — can remove or repurpose
- Untracked file `landing-v3-problem (1).html` in repo root can be cleaned up
- Authentication (Supabase Auth), database persistence, multi-tenancy, payments — all still on the roadmap from previous sessions

### Key decisions made today

| Decision | Rationale |
|---|---|
| `sessionStorage` for session data | Clean slate on tab close; no stale data across visits |
| `localStorage` for API keys | Linear/Jira/Fireflies keys should persist across sessions |
| Landing always shows on load | This is a demo tool — every visit starts with the landing page |
| Feedback after 2 interactions | Less intrusive; users have actually engaged before being asked |
| "Staging" instead of "Roadmap" | Better reflects purpose — tickets sit here before export to Linear/Jira |
| Feedback stored permanently | Every piece of feedback is valuable at this stage |
| Demo transcript: 3 problems | Sweet spot for demonstrating value without overwhelming first-time users |

---

## Previous Sessions

### February 12, 2026
- Ticket detail back navigation with arrow icon + accent color
- Save-to-roadmap flow: hint text, enlarged checkboxes, green glow on button
- Toast system upgrade with optional action links
- Error recovery on failed ticket generation

### February 10, 2026
- Global toast notification system
- Delete tickets from roadmap with confirmation modal
- Typography & spacing polish (48px headings, 1100px max-width)
- Initial deploy to **https://fijord.app**

## File map

```
app/
  page.tsx              — Landing page + Discovery (transcript input + processing)
  landing.tsx           — Landing page component (hero, features, integrations)
  results.tsx           — 3-column Scope view (Evidence, Problems, Tickets)
  roadmap.tsx           — Staging area: Now/Next/Later kanban with drag-and-drop
  ticket-detail.tsx     — Full ticket detail (two-column, inline editable)
  nav-context.tsx       — React Context: tabs, results, staging, toast, feedback, session persistence
  transcript-drawer.tsx — Slide-out transcript with quote highlighting
  layout.tsx            — Root layout with NavProvider + TopNav
  globals.css           — Tailwind v4 theme tokens + animations
  components/
    top-nav.tsx           — Sticky nav (Discovery, Scope, Staging) + logo home link
    feedback-modal.tsx    — FeedbackButton, FeedbackModal, FeedbackBanner
    editable-fields.tsx   — EditableText, EditableTextarea, EditableList, EditablePriority
    linear-connect-modal.tsx / linear-send-modal.tsx — Linear integration
    jira-connect-modal.tsx / jira-send-modal.tsx     — Jira integration
  api/
    process/route.ts           — Extract problems from transcript (Haiku 4.5)
    generate-solution/route.ts — Generate solution + work items per problem (Haiku 4.5)
    generate-ticket/route.ts   — Generate full ticket detail (Sonnet 4.5)
    feedback/route.ts          — Store feedback in Upstash Redis
    share/route.ts             — Create shareable ticket bundles
    linear/route.ts            — Linear API proxy
    jira/route.ts              — Jira API proxy
    fireflies/route.ts         — Fireflies transcript fetch
lib/
  types.ts  — Shared TypeScript types
  kv.ts     — Upstash Redis helpers
  jira.ts   — Jira credential types
  share.ts  — Share bundle creation
```
