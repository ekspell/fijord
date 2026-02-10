"use client";

import { useState, useRef } from "react";
import { useNav, RoadmapTicket } from "./nav-context";

type ColumnKey = "now" | "next" | "later";

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  High: { bg: "#FEF2F2", text: "#B91C1C" },
  Med:  { bg: "#FDF6E3", text: "#B5860B" },
  Low:  { bg: "#EFF6FF", text: "#1D4ED8" },
};

const COLUMN_META: { key: ColumnKey; label: string; dotColor: string }[] = [
  { key: "now", label: "Now", dotColor: "#2C5F2D" },
  { key: "next", label: "Next", dotColor: "#B5860B" },
  { key: "later", label: "Later", dotColor: "#9C978E" },
];

function ColHeader({ label, dotColor, count }: { label: string; dotColor: string; count: number }) {
  return (
    <div className="mb-3 flex items-center justify-between px-1 py-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <span className="text-xs text-muted">
        {count} {count === 1 ? "ticket" : "tickets"}
      </span>
    </div>
  );
}

function TicketCard({
  ticket,
  onDragStart,
  onClick,
}: {
  ticket: RoadmapTicket;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
}) {
  const ps = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Low;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={onClick}
      className="mb-3 cursor-grab rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:bg-[#F9F8F6] active:cursor-grabbing active:shadow-lg"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-muted">{ticket.id}</span>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
          style={{ backgroundColor: ps.bg, color: ps.text }}
        >
          {ticket.priority}
        </span>
      </div>
      <h3 className="text-sm font-medium leading-snug text-foreground">
        {ticket.title}
      </h3>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: ticket.problemColor }} />
        <span className="text-[11px] font-medium" style={{ color: ticket.problemColor }}>
          {ticket.problemTitle}
        </span>
      </div>
    </div>
  );
}

function RoadmapTicketDetail({
  ticket,
  onBack,
}: {
  ticket: RoadmapTicket;
  onBack: () => void;
}) {
  const ps = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Low;
  const colLabel = { now: "Now", next: "Next", later: "Later" }[ticket.column];

  return (
    <div className="mx-auto max-w-[900px]">
      {/* Breadcrumb */}
      <div className="pb-2">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <button onClick={onBack} className="hover:text-foreground">
            Roadmap
          </button>
          <span className="text-muted/50">&rsaquo;</span>
          <span className="font-medium text-foreground">{ticket.id}</span>
        </nav>
      </div>

      <div className="flex gap-6 pt-6 pb-24">
        {/* Main content */}
        <div className="w-2/3">
          <div className="rounded-xl border border-border bg-card p-8">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-medium text-muted">{ticket.id}</span>
              <span
                className="rounded px-2 py-0.5 text-[11px] font-semibold uppercase"
                style={{ backgroundColor: ps.bg, color: ps.text }}
              >
                {ticket.priority}
              </span>
              <span className="rounded-full border border-border px-3 py-0.5 text-xs font-medium text-muted">
                {colLabel}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-2xl font-semibold text-foreground">
              {ticket.title}
            </h1>

            {/* Original Problem block */}
            <div
              className="mb-8 overflow-hidden rounded-lg border"
              style={{ borderColor: "#E8E6E1" }}
            >
              <div className="flex">
                <div className="w-1 shrink-0" style={{ backgroundColor: ticket.problemColor }} />
                <div className="flex-1 p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ticket.problemColor }} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: ticket.problemColor }}>
                      Original Problem
                    </p>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {ticket.problemTitle}
                  </h3>
                  {ticket.problemDescription && (
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      {ticket.problemDescription}
                    </p>
                  )}
                  {ticket.problemQuotes && ticket.problemQuotes.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      {ticket.problemQuotes.map((q, i) => (
                        <p key={i} className="mt-1 text-[12px] italic text-muted">
                          &ldquo;{q.text}&rdquo; &mdash; {q.speaker}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-1/3 flex flex-col gap-4">
          {/* Details */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
              Details
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Priority</span>
                <span className="text-sm font-medium text-foreground">{ticket.priority}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Column</span>
                <span className="text-sm font-medium text-foreground">{colLabel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Problem</span>
                <span
                  className="flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: ticket.problemColor }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ticket.problemColor }} />
                  {ticket.problemTitle.length > 20
                    ? ticket.problemTitle.slice(0, 20) + "..."
                    : ticket.problemTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Quotes */}
          {ticket.problemQuotes && ticket.problemQuotes.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
                User Quotes
              </h3>
              <div className="flex flex-col gap-3">
                {ticket.problemQuotes.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm italic leading-relaxed text-foreground">
                      &ldquo;{q.text}&rdquo;
                    </p>
                    <p className="mt-2 text-xs text-muted">{q.speaker}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back button */}
          <button
            onClick={onBack}
            className="w-full rounded-xl border border-border bg-card px-5 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            &larr; Back to roadmap
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Roadmap() {
  const { roadmap, setRoadmap, setActiveTab } = useNav();
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<RoadmapTicket | null>(null);
  const draggedId = useRef<string | null>(null);

  const columns = COLUMN_META.map((meta) => ({
    ...meta,
    tickets: roadmap.filter((t) => t.column === meta.key),
  }));

  const handleDragStart = (_e: React.DragEvent, id: string) => {
    draggedId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, colKey: ColumnKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== colKey) setDragOverCol(colKey);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, colKey: ColumnKey) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedId.current === null) return;

    const updated = roadmap.map((t) =>
      t.id === draggedId.current ? { ...t, column: colKey } : t
    );
    setRoadmap(updated);
    draggedId.current = null;
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    draggedId.current = null;
  };

  if (selectedTicket) {
    return (
      <RoadmapTicketDetail
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
      />
    );
  }

  if (roadmap.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-8">
          <h1 className="text-[32px] font-normal text-foreground">Roadmap</h1>
          <p className="mt-1 text-sm text-muted">
            Process a transcript and save tickets to see them here.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <p className="text-sm text-muted">No tickets on the roadmap yet.</p>
          <button
            onClick={() => setActiveTab("Discovery")}
            className="mt-4 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Process a transcript
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-normal text-foreground">Roadmap</h1>
          <p className="mt-1 text-sm text-muted">
            Drag tickets between columns to reprioritize.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background">
            Export to Linear
          </button>
          <button
            onClick={() => setActiveTab("Discovery")}
            className="rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent/90"
          >
            + New call
          </button>
        </div>
      </div>

      {/* 3-column kanban */}
      <div className="mb-8 grid grid-cols-3 gap-5">
        {columns.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.key)}
            onDragEnd={handleDragEnd}
            className={`rounded-xl p-2 transition-colors ${
              dragOverCol === col.key ? "bg-accent/5 ring-2 ring-accent/20" : ""
            }`}
            style={{ minHeight: 400 }}
          >
            <ColHeader label={col.label} dotColor={col.dotColor} count={col.tickets.length} />
            {col.tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onDragStart={handleDragStart}
                onClick={() => setSelectedTicket(ticket)}
              />
            ))}
            {col.tickets.length === 0 && (
              <div
                className={`flex items-center justify-center rounded-xl border border-dashed py-16 text-xs text-muted ${
                  dragOverCol === col.key ? "border-accent bg-accent/5" : "border-border"
                }`}
              >
                {dragOverCol === col.key ? "Drop here" : "No tickets yet"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <p className="text-[13px] text-muted">
          <strong className="text-foreground">{roadmap.length} tickets</strong> on the roadmap
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("Scope")}
            className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background"
          >
            View scope
          </button>
          <button
            onClick={() => setActiveTab("Discovery")}
            className="rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent/90"
          >
            + New call
          </button>
        </div>
      </div>
    </div>
  );
}
