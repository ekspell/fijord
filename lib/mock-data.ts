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
  status: "new" | "stable" | "project" | "converted";
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

/* ─── Meeting Detail Types ─── */

export type MeetingProblem = {
  id: string;
  title: string;
  ticketCount: number;
  quotes: { text: string; speaker: string; timestamp: string }[];
};

export type TranscriptLine = {
  speaker: string;
  text: string;
  timestamp: string;
  isExtracted?: boolean;
};

export type MeetingDetail = {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: { name: string; color: string }[];
  problems: MeetingProblem[];
  transcript: TranscriptLine[];
};

export const MOCK_MEETING_DETAILS: Record<string, MeetingDetail> = {
  "meeting-7": {
    id: "meeting-7",
    title: "Onboarding call with Sarah K.",
    date: "Feb 4, 2026",
    duration: "32 min",
    participants: [
      { name: "Kate S.", color: "#7C6CA5" },
      { name: "Sarah K.", color: "#3A8A7C" },
    ],
    problems: [
      {
        id: "prob-1",
        title: "Empty state confusion",
        ticketCount: 2,
        quotes: [
          {
            text: "I signed up and then I was just staring at a blank screen. I had no idea what to do next.",
            speaker: "Sarah K.",
            timestamp: "4:23",
          },
          {
            text: "The empty dashboard didn\u2019t give me any hints. I expected some kind of tutorial or first step.",
            speaker: "Sarah K.",
            timestamp: "5:12",
          },
        ],
      },
      {
        id: "prob-2",
        title: "Role confusion in invite flow",
        ticketCount: 1,
        quotes: [
          {
            text: "I tried inviting my team but the roles were confusing. What\u2019s the difference between editor and contributor?",
            speaker: "Sarah K.",
            timestamp: "8:45",
          },
        ],
      },
      {
        id: "prob-3",
        title: "Missing onboarding guidance",
        ticketCount: 1,
        quotes: [
          {
            text: "We almost didn\u2019t make it past the first week because nobody knew how to set up their workspace.",
            speaker: "Sarah K.",
            timestamp: "12:03",
          },
        ],
      },
    ],
    transcript: [
      { speaker: "Kate", text: "Thanks for joining me today, Sarah. I wanted to hear about your experience getting started with the product.", timestamp: "0:23" },
      { speaker: "Sarah", text: "Sure, happy to share. It was a bit of a rough start honestly.", timestamp: "0:45" },
      { speaker: "Kate", text: "Tell me more about that. What happened when you first signed up?", timestamp: "1:10" },
      { speaker: "Sarah", text: "Well, I created my account and everything went fine there. But then...", timestamp: "1:35" },
      { speaker: "Kate", text: "What happened next?", timestamp: "3:50" },
      { speaker: "Sarah", text: "I signed up and then I was just staring at a blank screen. I had no idea what to do next.", timestamp: "4:23", isExtracted: true },
      { speaker: "Kate", text: "That\u2019s really helpful to know. Was there anything on the screen at all?", timestamp: "4:55" },
      { speaker: "Sarah", text: "The empty dashboard didn\u2019t give me any hints. I expected some kind of tutorial or first step.", timestamp: "5:12", isExtracted: true },
      { speaker: "Kate", text: "Makes sense. What did you do then?", timestamp: "5:40" },
      { speaker: "Sarah", text: "I tried to figure it out on my own. Eventually I found the team settings.", timestamp: "6:30" },
      { speaker: "Kate", text: "And how was the team invite experience?", timestamp: "7:10" },
      { speaker: "Sarah", text: "I tried inviting my team but the roles were confusing. What\u2019s the difference between editor and contributor?", timestamp: "8:45", isExtracted: true },
      { speaker: "Kate", text: "Good question. Did you end up figuring it out?", timestamp: "9:15" },
      { speaker: "Sarah", text: "Not really. I just picked one and hoped for the best.", timestamp: "9:45" },
      { speaker: "Kate", text: "How did the first week go overall for your team?", timestamp: "10:30" },
      { speaker: "Sarah", text: "We almost didn\u2019t make it past the first week because nobody knew how to set up their workspace.", timestamp: "12:03", isExtracted: true },
      { speaker: "Kate", text: "That\u2019s something we really need to address. Thank you for sharing all of this, Sarah.", timestamp: "13:20" },
      { speaker: "Sarah", text: "Happy to help. I think the product has a lot of potential, it just needs a better first experience.", timestamp: "14:00" },
    ],
  },
  "meeting-10": {
    id: "meeting-10",
    title: "Churn exit call with Mike D.",
    date: "Jan 15, 2026",
    duration: "18 min",
    participants: [
      { name: "Kate S.", color: "#7C6CA5" },
      { name: "Mike D.", color: "#C17D4A" },
    ],
    problems: [
      {
        id: "prob-4",
        title: "No clear starting point after signup",
        ticketCount: 1,
        quotes: [
          {
            text: "Honestly, after signing up I didn\u2019t know where to start. I left and never came back.",
            speaker: "Mike D.",
            timestamp: "2:15",
          },
        ],
      },
      {
        id: "prob-5",
        title: "Broken invite flow",
        ticketCount: 1,
        quotes: [
          {
            text: "The invite flow felt broken. I sent invites but my team said they never got them.",
            speaker: "Mike D.",
            timestamp: "5:40",
          },
          {
            text: "There was no onboarding checklist or guide. Just a blank canvas with no direction.",
            speaker: "Mike D.",
            timestamp: "7:22",
          },
        ],
      },
    ],
    transcript: [
      { speaker: "Kate", text: "Thanks for taking the time to talk with us, Mike. I know you recently decided to cancel.", timestamp: "0:15" },
      { speaker: "Mike", text: "Yeah, it just wasn\u2019t working out for us.", timestamp: "0:35" },
      { speaker: "Kate", text: "Can you tell me what happened? What was your experience like?", timestamp: "1:00" },
      { speaker: "Mike", text: "Honestly, after signing up I didn\u2019t know where to start. I left and never came back.", timestamp: "2:15", isExtracted: true },
      { speaker: "Kate", text: "That\u2019s concerning. Were there any specific friction points?", timestamp: "3:00" },
      { speaker: "Mike", text: "The invite flow felt broken. I sent invites but my team said they never got them.", timestamp: "5:40", isExtracted: true },
      { speaker: "Kate", text: "Did you try any other features?", timestamp: "6:10" },
      { speaker: "Mike", text: "There was no onboarding checklist or guide. Just a blank canvas with no direction.", timestamp: "7:22", isExtracted: true },
      { speaker: "Kate", text: "I understand. Thank you for being honest with us, this is really valuable feedback.", timestamp: "8:00" },
    ],
  },
  "meeting-2": {
    id: "meeting-2",
    title: "Discovery with Susan",
    date: "Feb 23, 2026",
    duration: "45 min",
    participants: [
      { name: "Kate S.", color: "#7C6CA5" },
      { name: "Susan R.", color: "#3A8A7C" },
    ],
    problems: [
      {
        id: "prob-6",
        title: "Manual onboarding workaround",
        ticketCount: 2,
        quotes: [
          {
            text: "Every new user we onboard hits the same wall \u2014 they don\u2019t know what to do first.",
            speaker: "Susan R.",
            timestamp: "3:18",
          },
          {
            text: "We\u2019ve been manually walking people through setup because the product doesn\u2019t do it.",
            speaker: "Susan R.",
            timestamp: "6:44",
          },
        ],
      },
      {
        id: "prob-7",
        title: "AI output lacks transparency",
        ticketCount: 1,
        quotes: [
          {
            text: "If I could see the confidence level for each extraction, I\u2019d use this daily.",
            speaker: "Susan R.",
            timestamp: "5:30",
          },
          {
            text: "Right now it feels like a black box. I need to see the reasoning.",
            speaker: "Susan R.",
            timestamp: "8:15",
          },
        ],
      },
    ],
    transcript: [
      { speaker: "Kate", text: "Susan, thanks for making time. I\u2019d love to hear how your team is using the product.", timestamp: "0:20" },
      { speaker: "Susan", text: "Of course. We\u2019ve been using it for about two months now.", timestamp: "0:45" },
      { speaker: "Susan", text: "Every new user we onboard hits the same wall \u2014 they don\u2019t know what to do first.", timestamp: "3:18", isExtracted: true },
      { speaker: "Kate", text: "How have you been handling that?", timestamp: "4:10" },
      { speaker: "Susan", text: "If I could see the confidence level for each extraction, I\u2019d use this daily.", timestamp: "5:30", isExtracted: true },
      { speaker: "Susan", text: "We\u2019ve been manually walking people through setup because the product doesn\u2019t do it.", timestamp: "6:44", isExtracted: true },
      { speaker: "Susan", text: "Right now it feels like a black box. I need to see the reasoning.", timestamp: "8:15", isExtracted: true },
      { speaker: "Susan", text: "Would love to check signal updates from my phone between meetings.", timestamp: "10:30", isExtracted: true },
      { speaker: "Kate", text: "The onboarding experience is the number one complaint from our customer success team.", timestamp: "11:20", isExtracted: true },
    ],
  },
  "meeting-5": {
    id: "meeting-5",
    title: "Working Session",
    date: "Feb 22, 2026",
    duration: "38 min",
    participants: [
      { name: "Kate S.", color: "#7C6CA5" },
    ],
    problems: [
      {
        id: "prob-8",
        title: "Enterprise onboarding drop-off",
        ticketCount: 1,
        quotes: [
          {
            text: "We lost three enterprise prospects because they couldn\u2019t get through initial setup.",
            speaker: "Kate S.",
            timestamp: "2:10",
          },
          {
            text: "The first five minutes are everything. Right now those five minutes are wasted.",
            speaker: "Kate S.",
            timestamp: "8:15",
          },
        ],
      },
      {
        id: "prob-9",
        title: "AI summaries lack verification",
        ticketCount: 2,
        quotes: [
          {
            text: "The AI summaries are sometimes wrong and there\u2019s no way to tell which parts to trust.",
            speaker: "Kate S.",
            timestamp: "4:20",
          },
          {
            text: "We need explainability. Show me the source quotes that led to each insight.",
            speaker: "Kate S.",
            timestamp: "7:55",
          },
        ],
      },
      {
        id: "prob-10",
        title: "Pricing clarity issues",
        ticketCount: 1,
        quotes: [
          {
            text: "Three of our prospects asked about pricing clarity this month alone.",
            speaker: "Kate S.",
            timestamp: "3:50",
          },
          {
            text: "The pricing tiers need a simpler comparison. People are dropping off at the plan selection step.",
            speaker: "Kate S.",
            timestamp: "6:20",
          },
        ],
      },
    ],
    transcript: [
      { speaker: "Kate", text: "Okay, let me go through my notes from this week\u2019s meetings.", timestamp: "0:10" },
      { speaker: "Kate", text: "We lost three enterprise prospects because they couldn\u2019t get through initial setup.", timestamp: "2:10", isExtracted: true },
      { speaker: "Kate", text: "Three of our prospects asked about pricing clarity this month alone.", timestamp: "3:50", isExtracted: true },
      { speaker: "Kate", text: "The AI summaries are sometimes wrong and there\u2019s no way to tell which parts to trust.", timestamp: "4:20", isExtracted: true },
      { speaker: "Kate", text: "The pricing tiers need a simpler comparison. People are dropping off at the plan selection step.", timestamp: "6:20", isExtracted: true },
      { speaker: "Kate", text: "We need explainability. Show me the source quotes that led to each insight.", timestamp: "7:55", isExtracted: true },
      { speaker: "Kate", text: "The first five minutes are everything. Right now those five minutes are wasted.", timestamp: "8:15", isExtracted: true },
      { speaker: "Kate", text: "The mobile experience is essentially broken. I can\u2019t review tickets on the go.", timestamp: "9:40", isExtracted: true },
    ],
  },
  "meeting-4": {
    id: "meeting-4",
    title: "Darren Meeting",
    date: "Feb 22, 2026",
    duration: "28 min",
    participants: [
      { name: "Kate S.", color: "#7C6CA5" },
      { name: "Darren P.", color: "#C17D4A" },
    ],
    problems: [
      {
        id: "prob-11",
        title: "Empty state is the core problem",
        ticketCount: 1,
        quotes: [
          {
            text: "I think the empty state is the biggest issue. People need to see value immediately.",
            speaker: "Darren P.",
            timestamp: "4:55",
          },
        ],
      },
      {
        id: "prob-12",
        title: "Pricing is buried and confusing",
        ticketCount: 1,
        quotes: [
          {
            text: "The per-seat pricing is buried. I had to email sales to figure out the actual cost.",
            speaker: "Darren P.",
            timestamp: "5:40",
          },
        ],
      },
      {
        id: "prob-13",
        title: "Permissions model is unclear",
        ticketCount: 1,
        quotes: [
          {
            text: "Roles and permissions are a mess right now. Users can\u2019t figure out what they can and can\u2019t do.",
            speaker: "Darren P.",
            timestamp: "9:30",
          },
        ],
      },
    ],
    transcript: [
      { speaker: "Kate", text: "Darren, thanks for coming in. I want to walk through some of the feedback we\u2019ve been getting.", timestamp: "0:15" },
      { speaker: "Darren", text: "Sure thing. I\u2019ve got some thoughts too.", timestamp: "0:30" },
      { speaker: "Darren", text: "I think the empty state is the biggest issue. People need to see value immediately.", timestamp: "4:55", isExtracted: true },
      { speaker: "Darren", text: "The per-seat pricing is buried. I had to email sales to figure out the actual cost.", timestamp: "5:40", isExtracted: true },
      { speaker: "Darren", text: "Roles and permissions are a mess right now. Users can\u2019t figure out what they can and can\u2019t do.", timestamp: "9:30", isExtracted: true },
      { speaker: "Darren", text: "I tried using the app on my phone during a meeting and half the buttons were cut off.", timestamp: "11:05", isExtracted: true },
    ],
  },
  "meeting-9": {
    id: "meeting-9",
    title: "AI trust interview with Sarah K.",
    date: "Jan 22, 2026",
    duration: "25 min",
    participants: [
      { name: "Kate S.", color: "#7C6CA5" },
      { name: "Sarah K.", color: "#3A8A7C" },
    ],
    problems: [
      {
        id: "prob-14",
        title: "AI output is a black box",
        ticketCount: 2,
        quotes: [
          {
            text: "I don\u2019t trust the AI output because I can\u2019t see how it reached its conclusion.",
            speaker: "Sarah K.",
            timestamp: "3:45",
          },
          {
            text: "My team won\u2019t adopt it until they can verify the AI\u2019s reasoning.",
            speaker: "Sarah K.",
            timestamp: "9:30",
          },
        ],
      },
      {
        id: "prob-15",
        title: "Need confidence scoring",
        ticketCount: 1,
        quotes: [
          {
            text: "A confidence score would help. Even just \u2018high/medium/low\u2019 would be better than nothing.",
            speaker: "Sarah K.",
            timestamp: "6:12",
          },
        ],
      },
    ],
    transcript: [
      { speaker: "Kate", text: "Sarah, today I\u2019d love to focus specifically on how you feel about the AI features.", timestamp: "0:20" },
      { speaker: "Sarah", text: "Yeah, that\u2019s actually the main thing I wanted to talk about.", timestamp: "0:40" },
      { speaker: "Sarah", text: "I don\u2019t trust the AI output because I can\u2019t see how it reached its conclusion.", timestamp: "3:45", isExtracted: true },
      { speaker: "Kate", text: "What would make you trust it more?", timestamp: "4:30" },
      { speaker: "Sarah", text: "A confidence score would help. Even just \u2018high/medium/low\u2019 would be better than nothing.", timestamp: "6:12", isExtracted: true },
      { speaker: "Sarah", text: "My team won\u2019t adopt it until they can verify the AI\u2019s reasoning.", timestamp: "9:30", isExtracted: true },
    ],
  },
  "meeting-8": {
    id: "meeting-8",
    title: "Pricing feedback with Mike C.",
    date: "Jan 28, 2026",
    duration: "22 min",
    participants: [
      { name: "Kate S.", color: "#7C6CA5" },
      { name: "Mike C.", color: "#5B82B5" },
    ],
    problems: [
      {
        id: "prob-16",
        title: "Pricing tiers are confusing",
        ticketCount: 2,
        quotes: [
          {
            text: "I can\u2019t tell the difference between the Pro and Business plans. The feature comparison is confusing.",
            speaker: "Mike C.",
            timestamp: "3:10",
          },
          {
            text: "We almost went with a competitor because your pricing page made it seem more expensive than it is.",
            speaker: "Mike C.",
            timestamp: "7:25",
          },
        ],
      },
    ],
    transcript: [
      { speaker: "Kate", text: "Mike, appreciate you taking the time. I wanted to get your thoughts on pricing.", timestamp: "0:15" },
      { speaker: "Mike", text: "I can\u2019t tell the difference between the Pro and Business plans. The feature comparison is confusing.", timestamp: "3:10", isExtracted: true },
      { speaker: "Kate", text: "That\u2019s really valuable feedback. Did that affect your decision?", timestamp: "4:00" },
      { speaker: "Mike", text: "We almost went with a competitor because your pricing page made it seem more expensive than it is.", timestamp: "7:25", isExtracted: true },
    ],
  },
};

export const SIGNAL_STATUS_STYLES: Record<
  Signal["status"],
  { bg: string; text: string; label: string }
> = {
  project: { bg: "#E8F0E8", text: "#3D5A3D", label: "Project" },
  stable: { bg: "#FEF3C7", text: "#D97706", label: "stable" },
  new: { bg: "#FFEDD5", text: "#EA580C", label: "new" },
  converted: { bg: "#E8F0E8", text: "#3D5A3D", label: "Converted to Epic" },
};
