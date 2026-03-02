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

export type BriefPersona = {
  avatar: string;
  title: string;
  description: string;
  goal: string;
  frustration: string;
  keyQuote: string;
};

export type ExperienceStep = {
  emoji: string;
  title: string;
  description: string;
  emotionTag: string;
  emotionColor: "red" | "yellow" | "green";
};

export type DesignPrinciple = {
  title: string;
  description: string;
  quote: string;
};

export type WireframeCard = {
  title: string;
  items: string[];
};

export type EpicBrief = {
  generatedFrom: string;
  generatedDate: string;
  sourceCount: number;
  persona: BriefPersona;
  currentExperience: {
    subtitle: string;
    steps: ExperienceStep[];
  };
  desiredExperience: {
    subtitle: string;
    steps: ExperienceStep[];
  };
  designPrinciples: DesignPrinciple[];
  wireframeSketch: {
    subtitle: string;
    cards: WireframeCard[];
  };
  openQuestions: string[];
  problem: string;
  goal: string;
  approach: string;
  successMetrics: string[];
  editedAt?: string;
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
  brief?: EpicBrief;
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
      generatedFrom: "5 discovery calls",
      generatedDate: "Feb 10, 2026",
      sourceCount: 5,
      persona: {
        avatar: "TL",
        title: "Team Lead at a Mid-Size Company",
        description: "Manages a cross-functional team of 8–12, evaluates new tools for adoption, and needs to show quick wins to justify the switch.",
        goal: "Get their team set up and productive within 30 minutes of signing up.",
        frustration: "Spends 20+ minutes configuring roles and invites before anyone can do real work.",
        keyQuote: "We almost didn\u2019t make it past the first week because nobody knew how to set up their workspace.",
      },
      currentExperience: {
        subtitle: "What users go through today",
        steps: [
          { emoji: "\uD83D\uDE15", title: "Signs up, sees empty dashboard", description: "New user lands on a blank screen with no guidance on what to do first.", emotionTag: "Confused", emotionColor: "red" },
          { emoji: "\uD83D\uDE35\u200D\uD83D\uDCAB", title: "Tries to invite team, gets lost", description: "Role names are confusing, invites don\u2019t arrive, and permissions are unclear.", emotionTag: "Lost", emotionColor: "red" },
          { emoji: "\uD83D\uDE24", title: "Gives up or asks for help", description: "After 5+ minutes of confusion, 40% of users drop off entirely.", emotionTag: "Frustrated", emotionColor: "red" },
        ],
      },
      desiredExperience: {
        subtitle: "What we want users to feel",
        steps: [
          { emoji: "\uD83D\uDE0A", title: "Guided welcome with checklist", description: "A clear step-by-step checklist shows exactly what to do and how long it takes.", emotionTag: "Confident", emotionColor: "green" },
          { emoji: "\uD83E\uDDED", title: "Sample data shows the value", description: "Pre-populated workspace demonstrates what a completed setup looks like.", emotionTag: "Oriented", emotionColor: "green" },
          { emoji: "\uD83D\uDCAA", title: "Team invited and working in minutes", description: "Simple 3-role model and reliable invites get the whole team onboard fast.", emotionTag: "In control", emotionColor: "green" },
        ],
      },
      designPrinciples: [
        { title: "Show, don\u2019t tell", description: "Use sample data and interactive tours instead of documentation walls. Let users learn by doing.", quote: "I signed up and then I was just staring at a blank screen." },
        { title: "Minimize time-to-value", description: "Users should see their first meaningful output within 3 minutes. Remove every unnecessary step.", quote: "The empty dashboard didn\u2019t give me any hints." },
        { title: "Simplify permissions", description: "Consolidate complex role systems into 3 clear roles. Most teams don\u2019t need granular control.", quote: "Roles and permissions are a mess right now." },
      ],
      wireframeSketch: {
        subtitle: "Key screens and components",
        cards: [
          { title: "Welcome Checklist", items: ["Progress bar (3 steps)", "Step 1: Profile setup", "Step 2: Invite team", "Step 3: First project"] },
          { title: "Sample Workspace", items: ["Demo project card", "Sample channels list", "'This is demo data' banner", "Dismiss / Keep toggle"] },
          { title: "Simplified Invite", items: ["Email input field", "3-role dropdown (Admin, Member, Viewer)", "Role description tooltip", "Send invites button"] },
        ],
      },
      openQuestions: [
        "Should the checklist be dismissible before completion, or should it persist until all steps are done?",
        "Do we pre-select a workspace template or let the user choose?",
        "Should the interactive tour be opt-in or automatic on first login?",
        "How do we handle users who signed up but never completed onboarding — re-trigger the flow?",
        "What\u2019s the fallback if invite emails fail — in-app link, QR code, or both?",
      ],
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
      generatedFrom: "3 discovery calls",
      generatedDate: "Feb 5, 2026",
      sourceCount: 3,
      persona: {
        avatar: "BU",
        title: "Buyer Evaluating SaaS Tools",
        description: "Director of ops responsible for tool procurement. Compares 3\u20134 vendors, needs to justify spend to finance, and hates hidden costs.",
        goal: "Understand exact cost for their team size and pick the right plan in under 2 minutes.",
        frustration: "Can\u2019t tell the difference between plans, and per-seat pricing is buried below the fold.",
        keyQuote: "I can\u2019t tell the difference between the Pro and Business plans.",
      },
      currentExperience: {
        subtitle: "What buyers experience today",
        steps: [
          { emoji: "\uD83E\uDD14", title: "Lands on pricing page, scans plans", description: "Three plans with similar names and long feature lists that blur together.", emotionTag: "Uncertain", emotionColor: "yellow" },
          { emoji: "\uD83D\uDE29", title: "Scrolls through feature matrix", description: "Dense comparison table with 30+ rows. Can\u2019t find per-seat cost or team-size pricing.", emotionTag: "Overwhelmed", emotionColor: "red" },
          { emoji: "\uD83D\uDEB6", title: "Leaves to check competitor pricing", description: "Unable to make a confident decision, bounces to a competitor with clearer pricing.", emotionTag: "Gone", emotionColor: "red" },
        ],
      },
      desiredExperience: {
        subtitle: "What we want buyers to feel",
        steps: [
          { emoji: "\uD83D\uDCA1", title: "Instantly sees plan differences", description: "Clear visual hierarchy highlights what makes each plan unique in seconds.", emotionTag: "Informed", emotionColor: "green" },
          { emoji: "\uD83E\uDDEE", title: "Calculates exact cost for their team", description: "Interactive calculator shows monthly/annual price based on team size.", emotionTag: "Confident", emotionColor: "green" },
          { emoji: "\u2705", title: "Picks a plan and starts trial", description: "FAQ answers remaining objections. One-click to start free trial.", emotionTag: "Decided", emotionColor: "green" },
        ],
      },
      designPrinciples: [
        { title: "Clarity over completeness", description: "Show the 5 differences that matter, not 30 features that are the same. Highlight what\u2019s unique per plan.", quote: "I can\u2019t tell the difference between the Pro and Business plans." },
        { title: "Price transparency", description: "Show exact costs upfront. No hidden fees, no 'contact us' for basic pricing. Build trust through honesty.", quote: "The per-seat pricing is buried." },
        { title: "Reduce decision fatigue", description: "Recommend a plan based on team size. Use visual cues to guide users toward the right choice.", quote: "Just tell me which plan is right for a team of 10." },
      ],
      wireframeSketch: {
        subtitle: "Pricing page structure",
        cards: [
          { title: "Plan Comparison", items: ["3-column plan cards", "Highlighted 'Most popular' badge", "Key differentiators only", "Price per seat / month"] },
          { title: "Cost Calculator", items: ["Team size slider (1\u2013100)", "Monthly / Annual toggle", "Real-time price display", "Annual savings callout"] },
          { title: "FAQ Section", items: ["Top 10 questions accordion", "Enterprise CTA block", "'Still not sure?' chat link", "Trust badges row"] },
        ],
      },
      openQuestions: [
        "Should we show a 'recommended' plan based on the user\u2019s team size input?",
        "Do enterprise prospects need a separate page or an inline contact form?",
        "How do we handle non-profit or education pricing — separate tier or discount code?",
      ],
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
      generatedFrom: "4 discovery calls",
      generatedDate: "Feb 8, 2026",
      sourceCount: 4,
      persona: {
        avatar: "PM",
        title: "PM Adopting AI Tools",
        description: "Senior product manager responsible for synthesis and prioritization. Interested in AI but burned by tools that hallucinate or oversimplify.",
        goal: "Trust AI extractions enough to present them to stakeholders without manually re-checking every output.",
        frustration: "No way to see how the AI reached its conclusions. Feels like a black box.",
        keyQuote: "Right now it feels like a black box. I need to see the reasoning.",
      },
      currentExperience: {
        subtitle: "How users interact with AI today",
        steps: [
          { emoji: "\uD83E\uDD28", title: "Sees AI output, no explanation", description: "AI generates summaries and tickets, but there\u2019s no source or confidence info.", emotionTag: "Skeptical", emotionColor: "red" },
          { emoji: "\uD83D\uDD0D", title: "Manually checks every extraction", description: "Goes back to the transcript to verify each AI output, doubling their work.", emotionTag: "Tedious", emotionColor: "yellow" },
          { emoji: "\uD83D\uDEAB", title: "Stops using AI features entirely", description: "After finding a few errors, loses trust and reverts to manual synthesis.", emotionTag: "Distrustful", emotionColor: "red" },
        ],
      },
      desiredExperience: {
        subtitle: "What we want users to feel",
        steps: [
          { emoji: "\uD83D\uDCCA", title: "Confidence scores at a glance", description: "Every AI output shows high/medium/low confidence with color-coded badges.", emotionTag: "Informed", emotionColor: "green" },
          { emoji: "\uD83D\uDD17", title: "Source quotes linked to insights", description: "Click any AI extraction to see the exact quotes that informed it.", emotionTag: "Reassured", emotionColor: "green" },
          { emoji: "\u2705", title: "Verify or reject to improve the model", description: "One-click approve/reject trains the AI on this team\u2019s domain over time.", emotionTag: "Empowered", emotionColor: "green" },
        ],
      },
      designPrinciples: [
        { title: "Transparency by default", description: "Every AI output must show its sources and confidence level. No black boxes.", quote: "Right now it feels like a black box. I need to see the reasoning." },
        { title: "Trust through verification", description: "Make it easy to verify AI outputs against source material. The AI should invite scrutiny, not avoid it.", quote: "A confidence score would help. Even just \u2018high/medium/low\u2019 would be better than nothing." },
        { title: "Progressive disclosure", description: "Show confidence badges at the summary level, full reasoning on demand. Don\u2019t overwhelm with info upfront.", quote: "We need explainability. Show me the source quotes that led to each insight." },
      ],
      wireframeSketch: {
        subtitle: "Trust and explainability components",
        cards: [
          { title: "Confidence Badges", items: ["High/Med/Low pill on each card", "Color: green / yellow / red", "Tooltip with reasoning summary", "Aggregate score per epic"] },
          { title: "Explainability Panel", items: ["Side panel slide-out", "Step-by-step reasoning chain", "Source quotes with highlights", "Collapsible sections"] },
          { title: "Verification Actions", items: ["Approve / Reject buttons", "Optional correction text input", "Verification progress bar", "Team accuracy dashboard link"] },
        ],
      },
      openQuestions: [
        "Should confidence scores be computed client-side or returned from the API?",
        "How do we handle AI extractions that have no clear source quote — flag as 'unverified'?",
        "Should rejected extractions be deleted or archived for model training?",
        "What\u2019s the minimum verification threshold before we show accuracy metrics to users?",
      ],
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
