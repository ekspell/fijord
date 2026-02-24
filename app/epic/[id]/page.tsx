"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MOCK_EPICS,
  STATUS_STYLES,
  TICKET_STATUS_STYLES,
  PRIORITY_STYLES,
} from "@/lib/mock-epics";
import type { EpicTicket } from "@/lib/mock-epics";
import {
  MOCK_SIGNALS,
  MOCK_MEETING_RECORDS,
  MOCK_MEETING_DETAILS,
} from "@/lib/mock-data";

const TABS = ["Discovery", "Scope", "Roadmap", "Brief"] as const;

/* ─── Discovery Tab ─── */

function DiscoveryTab({ epicId }: { epicId: string }) {
  const router = useRouter();

  // Find signals linked to this epic
  const linkedSignals = MOCK_SIGNALS.filter((s) => s.epicId === epicId);

  // Find meetings linked to this epic
  const linkedMeetings = MOCK_MEETING_RECORDS.filter((m) =>
    m.epicIds.includes(epicId)
  );

  // Gather all quotes from linked signals for this epic's meetings
  const meetingQuotes: Record<
    string,
    { text: string; speaker: string; timestamp: string }[]
  > = {};
  for (const signal of linkedSignals) {
    for (const quote of signal.quotes ?? []) {
      const meetingId = quote.meetingId;
      if (!meetingQuotes[meetingId]) meetingQuotes[meetingId] = [];
      meetingQuotes[meetingId].push({
        text: quote.text,
        speaker: quote.speaker,
        timestamp: quote.timestamp,
      });
    }
  }

  return (
    <div>
      {/* Linked signals */}
      {linkedSignals.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3
            className="font-medium text-foreground"
            style={{ fontSize: 14, marginBottom: 12 }}
          >
            Linked signals
          </h3>
          <div className="flex flex-col gap-2">
            {linkedSignals.map((signal) => (
              <button
                key={signal.id}
                onClick={() => router.push(`/signals/${signal.id}`)}
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-accent-green-light"
              >
                <span
                  className="shrink-0 rounded-full"
                  style={{
                    width: 8,
                    height: 8,
                    background: signal.color,
                  }}
                />
                <span className="flex-1 font-medium" style={{ fontSize: 13 }}>
                  {signal.title}
                </span>
                <span className="text-muted" style={{ fontSize: 12 }}>
                  {signal.quoteCount} quotes · {signal.meetingCount} meetings
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Linked meetings with quotes */}
      <h3
        className="font-medium text-foreground"
        style={{ fontSize: 14, marginBottom: 12 }}
      >
        Meeting evidence
      </h3>
      {linkedMeetings.length === 0 ? (
        <div
          className="rounded-lg border border-border px-6 py-10 text-center text-sm text-muted"
        >
          No meetings linked to this epic yet. Process a transcript to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {linkedMeetings.map((meeting) => {
            const detail = MOCK_MEETING_DETAILS[meeting.id];
            const quotes = meetingQuotes[meeting.id] ?? [];
            return (
              <div
                key={meeting.id}
                className="rounded-lg border border-border"
              >
                <button
                  onClick={() => router.push(`/meeting/${meeting.id}`)}
                  className="flex w-full items-center gap-2.5 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent-green-light"
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
                    className="shrink-0 text-muted"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span className="flex-1 font-medium" style={{ fontSize: 13 }}>
                    {detail?.title ?? meeting.title}
                  </span>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    {meeting.date}
                  </span>
                  {quotes.length > 0 && (
                    <span
                      className="rounded text-muted"
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        background: "#FAF9F6",
                      }}
                    >
                      {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
                    </span>
                  )}
                </button>
                {quotes.length > 0 && (
                  <div className="bg-card" style={{ padding: "12px 16px" }}>
                    {quotes.slice(0, 3).map((q, i) => (
                      <div
                        key={i}
                        className="leading-relaxed text-muted"
                        style={{
                          fontSize: 13,
                          paddingLeft: 12,
                          borderLeft: "3px solid #3D5A3D",
                          marginBottom: i < Math.min(quotes.length, 3) - 1 ? 10 : 0,
                        }}
                      >
                        &ldquo;{q.text}&rdquo;
                        <div style={{ fontSize: 11, marginTop: 2 }}>
                          {q.speaker} · {q.timestamp}
                        </div>
                      </div>
                    ))}
                    {quotes.length > 3 && (
                      <div
                        className="text-muted"
                        style={{ fontSize: 12, marginTop: 8 }}
                      >
                        + {quotes.length - 3} more quotes
                      </div>
                    )}
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

/* ─── Scope Tab ─── */

function ScopeTab({ tickets }: { tickets: EpicTicket[] }) {
  if (tickets.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted">
        No tickets yet. Run discovery first to populate the scope.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tickets.map((ticket) => {
        const statusStyle = TICKET_STATUS_STYLES[ticket.status];
        const priorityStyle = PRIORITY_STYLES[ticket.priority];
        return (
          <div
            key={ticket.id}
            className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-background"
          >
            {/* Checkbox-style indicator */}
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded border"
              style={{
                borderColor:
                  ticket.status === "shipped" ? "#3D5A3D" : "#E8E6E1",
                background:
                  ticket.status === "shipped" ? "#3D5A3D" : "transparent",
              }}
            >
              {ticket.status === "shipped" && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>

            {/* Title */}
            <span
              className={`flex-1 ${ticket.status === "shipped" ? "text-muted line-through" : "text-foreground"}`}
              style={{ fontSize: 14 }}
            >
              {ticket.title}
            </span>

            {/* Priority */}
            <span
              className="shrink-0 rounded font-medium"
              style={{
                fontSize: 11,
                padding: "2px 6px",
                background: priorityStyle.bg,
                color: priorityStyle.text,
              }}
            >
              {priorityStyle.label}
            </span>

            {/* Status */}
            <span
              className="shrink-0 rounded font-medium"
              style={{
                fontSize: 11,
                padding: "2px 6px",
                background: statusStyle.bg,
                color: statusStyle.text,
              }}
            >
              {statusStyle.label}
            </span>

            {/* Assignee */}
            {ticket.assignee && (
              <span className="shrink-0 text-muted" style={{ fontSize: 12 }}>
                {ticket.assignee}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Roadmap Tab ─── */

function RoadmapTab({ tickets }: { tickets: EpicTicket[] }) {
  const lanes: { key: "now" | "next" | "later"; label: string }[] = [
    { key: "now", label: "Now" },
    { key: "next", label: "Next" },
    { key: "later", label: "Later" },
  ];

  if (tickets.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted">
        No tickets to display. Save tickets from Scope to see them here.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {lanes.map((lane) => {
        const laneTickets = tickets.filter((t) => t.lane === lane.key);
        return (
          <div key={lane.key}>
            <div
              className="mb-3 flex items-center justify-between"
            >
              <span
                className="font-medium text-foreground"
                style={{ fontSize: 14 }}
              >
                {lane.label}
              </span>
              <span
                className="rounded-full bg-border text-muted"
                style={{ fontSize: 11, padding: "1px 8px" }}
              >
                {laneTickets.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {laneTickets.map((ticket) => {
                const statusStyle = TICKET_STATUS_STYLES[ticket.status];
                return (
                  <div
                    key={ticket.id}
                    className="rounded-lg border border-border bg-card transition-colors hover:border-border-hover"
                    style={{ padding: 12 }}
                  >
                    <div
                      className="mb-2 font-medium text-foreground"
                      style={{ fontSize: 13 }}
                    >
                      {ticket.title}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded font-medium"
                        style={{
                          fontSize: 10,
                          padding: "1px 5px",
                          background: statusStyle.bg,
                          color: statusStyle.text,
                        }}
                      >
                        {statusStyle.label}
                      </span>
                      {ticket.assignee && (
                        <span
                          className="text-muted"
                          style={{ fontSize: 11 }}
                        >
                          {ticket.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {laneTickets.length === 0 && (
                <div
                  className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-muted"
                  style={{ fontSize: 12 }}
                >
                  No tickets
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Brief Tab ─── */

function BriefTab({
  brief,
  epicTitle,
}: {
  brief: NonNullable<(typeof MOCK_EPICS)[number]["brief"]>;
  epicTitle: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3
          className="font-medium text-foreground"
          style={{ fontSize: 14, marginBottom: 8 }}
        >
          Problem
        </h3>
        <p
          className="leading-relaxed text-muted"
          style={{ fontSize: 14 }}
        >
          {brief.problem}
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3
          className="font-medium text-foreground"
          style={{ fontSize: 14, marginBottom: 8 }}
        >
          Goal
        </h3>
        <p
          className="leading-relaxed text-muted"
          style={{ fontSize: 14 }}
        >
          {brief.goal}
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3
          className="font-medium text-foreground"
          style={{ fontSize: 14, marginBottom: 8 }}
        >
          Approach
        </h3>
        <p
          className="leading-relaxed text-muted"
          style={{ fontSize: 14 }}
        >
          {brief.approach}
        </p>
      </div>

      <div>
        <h3
          className="font-medium text-foreground"
          style={{ fontSize: 14, marginBottom: 8 }}
        >
          Success metrics
        </h3>
        <div className="flex flex-col gap-2">
          {brief.successMetrics.map((metric, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-border px-4 py-2.5"
            >
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                style={{ background: "#E8F0E8" }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3D5A3D"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-muted" style={{ fontSize: 13 }}>
                {metric}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Epic Detail Page ─── */

export default function EpicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Discovery");

  const epic = MOCK_EPICS.find((e) => e.id === id);

  if (!epic) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h1 className="mb-2 text-xl font-medium text-foreground">
          Epic not found
        </h1>
        <p className="mb-6 text-sm text-muted">
          The epic you&apos;re looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/epics")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: "#3D5A3D" }}
        >
          Back to Epics
        </button>
      </div>
    );
  }

  const status = STATUS_STYLES[epic.status];
  const progressPercent =
    epic.progress.total > 0
      ? Math.round((epic.progress.shipped / epic.progress.total) * 100)
      : 0;
  const tickets = epic.tickets ?? [];

  return (
    <div className="mx-auto" style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
        <button
          onClick={() => router.push("/")}
          className="hover:text-foreground"
        >
          Home
        </button>
        {" › "}
        <button
          onClick={() => router.push("/epics")}
          className="hover:text-foreground"
        >
          Epics
        </button>
        {" › "}
        <span className="text-accent">{epic.title}</span>
      </div>

      {/* Header */}
      <div className="mb-1.5 flex items-center gap-3">
        <h1 className="font-medium" style={{ fontSize: 26 }}>
          {epic.title}
        </h1>
        <div
          className="flex items-center gap-1.5 rounded-md font-medium"
          style={{
            fontSize: 12,
            padding: "4px 10px",
            background: status.bg,
            color: status.text,
          }}
        >
          <span
            className="rounded-full"
            style={{
              width: 6,
              height: 6,
              background: "currentColor",
            }}
          />
          {status.label}
        </div>
      </div>
      <p className="mb-2 text-muted" style={{ fontSize: 15 }}>
        {epic.description}
      </p>

      {/* Meta row */}
      <div className="mb-6 flex items-center gap-4">
        <div
          className="flex items-center gap-1.5 text-muted"
          style={{ fontSize: 13 }}
        >
          <span className="font-medium text-foreground">
            {epic.metrics.tickets}
          </span>{" "}
          tickets
        </div>
        <div
          className="flex items-center gap-1.5 text-muted"
          style={{ fontSize: 13 }}
        >
          <span className="font-medium text-foreground">
            {epic.metrics.meetings}
          </span>{" "}
          meetings
        </div>
        <div
          className="flex items-center gap-1.5 text-muted"
          style={{ fontSize: 13 }}
        >
          <span className="font-medium text-foreground">
            {epic.metrics.quotes}
          </span>{" "}
          quotes
        </div>
        <span className="text-muted" style={{ fontSize: 12 }}>
          · {epic.owner.name} · {epic.dateLabel}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div
          className="mb-1.5 overflow-hidden rounded-full bg-border"
          style={{ height: 6 }}
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-muted" style={{ fontSize: 12 }}>
          {epic.progressLabel}
        </div>
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
      <div className="rounded-xl border border-border bg-card p-6">
        {activeTab === "Discovery" && <DiscoveryTab epicId={epic.id} />}
        {activeTab === "Scope" && <ScopeTab tickets={tickets} />}
        {activeTab === "Roadmap" && <RoadmapTab tickets={tickets} />}
        {activeTab === "Brief" && epic.brief ? (
          <BriefTab brief={epic.brief} epicTitle={epic.title} />
        ) : (
          activeTab === "Brief" && (
            <div className="px-6 py-10 text-center text-sm text-muted">
              No brief generated yet. Add more discovery evidence to auto-generate a brief.
            </div>
          )
        )}
      </div>
    </div>
  );
}
