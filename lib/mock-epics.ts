export type EpicStatus = "on-track" | "at-risk" | "blocked";

export type TicketPriority = "high" | "medium" | "low";
export type TicketStatus = "shipped" | "in-progress" | "planned" | "backlog";
export type RoadmapLane = "now" | "next" | "later";

export type EpicTicket = {
  id: string;
  title: string;
  priority: TicketPriority;
  status: TicketStatus;
  lane: RoadmapLane;
  assignee?: string;
  description?: string;
  acceptanceCriteria?: string[];
  sourceQuote?: string;
};

export type Epic = {
  id: string;
  title: string;
  description: string;
  status: EpicStatus;
  metrics: {
    tickets: number;
    meetings: number;
    quotes: number;
  };
  progress: {
    shipped: number;
    total: number;
  };
  progressLabel: string;
  owner: {
    name: string;
    initials: string;
  };
  dateLabel: string;
  tickets?: EpicTicket[];
  brief?: {
    problem: string;
    goal: string;
    approach: string;
    successMetrics: string[];
  };
};

export type Meeting = {
  title: string;
  date: string;
};

export const MOCK_EPICS: Epic[] = [
  {
    id: "onboarding-confusion",
    title: "Onboarding confusion",
    description:
      "Users don\u2019t know what to do after signup. Empty dashboard with no guidance leads to drop-off within first 5 minutes.",
    status: "on-track",
    metrics: { tickets: 12, meetings: 5, quotes: 14 },
    progress: { shipped: 7, total: 12 },
    progressLabel: "7 of 12 tickets shipped (58%)",
    owner: { name: "Lauren Baker", initials: "LB" },
    dateLabel: "Started Jan 15 \u00b7 Updated 2 days ago",
    tickets: [
      { id: "t1", title: "Add welcome checklist after signup", priority: "high", status: "shipped", lane: "now", assignee: "Lauren B.", description: "Display a step-by-step checklist when a user first logs in, guiding them through profile setup, team invite, and first project creation.", acceptanceCriteria: ["Checklist appears on first login", "Steps are clearly numbered", "Completed steps show checkmark", "Checklist dismissible after completion"], sourceQuote: "I signed up and then I was just staring at a blank screen." },
      { id: "t2", title: "Design empty state with sample data", priority: "high", status: "shipped", lane: "now", assignee: "Lauren B.", description: "Replace blank dashboard with pre-populated sample project showing what a completed workspace looks like.", acceptanceCriteria: ["Sample project visible on first login", "Sample data is clearly labeled as demo", "User can dismiss or keep sample data"], sourceQuote: "The empty dashboard didn\u2019t give me any hints." },
      { id: "t3", title: "Build interactive onboarding tour", priority: "high", status: "shipped", lane: "now", assignee: "Sarah K.", description: "Create a guided tour that highlights key features using tooltip overlays, triggered after signup.", acceptanceCriteria: ["Tour covers 5 key features", "Skip button available", "Progress indicator shows step count"], sourceQuote: "We almost didn\u2019t make it past the first week because nobody knew how to set up their workspace." },
      { id: "t4", title: "Add role descriptions to invite flow", priority: "medium", status: "shipped", lane: "now", assignee: "Mike C.", description: "Add clear descriptions and examples for each role (Admin, Editor, Viewer) in the team invite modal.", acceptanceCriteria: ["Each role has a 1-line description", "Examples of what each role can do", "Default role is pre-selected"], sourceQuote: "I tried inviting my team but the roles were confusing." },
      { id: "t5", title: "Create template workspace for new teams", priority: "medium", status: "shipped", lane: "now", assignee: "Lauren B.", description: "Offer pre-built workspace templates (Product, Engineering, Design) during onboarding to reduce blank-slate anxiety.", acceptanceCriteria: ["3+ templates available", "Templates include sample channels and projects", "User can customize after selection"] },
      { id: "t6", title: "Add progress indicator to setup wizard", priority: "medium", status: "shipped", lane: "now", assignee: "Sarah K.", description: "Show a progress bar during the onboarding flow so users know how many steps remain.", acceptanceCriteria: ["Progress bar visible on all wizard steps", "Current step highlighted", "Estimated time shown"] },
      { id: "t7", title: "Email invite delivery reliability fix", priority: "high", status: "shipped", lane: "now", assignee: "Mike C.", description: "Investigate and fix invite email delivery issues. Emails are landing in spam or not arriving for some domains.", acceptanceCriteria: ["Invite delivery rate > 95%", "SPF/DKIM properly configured", "Fallback invite link available"], sourceQuote: "The invite flow felt broken. I sent invites but my team said they never got them." },
      { id: "t8", title: "Contextual help tooltips for key features", priority: "medium", status: "in-progress", lane: "now", assignee: "Lauren B.", description: "Add info-icon tooltips to complex features that explain what they do and link to docs.", acceptanceCriteria: ["Tooltips on 10+ key features", "Links to relevant help docs", "Dismissible and non-blocking"] },
      { id: "t9", title: "Simplify permission model to 3 roles", priority: "high", status: "in-progress", lane: "next", assignee: "Mike C.", description: "Consolidate the current 6-role permission system into 3 clear roles: Admin, Member, Viewer.", acceptanceCriteria: ["Migration path for existing roles", "No permissions regressions", "Role picker updated across all flows"], sourceQuote: "Roles and permissions are a mess right now." },
      { id: "t10", title: "Add \u2018getting started\u2019 video walkthrough", priority: "low", status: "planned", lane: "next", description: "Record and embed a 2-minute video walkthrough accessible from the onboarding checklist and help menu.", acceptanceCriteria: ["Video < 2 minutes", "Covers core workflow end-to-end", "Accessible from help menu"] },
      { id: "t11", title: "Onboarding analytics dashboard", priority: "low", status: "planned", lane: "later", description: "Build an internal dashboard tracking onboarding funnel metrics: signup \u2192 first action \u2192 invite \u2192 retained.", acceptanceCriteria: ["Funnel visualization", "Cohort analysis by signup week", "Drop-off points highlighted"] },
      { id: "t12", title: "A/B test onboarding flows", priority: "low", status: "backlog", lane: "later", description: "Set up infrastructure to A/B test different onboarding flows and measure impact on retention.", acceptanceCriteria: ["Feature flag system for onboarding variants", "Statistical significance calculator", "Results dashboard"] },
    ],
    brief: {
      problem: "New users don\u2019t know what to do after signing up. The empty dashboard provides no guidance, leading to a 40% drop-off rate within the first 5 minutes. Users struggle with role assignments, invite flows, and workspace setup.",
      goal: "Reduce first-session drop-off from 40% to under 15% by guiding new users through a structured onboarding experience that demonstrates value within the first 3 minutes.",
      approach: "Implement a multi-step onboarding wizard with a welcome checklist, pre-populated sample data, interactive tour, and simplified role model. Focus on time-to-first-value by showing users their first meaningful output immediately.",
      successMetrics: [
        "First-session drop-off rate < 15%",
        "Time to first action < 3 minutes",
        "Invite completion rate > 80%",
        "Setup wizard completion rate > 70%",
      ],
    },
  },
  {
    id: "pricing-page-redesign",
    title: "Pricing page redesign",
    description:
      "Conversion rate on pricing page is 40% below benchmark. Users confused by tier differences.",
    status: "at-risk",
    metrics: { tickets: 8, meetings: 3, quotes: 7 },
    progress: { shipped: 2, total: 8 },
    progressLabel: "2 of 8 tickets shipped (25%) \u00b7 No updates in 12 days",
    owner: { name: "Mike Chen", initials: "MC" },
    dateLabel: "Started Jan 28 \u00b7 Updated 12 days ago",
    tickets: [
      { id: "t13", title: "Redesign pricing comparison table", priority: "high", status: "shipped", lane: "now", assignee: "Mike C.", description: "Replace the current feature matrix with a cleaner side-by-side comparison highlighting key differences between plans.", acceptanceCriteria: ["Visual hierarchy makes differences obvious", "Most popular plan highlighted", "Mobile responsive"], sourceQuote: "I can\u2019t tell the difference between the Pro and Business plans." },
      { id: "t14", title: "Add per-seat pricing calculator", priority: "high", status: "shipped", lane: "now", assignee: "Mike C.", description: "Interactive calculator where users input team size and see exact monthly/annual cost for each plan.", acceptanceCriteria: ["Slider or input for team size", "Real-time price update", "Shows savings for annual"], sourceQuote: "The per-seat pricing is buried." },
      { id: "t15", title: "Simplify plan names and descriptions", priority: "high", status: "in-progress", lane: "now", assignee: "Lauren B.", description: "Rename plans from technical names to outcome-based names and rewrite descriptions to focus on use cases.", acceptanceCriteria: ["New names tested with 5+ users", "Descriptions < 15 words each", "Updated across all touchpoints"] },
      { id: "t16", title: "Add FAQ section to pricing page", priority: "medium", status: "in-progress", lane: "next", assignee: "Mike C.", description: "Add expandable FAQ section addressing top 10 pricing questions from support tickets and sales calls.", acceptanceCriteria: ["10+ questions covered", "Expandable accordion format", "Search or filter capability"] },
      { id: "t17", title: "Enterprise custom pricing flow", priority: "medium", status: "planned", lane: "next", description: "Create a dedicated flow for enterprise prospects with custom pricing, volume discounts, and direct sales contact." },
      { id: "t18", title: "Annual vs monthly toggle with savings", priority: "medium", status: "planned", lane: "next", description: "Add a toggle showing monthly vs annual pricing with the savings percentage clearly displayed." },
      { id: "t19", title: "Pricing page A/B test framework", priority: "low", status: "backlog", lane: "later", description: "Set up A/B testing infrastructure specifically for the pricing page to test layouts, copy, and pricing models." },
      { id: "t20", title: "Competitor pricing comparison widget", priority: "low", status: "backlog", lane: "later", description: "Add a section showing how our pricing compares to key competitors, highlighting value advantages." },
    ],
    brief: {
      problem: "The pricing page conversion rate is 40% below industry benchmark. Users can\u2019t differentiate between Pro and Business plans, per-seat pricing is buried, and 3 enterprise prospects dropped off at plan selection this month.",
      goal: "Increase pricing page conversion rate by 40% by making plan differences, pricing, and value proposition immediately clear.",
      approach: "Redesign the pricing comparison table with clearer feature differentiation, add an interactive per-seat calculator, simplify plan naming, and add a FAQ section addressing common objections.",
      successMetrics: [
        "Pricing page conversion rate +40%",
        "Plan selection drop-off rate < 20%",
        "Support tickets about pricing -50%",
        "Enterprise inquiry rate +25%",
      ],
    },
  },
  {
    id: "ai-output-trust",
    title: "AI output trust",
    description:
      "Users don\u2019t trust AI-generated content. Need transparency into sources and confidence levels.",
    status: "blocked",
    metrics: { tickets: 6, meetings: 4, quotes: 11 },
    progress: { shipped: 0, total: 6 },
    progressLabel: "0 of 6 tickets shipped \u00b7 Waiting on API team",
    owner: { name: "Sarah Kim", initials: "SK" },
    dateLabel: "Started Feb 1 \u00b7 Blocked since Feb 8",
    tickets: [
      { id: "t21", title: "Add confidence scores to AI extractions", priority: "high", status: "planned", lane: "now", assignee: "Sarah K.", description: "Display a high/medium/low confidence indicator next to every AI-extracted insight, problem, and ticket suggestion.", acceptanceCriteria: ["Confidence badge on all AI outputs", "Color-coded (green/yellow/red)", "Tooltip explains confidence reasoning"], sourceQuote: "A confidence score would help. Even just \u2018high/medium/low\u2019 would be better than nothing." },
      { id: "t22", title: "Show source quotes for each AI insight", priority: "high", status: "planned", lane: "now", assignee: "Sarah K.", description: "Link every AI-generated insight back to the specific transcript quotes that informed it.", acceptanceCriteria: ["Each insight shows source quotes", "Quotes link back to transcript", "Quote count visible at a glance"], sourceQuote: "We need explainability. Show me the source quotes that led to each insight." },
      { id: "t23", title: "Build explainability panel for AI output", priority: "high", status: "planned", lane: "next", description: "Create a side panel that shows the AI\u2019s reasoning chain: which quotes it found, how it grouped them, and why it reached its conclusions.", acceptanceCriteria: ["Reasoning chain visible for each output", "Step-by-step logic display", "Collapsible for quick scanning"], sourceQuote: "Right now it feels like a black box. I need to see the reasoning." },
      { id: "t24", title: "Allow users to verify/reject AI extractions", priority: "medium", status: "planned", lane: "next", description: "Add approve/reject buttons to AI extractions so users can flag incorrect outputs and improve the model over time.", acceptanceCriteria: ["Approve/reject on each extraction", "Rejected items archived not deleted", "Verification stats tracked"] },
      { id: "t25", title: "AI accuracy dashboard for admins", priority: "low", status: "backlog", lane: "later", description: "Internal dashboard showing AI extraction accuracy rates, rejection rates, and model performance over time." },
      { id: "t26", title: "Fine-tune extraction model on verified data", priority: "low", status: "backlog", lane: "later", description: "Use verified/rejected extraction data to fine-tune the AI model for better accuracy on this team\u2019s domain." },
    ],
    brief: {
      problem: "Users don\u2019t trust AI-generated summaries and extractions because there\u2019s no way to see how the AI reached its conclusions. Teams refuse to adopt the tool until they can verify reasoning, and the AI sometimes produces incorrect outputs with no indication of confidence.",
      goal: "Increase AI feature adoption from 30% to 70% of active users by making AI outputs transparent, verifiable, and trustworthy.",
      approach: "Add confidence scores (high/medium/low) to every AI extraction, link each insight back to source quotes, build an explainability panel showing reasoning chains, and allow users to verify or reject extractions to improve the model.",
      successMetrics: [
        "AI feature adoption rate > 70%",
        "User-reported trust score > 4/5",
        "AI extraction accuracy > 90%",
        "Manual verification rate < 30%",
      ],
    },
  },
];

export const MOCK_MEETINGS: Meeting[] = [
  { title: "Onboarding call", date: "Feb 4" },
  { title: "Pricing feedback", date: "Jan 28" },
  { title: "AI trust interview", date: "Jan 22" },
];

export const STATUS_STYLES: Record<
  EpicStatus,
  { bg: string; text: string; label: string }
> = {
  "on-track": { bg: "#E8F0E8", text: "#3D5A3D", label: "On track" },
  "at-risk": { bg: "#FEF3C7", text: "#D97706", label: "At risk" },
  blocked: { bg: "#FEE2E2", text: "#DC2626", label: "Blocked" },
};

export const TICKET_STATUS_STYLES: Record<
  TicketStatus,
  { bg: string; text: string; label: string }
> = {
  shipped: { bg: "#E8F0E8", text: "#3D5A3D", label: "Shipped" },
  "in-progress": { bg: "#DBEAFE", text: "#2563EB", label: "In progress" },
  planned: { bg: "#FEF3C7", text: "#D97706", label: "Planned" },
  backlog: { bg: "#F3F3F3", text: "#6B6B6B", label: "Backlog" },
};

export const PRIORITY_STYLES: Record<
  TicketPriority,
  { bg: string; text: string; label: string }
> = {
  high: { bg: "#FEE2E2", text: "#DC2626", label: "High" },
  medium: { bg: "#FEF3C7", text: "#D97706", label: "Medium" },
  low: { bg: "#F3F3F3", text: "#6B6B6B", label: "Low" },
};
