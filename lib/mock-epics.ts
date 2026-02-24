export type EpicStatus = "on-track" | "at-risk" | "blocked";

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
