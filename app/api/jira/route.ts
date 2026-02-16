import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { path, method, body, domain, email, apiToken } = await request.json();

  if (!path || !domain || !email || !apiToken) {
    return NextResponse.json(
      { error: "path, domain, email, and apiToken are required" },
      { status: 400 }
    );
  }

  const url = `https://${domain}/rest/api/3/${path}`;
  const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");

  try {
    const res = await fetch(url, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          { error: "Invalid credentials — check your domain, email, and API token." },
          { status: 401 }
        );
      }
      if (res.status === 403) {
        return NextResponse.json(
          { error: "You don't have permission to perform this action." },
          { status: 403 }
        );
      }
      if (res.status === 429) {
        return NextResponse.json(
          { error: "Rate limited — please wait a moment and try again." },
          { status: 429 }
        );
      }
      const errorBody = await res.text();
      return NextResponse.json(
        { error: `Jira API error: ${errorBody}` },
        { status: res.status }
      );
    }

    // Some Jira endpoints return 204 with no body
    if (res.status === 204) {
      return NextResponse.json({});
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Could not reach Jira — check your connection and domain." },
      { status: 502 }
    );
  }
}
