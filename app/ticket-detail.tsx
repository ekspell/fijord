"use client";

import { useState } from "react";
import { TicketContext, TicketDetail, Quote } from "@/lib/types";
import { useNav } from "./nav-context";
import { EditableText, EditableTextarea, EditableList, EditablePriority } from "./components/editable-fields";
import TranscriptDrawer from "./transcript-drawer";

export default function TicketDetailView({
  context,
  onBack,
  onUpdate,
  breadcrumbLabel = "Scope",
}: {
  context: TicketContext;
  onBack: () => void;
  onUpdate?: (updates: Partial<TicketDetail>) => void;
  breadcrumbLabel?: string;
}) {
  const { ticket, problem, problemColor, meetingTitle, meetingDate } = context;
  const { transcript } = useNav();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerQuote, setDrawerQuote] = useState<Quote | null>(null);
  const [checkedAC, setCheckedAC] = useState<Set<number>>(
    new Set(ticket.checkedAC || [])
  );

  const toggleAC = (index: number) => {
    setCheckedAC((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      onUpdate?.({ checkedAC: Array.from(next) });
      return next;
    });
  };

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Breadcrumb */}
      <div className="pb-2">
        <nav className="flex items-center gap-2 text-sm">
          <button onClick={onBack} className="flex items-center gap-1.5 font-medium text-accent transition-colors hover:text-accent/80">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {breadcrumbLabel}
          </button>
          <span className="text-muted/50">&rsaquo;</span>
          <span className="font-medium text-foreground">{ticket.id}</span>
        </nav>
      </div>

      {/* Sub-breadcrumb — only shown when there's a meeting title */}
      {meetingTitle ? (
        <div className="pb-6">
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-muted">{meetingTitle}</span>
            <span className="text-muted/50">&rsaquo;</span>
            <span className="font-semibold text-foreground">{ticket.id}</span>
          </nav>
        </div>
      ) : (
        <div className="pb-4" />
      )}

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 pb-24 lg:flex-row">
        {/* Main content card */}
        <div className="w-full lg:w-2/3">
          <div className="rounded-xl border border-border bg-card p-8">
            {/* Header: ID, priority badge, status badge */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-medium text-muted">{ticket.id}</span>
              <EditablePriority
                value={ticket.priority}
                onChange={(val) => onUpdate?.({ priority: val as "High" | "Med" | "Low" })}
              />
              <span className="rounded-full border border-border px-3 py-0.5 text-xs font-medium text-muted">
                {ticket.status || "Ready for design"}
              </span>
            </div>

            {/* Title */}
            <div className="mb-6">
              <EditableText
                value={ticket.title}
                onChange={(val) => onUpdate?.({ title: val })}
                className="text-foreground"
                as="h1"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '32px',
                  letterSpacing: '-1px',
                  lineHeight: '37.2px',
                  fontWeight: 300,
                }}
              />
            </div>

            {/* Original Problem block */}
            <div
              className="mb-8 overflow-hidden rounded-lg border"
              style={{ borderColor: "#E8E6E1" }}
            >
              <div className="flex">
                <div className="w-1 shrink-0" style={{ backgroundColor: problemColor }} />
                <div className="flex-1 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: problemColor }} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: problemColor }}>
                      Original Problem
                    </p>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {problem.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {problem.description}
                  </p>
                  {problem.quotes.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      {problem.quotes.slice(0, 2).map((q, i) => (
                        <p key={i} className="mt-1 text-[12px] italic text-muted">
                          &ldquo;{q.text}&rdquo; &mdash; {q.speaker}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Problem Statement */}
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: problemColor }}>
                Problem Statement
              </h2>
              <EditableTextarea
                value={ticket.problemStatement}
                onChange={(val) => onUpdate?.({ problemStatement: val })}
                className="text-sm leading-relaxed text-foreground"
              />
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: problemColor }}>
                Description
              </h2>
              <EditableTextarea
                value={ticket.description}
                onChange={(val) => onUpdate?.({ description: val })}
                className="text-sm leading-relaxed text-foreground"
              />
            </div>

            {/* Acceptance Criteria */}
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: problemColor }}>
                Acceptance Criteria
              </h2>
              <EditableList
                items={ticket.acceptanceCriteria}
                onChange={(items) => onUpdate?.({ acceptanceCriteria: items })}
                checkedItems={checkedAC}
                onToggleCheck={toggleAC}
              />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          {/* User Quotes */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                User Quotes
              </h3>
              <span className="text-xs font-medium text-muted">
                {ticket.quotes.length} QUOTE{ticket.quotes.length !== 1 ? "S" : ""}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {ticket.quotes.map((quote, i) => (
                <div
                  key={i}
                  onClick={() => { setDrawerQuote(quote); setDrawerOpen(true); }}
                  className="cursor-pointer rounded-lg border border-border bg-background p-4 transition-colors hover:bg-[#F9F8F6]"
                >
                  <p className="text-sm italic leading-relaxed text-foreground">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {quote.speaker} &middot; {quote.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
              Details
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Priority</span>
                <EditablePriority
                  value={ticket.priority}
                  onChange={(val) => onUpdate?.({ priority: val as "High" | "Med" | "Low" })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Problem</span>
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80"
                  style={{ color: problemColor }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: problemColor }} />
                  {problem.title.length > 20
                    ? problem.title.slice(0, 20) + "..."
                    : problem.title}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Created</span>
                <span className="text-sm font-medium text-foreground">
                  {today}
                </span>
              </div>
            </div>
          </div>

          {/* Source Transcript */}
          {transcript && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
                Source Transcript
              </h3>
              <button
                onClick={() => { setDrawerQuote(null); setDrawerOpen(true); }}
                className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-background"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="shrink-0"
                  style={{ color: problemColor }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                  />
                </svg>
                <span className="text-sm font-medium text-foreground">
                  {meetingTitle || "Meeting transcript"} {meetingDate && <>&mdash; {meetingDate}</>}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transcript drawer */}
      {drawerOpen && transcript && (
        <TranscriptDrawer
          transcript={transcript}
          highlightQuote={drawerQuote}
          meetingTitle={meetingTitle || "Meeting"}
          meetingDate={meetingDate || ""}
          onClose={() => { setDrawerOpen(false); setDrawerQuote(null); }}
        />
      )}
    </div>
  );
}
