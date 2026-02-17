import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveShareBundle, isKVConfigured, ShareBundle, ShareTicket } from "@/lib/kv";

export async function POST(request: NextRequest) {
  if (!isKVConfigured()) {
    return NextResponse.json(
      { error: "Share storage not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { meetingTitle, meetingDate, tickets } = body as {
    meetingTitle?: string;
    meetingDate?: string;
    tickets: ShareTicket[];
  };

  if (!tickets || tickets.length === 0) {
    return NextResponse.json(
      { error: "At least one ticket is required" },
      { status: 400 }
    );
  }

  const meetingId = randomUUID().replace(/-/g, "").slice(0, 8);

  const bundle: ShareBundle = {
    meetingId,
    meetingTitle: meetingTitle || "Meeting",
    meetingDate: meetingDate || new Date().toLocaleDateString(),
    createdAt: new Date().toISOString(),
    tickets,
  };

  try {
    await saveShareBundle(bundle);
    return NextResponse.json({ meetingId });
  } catch {
    return NextResponse.json(
      { error: "Failed to save share bundle" },
      { status: 500 }
    );
  }
}
