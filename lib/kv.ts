import { Redis } from "@upstash/redis";

export type ShareTicket = {
  id: string;
  title: string;
  priority: string;
  status?: string;
  problemStatement?: string;
  description?: string;
  acceptanceCriteria?: string[];
  quotes?: { text: string; speaker: string; timestamp?: string }[];
  problemTitle: string;
  problemDescription: string;
  problemColor: string;
  problemQuotes?: { text: string; speaker: string; summary?: string }[];
};

export type ShareBundle = {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  createdAt: string;
  tickets: ShareTicket[];
};

const TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

export function isKVConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export async function saveShareBundle(bundle: ShareBundle): Promise<void> {
  const redis = getRedis();
  await redis.set(`share:${bundle.meetingId}`, JSON.stringify(bundle), { ex: TTL_SECONDS });
}

export async function getShareBundle(meetingId: string): Promise<ShareBundle | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(`share:${meetingId}`);
  if (!raw) return null;
  if (typeof raw === "object") return raw as unknown as ShareBundle;
  return JSON.parse(raw);
}
