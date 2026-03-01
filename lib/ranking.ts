import type { ExtractedProblem } from "./types";
import type { Signal } from "./mock-data";

// ── Pain-language keyword lists ──

const SEVERE_KEYWORDS = [
  "broken",
  "can't",
  "can\u2019t",
  "blocker",
  "dealbreaker",
  "frustrated",
  "impossible",
  "never came back",
  "almost didn't",
  "almost didn\u2019t",
  "failed",
  "unusable",
];

const MODERATE_KEYWORDS = [
  "annoying",
  "slow",
  "confusing",
  "difficult",
  "unclear",
  "struggled",
  "took forever",
];

const MINOR_KEYWORDS = [
  "would be nice",
  "maybe",
  "sometimes",
  "slightly",
  "minor",
];

// ── Severity detection ──

export type Severity = "severe" | "moderate" | "minor";

export function detectSeverity(text: string): Severity {
  const lower = text.toLowerCase();
  if (SEVERE_KEYWORDS.some((kw) => lower.includes(kw))) return "severe";
  if (MODERATE_KEYWORDS.some((kw) => lower.includes(kw))) return "moderate";
  if (MINOR_KEYWORDS.some((kw) => lower.includes(kw))) return "minor";
  return "moderate"; // default
}

export function severityScore(severity: Severity): number {
  if (severity === "severe") return 3;
  if (severity === "moderate") return 2;
  return 1;
}

// ── Problem ranking ──

function maxSeverityForProblem(problem: ExtractedProblem): Severity {
  const texts = [
    problem.description,
    ...problem.quotes.map((q) => q.text),
  ];
  let best: Severity = "minor";
  for (const t of texts) {
    const s = detectSeverity(t);
    if (severityScore(s) > severityScore(best)) best = s;
    if (best === "severe") break; // can't do better
  }
  return best;
}

export function rankProblems(problems: ExtractedProblem[]): ExtractedProblem[] {
  return [...problems].sort((a, b) => {
    const sevDiff =
      severityScore(maxSeverityForProblem(b)) -
      severityScore(maxSeverityForProblem(a));
    if (sevDiff !== 0) return sevDiff;
    return b.quotes.length - a.quotes.length; // secondary: frequency
  });
}

/** Get the detected severity for a problem (exposed for badge display) */
export function problemSeverity(problem: ExtractedProblem): Severity {
  return maxSeverityForProblem(problem);
}

// ── Signal ranking ──

export function detectSignalSeverity(signal: Signal): Severity {
  if (!signal.quotes || signal.quotes.length === 0) return "moderate";
  let best: Severity = "minor";
  for (const q of signal.quotes) {
    const s = detectSeverity(q.text);
    if (severityScore(s) > severityScore(best)) best = s;
    if (best === "severe") break;
  }
  return best;
}

export function rankSignals(signals: Signal[]): Signal[] {
  return [...signals].sort((a, b) => {
    const sevDiff =
      severityScore(detectSignalSeverity(b)) -
      severityScore(detectSignalSeverity(a));
    if (sevDiff !== 0) return sevDiff;
    return b.strength - a.strength; // secondary: signal strength
  });
}

// ── Visual style mapping ──

export const SEVERITY_DISPLAY: Record<
  Severity,
  { dot: string; bg: string; text: string; label: string }
> = {
  severe: { dot: "#DC2626", bg: "#FEF2F2", text: "#B91C1C", label: "Severe" },
  moderate: { dot: "#D97706", bg: "#FEF3C7", text: "#92400E", label: "Moderate" },
  minor: { dot: "#16A34A", bg: "#F0FDF4", text: "#166534", label: "Minor" },
};
