// Color palette for problem threading — assigned by index
export const PROBLEM_COLORS = [
  "#7C6CA5", // purple
  "#3A8A7C", // teal
  "#C17D4A", // amber
  "#5B82B5", // blue
  "#B56B6B", // rose
];

export type Quote = {
  text: string;
  speaker: string;
  timestamp: string;
};

// Step 1: Problems extracted from transcript
export type ExtractedProblem = {
  id: string;
  title: string;
  description: string;
  severity: "High" | "Med" | "Low";
  quotes: Quote[];
};

export type ProblemsResult = {
  meetingTitle: string;
  date: string;
  participants: string;
  problems: ExtractedProblem[];
};

// Step 2: solution + work items generated for a problem
export type WorkItem = {
  id: string;
  title: string;
  priority: "High" | "Med" | "Low";
};

export type solutionResult = {
  solution: {
    title: string;
    description: string;
  };
  workItems: WorkItem[];
};

// Step 3: Full ticket detail for a work item
export type TicketDetail = {
  id: string;
  title: string;
  priority: "High" | "Med" | "Low";
  status: string;
  problemStatement: string;
  description: string;
  acceptanceCriteria: string[];
  quotes: Quote[];
};

// Context bundle for ticket detail view
export type TicketContext = {
  ticket: TicketDetail;
  problem: ExtractedProblem;
  problemIndex: number;
  problemColor: string;
  solution: solutionResult["solution"];
  meetingTitle: string;
  meetingDate: string;
};
