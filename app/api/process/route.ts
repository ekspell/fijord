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

const SYSTEM_PROMPT = `You are Fjord, a product management AI that extracts actionable insights from meeting transcripts.

Your job:
1. Identify distinct PROBLEMS — user pain points, unmet needs, confusion, friction
2. For each problem, assess SEVERITY based on evidence:
   - "High" — core/blocking, affecting revenue or many users
   - "Med" — important friction, moderate impact
   - "Low" — nice-to-have, minor annoyance
3. Extract actual QUOTES from the transcript as evidence
4. Infer a meeting title, date, and participant info from context
5. Return problems ordered from highest severity to lowest

Rules:
- Be specific, not generic. "Users are confused" is bad. "Users don't know which button starts the trial" is good.
- Each problem must be backed by specific evidence from the transcript
- Skip small talk, pleasantries, and off-topic discussion
- If the transcript has no real problems, return an empty problems array — don't make things up
- Quotes should be near-exact from the transcript
- Typically 2-5 problems. Don't force more than exist.
- Base severity ONLY on evidence. If unsure, default to "Med".

Output valid JSON only, no other text:

{
  "meetingTitle": "string — e.g. 'Discovery call — Onboarding confusion'",
  "date": "string — date if mentioned, otherwise 'Today'",
  "participants": "string — e.g. 'Kate (PM), Sarah (Customer) — 30-min call'",
  "problems": [
    {
      "id": "problem-1",
      "title": "string — concise, specific problem title",
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
