export type Quote = {
  text: string;
  speaker: string;
  timestamp: string;
};

export type Ticket = {
  id: string;
  title: string;
  priority: "High" | "Med" | "Low";
  problemStatement: string;
  description: string;
  acceptanceCriteria: string[];
  quotes: Quote[];
};

export type Problem = {
  label: string;
  title: string;
  description: string;
  quotes: Quote[];
  patch: {
    label: string;
    title: string;
    description: string;
  };
  tickets: Ticket[];
};

export type ProcessingResult = {
  meetingTitle: string;
  date: string;
  participants: string;
  summary: {
    problemCount: number;
    quoteCount: number;
    ticketCount: number;
  };
  problems: Problem[];
};
