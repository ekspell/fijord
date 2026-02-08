import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { ProcessingResult } from "@/lib/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are Fjord, a product management AI. You analyze meeting transcripts from product discovery calls and extract structured, actionable output.

Your job:
1. Read the transcript carefully.
2. Identify distinct PROBLEMS — real user pain points discussed in the call. Not feature requests, not vague complaints. Concrete problems with evidence.
3. For each problem, create exactly ONE PATCH — a specific, opinionated solution. Be decisive. Don't hedge.
4. For each patch, break it into TICKETS — concrete work items a dev team could pick up. Each ticket should read like a well-written JIRA ticket.
5. Extract direct QUOTES from the transcript that support each problem. Include the speaker name and approximate timestamp if available.

Guidelines:
- Be opinionated. Pick the best solution, don't offer alternatives.
- Tickets should be specific enough to implement. Include acceptance criteria.
- Assign realistic priorities: High = blocking/critical UX issue, Med = important but not blocking, Low = nice to have.
- Use ticket IDs in the format FJD-101, FJD-102, etc.
- If the transcript mentions participant names and roles, capture them.
- Meeting title should reflect the main topic discussed.

Respond with ONLY valid JSON matching this exact structure (no markdown, no code fences):

{
  "meetingTitle": "string — descriptive title like 'Discovery call — Onboarding confusion'",
  "date": "string — date if mentioned, otherwise 'Today'",
  "participants": "string — e.g. 'Kate (PM), 30-min customer call'",
  "summary": {
    "problemCount": number,
    "quoteCount": number,
    "ticketCount": number
  },
  "problems": [
    {
      "label": "PROBLEM 1",
      "title": "string — concise problem title",
      "description": "string — 1-2 sentence description of the pain point",
      "quotes": [
        {
          "text": "string — exact quote from transcript",
          "speaker": "string — who said it",
          "timestamp": "string — e.g. '4:12' or 'early in call'"
        }
      ],
      "patch": {
        "label": "PATCH 1",
        "title": "string — concise solution title",
        "description": "string — 1-2 sentence description of the approach"
      },
      "tickets": [
        {
          "id": "FJD-101",
          "title": "string — actionable ticket title",
          "priority": "High | Med | Low",
          "problemStatement": "string — paragraph explaining the problem context, why it matters, what users experience",
          "description": "string — paragraph explaining what to build or change",
          "acceptanceCriteria": ["string — specific, testable criteria"],
          "quotes": [
            {
              "text": "string — supporting quote",
              "speaker": "string",
              "timestamp": "string"
            }
          ]
        }
      ]
    }
  ]
}`;

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
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Here is a meeting transcript to analyze:\n\n${transcript}`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json(
        { error: "Unexpected response format" },
        { status: 500 }
      );
    }

    // Strip markdown code fences if Claude wraps the JSON
    let text = content.text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    const result: ProcessingResult = JSON.parse(text);

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
