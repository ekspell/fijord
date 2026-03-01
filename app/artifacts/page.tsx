"use client";

import { useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { MOCK_MEETING_RECORDS, MOCK_MEETING_DETAILS } from "@/lib/mock-data";
import { MOCK_EPICS } from "@/lib/mock-epics";

export default function EvidencePage() {
  const router = useRouter();
  const { demoMode, result, solutions } = useNav();
  const mockMeetings = demoMode ? [] : MOCK_MEETING_RECORDS;

  // Build a card for the current session's processed meeting
  const processedMeeting = result && solutions.length > 0 ? {
    id: "__processed__",
    title: result.meetingTitle,
    participant: result.participants,
    date: result.date,
    time: "",
    color: "#3D5A3D",
    epicIds: [] as string[],
    problemCount: result.problems.length,
    ticketCount: solutions.reduce((s, sol) => s + sol.workItems.length, 0),
  } : null;

  const meetings = [
    ...(processedMeeting ? [processedMeeting] : []),
    ...mockMeetings,
  ];

  return (
    <div className="mx-auto" style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
        <button onClick={() => router.push("/")} className="hover:text-foreground">
          Home
        </button>
        {" \u203A "}
        <span className="text-accent">Evidence</span>
      </div>

      {/* Header */}
      <h1
        className="text-foreground"
        style={{
          fontSize: 48,
          letterSpacing: "-1px",
          lineHeight: "74.4px",
          fontWeight: 300,
        }}
      >
        Evidence
      </h1>
      <p className="mb-6 text-muted" style={{ fontSize: 15 }}>
        Your processed meetings and evidence library.
      </p>

      {/* Empty state */}
      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9C978E"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-foreground">
            Your evidence lives here
          </p>
          <p className="mt-1.5 text-[13px] text-muted">
            Process a meeting to start building your evidence library.
          </p>
          <button
            onClick={() => router.push("/meeting/new?from=artifacts")}
            className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/25 transition-colors hover:bg-accent/90"
          >
            Process your first meeting &rarr;
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {meetings.map((meeting) => {
            const isProcessed = meeting.id === "__processed__";
            const detail = !isProcessed ? MOCK_MEETING_DETAILS[meeting.id] : null;
            const participantCount = detail
              ? detail.participants.length
              : 1;
            const quoteCount = detail
              ? detail.problems.reduce(
                  (sum, p) => sum + p.quotes.length,
                  0
                )
              : 0;
            const linkedEpics = meeting.epicIds
              .map((eid) => MOCK_EPICS.find((e) => e.id === eid))
              .filter(Boolean);

            return (
              <div
                key={meeting.id}
                onClick={() =>
                  isProcessed
                    ? router.push("/meeting/new")
                    : router.push(`/meeting/${meeting.id}?from=artifacts`)
                }
                className="cursor-pointer rounded-xl border border-border bg-card transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                style={{ padding: 20 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-medium text-white"
                      style={{ background: meeting.color, fontSize: 12 }}
                    >
                      {isProcessed ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        meeting.participant
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground" style={{ fontSize: 15 }}>
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-3 text-muted" style={{ fontSize: 13, marginTop: 2 }}>
                        <span>{meeting.date}{meeting.time ? ` \u00b7 ${meeting.time}` : ""}</span>
                        {isProcessed && processedMeeting ? (
                          <>
                            <span>{processedMeeting.problemCount} problems</span>
                            <span>{processedMeeting.ticketCount} tickets</span>
                          </>
                        ) : (
                          <>
                            <span>{participantCount} participant{participantCount !== 1 ? "s" : ""}</span>
                            {quoteCount > 0 && (
                              <span>{quoteCount} quote{quoteCount !== 1 ? "s" : ""}</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-1 shrink-0 text-muted"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                {linkedEpics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {linkedEpics.map((epic) => (
                      <span
                        key={epic!.id}
                        className="rounded-full text-[11px] font-medium"
                        style={{
                          padding: "2px 8px",
                          background: "#E8F0E8",
                          color: "#3D5A3D",
                        }}
                      >
                        {epic!.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
