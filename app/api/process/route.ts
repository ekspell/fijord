import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Fjord, a product management AI. You analyze meeting transcripts and extract structured problems.

Your job:
1. Read the transcript carefully.
2. Identify distinct PROBLEMS — real user pain points discussed in the call. Not feature requests, not vague complaints. Concrete problems with evidence.
3. Extract direct QUOTES from the transcript that support each problem. Include the speaker name and approximate timestamp if available.
4. Infer a meeting title, date, and participant info from context.

Guidelines:
- Ignore small talk, greetings, pleasantries, scheduling logistics, and off-topic conversation. Only extract substantive product or user experience problems.
- A problem must be backed by specific evidence — a user describing friction, confusion, failure, or workaround. Passing mentions or hypotheticals don't count.
- Focus only on problems. Do NOT generate solutions or tickets yet.
- Each problem should be a distinct pain point, not a duplicate or sub-issue of another.
- Quotes should be near-exact from the transcript. Only quote statements that directly describe a pain point or its impact — never quote greetings, filler, or agreement statements.
- Typically 2-5 problems per transcript. Don't force more than exist. If the transcript is mostly small talk with only 1 real problem, return 1.

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

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: `Here is a meeting transcript to analyze:\n\n${transcript}`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

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
