"use client";

import { useState, useRef } from "react";
import { useNav, RoadmapTicket } from "./nav-context";
import { TicketDetail, TicketContext, Quote } from "@/lib/types";
import TicketDetailView from "./ticket-detail";

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
  loading,
  failed,
  onDragStart,
  onClick,
}: {
  ticket: RoadmapTicket;
  loading: boolean;
  failed: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
}) {
  const ps = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Low;

  return (
    <div
      draggable={!loading}
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={onClick}
      className={`mb-3 cursor-grab rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:bg-[#F9F8F6] active:cursor-grabbing active:shadow-lg ${loading ? "opacity-60" : ""}`}
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
      {loading && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-accent" />
          <span className="text-[11px] text-muted">Generating ticket...</span>
        </div>
      )}
      {failed && !loading && (
        <div className="mt-2 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span className="text-[11px] text-red-700">Failed to load — click to retry</span>
        </div>
      )}
    </div>
  );
}

/** Convert a RoadmapTicket into the TicketContext shape that TicketDetailView expects */
function roadmapToContext(ticket: RoadmapTicket): TicketContext {
  const quotes: Quote[] = ticket.quotes && ticket.quotes.length > 0
    ? ticket.quotes
    : (ticket.problemQuotes || []).map((q) => ({
        text: q.text,
        summary: q.summary || "",
        speaker: q.speaker,
        timestamp: "",
      }));

  return {
    ticket: {
      id: ticket.id,
      title: ticket.title,
      priority: ticket.priority as "High" | "Med" | "Low",
      status: ticket.status || ({ now: "Now", next: "Next", later: "Later" }[ticket.column]),
      problemStatement: ticket.problemStatement || "",
      description: ticket.description || "",
      acceptanceCriteria: ticket.acceptanceCriteria || [],
      checkedAC: ticket.checkedAC,
      quotes,
    },
    problem: {
      id: ticket.id + "-problem",
      title: ticket.problemTitle,
      description: ticket.problemDescription,
      severity: "Med" as const,
      quotes,
    },
    problemIndex: 0,
    problemColor: ticket.problemColor,
    solution: { title: "", description: "" },
    meetingTitle: "",
    meetingDate: "",
  };
}

export default function Roadmap() {
  const { roadmap, setRoadmap, updateRoadmapTicket, setActiveTab, transcript, showToast } = useNav();
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<RoadmapTicket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);
  const [failedTicket, setFailedTicket] = useState<string | null>(null);
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

  const hasDetail = (ticket: RoadmapTicket) =>
    ticket.problemStatement !== undefined && ticket.description !== undefined && ticket.acceptanceCriteria !== undefined;

  const handleTicketClick = async (ticket: RoadmapTicket) => {
    // If detail already exists, open directly
    if (hasDetail(ticket)) {
      setSelectedTicket(ticket);
      return;
    }

    // Generate detail via API
    setLoadingTicket(ticket.id);
    setFailedTicket(null);
    try {
      const res = await fetch("/api/generate-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          problem: {
            id: ticket.id + "-problem",
            title: ticket.problemTitle,
            description: ticket.problemDescription,
            severity: "Med",
            quotes: (ticket.problemQuotes || []).map((q) => ({
              text: q.text,
              summary: q.summary || "",
              speaker: q.speaker,
              timestamp: "",
            })),
          },
          solution: { title: ticket.title, description: "" },
          workItem: { id: ticket.id, title: ticket.title, priority: ticket.priority },
        }),
      });

      if (!res.ok) throw new Error("Failed to generate ticket");

      const detail: TicketDetail = await res.json();
      const updates: Partial<RoadmapTicket> = {
        status: detail.status,
        problemStatement: detail.problemStatement,
        description: detail.description,
        acceptanceCriteria: detail.acceptanceCriteria,
        quotes: detail.quotes,
      };
      updateRoadmapTicket(ticket.id, updates);
      setSelectedTicket({ ...ticket, ...updates });
    } catch (err) {
      console.error(err);
      setFailedTicket(ticket.id);
    } finally {
      setLoadingTicket(null);
    }
  };

  const handleTicketUpdate = (updates: Partial<TicketDetail>) => {
    if (!selectedTicket) return;
    // Map TicketDetail fields back to RoadmapTicket fields
    const roadmapUpdates: Partial<RoadmapTicket> = {};
    if (updates.title !== undefined) roadmapUpdates.title = updates.title;
    if (updates.priority !== undefined) roadmapUpdates.priority = updates.priority;
    if (updates.status !== undefined) roadmapUpdates.status = updates.status;
    if (updates.problemStatement !== undefined) roadmapUpdates.problemStatement = updates.problemStatement;
    if (updates.description !== undefined) roadmapUpdates.description = updates.description;
    if (updates.acceptanceCriteria !== undefined) roadmapUpdates.acceptanceCriteria = updates.acceptanceCriteria;
    if (updates.checkedAC !== undefined) roadmapUpdates.checkedAC = updates.checkedAC;
    if (updates.quotes !== undefined) roadmapUpdates.quotes = updates.quotes;
    updateRoadmapTicket(selectedTicket.id, roadmapUpdates);
    setSelectedTicket((prev) => prev ? { ...prev, ...roadmapUpdates } : prev);
  };

  if (selectedTicket) {
    const ctx = roadmapToContext(selectedTicket);
    return (
      <TicketDetailView
        context={ctx}
        onBack={() => setSelectedTicket(null)}
        onUpdate={handleTicketUpdate}
        breadcrumbLabel="Roadmap"
      />
    );
  }

  if (roadmap.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-8">
          <h1
            className="text-foreground"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '48px',
              letterSpacing: '-4px',
              lineHeight: '74.4px',
              fontWeight: 300,
            }}
          >
            Roadmap
          </h1>
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
          <h1
            className="text-foreground"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '48px',
              letterSpacing: '-4px',
              lineHeight: '74.4px',
              fontWeight: 300,
            }}
          >
            Roadmap
          </h1>
          <p className="mt-1 text-sm text-muted">
            Drag tickets between columns to reprioritize.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => showToast("Linear export — coming soon")}
            className="rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background"
          >
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
                loading={loadingTicket === ticket.id}
                failed={failedTicket === ticket.id}
                onDragStart={handleDragStart}
                onClick={() => handleTicketClick(ticket)}
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
