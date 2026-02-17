import { ShareTicket } from "./kv";

export async function createShareBundle(
  meetingTitle: string,
  meetingDate: string,
  tickets: ShareTicket[]
): Promise<Map<string, string>> {
  const shareUrlMap = new Map<string, string>();

  try {
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingTitle, meetingDate, tickets }),
    });

    if (res.ok) {
      const { meetingId } = await res.json();
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://fijord.app";
      for (const t of tickets) {
        shareUrlMap.set(t.id, `${baseUrl}/share/${meetingId}/${t.id}`);
      }
    } else {
      const errBody = await res.text().catch(() => "");
      console.error(`[share] API returned ${res.status}: ${errBody}`);
    }
  } catch (err) {
    console.error("[share] Failed to create share bundle:", err);
  }

  return shareUrlMap;
}
