export type Quote = {
  text: string;
  speaker: string;
  timestamp: string;
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
};

export type TimelineEvent = {
  label: string;
  description: string;
  date: string;
};

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
  firstDetected?: string; // e.g. "Jan 15, 2026"
  quotes?: Quote[];
  timeline?: TimelineEvent[];
};

export type MeetingRecord = {
  id: string;
  title: string;
  date: string;
  time?: string;
  participant: string;
  color: string; // avatar color
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
    firstDetected: "Jan 15, 2026",
    quotes: [
      {
        text: "I signed up and then I was just staring at a blank screen. I had no idea what to do next.",
        speaker: "Sarah K.",
        timestamp: "4:23",
        meetingId: "meeting-7",
        meetingTitle: "Onboarding call with Sarah K.",
        meetingDate: "Feb 4, 2026",
      },
      {
        text: "The empty dashboard didn\u2019t give me any hints. I expected some kind of tutorial or first step.",
        speaker: "Sarah K.",
        timestamp: "5:12",
        meetingId: "meeting-7",
        meetingTitle: "Onboarding call with Sarah K.",
        meetingDate: "Feb 4, 2026",
      },
      {
        text: "I tried inviting my team but the roles were confusing. What\u2019s the difference between editor and contributor?",
        speaker: "Sarah K.",
        timestamp: "8:45",
        meetingId: "meeting-7",
        meetingTitle: "Onboarding call with Sarah K.",
        meetingDate: "Feb 4, 2026",
      },
      {
        text: "We almost didn\u2019t make it past the first week because nobody knew how to set up their workspace.",
        speaker: "Sarah K.",
        timestamp: "12:03",
        meetingId: "meeting-7",
        meetingTitle: "Onboarding call with Sarah K.",
        meetingDate: "Feb 4, 2026",
      },
      {
        text: "Honestly, after signing up I didn\u2019t know where to start. I left and never came back.",
        speaker: "Mike D.",
        timestamp: "2:15",
        meetingId: "meeting-10",
        meetingTitle: "Churn exit call with Mike D.",
        meetingDate: "Jan 15, 2026",
      },
      {
        text: "The invite flow felt broken. I sent invites but my team said they never got them.",
        speaker: "Mike D.",
        timestamp: "5:40",
        meetingId: "meeting-10",
        meetingTitle: "Churn exit call with Mike D.",
        meetingDate: "Jan 15, 2026",
      },
      {
        text: "There was no onboarding checklist or guide. Just a blank canvas with no direction.",
        speaker: "Mike D.",
        timestamp: "7:22",
        meetingId: "meeting-10",
        meetingTitle: "Churn exit call with Mike D.",
        meetingDate: "Jan 15, 2026",
      },
      {
        text: "Every new user we onboard hits the same wall \u2014 they don\u2019t know what to do first.",
        speaker: "Susan R.",
        timestamp: "3:18",
        meetingId: "meeting-2",
        meetingTitle: "Discovery with Susan",
        meetingDate: "Feb 23, 2026",
      },
      {
        text: "We\u2019ve been manually walking people through setup because the product doesn\u2019t do it.",
        speaker: "Susan R.",
        timestamp: "6:44",
        meetingId: "meeting-2",
        meetingTitle: "Discovery with Susan",
        meetingDate: "Feb 23, 2026",
      },
      {
        text: "The onboarding experience is the number one complaint from our customer success team.",
        speaker: "Kate S.",
        timestamp: "11:20",
        meetingId: "meeting-2",
        meetingTitle: "Discovery with Susan",
        meetingDate: "Feb 23, 2026",
      },
      {
        text: "I think the empty state is the biggest issue. People need to see value immediately.",
        speaker: "Darren P.",
        timestamp: "4:55",
        meetingId: "meeting-4",
        meetingTitle: "Darren Meeting",
        meetingDate: "Feb 22, 2026",
      },
      {
        text: "Roles and permissions are a mess right now. Users can\u2019t figure out what they can and can\u2019t do.",
        speaker: "Darren P.",
        timestamp: "9:30",
        meetingId: "meeting-4",
        meetingTitle: "Darren Meeting",
        meetingDate: "Feb 22, 2026",
      },
      {
        text: "We lost three enterprise prospects because they couldn\u2019t get through initial setup.",
        speaker: "Kate S.",
        timestamp: "2:10",
        meetingId: "meeting-5",
        meetingTitle: "Working Session",
        meetingDate: "Feb 22, 2026",
      },
      {
        text: "The first five minutes are everything. Right now those five minutes are wasted.",
        speaker: "Kate S.",
        timestamp: "8:15",
        meetingId: "meeting-5",
        meetingTitle: "Working Session",
        meetingDate: "Feb 22, 2026",
      },
    ],
    timeline: [
      {
        label: "Signal detected",
        description: "First mention in \u201CChurn exit call with Mike D.\u201D",
        date: "Jan 15, 2026",
      },
      {
        label: "Growing pattern",
        description: "Mentioned in 3rd meeting",
        date: "Feb 4, 2026",
      },
      {
        label: "Strong signal",
        description: "5 meetings, 14 quotes collected",
        date: "Feb 23, 2026",
      },
    ],
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
    firstDetected: "Jan 22, 2026",
    quotes: [
      {
        text: "I don\u2019t trust the AI output because I can\u2019t see how it reached its conclusion.",
        speaker: "Sarah K.",
        timestamp: "3:45",
        meetingId: "meeting-9",
        meetingTitle: "AI trust interview with Sarah K.",
        meetingDate: "Jan 22, 2026",
      },
      {
        text: "A confidence score would help. Even just \u2018high/medium/low\u2019 would be better than nothing.",
        speaker: "Sarah K.",
        timestamp: "6:12",
        meetingId: "meeting-9",
        meetingTitle: "AI trust interview with Sarah K.",
        meetingDate: "Jan 22, 2026",
      },
      {
        text: "My team won\u2019t adopt it until they can verify the AI\u2019s reasoning.",
        speaker: "Sarah K.",
        timestamp: "9:30",
        meetingId: "meeting-9",
        meetingTitle: "AI trust interview with Sarah K.",
        meetingDate: "Jan 22, 2026",
      },
      {
        text: "The AI summaries are sometimes wrong and there\u2019s no way to tell which parts to trust.",
        speaker: "Kate S.",
        timestamp: "4:20",
        meetingId: "meeting-5",
        meetingTitle: "Working Session",
        meetingDate: "Feb 22, 2026",
      },
      {
        text: "We need explainability. Show me the source quotes that led to each insight.",
        speaker: "Kate S.",
        timestamp: "7:55",
        meetingId: "meeting-5",
        meetingTitle: "Working Session",
        meetingDate: "Feb 22, 2026",
      },
      {
        text: "If I could see the confidence level for each extraction, I\u2019d use this daily.",
        speaker: "Susan R.",
        timestamp: "5:30",
        meetingId: "meeting-2",
        meetingTitle: "Discovery with Susan",
        meetingDate: "Feb 23, 2026",
      },
      {
        text: "Right now it feels like a black box. I need to see the reasoning.",
        speaker: "Susan R.",
        timestamp: "8:15",
        meetingId: "meeting-2",
        meetingTitle: "Discovery with Susan",
        meetingDate: "Feb 23, 2026",
      },
    ],
    timeline: [
      {
        label: "Signal detected",
        description: "First mention in \u201CAI trust interview\u201D",
        date: "Jan 22, 2026",
      },
      {
        label: "Growing pattern",
        description: "Mentioned in 2nd meeting",
        date: "Feb 22, 2026",
      },
      {
        label: "Confirmed signal",
        description: "3 meetings, 7 quotes collected",
        date: "Feb 23, 2026",
      },
    ],
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
    firstDetected: "Jan 28, 2026",
    quotes: [
      {
        text: "I can\u2019t tell the difference between the Pro and Business plans. The feature comparison is confusing.",
        speaker: "Mike C.",
        timestamp: "3:10",
        meetingId: "meeting-8",
        meetingTitle: "Pricing feedback with Mike C.",
        meetingDate: "Jan 28, 2026",
      },
      {
        text: "We almost went with a competitor because your pricing page made it seem more expensive than it is.",
        speaker: "Mike C.",
        timestamp: "7:25",
        meetingId: "meeting-8",
        meetingTitle: "Pricing feedback with Mike C.",
        meetingDate: "Jan 28, 2026",
      },
      {
        text: "The per-seat pricing is buried. I had to email sales to figure out the actual cost.",
        speaker: "Darren P.",
        timestamp: "5:40",
        meetingId: "meeting-4",
        meetingTitle: "Darren Meeting",
        meetingDate: "Feb 22, 2026",
      },
      {
        text: "Three of our prospects asked about pricing clarity this month alone.",
        speaker: "Kate S.",
        timestamp: "3:50",
        meetingId: "meeting-5",
        meetingTitle: "Working Session",
        meetingDate: "Feb 22, 2026",
      },
      {
        text: "The pricing tiers need a simpler comparison. People are dropping off at the plan selection step.",
        speaker: "Kate S.",
        timestamp: "6:20",
        meetingId: "meeting-5",
        meetingTitle: "Working Session",
        meetingDate: "Feb 22, 2026",
      },
    ],
    timeline: [
      {
        label: "Signal detected",
        description: "First mention in \u201CPricing feedback with Mike C.\u201D",
        date: "Jan 28, 2026",
      },
      {
        label: "Growing pattern",
        description: "Mentioned in 2nd meeting",
        date: "Feb 22, 2026",
      },
    ],
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
    firstDetected: "Feb 22, 2026",
    quotes: [
      {
        text: "I tried using the app on my phone during a meeting and half the buttons were cut off.",
        speaker: "Darren P.",
        timestamp: "11:05",
        meetingId: "meeting-4",
        meetingTitle: "Darren Meeting",
        meetingDate: "Feb 22, 2026",
      },
      {
        text: "The mobile experience is essentially broken. I can\u2019t review tickets on the go.",
        speaker: "Kate S.",
        timestamp: "9:40",
        meetingId: "meeting-5",
        meetingTitle: "Working Session",
        meetingDate: "Feb 22, 2026",
      },
      {
        text: "Would love to check signal updates from my phone between meetings.",
        speaker: "Susan R.",
        timestamp: "10:30",
        meetingId: "meeting-2",
        meetingTitle: "Discovery with Susan",
        meetingDate: "Feb 23, 2026",
      },
    ],
    timeline: [
      {
        label: "Signal detected",
        description: "First mention in \u201CDarren Meeting\u201D",
        date: "Feb 22, 2026",
      },
    ],
  },
];

export const MOCK_MEETING_RECORDS: MeetingRecord[] = [
  {
    id: "meeting-1",
    title: "LinkedIn Outreach Sync",
    date: "Today",
    time: "3:32 pm",
    participant: "Me",
    color: "#3D5A3D",
    epicIds: [],
    processedAt: "2026-02-23T15:32:00Z",
  },
  {
    id: "meeting-2",
    title: "Discovery with Susan",
    date: "Today",
    time: "8:12 pm",
    participant: "Kate S.",
    color: "#7C6CA5",
    epicIds: ["onboarding-confusion"],
    processedAt: "2026-02-23T20:12:00Z",
  },
  {
    id: "meeting-3",
    title: "All hands standup",
    date: "Today",
    time: "9:16 am",
    participant: "Me",
    color: "#3A8A7C",
    epicIds: [],
    processedAt: "2026-02-23T09:16:00Z",
  },
  {
    id: "meeting-4",
    title: "Darren Meeting",
    date: "Yesterday",
    participant: "Me",
    color: "#C17D4A",
    epicIds: ["pricing-page-redesign"],
    processedAt: "2026-02-22T14:00:00Z",
  },
  {
    id: "meeting-5",
    title: "Working Session",
    date: "Yesterday",
    participant: "Kate S.",
    color: "#5B82B5",
    epicIds: ["ai-output-trust"],
    processedAt: "2026-02-22T11:00:00Z",
  },
  {
    id: "meeting-6",
    title: "Figma Plugin Issue",
    date: "Wed, Feb 4",
    participant: "Me",
    color: "#B56B6B",
    epicIds: [],
    processedAt: "2026-02-04T16:00:00Z",
  },
  {
    id: "meeting-7",
    title: "Onboarding call",
    date: "Feb 4",
    participant: "Kate S.",
    color: "#3D5A3D",
    epicIds: ["onboarding-confusion"],
    processedAt: "2026-02-04T10:30:00Z",
  },
  {
    id: "meeting-8",
    title: "Pricing feedback",
    date: "Jan 28",
    participant: "Mike C.",
    color: "#7C6CA5",
    epicIds: ["pricing-page-redesign"],
    processedAt: "2026-01-28T14:00:00Z",
  },
  {
    id: "meeting-9",
    title: "AI trust interview",
    date: "Jan 22",
    participant: "Sarah K.",
    color: "#3A8A7C",
    epicIds: ["ai-output-trust"],
    processedAt: "2026-01-22T11:00:00Z",
  },
  {
    id: "meeting-10",
    title: "Churn exit call",
    date: "Jan 15",
    participant: "Me",
    color: "#C17D4A",
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
