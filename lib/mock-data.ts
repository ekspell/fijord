export type Signal = {
  id: string;
  title: string;
  meetingCount: number;
  totalMeetings: number;
  quoteCount: number;
  strength: number; // 0-100
  tags: string[];
  status: "new" | "stable" | "project";
  color: string; // dot + progress bar color
  recentDelta?: string; // e.g. "+2 this week"
  epicId?: string; // linked epic id if status === "project"
};

export type MeetingRecord = {
  id: string;
  title: string;
  date: string;
  epicIds: string[];
  processedAt: string;
};

export const MOCK_SIGNALS: Signal[] = [
  {
    id: "onboarding-confusion-signal",
    title: "Onboarding confusion",
    meetingCount: 5,
    totalMeetings: 6,
    quoteCount: 14,
    strength: 83,
    tags: ["roles", "empty-state", "invite-flow"],
    status: "project",
    color: "#3D5A3D",
    recentDelta: "+2 this week",
    epicId: "onboarding-confusion",
  },
  {
    id: "ai-output-trust-signal",
    title: "AI output trust",
    meetingCount: 3,
    totalMeetings: 6,
    quoteCount: 7,
    strength: 50,
    tags: ["confidence-score", "explainability"],
    status: "project",
    color: "#3B82F6",
    recentDelta: "+1 this week",
    epicId: "ai-output-trust",
  },
  {
    id: "pricing-tier-confusion",
    title: "Pricing tier confusion",
    meetingCount: 3,
    totalMeetings: 6,
    quoteCount: 5,
    strength: 50,
    tags: ["pricing", "plan-comparison"],
    status: "stable",
    color: "#D97706",
  },
  {
    id: "mobile-experience-gaps",
    title: "Mobile experience gaps",
    meetingCount: 2,
    totalMeetings: 6,
    quoteCount: 3,
    strength: 33,
    tags: ["mobile", "responsive"],
    status: "new",
    color: "#3B82F6",
  },
];

export const MOCK_MEETING_RECORDS: MeetingRecord[] = [
  {
    id: "meeting-1",
    title: "Onboarding call",
    date: "Feb 4",
    epicIds: ["onboarding-confusion"],
    processedAt: "2026-02-04T10:30:00Z",
  },
  {
    id: "meeting-2",
    title: "Pricing feedback",
    date: "Jan 28",
    epicIds: ["pricing-page-redesign"],
    processedAt: "2026-01-28T14:00:00Z",
  },
  {
    id: "meeting-3",
    title: "AI trust interview",
    date: "Jan 22",
    epicIds: ["ai-output-trust"],
    processedAt: "2026-01-22T11:00:00Z",
  },
  {
    id: "meeting-4",
    title: "Churn exit call",
    date: "Jan 15",
    epicIds: [],
    processedAt: "2026-01-15T16:00:00Z",
  },
];

export const SIGNAL_STATUS_STYLES: Record<
  Signal["status"],
  { bg: string; text: string; label: string }
> = {
  project: { bg: "#E8F0E8", text: "#3D5A3D", label: "Project" },
  stable: { bg: "#FEF3C7", text: "#D97706", label: "stable" },
  new: { bg: "#FFEDD5", text: "#EA580C", label: "new" },
};
