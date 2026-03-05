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
    const { transcript, problem } = await request.json();

    const message = await withRetry(() => client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: `You are Fijord, a senior product manager AI. Given a problem extracted from a meeting transcript, generate ONE opinionated solution and the minimum set of work items needed to ship it.

PM thinking:
- Be decisive. Pick the best solution, don't hedge.
- LESS IS MORE. Only create work items that are truly necessary to solve the problem. Ask yourself: "Would I actually create this ticket in Jira?" If no, skip it.
- Aim for 2-3 work items. Maximum 4, only if the solution genuinely requires it.
- Each work item should represent meaningful, shippable work — not micro-tasks. "Add tooltip to button" is too small. "Redesign onboarding first-run experience" is the right granularity.
- Don't create work items for things like "write tests", "update docs", or "do research" — those are part of normal engineering work, not separate tickets.
- Don't duplicate — if two work items sound similar, merge them into one.
- Assign priority honestly: High = must ship first, Med = important but not blocking, Low = can defer.

Respond with ONLY valid JSON (no markdown, no code fences):

{
  "solution": {
    "title": "string — concise solution title",
    "description": "string — 1-2 sentences explaining the approach"
  },
  "workItems": [
    {
      "id": "FJD-101",
      "title": "string — actionable work item title",
      "priority": "High | Med | Low"
    }
  ]
}`,
      messages: [
        {
          role: "user",
          content: `Original transcript (for context):\n${transcript}\n\nProblem to solve:\nTitle: ${problem.title}\nDescription: ${problem.description}\nSupporting quotes: ${problem.quotes.map((q: { text: string }) => `"${q.text}"`).join(", ")}`,
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
    console.error("Generate solution error:", error);
    return NextResponse.json({ error: "Failed to generate solution" }, { status: 500 });
  }
}
