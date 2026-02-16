export const FIREFLIES_QUERIES = {
  transcripts: `{
    transcripts {
      id
      title
      date
      participants
    }
  }`,
  transcript: `query Transcript($id: String!) {
    transcript(id: $id) {
      title
      sentences {
        text
        speaker_name
        start_time
      }
    }
  }`,
  user: `{ user { name email } }`,
};

export class FirefliesError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function firefliesFetch(
  query: string,
  variables: Record<string, unknown> | undefined,
  apiKey: string
) {
  const res = await fetch("/api/fireflies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables, apiKey }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new FirefliesError(data.error || "Fireflies API error", res.status);
  }
  return res.json();
}

export type FirefliesTranscript = {
  id: string;
  title: string;
  date: string;
  participants: string[];
};

export type FirefliesSentence = {
  text: string;
  speaker_name: string;
  start_time: number;
};

export function formatTranscript(sentences: FirefliesSentence[]): string {
  return sentences
    .map((s) => `${s.speaker_name}: "${s.text}"`)
    .join("\n");
}
