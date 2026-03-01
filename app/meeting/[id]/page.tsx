"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { useAuth } from "@/app/auth-context";
import UpgradeModal from "@/app/components/upgrade-modal";
import {
  MOCK_MEETING_RECORDS,
  MOCK_MEETING_DETAILS,
  MOCK_SIGNALS,
} from "@/lib/mock-data";
import { MOCK_EPICS, STATUS_STYLES } from "@/lib/mock-epics";
import type { MeetingProblem, TranscriptLine } from "@/lib/mock-data";

const TABS = ["Discovery", "Scope", "Staging", "Brief"] as const;

/* ─── Assign Epic Modal ─── */

function AssignEpicModal({
  onClose,
  onAssign,
}: {
  onClose: () => void;
  onAssign: (epicTitle: string) => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-medium text-foreground">
          Assign to epic
        </h2>
        <div className="mb-6 flex flex-col gap-2">
          {MOCK_EPICS.map((epic) => {
            const status = STATUS_STYLES[epic.status];
            return (
              <button
                key={epic.id}
                onClick={() => onAssign(epic.title)}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-accent-green-light"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: "#E8F0E8" }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3D5A3D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {epic.title}
                  </div>
                  <div style={{ fontSize: 12, color: status.text }}>
                    {status.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-background"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirmation Modal ─── */

function DeleteModal({
  onClose,
  onDelete,
}: {
  onClose: () => void;
  onDelete: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-lg font-medium text-foreground">
          Delete meeting?
        </h2>
        <p className="mb-6 text-sm text-muted">
          This will permanently delete this meeting and all extracted data.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-background"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#DC2626" }}
          >
            Delete meeting
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Transcript Drawer ─── */

function TranscriptDrawer({
  title,
  transcript,
  onClose,
}: {
  title: string;
  transcript: TranscriptLine[];
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/30 transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-[101] flex h-screen flex-col border-l border-border bg-card shadow-[-4px_0_20px_rgba(0,0,0,0.1)]"
        style={{ width: 500 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b border-border"
          style={{ padding: "20px 24px" }}
        >
          <span className="font-medium" style={{ fontSize: 16 }}>
            Transcript
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-background transition-colors hover:bg-border"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: 24 }}>
          {transcript.map((line, i) =>
            line.isExtracted ? (
              <div
                key={i}
                className="rounded-r-lg"
                style={{
                  background: "#FEF9E7",
                  borderLeft: "3px solid #F6E05E",
                  padding: "12px 16px",
                  margin: "12px 0",
                }}
              >
                <div
                  className="font-medium uppercase"
                  style={{
                    fontSize: 11,
                    color: "#D97706",
                    letterSpacing: "0.5px",
                    marginBottom: 6,
                  }}
                >
                  Extracted quote
                </div>
                <div style={{ lineHeight: 1.7 }}>
                  <span className="font-medium text-foreground" style={{ marginRight: 8 }}>
                    {line.speaker}:
                  </span>
                  <span className="text-muted">
                    &ldquo;{line.text}&rdquo;
                  </span>
                  <span className="text-muted" style={{ fontSize: 12, marginLeft: 8 }}>
                    {line.timestamp}
                  </span>
                </div>
              </div>
            ) : (
              <div key={i} style={{ marginBottom: 16, lineHeight: 1.7 }}>
                <span className="font-medium text-foreground" style={{ marginRight: 8 }}>
                  {line.speaker}:
                </span>
                <span className="text-muted">{line.text}</span>
                <span className="text-muted" style={{ fontSize: 12, marginLeft: 8 }}>
                  {line.timestamp}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Problem Card ─── */

function ProblemCard({ problem }: { problem: MeetingProblem }) {
  return (
    <div
      className="rounded-xl border border-border bg-card"
      style={{ padding: 20 }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <span className="font-medium" style={{ fontSize: 15 }}>
          {problem.title}
        </span>
        <span
          className="shrink-0 rounded-md font-medium"
          style={{
            fontSize: 12,
            padding: "4px 8px",
            background: "#E8F0E8",
            color: "#3D5A3D",
          }}
        >
          {problem.ticketCount} {problem.ticketCount === 1 ? "ticket" : "tickets"}
        </span>
      </div>

      {/* Quotes */}
      {problem.quotes.map((quote, i) => (
        <div
          key={i}
          style={{
            marginBottom: i < problem.quotes.length - 1 ? 8 : 0,
          }}
        >
          <div
            className="leading-relaxed text-muted"
            style={{
              fontSize: 14,
              paddingLeft: 12,
              borderLeft: "3px solid #3D5A3D",
            }}
          >
            &ldquo;{quote.text}&rdquo;
            <div
              className="flex gap-2"
              style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}
            >
              <span className="font-medium" style={{ color: "#6B6B6B" }}>
                {quote.speaker}
              </span>
              <span>{quote.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Meeting Detail Page ─── */

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { showToast } = useNav();
  const { isPro } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Discovery");
  const [showTranscript, setShowTranscript] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const record = MOCK_MEETING_RECORDS.find((m) => m.id === id);
  const detail = id ? MOCK_MEETING_DETAILS[id] : undefined;

  if (!record) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h1 className="mb-2 text-xl font-medium text-foreground">
          Meeting not found
        </h1>
        <p className="mb-6 text-sm text-muted">
          The meeting you&apos;re looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: "#3D5A3D" }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Use detail data if available, fallback to record
  const title = detail?.title ?? record.title;
  const date = detail?.date ?? record.date;
  const duration = detail?.duration ?? "";
  const participants = detail?.participants ?? [
    { name: record.participant, color: record.color },
  ];
  const problems = detail?.problems ?? [];
  const transcript = detail?.transcript ?? [];

  // Derive total quote count from problems
  const totalQuotes = problems.reduce(
    (sum, p) => sum + p.quotes.length,
    0
  );

  // Find signals this meeting contributes to
  const contributingSignals = MOCK_SIGNALS.filter(
    (signal) =>
      signal.quotes?.some((q) => q.meetingId === id)
  ).map((signal) => ({
    ...signal,
    quotesFromThisMeeting:
      signal.quotes?.filter((q) => q.meetingId === id).length ?? 0,
  }));

  // Find epics this meeting feeds
  const feedingEpics = MOCK_EPICS.filter((epic) =>
    record.epicIds.includes(epic.id)
  );

  return (
    <div className="mx-auto" style={{ maxWidth: 900 }}>
      {/* Breadcrumb — only shown when navigating from a list/page */}
      {from && (
        <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
          <button
            onClick={() => router.push("/")}
            className="hover:text-foreground"
          >
            Home
          </button>
          {from !== "home" && (
            <>
              {" › "}
              <button
                onClick={() =>
                  router.push(
                    from === "signals"
                      ? "/signals"
                      : from === "epics"
                        ? "/epics"
                        : "/meeting/new"
                  )
                }
                className="hover:text-foreground"
              >
                {from === "signals"
                  ? "Signals"
                  : from === "epics"
                    ? "Epics"
                    : "Meetings"}
              </button>
            </>
          )}
          {" › "}
          <span className="text-accent">{title}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h1 className="font-medium" style={{ fontSize: 26, marginBottom: 8 }}>
              {title}
            </h1>
            <div
              className="flex items-center gap-4 text-muted"
              style={{ fontSize: 14 }}
            >
              <span>{date}</span>
              {duration && <span>{duration}</span>}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {transcript.length > 0 && (
              <button
                onClick={() => setShowTranscript(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-muted transition-colors hover:border-border-hover hover:text-foreground"
                style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500 }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                View transcript
              </button>
            )}
            <button
              onClick={() => showToast("Reprocessing coming soon")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-muted transition-colors hover:border-border-hover hover:text-foreground"
              style={{ padding: "10px 16px", fontSize: 13, fontWeight: 500 }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
              Reprocess
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-accent-red-light"
              style={{ width: 40, height: 40, color: "#DC2626" }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div
        className="flex items-center gap-3"
        style={{ marginBottom: 32 }}
      >
        <span className="text-muted" style={{ fontSize: 13 }}>
          Participants:
        </span>
        {participants.map((p) => (
          <div
            key={p.name}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card"
            style={{ padding: "6px 10px", fontSize: 13 }}
          >
            <div
              className="rounded-full"
              style={{ width: 20, height: 20, background: p.color }}
            />
            {p.name}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-xl border border-border bg-card p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "cursor-pointer text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Discovery" && (
        <>
          {/* Problems extracted */}
          <div style={{ marginBottom: 32 }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium" style={{ fontSize: 16 }}>
                Problems extracted
              </h2>
              <span className="text-muted" style={{ fontSize: 13 }}>
                {problems.length} {problems.length === 1 ? "problem" : "problems"} · {totalQuotes} {totalQuotes === 1 ? "quote" : "quotes"}
              </span>
            </div>

            {problems.length === 0 ? (
              <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
                <p className="text-sm text-muted">
                  No problems found in this meeting. Try reprocessing or check
                  the transcript.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {problems.map((problem) => (
                  <ProblemCard key={problem.id} problem={problem} />
                ))}
              </div>
            )}
          </div>

          {/* Connections */}
          <div style={{ marginBottom: 32 }}>
            <h2
              className="font-medium"
              style={{ fontSize: 16, marginBottom: 16 }}
            >
              Connections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contributing to signals */}
              <div
                className="rounded-xl border border-border bg-card"
                style={{ padding: 16 }}
              >
                <div
                  className="font-medium uppercase text-muted"
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.5px",
                    marginBottom: 12,
                  }}
                >
                  Contributing to signals
                </div>

                {contributingSignals.length === 0 ? (
                  <div
                    className="rounded-lg text-center text-muted"
                    style={{
                      fontSize: 13,
                      padding: "16px 12px",
                      background: "#FAF9F6",
                    }}
                  >
                    This meeting hasn&apos;t contributed to any signals yet.
                  </div>
                ) : (
                  contributingSignals.map((signal) => (
                    <button
                      key={signal.id}
                      onClick={() => router.push(`/signals/${signal.id}?from=meetings`)}
                      className="mb-2 flex w-full items-start gap-2.5 rounded-lg text-left transition-colors hover:bg-accent-green-light"
                      style={{ padding: "10px 12px", background: "#FAF9F6" }}
                    >
                      <span
                        className="mt-1.5 shrink-0 rounded-full"
                        style={{
                          width: 8,
                          height: 8,
                          background: signal.color,
                        }}
                      />
                      <div>
                        <div className="font-medium" style={{ fontSize: 13 }}>
                          {signal.title}
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {signal.quotesFromThisMeeting}{" "}
                          {signal.quotesFromThisMeeting === 1
                            ? "quote"
                            : "quotes"}{" "}
                          from this meeting
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Feeding epics */}
              <div
                className="rounded-xl border border-border bg-card"
                style={{ padding: 16 }}
              >
                <div
                  className="font-medium uppercase text-muted"
                  style={{
                    fontSize: 13,
                    letterSpacing: "0.5px",
                    marginBottom: 12,
                  }}
                >
                  Feeding epics
                </div>

                {feedingEpics.length === 0 ? (
                  <div
                    className="mb-2 rounded-lg text-center text-muted"
                    style={{
                      fontSize: 13,
                      padding: "16px 12px",
                      background: "#FAF9F6",
                    }}
                  >
                    Not assigned to any epics.
                  </div>
                ) : (
                  feedingEpics.map((epic) => {
                    const status = STATUS_STYLES[epic.status];
                    return (
                      <button
                        key={epic.id}
                        onClick={() => router.push(`/epic/${epic.id}?from=meetings`)}
                        className="mb-2 flex w-full items-center gap-2.5 rounded-lg text-left transition-colors hover:bg-accent-green-light"
                        style={{ padding: "10px 12px", background: "#FAF9F6" }}
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "#E8F0E8" }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#3D5A3D"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium" style={{ fontSize: 13 }}>
                            {epic.title}
                          </div>
                          <div style={{ fontSize: 12, color: status.text }}>
                            {status.label}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}

                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-muted transition-colors hover:border-accent hover:bg-accent-green-light hover:text-accent"
                  style={{ padding: 10, fontSize: 13 }}
                >
                  + Assign to another epic
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "Scope" && (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#E8F0E8" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-foreground">No solutions yet</p>
          <p className="mb-4 text-sm text-muted">
            Solutions haven&apos;t been generated for this meeting yet.
          </p>
          <button
            onClick={() => router.push("/meeting/new")}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#3D5A3D" }}
          >
            Reprocess
          </button>
        </div>
      )}

      {activeTab === "Staging" && (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#E8F0E8" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="12" y1="8" x2="12" y2="16" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-foreground">No staged tickets</p>
          <p className="mb-4 text-sm text-muted">
            No tickets have been staged for this meeting yet.
          </p>
          <button
            onClick={() => router.push("/meeting/new")}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#3D5A3D" }}
          >
            Reprocess
          </button>
        </div>
      )}

      {activeTab === "Brief" && !isPro ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#E8F0E8" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-foreground">Briefs is a Pro feature</p>
          <p className="mb-4 text-sm text-muted">Upgrade to auto-generate product briefs from your discovery evidence.</p>
          <button
            onClick={() => setShowUpgrade(true)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#3D5A3D" }}
          >
            Upgrade to Pro
          </button>
        </div>
      ) : activeTab === "Brief" && (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#E8F0E8" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-foreground">No brief generated</p>
          <p className="mb-4 text-sm text-muted">
            No brief generated yet.
          </p>
          <button
            onClick={() => router.push("/meeting/new")}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#3D5A3D" }}
          >
            Reprocess
          </button>
        </div>
      )}

      {/* Transcript drawer */}
      {showTranscript && (
        <TranscriptDrawer
          title={title}
          transcript={transcript}
          onClose={() => setShowTranscript(false)}
        />
      )}

      {/* Assign epic modal */}
      {showAssignModal && (
        <AssignEpicModal
          onClose={() => setShowAssignModal(false)}
          onAssign={(epicTitle) => {
            setShowAssignModal(false);
            showToast(`Assigned to "${epicTitle}"`);
          }}
        />
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            setShowDeleteModal(false);
            showToast("Meeting deleted");
            router.push("/");
          }}
        />
      )}

      {/* Upgrade modal */}
      {showUpgrade && <UpgradeModal feature="Briefs" onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
