import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

type MeetingProblem = {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  problemTitle: string;
  problemDescription: string;
  quotes: { text: string; speaker: string }[];
};

const SYSTEM_PROMPT = `You are Fijord, a product management AI that detects recurring patterns (signals) across multiple discovery meetings.

You receive problems extracted from multiple meetings. Your job:
1. Find RECURRING PATTERNS — the same pain point, theme, or need mentioned across 2+ meetings
2. Cluster related problems together into signals
3. Assess signal strength based on frequency and severity

Rules:
- A signal must appear in at least 2 meetings. Problems from a single meeting are NOT signals.
- Be specific. "Users are unhappy" is bad. "Users can't find search results" is good.
- Merge near-duplicates (e.g. "search is broken" and "search returns bad results" = one signal)
- Pick the most representative quotes from each meeting for that signal
- Strength = (meetings with this signal / total meetings) * 100, clamped to 20-95
- Assign severity: "severe" if blocking/revenue-impacting, "moderate" if significant friction, "minor" if nice-to-have
- Tags should be 2-4 short keywords describing the problem space
- Typically 1-5 signals. Don't force patterns that don't exist.
- If no patterns span multiple meetings, return an empty signals array.

Output valid JSON only, no other text:

{
  "signals": [
    {
      "id": "string — kebab-case unique id, e.g. 'search-broken-signal'",
      "title": "string — concise pattern title, e.g. 'Search returns irrelevant results'",
      "description": "string — 1-2 sentence description of the recurring pattern",
      "severity": "severe | moderate | minor",
      "meetingCount": number,
      "tags": ["string", "string"],
      "linkedProblems": [
        {
          "meetingId": "string",
          "meetingTitle": "string",
          "meetingDate": "string",
          "problemTitle": "string",
          "quotes": [
            {
              "text": "string — the quote",
              "speaker": "string",
              "meetingId": "string",
              "meetingTitle": "string",
              "meetingDate": "string"
            }
          ]
        }
      ]
    }
  ]
}`;

function extractJSON(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const { meetings } = await request.json() as { meetings: { id: string; title: string; date: string; problems: MeetingProblem[] }[] };

    if (!meetings || !Array.isArray(meetings) || meetings.length < 2) {
      return NextResponse.json({ signals: [] });
    }

    // Build a compact representation of all problems across meetings
    const totalMeetings = meetings.length;
    const problemsSummary = meetings.map((m) => ({
      meetingId: m.id,
      meetingTitle: m.title,
      meetingDate: m.date,
      problems: m.problems.map((p) => ({
        title: p.problemTitle,
        description: p.problemDescription,
        quotes: p.quotes.slice(0, 3).map((q) => ({ text: q.text, speaker: q.speaker })),
      })),
    }));

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Here are problems extracted from ${totalMeetings} discovery meetings. Find recurring patterns that appear across multiple meetings.\n\n${JSON.stringify(problemsSummary, null, 2)}`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ signals: [] });
    }

    const result = JSON.parse(extractJSON(content.text));

    // Post-process: add computed fields
    const SIGNAL_COLORS = ["#3D5A3D", "#3B82F6", "#8B5CF6", "#D97706", "#DC2626", "#059669", "#6366F1"];
    const signals = (result.signals || []).map((s: any, i: number) => {
      const quotes = (s.linkedProblems || []).flatMap((lp: any) =>
        (lp.quotes || []).map((q: any) => ({
          text: q.text,
          speaker: q.speaker || "",
          timestamp: "",
          meetingId: q.meetingId || lp.meetingId,
          meetingTitle: q.meetingTitle || lp.meetingTitle,
          meetingDate: q.meetingDate || lp.meetingDate,
        }))
      );

      const meetingCount = s.meetingCount || (s.linkedProblems || []).length;
      const strength = Math.min(95, Math.max(20, Math.round((meetingCount / totalMeetings) * 100)));

      return {
        id: s.id || `signal-${i}`,
        title: s.title,
        description: s.description || "",
        meetingCount,
        totalMeetings,
        quoteCount: quotes.length,
        strength,
        tags: s.tags || [],
        status: strength >= 60 ? "stable" : "new",
        color: SIGNAL_COLORS[i % SIGNAL_COLORS.length],
        firstDetected: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        quotes,
        timeline: [
          {
            label: "Signal detected",
            description: `Pattern found across ${meetingCount} meetings`,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          },
        ],
      };
    });

    return NextResponse.json({ signals });
  } catch (error) {
    console.error("Signal detection error:", error);
    return NextResponse.json({ signals: [] });
  }
}
