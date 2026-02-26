"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { useAuth } from "@/app/auth-context";
import UpgradeModal from "@/app/components/upgrade-modal";
import {
  MOCK_EPICS,
  STATUS_STYLES,
  TICKET_STATUS_STYLES,
  PRIORITY_STYLES,
} from "@/lib/mock-epics";
import type { EpicTicket, EpicBrief, ExperienceStep } from "@/lib/mock-epics";
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

/* ─── Ticket Accordion Row ─── */

function TicketRow({ ticket }: { ticket: EpicTicket }) {
  const [open, setOpen] = useState(false);
  const statusStyle = TICKET_STATUS_STYLES[ticket.status];
  const priorityStyle = PRIORITY_STYLES[ticket.priority];
  const hasDetails = ticket.description || ticket.acceptanceCriteria || ticket.sourceQuote;

  return (
    <div
      className="rounded-lg border border-border transition-colors hover:border-border-hover"
    >
      {/* Header row */}
      <button
        onClick={() => hasDetails && setOpen(!open)}
        className={`flex w-full items-center gap-3 text-left transition-colors ${hasDetails ? "cursor-pointer" : "cursor-default"}`}
        style={{ padding: "12px 16px" }}
      >
        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform"
          style={{
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            color: hasDetails ? "#9B9B9B" : "#E8E6E1",
          }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>

        {/* Checkbox */}
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
      </button>

      {/* Expanded detail */}
      {open && hasDetails && (
        <div
          className="border-t border-border bg-background"
          style={{ padding: "16px 16px 16px 47px" }}
        >
          {/* Description */}
          {ticket.description && (
            <div style={{ marginBottom: ticket.acceptanceCriteria || ticket.sourceQuote ? 16 : 0 }}>
              <div
                className="font-medium text-foreground"
                style={{ fontSize: 12, marginBottom: 4 }}
              >
                Description
              </div>
              <p
                className="leading-relaxed text-muted"
                style={{ fontSize: 13 }}
              >
                {ticket.description}
              </p>
            </div>
          )}

          {/* Acceptance criteria */}
          {ticket.acceptanceCriteria && ticket.acceptanceCriteria.length > 0 && (
            <div style={{ marginBottom: ticket.sourceQuote ? 16 : 0 }}>
              <div
                className="font-medium text-foreground"
                style={{ fontSize: 12, marginBottom: 6 }}
              >
                Acceptance criteria
              </div>
              <div className="flex flex-col gap-1.5">
                {ticket.acceptanceCriteria.map((ac, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-muted"
                    style={{ fontSize: 13 }}
                  >
                    <div
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "#D0CEC9" }}
                    />
                    {ac}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source quote */}
          {ticket.sourceQuote && (
            <div>
              <div
                className="font-medium text-foreground"
                style={{ fontSize: 12, marginBottom: 6 }}
              >
                Source evidence
              </div>
              <div
                className="leading-relaxed text-muted"
                style={{
                  fontSize: 13,
                  paddingLeft: 12,
                  borderLeft: "3px solid #3D5A3D",
                }}
              >
                &ldquo;{ticket.sourceQuote}&rdquo;
              </div>
            </div>
          )}
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
      {tickets.map((ticket) => (
        <TicketRow key={ticket.id} ticket={ticket} />
      ))}
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

/* ─── Brief Tab Sub-Components ─── */

const EMOTION_COLORS: Record<string, { bg: string; text: string }> = {
  red: { bg: "#FEE2E2", text: "#DC2626" },
  yellow: { bg: "#FEF3C7", text: "#D97706" },
  green: { bg: "#E8F0E8", text: "#3D5A3D" },
};

function BriefHeader({
  brief,
  epicTitle,
  onSwitchTab,
  onRegenerate,
  onCopy,
}: {
  brief: EpicBrief;
  epicTitle: string;
  onSwitchTab: (tab: (typeof TABS)[number]) => void;
  onRegenerate: () => void;
  onCopy: () => void;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
        <span
          className="rounded-full font-medium"
          style={{
            fontSize: 11,
            padding: "3px 10px",
            background: "#E8F0E8",
            color: "#3D5A3D",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Design Brief
        </span>
        <span className="text-muted" style={{ fontSize: 12 }}>
          Auto-generated from transcript
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium text-foreground" style={{ fontSize: 22, marginBottom: 4 }}>
            {epicTitle}
          </h2>
          <p className="text-muted" style={{ fontSize: 13 }}>
            Generated from {brief.generatedFrom} · {brief.generatedDate}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
            </svg>
            Regenerate
          </button>
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy
          </button>
          <button
            onClick={() => onSwitchTab("Scope")}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent-green-light"
          >
            View tickets
          </button>
        </div>
      </div>
    </div>
  );
}

function PersonaCard({ persona }: { persona: EpicBrief["persona"] }) {
  return (
    <div
      className="rounded-xl"
      style={{
        background: "#2a2a2a",
        padding: 24,
        marginBottom: 32,
      }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <div
          className="flex shrink-0 items-center justify-center rounded-full font-medium"
          style={{
            width: 40,
            height: 40,
            background: "#4a4a4a",
            color: "#e0e0e0",
            fontSize: 14,
          }}
        >
          {persona.avatar}
        </div>
        <div>
          <div className="font-medium" style={{ fontSize: 15, color: "#FFFFFF" }}>
            {persona.title}
          </div>
          <div style={{ fontSize: 13, color: "#A0A0A0" }}>
            {persona.description}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 16 }}>
        <div className="rounded-lg" style={{ background: "#353535", padding: 14 }}>
          <div
            className="rounded font-medium"
            style={{
              fontSize: 10,
              padding: "2px 6px",
              background: "rgba(61,90,61,0.3)",
              color: "#7CB97C",
              display: "inline-block",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Goal
          </div>
          <div style={{ fontSize: 13, color: "#D0D0D0", lineHeight: 1.5 }}>
            {persona.goal}
          </div>
        </div>
        <div className="rounded-lg" style={{ background: "#353535", padding: 14 }}>
          <div
            className="rounded font-medium"
            style={{
              fontSize: 10,
              padding: "2px 6px",
              background: "rgba(220,38,38,0.2)",
              color: "#F87171",
              display: "inline-block",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Frustration
          </div>
          <div style={{ fontSize: 13, color: "#D0D0D0", lineHeight: 1.5 }}>
            {persona.frustration}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#A0A0A0",
          fontStyle: "italic",
          borderLeft: "3px solid #4a4a4a",
          paddingLeft: 12,
        }}
      >
        &ldquo;{persona.keyQuote}&rdquo;
      </div>
    </div>
  );
}

function ExperienceStepCard({ step, index }: { step: ExperienceStep; index: number }) {
  const colors = EMOTION_COLORS[step.emotionColor];
  return (
    <div className="rounded-lg border border-border" style={{ padding: 16 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{step.emoji}</span>
        <span
          className="font-medium"
          style={{ fontSize: 10, color: "#9B9B9B", textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          Step {index + 1}
        </span>
      </div>
      <div className="font-medium text-foreground" style={{ fontSize: 14, marginBottom: 4 }}>
        {step.title}
      </div>
      <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>
        {step.description}
      </p>
      <span
        className="rounded-full font-medium"
        style={{
          fontSize: 11,
          padding: "2px 8px",
          background: colors.bg,
          color: colors.text,
        }}
      >
        {step.emotionTag}
      </span>
    </div>
  );
}

function ExperienceSection({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle: string;
  steps: ExperienceStep[];
}) {
  return (
    <div>
      <h3
        className="font-medium text-foreground"
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        {title}
      </h3>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
        {subtitle}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {steps.map((step, i) => (
          <ExperienceStepCard key={i} step={step} index={i} />
        ))}
      </div>
    </div>
  );
}

function ArrowSeparator() {
  return (
    <div className="flex items-center justify-center" style={{ padding: "16px 0" }}>
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 32, height: 32, background: "#F5F4F0" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9B9B9B"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </div>
    </div>
  );
}

function DesignPrinciplesSection({ principles }: { principles: EpicBrief["designPrinciples"] }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h3
        className="font-medium text-foreground"
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 16,
        }}
      >
        Design Principles
      </h3>
      <div className="flex flex-col gap-5">
        {principles.map((p, i) => (
          <div key={i} className="flex gap-3">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-medium"
              style={{ background: "#E8F0E8", color: "#3D5A3D", fontSize: 12 }}
            >
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground" style={{ fontSize: 14, marginBottom: 2 }}>
                {p.title}
              </div>
              <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
                {p.description}
              </p>
              <div
                className="text-muted"
                style={{
                  fontSize: 13,
                  fontStyle: "italic",
                  borderLeft: "3px solid #3D5A3D",
                  paddingLeft: 10,
                }}
              >
                &ldquo;{p.quote}&rdquo;
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WireframeSketchSection({ wireframe }: { wireframe: EpicBrief["wireframeSketch"] }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h3
        className="font-medium text-foreground"
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        Wireframe Sketch
      </h3>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
        {wireframe.subtitle}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {wireframe.cards.map((card, i) => (
          <div
            key={i}
            className="rounded-lg border border-border"
            style={{ padding: 16 }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <div
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-medium"
                style={{ background: "#E8F0E8", color: "#3D5A3D", fontSize: 10 }}
              >
                {i + 1}
              </div>
              <div className="font-medium text-foreground" style={{ fontSize: 13 }}>
                {card.title}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {card.items.map((item, j) => (
                <div
                  key={j}
                  className="rounded-md"
                  style={{
                    fontSize: 12,
                    padding: "6px 10px",
                    background: "#F5F4F0",
                    border: "1px solid #E8E6E1",
                    color: "#6B6B6B",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpenQuestionsSection({ questions }: { questions: string[] }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h3
        className="font-medium text-foreground"
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 14,
        }}
      >
        Open Questions
      </h3>
      <div className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-medium"
              style={{ background: "#F3E8FF", color: "#7C3AED", fontSize: 12 }}
            >
              ?
            </div>
            <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5, paddingTop: 2 }}>
              {q}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="font-medium text-foreground" style={{ fontSize: 14 }}>
          {label}
        </h3>
        <button
          onClick={() => setEditing(!editing)}
          className="text-muted transition-colors hover:text-foreground"
          style={{ fontSize: 12 }}
        >
          {editing ? "Done" : "Edit"}
        </button>
      </div>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm leading-relaxed text-foreground focus:border-accent/40 focus:outline-none"
          rows={4}
        />
      ) : (
        <p className="leading-relaxed text-muted" style={{ fontSize: 14 }}>
          {value}
        </p>
      )}
    </div>
  );
}

function BriefFooter({
  brief,
  onSwitchTab,
  onExport,
}: {
  brief: EpicBrief;
  onSwitchTab: (tab: (typeof TABS)[number]) => void;
  onExport: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between rounded-lg"
      style={{
        marginTop: 32,
        padding: "14px 16px",
        background: "#F5F4F0",
        border: "1px solid #E8E6E1",
      }}
    >
      <span className="text-muted" style={{ fontSize: 13 }}>
        Generated from {brief.sourceCount} discovery call{brief.sourceCount !== 1 ? "s" : ""}
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-foreground"
          style={{ fontSize: 13 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
        <button
          onClick={() => onSwitchTab("Scope")}
          className="text-muted transition-colors hover:text-foreground"
          style={{ fontSize: 13 }}
        >
          View tickets
        </button>
        <button
          onClick={() => onSwitchTab("Roadmap")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: "#3D5A3D" }}
        >
          Go to roadmap &rarr;
        </button>
      </div>
    </div>
  );
}

/* ─── Brief Tab ─── */

function BriefTab({
  brief,
  epicTitle,
  onSwitchTab,
}: {
  brief: EpicBrief;
  epicTitle: string;
  onSwitchTab: (tab: (typeof TABS)[number]) => void;
}) {
  const { showToast } = useNav();
  const [problem, setProblem] = useState(brief.problem);
  const [goal, setGoal] = useState(brief.goal);
  const [approach, setApproach] = useState(brief.approach);

  const handleRegenerate = useCallback(() => {
    setProblem(brief.problem);
    setGoal(brief.goal);
    setApproach(brief.approach);
    showToast("Brief regenerated from latest evidence");
  }, [brief, showToast]);

  const handleCopy = useCallback(() => {
    const text = [
      `# ${epicTitle} — Design Brief`,
      "",
      `## Problem`,
      problem,
      "",
      `## Goal`,
      goal,
      "",
      `## Approach`,
      approach,
      "",
      `## Success Metrics`,
      ...brief.successMetrics.map((m) => `- ${m}`),
      "",
      `## Persona: ${brief.persona.title}`,
      brief.persona.description,
      `- Goal: ${brief.persona.goal}`,
      `- Frustration: ${brief.persona.frustration}`,
      `- Key quote: "${brief.persona.keyQuote}"`,
      "",
      `## Design Principles`,
      ...brief.designPrinciples.map((p, i) => `${i + 1}. **${p.title}**: ${p.description}\n   > "${p.quote}"`),
      "",
      `## Open Questions`,
      ...brief.openQuestions.map((q) => `- ${q}`),
      "",
      `---`,
      `Generated from ${brief.generatedFrom} · ${brief.generatedDate}`,
    ].join("\n");

    navigator.clipboard.writeText(text).then(
      () => showToast("Brief copied to clipboard"),
      () => showToast("Failed to copy — try again")
    );
  }, [epicTitle, problem, goal, approach, brief, showToast]);

  const handleExport = useCallback(() => {
    showToast("Export coming soon");
  }, [showToast]);

  return (
    <div>
      <BriefHeader
        brief={brief}
        epicTitle={epicTitle}
        onSwitchTab={onSwitchTab}
        onRegenerate={handleRegenerate}
        onCopy={handleCopy}
      />
      <PersonaCard persona={brief.persona} />

      {/* Editable summary fields */}
      <div
        className="rounded-xl border border-border"
        style={{ padding: 20, marginBottom: 32 }}
      >
        <div className="mb-2 flex items-center gap-2">
          <h3
            className="font-medium text-foreground"
            style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Summary
          </h3>
          <span className="text-muted" style={{ fontSize: 11 }}>
            Last updated {brief.generatedDate}
          </span>
        </div>
        <EditableField label="Problem" value={problem} onChange={setProblem} />
        <EditableField label="Goal" value={goal} onChange={setGoal} />
        <EditableField label="Approach" value={approach} onChange={setApproach} />
        <div>
          <h3 className="font-medium text-foreground" style={{ fontSize: 14, marginBottom: 8 }}>
            Success Metrics
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
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-muted" style={{ fontSize: 13 }}>{metric}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ExperienceSection
        title="Current Experience"
        subtitle={brief.currentExperience.subtitle}
        steps={brief.currentExperience.steps}
      />
      <ArrowSeparator />
      <ExperienceSection
        title="Desired Experience"
        subtitle={brief.desiredExperience.subtitle}
        steps={brief.desiredExperience.steps}
      />
      <DesignPrinciplesSection principles={brief.designPrinciples} />
      <WireframeSketchSection wireframe={brief.wireframeSketch} />
      <OpenQuestionsSection questions={brief.openQuestions} />
      <BriefFooter brief={brief} onSwitchTab={onSwitchTab} onExport={handleExport} />
    </div>
  );
}

/* ─── Epic Detail Page ─── */

export default function EpicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isPro } = useAuth();
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Discovery");
  const [showUpgrade, setShowUpgrade] = useState(false);

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
        {activeTab === "Brief" && !isPro ? (
          <div className="px-6 py-10 text-center">
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
        ) : activeTab === "Brief" && epic.brief ? (
          <BriefTab brief={epic.brief} epicTitle={epic.title} onSwitchTab={setActiveTab} />
        ) : (
          activeTab === "Brief" && (
            <div className="px-6 py-10 text-center text-sm text-muted">
              No brief generated yet. Add more discovery evidence to auto-generate a brief.
            </div>
          )
        )}
      </div>
      {showUpgrade && <UpgradeModal feature="Briefs" onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
