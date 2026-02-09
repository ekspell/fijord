"use client";

import { useNav } from "./nav-context";
import { solutionResult, WorkItem } from "@/lib/types";

type Initiative = {
  title: string;
  description: string;
  ticketCount: number;
  quoteCount: number;
  problemLabel: string;
  items: { name: string; id: string; priority: string }[];
};

type Column = {
  key: string;
  label: string;
  dotColor: string;
  initiatives: Initiative[];
};

const PRIORITY_ORDER: Record<string, number> = { High: 0, Med: 1, Low: 2 };

function getHighestPriority(items: WorkItem[]): string {
  if (items.length === 0) return "Low";
  return items.reduce((best, item) =>
    (PRIORITY_ORDER[item.priority] ?? 2) < (PRIORITY_ORDER[best.priority] ?? 2) ? item : best
  ).priority;
}

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

function InitiativeCard({ initiative }: { initiative: Initiative }) {
  const STATUS_COLORS: Record<string, string> = {
    High: "#B5860B",
    Med: "#6B6860",
    Low: "#D4CFC5",
  };

  return (
    <div className="mb-3 rounded-xl border border-border bg-card p-5">
      {/* Drag handle (visual only) */}
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

      {/* Stat badges */}
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

      {/* Linked tickets */}
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
  const { result, solutions, setActiveTab } = useNav();

  if (!result) return null;

  // Build initiatives: each problem + its solution = one initiative
  const initiatives: Initiative[] = result.problems.map((problem, i) => {
    const sol: solutionResult | undefined = solutions[i];
    const items = sol?.workItems || [];
    return {
      title: sol?.solution.title || problem.title,
      description: sol?.solution.description || problem.description,
      ticketCount: items.length,
      quoteCount: problem.quotes.length,
      problemLabel: `Problem ${i + 1}`,
      items: items.map((item) => ({
        name: item.title,
        id: item.id,
        priority: item.priority,
      })),
    };
  });

  // Sort into columns by highest-priority ticket in each initiative
  const columns: Column[] = [
    { key: "now", label: "Now", dotColor: "#2C5F2D", initiatives: [] },
    { key: "next", label: "Next", dotColor: "#B5860B", initiatives: [] },
    { key: "later", label: "Later", dotColor: "#9C978E", initiatives: [] },
  ];

  initiatives.forEach((init) => {
    const highest = getHighestPriority(
      solutions[initiatives.indexOf(init)]?.workItems || []
    );
    if (highest === "High") columns[0].initiatives.push(init);
    else if (highest === "Med") columns[1].initiatives.push(init);
    else columns[2].initiatives.push(init);
  });

  const totalTickets = initiatives.reduce((sum, i) => sum + i.ticketCount, 0);

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[32px] font-normal text-foreground">Roadmap</h1>
          <p className="mt-1 text-sm text-muted">
            Initiatives grouped by priority. Ticket priorities determine column placement.
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
          <div key={col.key} style={{ minHeight: 400 }}>
            <ColHeader label={col.label} dotColor={col.dotColor} count={col.initiatives.length} />
            {col.initiatives.map((init, i) => (
              <InitiativeCard key={i} initiative={init} />
            ))}
            {col.initiatives.length === 0 && (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-16 text-xs text-muted">
                No initiatives yet
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <p className="text-[13px] text-muted">
          <strong className="text-foreground">{initiatives.length} initiatives</strong> with{" "}
          <strong className="text-foreground">{totalTickets} tickets</strong> from{" "}
          <strong className="text-foreground">1 call</strong>
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("Scope")}
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
