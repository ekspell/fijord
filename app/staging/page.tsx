"use client";

import { Suspense, useRef, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNav, RoadmapTicket } from "@/app/nav-context";
import {
  MOCK_EPICS,
  STATUS_STYLES,
  TICKET_STATUS_STYLES,
  PRIORITY_STYLES,
} from "@/lib/mock-epics";
import type { EpicTicket, RoadmapLane, TicketPriority, TicketStatus } from "@/lib/mock-epics";
import TicketDetailView from "@/app/ticket-detail";
import type { TicketContext, Quote } from "@/lib/types";

type StagingTicket = EpicTicket & { epicId: string; epicTitle: string; epicStatus: "on-track" | "at-risk" | "blocked"; problemColor?: string };

const ROADMAP_PRIORITY_MAP: Record<string, TicketPriority> = {
  High: "high",
  Med: "medium",
  Low: "low",
};

const ROADMAP_LANE_TO_STATUS: Record<RoadmapLane, TicketStatus> = {
  now: "planned",
  next: "in-progress",
  later: "shipped",
};

type ColumnKey = RoadmapLane;

const COLUMN_META: { key: ColumnKey; label: string; dotColor: string; emptyHint: string }[] = [
  { key: "now", label: "To do", dotColor: "#2C5F2D", emptyHint: "Drag tickets here to plan" },
  { key: "next", label: "In progress", dotColor: "#B5860B", emptyHint: "Work that's actively being built" },
  { key: "later", label: "Done", dotColor: "#9C978E", emptyHint: "Shipped work \u2014 nice \uD83C\uDF89" },
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

function StagingCard({
  ticket,
  onDragStart,
  onClick,
}: {
  ticket: StagingTicket;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
}) {
  const ps = PRIORITY_STYLES[ticket.priority];
  const isFromMeeting = ticket.epicId === "meeting-staging";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={onClick}
      className="group/card relative mb-3 cursor-grab rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:bg-[#F9F8F6] active:cursor-grabbing active:shadow-lg"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-muted">{ticket.id}</span>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
          style={{ backgroundColor: ps.bg, color: ps.text }}
        >
          {ps.label}
        </span>
      </div>
      <h3 className="text-sm font-medium leading-snug text-foreground">
        {ticket.title}
      </h3>
      {isFromMeeting ? (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: ticket.problemColor || "#3D5A3D" }} />
          <span className="text-[11px] font-medium" style={{ color: ticket.problemColor || "#3D5A3D" }}>
            {ticket.epicTitle}
          </span>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <span
            className="rounded-full text-[10px] font-medium"
            style={{
              padding: "2px 8px",
              background: STATUS_STYLES[ticket.epicStatus].bg,
              color: STATUS_STYLES[ticket.epicStatus].text,
            }}
          >
            {ticket.epicTitle}
          </span>
          <span
            className="rounded text-[10px] font-medium"
            style={{
              padding: "1px 5px",
              background: TICKET_STATUS_STYLES[ticket.status].bg,
              color: TICKET_STATUS_STYLES[ticket.status].text,
            }}
          >
            {TICKET_STATUS_STYLES[ticket.status].label}
          </span>
        </div>
      )}
    </div>
  );
}

export default function StagingPage() {
  return (
    <Suspense>
      <StagingContent />
    </Suspense>
  );
}

function stagingToContext(ticket: StagingTicket, sourceRoadmap?: RoadmapTicket): TicketContext {
  const quotes: Quote[] = sourceRoadmap?.quotes && sourceRoadmap.quotes.length > 0
    ? sourceRoadmap.quotes
    : sourceRoadmap?.problemQuotes
      ? sourceRoadmap.problemQuotes.map((q) => ({ text: q.text, summary: q.summary || "", speaker: q.speaker, timestamp: "" }))
      : ticket.sourceQuote
        ? [{ text: ticket.sourceQuote, summary: "", speaker: "", timestamp: "" }]
        : [];

  const priorityMap: Record<string, "High" | "Med" | "Low"> = { high: "High", medium: "Med", low: "Low" };

  return {
    ticket: {
      id: ticket.id,
      title: ticket.title,
      priority: priorityMap[ticket.priority] || "Med",
      status: ticket.status || "planned",
      problemStatement: sourceRoadmap?.problemStatement || "",
      description: ticket.description || "",
      acceptanceCriteria: ticket.acceptanceCriteria || [],
      checkedAC: sourceRoadmap?.checkedAC,
      quotes,
      editedAt: sourceRoadmap?.editedAt,
    },
    problem: {
      id: ticket.id + "-problem",
      title: sourceRoadmap?.problemTitle || ticket.epicTitle,
      description: sourceRoadmap?.problemDescription || "",
      severity: "Med" as const,
      quotes,
    },
    problemIndex: 0,
    problemColor: sourceRoadmap?.problemColor || "#3D5A3D",
    solution: { title: "", description: "" },
    meetingTitle: "",
    meetingDate: "",
  };
}

function StagingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const { demoMode, roadmap, stagingOverrides, setStagingLane, updateRoadmapTicket } = useNav();
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<StagingTicket | null>(null);
  const draggedId = useRef<string | null>(null);

  const epics = demoMode ? [] : MOCK_EPICS;

  // Flatten all tickets across all epics + roadmap, applying lane overrides
  const allTickets = useMemo(() => {
    const tickets: StagingTicket[] = [];
    for (const epic of epics) {
      for (const ticket of epic.tickets ?? []) {
        tickets.push({
          ...ticket,
          lane: stagingOverrides[ticket.id] ?? ticket.lane,
          epicId: epic.id,
          epicTitle: epic.title,
          epicStatus: epic.status,
        });
      }
    }
    // Include tickets saved from meeting processing
    for (const rt of roadmap) {
      const lane = stagingOverrides[rt.id] ?? rt.column;
      tickets.push({
        id: rt.id,
        title: rt.title,
        priority: ROADMAP_PRIORITY_MAP[rt.priority] || "low",
        status: ROADMAP_LANE_TO_STATUS[lane] || "planned",
        lane,
        description: rt.description,
        acceptanceCriteria: rt.acceptanceCriteria,
        epicId: "meeting-staging",
        epicTitle: rt.problemTitle,
        epicStatus: "on-track",
        problemColor: rt.problemColor,
      });
    }
    return tickets;
  }, [epics, roadmap, stagingOverrides]);

  const columns = COLUMN_META.map((meta) => ({
    ...meta,
    tickets: allTickets.filter((t) => t.lane === meta.key),
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
    setStagingLane(draggedId.current, colKey);
    draggedId.current = null;
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    draggedId.current = null;
  };

  // Ticket detail view
  if (selectedTicket) {
    const sourceRoadmap = roadmap.find((r) => r.id === selectedTicket.id);
    const ctx = stagingToContext(selectedTicket, sourceRoadmap);
    const handleUpdate = (updates: Partial<import("@/lib/types").TicketDetail>) => {
      if (!sourceRoadmap) return;
      const roadmapUpdates: Partial<RoadmapTicket> = {};
      if (updates.title !== undefined) roadmapUpdates.title = updates.title;
      if (updates.priority !== undefined) roadmapUpdates.priority = updates.priority;
      if (updates.description !== undefined) roadmapUpdates.description = updates.description;
      if (updates.problemStatement !== undefined) roadmapUpdates.problemStatement = updates.problemStatement;
      if (updates.acceptanceCriteria !== undefined) roadmapUpdates.acceptanceCriteria = updates.acceptanceCriteria;
      if (updates.checkedAC !== undefined) roadmapUpdates.checkedAC = updates.checkedAC;
      if (updates.quotes !== undefined) roadmapUpdates.quotes = updates.quotes;
      if (updates.editedAt !== undefined) roadmapUpdates.editedAt = updates.editedAt;
      updateRoadmapTicket(sourceRoadmap.id, roadmapUpdates);
    };

    return (
      <div className="mx-auto max-w-[900px]" style={{ paddingTop: 36 }}>
        <TicketDetailView
          context={ctx}
          onBack={() => setSelectedTicket(null)}
          onUpdate={sourceRoadmap ? handleUpdate : undefined}
          breadcrumbLabel="Staging"
        />
      </div>
    );
  }

  if (allTickets.length === 0) {
    return (
      <div className="mx-auto max-w-[900px]" style={{ paddingTop: 36 }}>
        {from && (
          <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
            <button onClick={() => router.push("/")} className="hover:text-foreground">
              Home
            </button>
            {" \u203A "}
            <span className="text-accent">Staging</span>
          </div>
        )}
        <div className="mb-8">
          <h1
            className="text-foreground"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "48px",
              letterSpacing: "-1px",
              lineHeight: "74.4px",
              fontWeight: 300,
            }}
          >
            Staging
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            All tickets across your epics, organized by progress.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9C978E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-foreground">Nothing in staging</p>
          <p className="mt-1.5 text-[13px] text-muted">Save tickets from your meetings to see them here.</p>
          <button
            onClick={() => router.push("/meeting/new?from=staging")}
            className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/25 transition-colors hover:bg-accent/90"
          >
            Process a meeting &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px]" style={{ paddingTop: 36 }}>
      {/* Breadcrumb */}
      {from && (
        <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
          <button onClick={() => router.push("/")} className="hover:text-foreground">
            Home
          </button>
          {" \u203A "}
          <span className="text-accent">Staging</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <h1
              className="text-foreground"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "48px",
                letterSpacing: "-1px",
                lineHeight: "74.4px",
                fontWeight: 300,
              }}
            >
              Staging
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              All tickets across your epics, organized by progress.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[13px] text-muted">
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[12px] font-semibold text-accent">
              {allTickets.length}
            </span>
            <span>ticket{allTickets.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* 3-column kanban */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
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
              <StagingCard
                key={ticket.id}
                ticket={ticket}
                onDragStart={handleDragStart}
                onClick={() => setSelectedTicket(ticket)}
              />
            ))}
            {col.tickets.length === 0 && (
              <div
                className={`flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center ${
                  dragOverCol === col.key ? "border-accent bg-accent/5" : "border-border"
                }`}
              >
                {dragOverCol === col.key ? (
                  <span className="text-xs font-medium text-accent">Drop here</span>
                ) : (
                  <span className="text-xs text-muted">{col.emptyHint}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
