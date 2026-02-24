"use client";

import { useRouter } from "next/navigation";
import { MOCK_EPICS, STATUS_STYLES } from "@/lib/mock-epics";
import { MOCK_SIGNALS, SIGNAL_STATUS_STYLES } from "@/lib/mock-data";
import type { Signal } from "@/lib/mock-data";
import type { Epic } from "@/lib/mock-epics";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Quick Action Cards ─── */

function QuickActions() {
  const router = useRouter();

  return (
    <div className="mb-10 grid grid-cols-2 gap-4">
      <button
        onClick={() => router.push("/meeting/new")}
        className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "#E8F0E8" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3D5A3D"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
        </div>
        <div>
          <div className="font-medium text-foreground" style={{ fontSize: 15 }}>
            Process a new meeting
          </div>
          <div className="text-muted" style={{ fontSize: 13 }}>
            Paste a transcript or begin recording
          </div>
        </div>
      </button>

      <button
        className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "#EDE9FE" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7C3AED"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
        </div>
        <div>
          <div className="font-medium text-foreground" style={{ fontSize: 15 }}>
            Upload docs
          </div>
          <div className="text-muted" style={{ fontSize: 13 }}>
            4 signals detected across 6 meetings
          </div>
        </div>
      </button>
    </div>
  );
}

/* ─── Signal Card ─── */

function SignalCard({ signal }: { signal: Signal }) {
  const router = useRouter();
  const status = SIGNAL_STATUS_STYLES[signal.status];
  const showRecurringBanner =
    signal.status === "stable" && signal.strength >= 50;

  return (
    <div
      onClick={() => router.push(`/signals/${signal.id}`)}
      className="cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="rounded-full"
            style={{
              width: 8,
              height: 8,
              background: signal.color,
            }}
          />
          <span className="font-medium text-foreground" style={{ fontSize: 14 }}>
            {signal.title}
          </span>
        </div>
        <span
          className="rounded-md font-medium"
          style={{
            fontSize: 12,
            padding: "2px 8px",
            background: status.bg,
            color: status.text,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Mention count */}
      <div className="mb-3 text-muted" style={{ fontSize: 13 }}>
        Mentioned in {signal.meetingCount} of {signal.totalMeetings} meetings
        {" \u00b7 "}
        {signal.quoteCount} quotes
      </div>

      {/* Progress bar */}
      <div
        className="mb-3 overflow-hidden rounded-full bg-border"
        style={{ height: 4 }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${signal.strength}%`,
            background: signal.color,
          }}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
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

      {/* Recurring pattern banner */}
      {showRecurringBanner && (
        <div
          className="mt-3 rounded-lg px-3 py-2"
          style={{
            background: "#FEF3C7",
            color: "#92400E",
            fontSize: 13,
          }}
        >
          ⚡ Recurring pattern — consider creating a project
        </div>
      )}
    </div>
  );
}

/* ─── Epic Preview Card ─── */

function EpicPreviewCard({ epic }: { epic: Epic }) {
  const router = useRouter();
  const status = STATUS_STYLES[epic.status];
  const startDate = epic.dateLabel.match(/Started (.+?)( ·|$)/)?.[1] || "";
  const now = new Date();
  const start = new Date(`${startDate}, 2026`);
  const days = Math.max(
    1,
    Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div
      onClick={() => router.push(`/epic/${epic.id}`)}
      className="cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-foreground" style={{ fontSize: 14 }}>
          {epic.title}
        </span>
        <div
          className="flex items-center gap-1.5 rounded-md font-medium"
          style={{
            fontSize: 11,
            padding: "2px 8px",
            background: status.bg,
            color: status.text,
          }}
        >
          <span
            className="rounded-full"
            style={{
              width: 5,
              height: 5,
              background: "currentColor",
            }}
          />
          {status.label}
        </div>
      </div>

      {/* Description */}
      <p
        className="mb-4 leading-relaxed text-muted"
        style={{ fontSize: 13 }}
      >
        {epic.description}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className="rounded-full"
            style={{
              width: 22,
              height: 22,
              background: "#D0CEC9",
            }}
          />
          <span className="text-foreground" style={{ fontSize: 13 }}>
            {epic.owner.name}
          </span>
        </div>
        <span className="text-muted" style={{ fontSize: 12 }}>
          Duration: {days} days
        </span>
      </div>
    </div>
  );
}

/* ─── Section Header ─── */

function SectionHeader({
  title,
  href,
}: {
  title: string;
  href: string;
}) {
  const router = useRouter();

  return (
    <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
      <h2 className="font-medium text-foreground" style={{ fontSize: 18 }}>
        {title}
      </h2>
      <button
        onClick={() => router.push(href)}
        className="text-muted transition-colors hover:text-foreground"
        style={{ fontSize: 13 }}
      >
        View all →
      </button>
    </div>
  );
}

/* ─── Home Dashboard ─── */

export default function Home() {
  const greeting = getGreeting();

  return (
    <div className="mx-auto" style={{ maxWidth: 900 }}>
      {/* Greeting */}
      <h1
        className="mb-1 text-foreground"
        style={{
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: "-0.5px",
        }}
      >
        {greeting}, Kate
      </h1>
      <p className="mb-8 text-muted" style={{ fontSize: 15 }}>
        Here&apos;s what&apos;s happening across your discovery meetings.
      </p>

      {/* Quick actions */}
      <QuickActions />

      {/* Emerging signals */}
      <section className="mb-10">
        <SectionHeader title="Emerging signals" href="/signals" />
        {MOCK_SIGNALS.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted">
              No patterns detected yet. Process a few meetings to see emerging
              themes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {MOCK_SIGNALS.slice(0, 4).map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        )}
      </section>

      {/* Epics */}
      <section className="mb-10">
        <SectionHeader title="Epics" href="/epics" />
        {MOCK_EPICS.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
            <p className="text-sm text-muted">
              No projects yet. Create one manually or wait for signals to
              emerge.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {MOCK_EPICS.slice(0, 4).map((epic) => (
              <EpicPreviewCard key={epic.id} epic={epic} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
