import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isKVConfigured } from "@/lib/kv";
import { Redis } from "@upstash/redis";

export async function POST(request: NextRequest) {
  if (!isKVConfigured()) {
    return NextResponse.json(
      { error: "Storage not configured" },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { reaction, pageUrl, ...rest } = body as {
    reaction?: string;
    pageUrl?: string;
    [key: string]: unknown;
  };

  if (!reaction) {
    return NextResponse.json(
      { error: "Reaction is required" },
      { status: 400 }
    );
  }

  const id = randomUUID().replace(/-/g, "").slice(0, 12);

  const record = {
    id,
    reaction,
    pageUrl: pageUrl || "",
    timestamp: new Date().toISOString(),
    ...rest,
  };

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    await redis.set(`feedback:${id}`, JSON.stringify(record));
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}
