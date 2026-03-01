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
    const { transcript, problems, solutions } = await request.json();

    const problemsSummary = problems
      .map((p: { title: string; description: string; quotes: { text: string }[] }, i: number) =>
        `${i + 1}. ${p.title}: ${p.description}\n   Quotes: ${p.quotes.map((q: { text: string }) => `"${q.text}"`).join(", ")}`
      )
      .join("\n");

    const solutionsSummary = solutions
      .map((s: { solution: { title: string; description: string }; workItems: { title: string }[] }, i: number) =>
        `${i + 1}. ${s.solution.title}: ${s.solution.description}\n   Work items: ${s.workItems.map((w: { title: string }) => w.title).join(", ")}`
      )
      .join("\n");

    const message = await withRetry(() => client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      system: `You are Fijord, a product management AI. Given a meeting transcript, extracted problems, and proposed solutions, generate a comprehensive product design brief.

Be opinionated and specific. Use real details from the transcript. Persona should feel like a real person, not a template.

Respond with ONLY valid JSON (no markdown, no code fences):

{
  "generatedFrom": "string — e.g. '1 meeting transcript'",
  "generatedDate": "string — today's date formatted like 'Feb 27, 2026'",
  "sourceCount": 1,
  "persona": {
    "avatar": "string — 2-letter initials",
    "title": "string — role title like 'Team Lead at a Mid-Size Company'",
    "description": "string — 1-2 sentences about who they are",
    "goal": "string — what they want to achieve",
    "frustration": "string — their main pain point",
    "keyQuote": "string — a real quote from the transcript"
  },
  "currentExperience": {
    "subtitle": "string — e.g. 'What users go through today'",
    "steps": [
      {
        "emoji": "string — single emoji",
        "title": "string — short step title",
        "description": "string — 1 sentence description",
        "emotionTag": "string — emotion word like 'Frustrated'",
        "emotionColor": "red | yellow | green"
      }
    ]
  },
  "desiredExperience": {
    "subtitle": "string — e.g. 'What we want users to feel'",
    "steps": [
      {
        "emoji": "string — single emoji",
        "title": "string — short step title",
        "description": "string — 1 sentence description",
        "emotionTag": "string — emotion word like 'Confident'",
        "emotionColor": "red | yellow | green"
      }
    ]
  },
  "problem": "string — 2-3 sentences describing the core problem",
  "goal": "string — measurable goal statement",
  "approach": "string — 2-3 sentences on the proposed approach",
  "successMetrics": ["string — measurable metric", "...3-4 total"],
  "designPrinciples": [
    {
      "title": "string — principle name",
      "description": "string — 1-2 sentences explaining it",
      "quote": "string — supporting quote from transcript"
    }
  ],
  "wireframeSketch": {
    "subtitle": "string — e.g. 'Key screens and components'",
    "cards": [
      {
        "title": "string — screen/component name",
        "items": ["string — UI element description", "...3-4 items"]
      }
    ]
  },
  "openQuestions": ["string — question to resolve", "...3-5 total"]
}

Guidelines:
- currentExperience should have exactly 3 steps with emotionColor "red" or "yellow"
- desiredExperience should have exactly 3 steps with emotionColor "green"
- designPrinciples should have exactly 3 principles
- wireframeSketch should have exactly 3 cards
- openQuestions should have 3-5 items
- successMetrics should have 3-4 items
- Use real quotes from the transcript where possible`,
      messages: [
        {
          role: "user",
          content: `Meeting transcript:\n${transcript}\n\nProblems identified:\n${problemsSummary}\n\nProposed solutions:\n${solutionsSummary}`,
        },
      ],
    }));

    if (message.stop_reason === "max_tokens") {
      return NextResponse.json({ error: "AI response was truncated" }, { status: 500 });
    }

    const content = message.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response format" }, { status: 500 });
    }

    const result = JSON.parse(extractJSON(content.text));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate brief error:", error);
    return NextResponse.json({ error: "Failed to generate brief" }, { status: 500 });
  }
}
