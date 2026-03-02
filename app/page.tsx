"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { useAuth } from "@/app/auth-context";
import { MOCK_EPICS, STATUS_STYLES } from "@/lib/mock-epics";
import { MOCK_SIGNALS, MOCK_MEETING_RECORDS, SIGNAL_STATUS_STYLES } from "@/lib/mock-data";
import type { Signal } from "@/lib/mock-data";
import type { Epic } from "@/lib/mock-epics";
import Landing from "@/app/landing";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Quick Action Cards ─── */

function QuickActions() {
  const router = useRouter();
  const { showToast, demoMode } = useNav();

  return (
    <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={() => router.push("/meeting/new?from=home")}
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
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

      <div
        className="relative flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left opacity-60"
        title="Coming soon"
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
            Coming soon
          </div>
        </div>
        <span className="absolute top-2 right-2 rounded-full bg-border px-2 py-0.5 text-[10px] font-medium text-muted">Soon</span>
      </div>
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
      onClick={() => router.push(`/signals/${signal.id}?from=home`)}
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
      onClick={() => router.push(`/epic/${epic.id}?from=home`)}
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
  const { demoMode, isSignalConverted, result, solutions, deletedMeetings, deleteMeeting, clearSession, showToast, setActiveTab } = useNav();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

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

  if (loading) return null;
  if (!user) return <Landing onEnter={() => router.push("/signup")} />;
  const greeting = getGreeting();
  const userName = user?.name?.split(" ")[0] ?? "Kate";
  const signals = demoMode ? [] : MOCK_SIGNALS.filter((s) => !isSignalConverted(s.id));
  const epics = demoMode ? [] : MOCK_EPICS;
  const mockMeetings = demoMode ? [] : MOCK_MEETING_RECORDS.filter((m) => !deletedMeetings.has(m.id));
  const hasProcessed = !!(result && solutions.length > 0);

  return (
    <div className="mx-auto" style={{ maxWidth: 900, paddingTop: 36 }}>
      {/* Greeting */}
      <h1
        className="mb-1 text-foreground"
        style={{
          fontSize: 48,
          letterSpacing: "-1px",
          lineHeight: "74.4px",
          fontWeight: 300,
        }}
      >
        {greeting}, {userName}
      </h1>
      <p className="mb-8 text-muted" style={{ fontSize: 15 }}>
        Here&apos;s what&apos;s happening across your discovery meetings.
      </p>

      {/* Quick actions */}
      <QuickActions />

      {/* Recent meetings */}
      {(hasProcessed || mockMeetings.length > 0) && (
        <section className="mb-10">
          <SectionHeader title="Recent meetings" href="/artifacts" />
          <div className="flex flex-col gap-3">
            {/* Processed meeting from current session */}
            {hasProcessed && (
              <div
                onClick={() => { setActiveTab("Scope"); router.push("/meeting/new"); }}
                className="group cursor-pointer rounded-xl border border-border bg-card transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                style={{ padding: 16 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: "#3D5A3D" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground" style={{ fontSize: 14 }}>
                      {result!.meetingTitle}
                    </div>
                    <div className="flex items-center gap-3 text-muted" style={{ fontSize: 13 }}>
                      <span>{result!.date}</span>
                      <span>{result!.problems.length} problems</span>
                      <span>{solutions.reduce((s, sol) => s + sol.workItems.length, 0)} tickets</span>
                    </div>
                  </div>
                  <div className="relative shrink-0" ref={openMenuId === "__processed__" ? menuRef : undefined}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === "__processed__" ? null : "__processed__");
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted/0 transition-colors hover:bg-background hover:text-muted group-hover:text-muted"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                      </svg>
                    </button>
                    {openMenuId === "__processed__" && (
                      <div
                        className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setOpenMenuId(null);
                            setConfirmDeleteId("__processed__");
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
              </div>
            )}
            {/* Mock meetings */}
            {mockMeetings.slice(0, 4).map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => router.push(`/meeting/${meeting.id}?from=home`)}
                className="group cursor-pointer rounded-xl border border-border bg-card transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                style={{ padding: 16 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-medium text-white"
                    style={{ background: meeting.color, fontSize: 12 }}
                  >
                    {meeting.participant
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground" style={{ fontSize: 14 }}>
                      {meeting.title}
                    </div>
                    <div className="flex items-center gap-3 text-muted" style={{ fontSize: 13 }}>
                      <span>{meeting.date}{meeting.time ? ` · ${meeting.time}` : ""}</span>
                      <span>{meeting.participant}</span>
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
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Emerging signals */}
      <section className="mb-10">
        <SectionHeader title="Emerging signals" href="/signals" />
        {signals.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-border">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">No signals detected yet</p>
            <p className="text-sm text-muted">
              Signals will appear as patterns emerge across your meetings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {signals.slice(0, 4).map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        )}
      </section>

      {/* Epics */}
      <section className="mb-10">
        <SectionHeader title="Epics" href="/epics" />
        {epics.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-border">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">No epics yet</p>
            <p className="text-sm text-muted">
              Create your first epic or wait for a signal to grow.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {epics.slice(0, 4).map((epic) => (
              <EpicPreviewCard key={epic.id} epic={epic} />
            ))}
          </div>
        )}
      </section>

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
