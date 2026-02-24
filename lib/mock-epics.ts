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
      { id: "t1", title: "Add welcome checklist after signup", priority: "high", status: "shipped", lane: "now", assignee: "Lauren B." },
      { id: "t2", title: "Design empty state with sample data", priority: "high", status: "shipped", lane: "now", assignee: "Lauren B." },
      { id: "t3", title: "Build interactive onboarding tour", priority: "high", status: "shipped", lane: "now", assignee: "Sarah K." },
      { id: "t4", title: "Add role descriptions to invite flow", priority: "medium", status: "shipped", lane: "now", assignee: "Mike C." },
      { id: "t5", title: "Create template workspace for new teams", priority: "medium", status: "shipped", lane: "now", assignee: "Lauren B." },
      { id: "t6", title: "Add progress indicator to setup wizard", priority: "medium", status: "shipped", lane: "now", assignee: "Sarah K." },
      { id: "t7", title: "Email invite delivery reliability fix", priority: "high", status: "shipped", lane: "now", assignee: "Mike C." },
      { id: "t8", title: "Contextual help tooltips for key features", priority: "medium", status: "in-progress", lane: "now", assignee: "Lauren B." },
      { id: "t9", title: "Simplify permission model to 3 roles", priority: "high", status: "in-progress", lane: "next", assignee: "Mike C." },
      { id: "t10", title: "Add \u2018getting started\u2019 video walkthrough", priority: "low", status: "planned", lane: "next" },
      { id: "t11", title: "Onboarding analytics dashboard", priority: "low", status: "planned", lane: "later" },
      { id: "t12", title: "A/B test onboarding flows", priority: "low", status: "backlog", lane: "later" },
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
      { id: "t13", title: "Redesign pricing comparison table", priority: "high", status: "shipped", lane: "now", assignee: "Mike C." },
      { id: "t14", title: "Add per-seat pricing calculator", priority: "high", status: "shipped", lane: "now", assignee: "Mike C." },
      { id: "t15", title: "Simplify plan names and descriptions", priority: "high", status: "in-progress", lane: "now", assignee: "Lauren B." },
      { id: "t16", title: "Add FAQ section to pricing page", priority: "medium", status: "in-progress", lane: "next", assignee: "Mike C." },
      { id: "t17", title: "Enterprise custom pricing flow", priority: "medium", status: "planned", lane: "next" },
      { id: "t18", title: "Annual vs monthly toggle with savings", priority: "medium", status: "planned", lane: "next" },
      { id: "t19", title: "Pricing page A/B test framework", priority: "low", status: "backlog", lane: "later" },
      { id: "t20", title: "Competitor pricing comparison widget", priority: "low", status: "backlog", lane: "later" },
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
      { id: "t21", title: "Add confidence scores to AI extractions", priority: "high", status: "planned", lane: "now", assignee: "Sarah K." },
      { id: "t22", title: "Show source quotes for each AI insight", priority: "high", status: "planned", lane: "now", assignee: "Sarah K." },
      { id: "t23", title: "Build explainability panel for AI output", priority: "high", status: "planned", lane: "next" },
      { id: "t24", title: "Allow users to verify/reject AI extractions", priority: "medium", status: "planned", lane: "next" },
      { id: "t25", title: "AI accuracy dashboard for admins", priority: "low", status: "backlog", lane: "later" },
      { id: "t26", title: "Fine-tune extraction model on verified data", priority: "low", status: "backlog", lane: "later" },
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
