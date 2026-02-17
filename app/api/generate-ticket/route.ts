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
    const { transcript, problem, solution, workItem } = await request.json();

    const message = await withRetry(() => client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: `You are Fijord, a product management AI. Given a work item, its parent problem, and the proposed solution, generate a concise ticket that a developer could pick up immediately.

Write like a senior PM. Be brief and direct — no filler, no over-explanation. Every sentence should earn its place.
- problemStatement: 2-3 sentences max. State the user pain and why it matters.
- description: 2-3 sentences max. What to build or change, concretely.
- acceptanceCriteria: exactly 3-5 items. Each one short and testable.
- quotes: 1-2 most relevant quotes only.

Respond with ONLY valid JSON (no markdown, no code fences):

{
  "id": "string — the work item ID",
  "title": "string — the work item title",
  "priority": "High | Med | Low",
  "status": "string — one of: Ready for design, Ready for dev, Backlog",
  "problemStatement": "string — 2-3 sentences on the user problem",
  "description": "string — 2-3 sentences on what to build",
  "acceptanceCriteria": ["string — 3-5 short, testable criteria"],
  "quotes": [
    {
      "text": "string — relevant quote from transcript",
      "speaker": "string",
      "timestamp": "string"
    }
  ]
}`,
      messages: [
        {
          role: "user",
          content: `Transcript:\n${transcript}\n\nProblem: ${problem.title} — ${problem.description}\n\nsolution: ${solution.title} — ${solution.description}\n\nWork item to expand into a full ticket:\nID: ${workItem.id}\nTitle: ${workItem.title}\nPriority: ${workItem.priority}`,
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
    console.error("Generate ticket error:", error);
    return NextResponse.json({ error: "Failed to generate ticket" }, { status: 500 });
  }
}
