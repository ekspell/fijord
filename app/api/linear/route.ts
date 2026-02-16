import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { query, variables, apiKey } = await request.json();

  if (!query || !apiKey) {
    return NextResponse.json(
      { error: "query and apiKey are required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401 }
        );
      }
      if (res.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limited — please wait a moment and try again",
            retryAfter: res.headers.get("Retry-After"),
          },
          { status: 429 }
        );
      }
      const errorBody = await res.text();
      return NextResponse.json(
        { error: `Linear API error: ${errorBody}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Could not reach Linear — check your connection" },
      { status: 502 }
    );
  }
}
