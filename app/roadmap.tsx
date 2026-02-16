"use client";

import { useState, useRef } from "react";
import { useNav, RoadmapTicket } from "./nav-context";
import { TicketDetail, TicketContext, Quote } from "@/lib/types";
import TicketDetailView from "./ticket-detail";
import LinearConnectModal from "./components/linear-connect-modal";
import LinearSendModal from "./components/linear-send-modal";

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
  onDelete,
}: {
  ticket: RoadmapTicket;
  loading: boolean;
  failed: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: () => void;
  onDelete: () => void;
}) {
  const ps = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Low;

  return (
    <div
      draggable={!loading}
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={onClick}
      className={`group/card relative mb-3 cursor-grab rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80 hover:bg-[#F9F8F6] active:cursor-grabbing active:shadow-lg ${loading ? "opacity-60" : ""}`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-muted opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover/card:opacity-100"
        title="Delete ticket"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
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
  const { roadmap, setRoadmap, updateRoadmapTicket, setActiveTab, transcript, showToast, linearApiKey, setLinearApiKey } = useNav();
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<RoadmapTicket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);
  const [failedTicket, setFailedTicket] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showLinearConnect, setShowLinearConnect] = useState(false);
  const [showLinearSend, setShowLinearSend] = useState(false);
  const [preparingLinear, setPreparingLinear] = useState<{ done: number; total: number } | null>(null);
  const draggedId = useRef<string | null>(null);

  const handleDelete = () => {
    if (!confirmDeleteId) return;
    setRoadmap(roadmap.filter((t) => t.id !== confirmDeleteId));
    setConfirmDeleteId(null);
  };

  const prepareAndSendToLinear = async () => {
    const missing = roadmap.filter((t) => !hasDetail(t));

    if (missing.length === 0) {
      setShowLinearSend(true);
      return;
    }

    setPreparingLinear({ done: 0, total: missing.length });
    let done = 0;

    for (let i = 0; i < missing.length; i += 3) {
      const batch = missing.slice(i, i + 3);
      const results = await Promise.allSettled(
        batch.map(async (ticket) => {
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
          const detail = await res.json();
          return { ticketId: ticket.id, detail };
        })
      );

      results.forEach((r) => {
        if (r.status === "fulfilled") {
          updateRoadmapTicket(r.value.ticketId, {
            status: r.value.detail.status,
            problemStatement: r.value.detail.problemStatement,
            description: r.value.detail.description,
            acceptanceCriteria: r.value.detail.acceptanceCriteria,
            quotes: r.value.detail.quotes,
          });
        }
      });

      done += batch.length;
      setPreparingLinear({ done, total: missing.length });
    }

    setPreparingLinear(null);
    setShowLinearSend(true);
  };

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
              letterSpacing: '-1px',
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
              letterSpacing: '-1px',
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
        <button
          disabled={!!preparingLinear}
          onClick={() => {
            if (!linearApiKey) setShowLinearConnect(true);
            else prepareAndSendToLinear();
          }}
          className="flex items-center gap-2 rounded-lg border border-[#5E6AD2]/20 bg-[#5E6AD2]/5 px-4 py-2 text-[13px] font-medium text-[#5E6AD2] transition-colors hover:bg-[#5E6AD2]/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {preparingLinear ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#5E6AD2]/30 border-t-[#5E6AD2]" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 100 100" fill="currentColor">
              <path d="M3.35 55.2a3.05 3.05 0 010-4.31L46.9 7.34a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L22.52 55.24a3.05 3.05 0 01-4.31 0L3.35 55.2zm17.76 17.76a3.05 3.05 0 010-4.31L57.25 32.51a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31l-36.14 36.14a3.05 3.05 0 01-4.31 0l-7.45-7.45zm41.38 23.69a3.05 3.05 0 01-4.31 0l-7.45-7.45a3.05 3.05 0 010-4.31l36.14-36.14a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L62.49 96.65z" />
            </svg>
          )}
          {preparingLinear
            ? `Preparing ${preparingLinear.done}/${preparingLinear.total}...`
            : "Export to Linear"}
        </button>
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
                onDelete={() => setConfirmDeleteId(ticket.id)}
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


      {/* Linear modals */}
      {showLinearConnect && (
        <LinearConnectModal
          onClose={() => setShowLinearConnect(false)}
          onConnected={(key) => {
            setLinearApiKey(key);
            setShowLinearConnect(false);
            prepareAndSendToLinear();
          }}
        />
      )}
      {showLinearSend && (
        <LinearSendModal
          tickets={roadmap.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority as "High" | "Med" | "Low",
            description: t.description,
            acceptanceCriteria: t.acceptanceCriteria,
          }))}
          apiKey={linearApiKey}
          onClose={() => setShowLinearSend(false)}
          onSuccess={(results) => {
            setShowLinearSend(false);
            const count = results.length;
            const firstUrl = results[0]?.url;
            showToast(
              `${count} ticket${count !== 1 ? "s" : ""} sent to Linear`,
              firstUrl ? { label: "Open in Linear", onClick: () => window.open(firstUrl, "_blank") } : undefined
            );
          }}
        />
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-fade-in" onClick={() => setConfirmDeleteId(null)}>
          <div className="fixed inset-0 bg-black/20" />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground">Delete ticket?</h3>
            <p className="mt-2 text-[13px] text-muted">
              Are you sure you want to remove <strong className="text-foreground">{confirmDeleteId}</strong> from the roadmap? This can&apos;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-red-700"
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
