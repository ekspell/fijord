import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw new Error("Unreachable");
}

const SYSTEM_PROMPT = `You are Fjord, a product management AI. You analyze meeting transcripts and extract structured problems.

Your job:
1. Read the transcript carefully.
2. Identify distinct PROBLEMS — real user pain points discussed in the call. Not feature requests, not vague complaints. Concrete problems with evidence.
3. Assess each problem's SEVERITY based on the evidence in the transcript:
   - "High" — Blocking revenue, causing churn, or affecting many users. Strong evidence of urgency.
   - "Med" — Causing friction or confusion but not blocking. Moderate evidence of impact.
   - "Low" — Minor annoyance or edge case. Limited evidence or few users affected.
4. Extract direct QUOTES from the transcript that support each problem. Include the speaker name and approximate timestamp if available.
5. Infer a meeting title, date, and participant info from context.
6. Return problems ordered from highest severity to lowest.

Guidelines:
- Ignore small talk, greetings, pleasantries, scheduling logistics, and off-topic conversation. Only extract substantive product or user experience problems.
- A problem must be backed by specific evidence — a user describing friction, confusion, failure, or workaround. Passing mentions or hypotheticals don't count.
- Focus only on problems. Do NOT generate solutions or tickets yet.
- Each problem should be a distinct pain point, not a duplicate or sub-issue of another.
- Quotes should be near-exact from the transcript. Only quote statements that directly describe a pain point or its impact — never quote greetings, filler, or agreement statements.
- Typically 2-5 problems per transcript. Don't force more than exist. If the transcript is mostly small talk with only 1 real problem, return 1.
- Base severity ONLY on evidence from the transcript. If unsure, default to "Med".

Respond with ONLY valid JSON (no markdown, no code fences, no commentary):

{
  "meetingTitle": "string — e.g. 'Discovery call — Onboarding confusion'",
  "date": "string — date if mentioned, otherwise 'Today'",
  "participants": "string — e.g. 'Kate (PM), Sarah (Customer) — 30-min call'",
  "problems": [
    {
      "id": "problem-1",
      "title": "string — concise problem title",
      "description": "string — 1-2 sentence description of the pain point",
      "severity": "High | Med | Low",
      "quotes": [
        {
          "text": "string — exact quote from transcript",
          "speaker": "string — who said it",
          "timestamp": "string — e.g. '4:12' or 'early in call'"
        }
      ]
    }
  ]
}`;

function extractJSON(text: string): string {
  let cleaned = text.trim();
  // Strip code fences
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  // Find the JSON object if there's surrounding text
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const message = await withRetry(() =>
      client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 8192,
        messages: [
          {
            role: "user",
            content: `Here is a meeting transcript to analyze:\n\n${transcript}`,
          },
        ],
        system: SYSTEM_PROMPT,
      })
    );

    if (message.stop_reason === "max_tokens") {
      console.error("Response truncated — hit max_tokens limit");
      return NextResponse.json(
        { error: "AI response was truncated. Try a shorter transcript." },
        { status: 500 }
      );
    }

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format" },
        { status: 500 }
      );
    }

    const result = JSON.parse(extractJSON(content.text));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Processing error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process transcript" },
      { status: 500 }
    );
  }
}
