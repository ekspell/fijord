"use client";

import { useState, useRef } from "react";
import { useNav, SavedInitiative } from "./nav-context";

type ColumnKey = "now" | "next" | "later";

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
        {count} {count === 1 ? "item" : "items"}
      </span>
    </div>
  );
}

function InitiativeCard({
  initiative,
  onDragStart,
}: {
  initiative: SavedInitiative;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const STATUS_COLORS: Record<string, string> = {
    High: "#B5860B",
    Med: "#6B6860",
    Low: "#D4CFC5",
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, initiative.id)}
      className="mb-3 cursor-grab rounded-xl border border-border bg-card p-5 transition-shadow active:cursor-grabbing active:shadow-lg"
    >
      <div className="relative">
        <span className="absolute -top-1 right-0 text-sm text-muted/30 select-none">
          &#x2807;
        </span>
      </div>

      <h3 className="pr-6 text-[15px] font-semibold leading-snug text-foreground">
        {initiative.title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
        {initiative.description}
      </p>

      <div className="mt-3.5 flex flex-wrap gap-2">
        <span
          className="flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: initiative.ticketCount > 0 ? "#EEF4EE" : "#F6F5F3",
            color: initiative.ticketCount > 0 ? "#2C5F2D" : "#6B6860",
          }}
        >
          <span>&#127919;</span> {initiative.ticketCount} tickets
        </span>
        <span className="flex items-center gap-1.5 rounded bg-background px-2 py-0.5 text-[11px] text-muted">
          <span>&#128172;</span> {initiative.quoteCount} quotes
        </span>
        <span className="flex items-center gap-1.5 rounded bg-background px-2 py-0.5 text-[11px] text-muted">
          <span>&#128222;</span> 1 call
        </span>
      </div>

      {initiative.items.length > 0 && (
        <div className="mt-4 border-t border-border pt-3.5">
          {initiative.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 py-1.5 text-xs">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[item.priority] || "#D4CFC5" }}
              />
              <span className="text-muted">{item.name}</span>
              <span className="ml-auto text-[10px] text-muted/60">{item.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Roadmap() {
  const { roadmap, setRoadmap, setActiveTab } = useNav();
  const [dragOverCol, setDragOverCol] = useState<ColumnKey | null>(null);
  const draggedId = useRef<string | null>(null);

  // Group initiatives into columns based on their saved column assignment
  const columns = COLUMN_META.map((meta) => ({
    ...meta,
    initiatives: roadmap.filter((init) => init.column === meta.key),
  }));

  const totalTickets = roadmap.reduce((sum, i) => sum + i.ticketCount, 0);

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

    const updated = roadmap.map((init) =>
      init.id === draggedId.current ? { ...init, column: colKey } : init
    );
    setRoadmap(updated);
    draggedId.current = null;
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    draggedId.current = null;
  };

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
          <p className="text-sm text-muted">No initiatives on the roadmap yet.</p>
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
            Drag initiatives between columns to reprioritize.
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
            <ColHeader label={col.label} dotColor={col.dotColor} count={col.initiatives.length} />
            {col.initiatives.map((init) => (
              <InitiativeCard
                key={init.id}
                initiative={init}
                onDragStart={handleDragStart}
              />
            ))}
            {col.initiatives.length === 0 && (
              <div
                className={`flex items-center justify-center rounded-xl border border-dashed py-16 text-xs text-muted ${
                  dragOverCol === col.key ? "border-accent bg-accent/5" : "border-border"
                }`}
              >
                {dragOverCol === col.key ? "Drop here" : "No initiatives yet"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <p className="text-[13px] text-muted">
          <strong className="text-foreground">{roadmap.length} initiatives</strong> with{" "}
          <strong className="text-foreground">{totalTickets} tickets</strong>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("Scope")}
            disabled={!columns.some(() => true)}
            className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background"
          >
            View tickets
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
