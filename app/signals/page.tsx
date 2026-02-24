"use client";

import { useRouter } from "next/navigation";
import { MOCK_SIGNALS, SIGNAL_STATUS_STYLES } from "@/lib/mock-data";
import type { Signal } from "@/lib/mock-data";

function SignalCard({ signal }: { signal: Signal }) {
  const router = useRouter();
  const status = SIGNAL_STATUS_STYLES[signal.status];
  const isProject = signal.status === "project";
  const showSuggestion =
    signal.status === "stable" && signal.strength >= 50;

  return (
    <div className="rounded-xl border border-border bg-card p-6 transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="shrink-0 rounded-full"
            style={{
              width: 10,
              height: 10,
              background: signal.color,
            }}
          />
          <span
            className="font-medium text-foreground"
            style={{ fontSize: 16 }}
          >
            {signal.title}
          </span>
          <span
            className="flex items-center gap-1 rounded-md font-medium"
            style={{
              fontSize: 12,
              padding: "2px 10px",
              background: status.bg,
              color: status.text,
            }}
          >
            {status.label}
            {isProject && " \u2713"}
          </span>
        </div>
        {signal.recentDelta && (
          <span className="text-muted" style={{ fontSize: 13 }}>
            {signal.recentDelta}
          </span>
        )}
      </div>

      {/* Metrics + tags row */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
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
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          {signal.meetingCount} of {signal.totalMeetings} meetings
        </div>
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
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
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {signal.quoteCount} quotes
        </div>
        <div className="flex items-center gap-1.5">
          {signal.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border text-muted"
              style={{ fontSize: 12, padding: "2px 8px" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Signal strength */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-muted" style={{ fontSize: 12 }}>
            Signal strength
          </span>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {signal.strength}%
          </span>
        </div>
        <div
          className="overflow-hidden rounded-full bg-border"
          style={{ height: 6 }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${signal.strength}%`,
              background: signal.color,
            }}
          />
        </div>
      </div>

      {/* Action row */}
      {isProject && signal.epicId && (
        <button
          onClick={() => router.push(`/epic/${signal.epicId}`)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: "#3D5A3D" }}
        >
          Open epic →
        </button>
      )}

      {showSuggestion && (
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#3D5A3D" }}
          >
            Create epic from pattern →
          </button>
          <span style={{ fontSize: 13, color: "#92400E" }}>
            ⚡ Enough signal — consider a dedicated project
          </span>
        </div>
      )}

      {signal.status === "new" && !showSuggestion && (
        <div className="text-muted" style={{ fontSize: 13 }}>
          Tracking — needs more data to confirm pattern
        </div>
      )}
    </div>
  );
}

export default function SignalsPage() {
  return (
    <div className="mx-auto" style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
        <span className="cursor-pointer hover:text-foreground">Home</span>
        {" › "}
        <span className="text-accent">Emerging signals</span>
      </div>

      {/* Header */}
      <h1
        className="mb-1.5 flex items-center gap-2 text-foreground"
        style={{
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: "-0.5px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        Signals
      </h1>
      <p className="mb-8 text-muted" style={{ fontSize: 15 }}>
        Recurring themes detected across your meetings. When a pattern has
        enough signal, turn it into an epic.
      </p>

      {/* Signal cards */}
      {MOCK_SIGNALS.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted">
            No patterns detected yet. Process a few meetings to see emerging
            themes.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {MOCK_SIGNALS.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}
