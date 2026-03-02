"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { MOCK_MEETING_RECORDS, MOCK_MEETING_DETAILS } from "@/lib/mock-data";
import { MOCK_EPICS } from "@/lib/mock-epics";

export default function EvidencePage() {
  const router = useRouter();
  const { demoMode, result, solutions, deletedMeetings, deleteMeeting, clearSession, showToast } = useNav();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenuId) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);
  const mockMeetings = demoMode ? [] : MOCK_MEETING_RECORDS.filter((m) => !deletedMeetings.has(m.id));

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
                className="group cursor-pointer rounded-xl border border-border bg-card transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
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
                  <div className="relative shrink-0" ref={openMenuId === meeting.id ? menuRef : undefined}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === meeting.id ? null : meeting.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted/0 transition-colors hover:bg-background hover:text-muted group-hover:text-muted"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>
                    {openMenuId === meeting.id && (
                      <div
                        className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setConfirmDeleteId(meeting.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-600 transition-colors hover:bg-red-50"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          Delete meeting
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-medium text-foreground">
              Delete meeting?
            </h2>
            <p className="mb-6 text-sm text-muted">
              This will permanently remove this meeting from your library. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-background"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDeleteId === "__processed__") {
                    clearSession();
                  } else {
                    deleteMeeting(confirmDeleteId);
                  }
                  setConfirmDeleteId(null);
                  showToast("Meeting deleted");
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{ background: "#DC2626" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
