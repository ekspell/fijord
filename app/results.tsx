"use client";

import { useState } from "react";
import { useNav, RoadmapTicket } from "./nav-context";
import { solutionResult, WorkItem, TicketDetail, TicketContext, Quote, PROBLEM_COLORS } from "@/lib/types";
import TicketDetailView from "./ticket-detail";
import TranscriptDrawer from "./transcript-drawer";

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  High: { bg: "bg-red-50", text: "text-red-700" },
  Med: { bg: "bg-amber-50", text: "text-amber-700" },
  Low: { bg: "bg-blue-50", text: "text-blue-700" },
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  High: { bg: "#FEF2F2", text: "#B91C1C", label: "High" },
  Med:  { bg: "#FDF6E3", text: "#B5860B", label: "Med" },
  Low:  { bg: "#EFF6FF", text: "#1D4ED8", label: "Low" },
};

function ColHeader({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </h3>
      <span className="rounded-full bg-background px-2.5 py-0.5 text-[11px] text-muted">
        {count}
      </span>
    </div>
  );
}

function EvidenceCard({ quote, color, dimmed, onClick }: { quote: Quote; color?: string; dimmed?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`mb-2 cursor-pointer rounded-lg bg-background p-3.5 transition-all ${dimmed ? "opacity-30" : "hover:bg-[#F9F8F6]"}`}
      style={{ borderLeft: `3px solid ${color || "#D4CFC5"}` }}
    >
      <p className="text-[13px] leading-relaxed text-foreground">
        {quote.summary || quote.text}
      </p>
      <p className="mt-1.5 text-[11px] font-medium text-muted">
        {quote.speaker} &mdash; {quote.timestamp}
      </p>
    </div>
  );
}

function ProblemCard({ problem, index, color, active, dimmed, onClick }: { problem: { title: string; description: string; severity?: string; quotes: Quote[] }; index: number; color: string; active?: boolean; dimmed?: boolean; onClick?: () => void }) {
  const sev = SEVERITY_STYLES[problem.severity || "Med"] || SEVERITY_STYLES.Med;
  return (
    <div
      onClick={onClick}
      className={`mb-2 cursor-pointer overflow-hidden rounded-lg border bg-white transition-all ${dimmed ? "opacity-30" : "hover:bg-[#F9F8F6]"} ${active ? "ring-2 ring-offset-1" : ""}`}
      style={{
        borderColor: active ? color : "#E8E6E1",
        ...(active ? { ["--tw-ring-color" as string]: color } : {}),
      }}
    >
      <div className="flex">
        <div className="w-1 shrink-0" style={{ backgroundColor: color }} />
        <div className="flex-1 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <p className="text-[11px] font-medium text-foreground">
                {problem.title}
              </p>
            </div>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
              style={{ backgroundColor: sev.bg, color: sev.text }}
            >
              {sev.label}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            {problem.description}
          </p>
          <p className="mt-2 text-[11px] font-medium text-muted">
            &darr; {problem.quotes.length} supporting quotes
          </p>
        </div>
      </div>
    </div>
  );
}

function TicketCard({
  item,
  problemTitle,
  problemColor,
  loading,
  selected,
  onToggle,
  onClick,
}: {
  item: WorkItem;
  problemTitle: string;
  problemColor: string;
  loading: boolean;
  selected: boolean;
  onToggle: () => void;
  onClick: () => void;
}) {
  const ps = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Low;
  return (
    <div
      className={`mb-2 rounded-lg border bg-card p-3.5 transition-all ${
        selected ? "border-accent/40 ring-1 ring-accent/20" : "border-border hover:bg-[#F9F8F6]"
      }`}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-border accent-accent"
        />
        <span className="text-[11px] font-semibold text-muted">{item.id}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${ps.bg} ${ps.text}`}
        >
          {item.priority}
        </span>
      </div>
      <button
        onClick={onClick}
        disabled={loading}
        className="w-full text-left disabled:opacity-60"
      >
        <h4 className="text-sm font-medium leading-snug text-foreground">
          {item.title}
        </h4>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: problemColor }} />
          <span className="text-[11px] font-medium" style={{ color: problemColor }}>
            {problemTitle}
          </span>
        </div>
        {loading && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-accent" />
            <span className="text-[11px] text-muted">Generating ticket...</span>
          </div>
        )}
      </button>
    </div>
  );
}

export default function Results() {
  const { result: data, solutions, transcript, processingTime, setActiveTab, addToRoadmap } = useNav();
  const [ticketContext, setTicketContext] = useState<TicketContext | null>(null);
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [filterProblemId, setFilterProblemId] = useState<string | null>(null);
  const [drawerQuote, setDrawerQuote] = useState<Quote | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [generatedDetails, setGeneratedDetails] = useState<Map<string, TicketDetail>>(new Map());

  const toggleFilter = (problemId: string) => {
    setFilterProblemId((prev) => (prev === problemId ? null : problemId));
  };

  const toggleTicket = (id: string) => {
    setSelectedTickets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!data) return null;

  const SEVERITY_ORDER: Record<string, number> = { High: 0, Med: 1, Low: 2 };

  // Sort problems by severity (High → Med → Low)
  const sortedProblems = [...data.problems].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 1) - (SEVERITY_ORDER[b.severity] ?? 1)
  );

  // Assign colors to sorted problems
  const problemColorMap = new Map<string, string>();
  sortedProblems.forEach((p, i) => {
    problemColorMap.set(p.id, PROBLEM_COLORS[i % PROBLEM_COLORS.length]);
  });

  // Build evidence with color threading
  const coloredQuotes = sortedProblems.flatMap((p) =>
    p.quotes.map((q) => ({ quote: q, color: problemColorMap.get(p.id)!, problemId: p.id }))
  );

  // Build tickets aligned to sorted problem order
  const allTickets: {
    item: WorkItem;
    problemId: string;
    problemIndex: number;
    problemTitle: string;
    problemColor: string;
    solution: solutionResult;
  }[] = [];
  sortedProblems.forEach((problem) => {
    const originalIdx = data.problems.indexOf(problem);
    const sol = solutions[originalIdx];
    if (!sol) return;
    const color = problemColorMap.get(problem.id)!;
    sol.workItems.forEach((item) => {
      allTickets.push({
        item,
        problemId: problem.id,
        problemIndex: originalIdx,
        problemTitle: problem.title,
        problemColor: color,
        solution: sol,
      });
    });
  });

  // Sort tickets by priority (High → Med → Low)
  allTickets.sort(
    (a, b) => (SEVERITY_ORDER[a.item.priority] ?? 1) - (SEVERITY_ORDER[b.item.priority] ?? 1)
  );

  const handleTicketClick = async (ticket: typeof allTickets[0]) => {
    // If we already have a generated detail for this ticket, reuse it
    const existing = generatedDetails.get(ticket.item.id);
    if (existing) {
      setTicketContext({
        ticket: existing,
        problem: data.problems[ticket.problemIndex],
        problemIndex: ticket.problemIndex,
        problemColor: ticket.problemColor,
        solution: ticket.solution.solution,
        meetingTitle: data.meetingTitle,
        meetingDate: data.date,
      });
      return;
    }

    setLoadingTicket(ticket.item.id);
    try {
      const res = await fetch("/api/generate-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          problem: data.problems[ticket.problemIndex],
          solution: ticket.solution.solution,
          workItem: ticket.item,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate ticket");

      const ticketDetail: TicketDetail = await res.json();
      setGeneratedDetails((prev) => new Map(prev).set(ticketDetail.id, ticketDetail));
      setTicketContext({
        ticket: ticketDetail,
        problem: data.problems[ticket.problemIndex],
        problemIndex: ticket.problemIndex,
        problemColor: ticket.problemColor,
        solution: ticket.solution.solution,
        meetingTitle: data.meetingTitle,
        meetingDate: data.date,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTicket(null);
    }
  };

  const handleTicketUpdate = (updates: Partial<TicketDetail>) => {
    if (!ticketContext) return;
    const updatedTicket = { ...ticketContext.ticket, ...updates };
    setTicketContext({ ...ticketContext, ticket: updatedTicket });
    setGeneratedDetails((prev) => new Map(prev).set(updatedTicket.id, updatedTicket));
  };

  if (ticketContext) {
    return (
      <TicketDetailView
        context={ticketContext}
        onBack={() => setTicketContext(null)}
        onUpdate={handleTicketUpdate}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* Summary banner */}
      <div className="mb-6 flex items-center justify-between rounded-xl p-5" style={{ backgroundColor: "#EEF4EE", border: "1px solid rgba(44, 95, 45, 0.13)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-foreground">
              {data.problems.length} problems, {coloredQuotes.length} quotes &rarr; {allTickets.length} tickets
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              Processed in {processingTime}s
            </p>
          </div>
        </div>
      </div>

      {/* Title + pills */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-normal text-foreground">
            {data.meetingTitle}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {data.date} &middot; {data.participants}
          </p>
        </div>
        <div className="flex gap-3">
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            {coloredQuotes.length} quotes
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            {data.problems.length} problems
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            {allTickets.length} tickets
          </span>
        </div>
      </div>

      {/* Flow indicator + filter bar */}
      {filterProblemId ? (
        <div className="mb-5 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: problemColorMap.get(filterProblemId) }}
            />
            <span className="text-xs font-medium text-foreground">
              {sortedProblems.find((p) => p.id === filterProblemId)?.title}
            </span>
            <button
              onClick={() => setFilterProblemId(null)}
              className="ml-1 text-xs text-muted hover:text-foreground"
            >
              &times;
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex items-center justify-center gap-2 text-xs text-muted">
          <span>Evidence from the call</span>
          <span className="text-border">&rarr;</span>
          <span>Grouped into problems</span>
          <span className="text-border">&rarr;</span>
          <span>Turned into work</span>
        </div>
      )}

      {/* 3-column grid */}
      <div className="mb-8 grid grid-cols-3 gap-5">
        {/* Evidence column */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ColHeader
            title="Evidence"
            count={`${filterProblemId ? coloredQuotes.filter((cq) => cq.problemId === filterProblemId).length : coloredQuotes.length} quotes`}
          />
          <div className="max-h-[600px] overflow-y-auto p-3">
            {coloredQuotes.map((cq, i) => (
              <EvidenceCard
                key={i}
                quote={cq.quote}
                color={cq.color}
                dimmed={filterProblemId !== null && cq.problemId !== filterProblemId}
                onClick={() => {
                  setDrawerQuote(cq.quote);
                  setDrawerOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Problems column */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ColHeader
            title="Problems"
            count={`${filterProblemId ? 1 : sortedProblems.length} found`}
          />
          <div className="max-h-[600px] overflow-y-auto p-3">
            {sortedProblems.map((problem, i) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                index={i}
                color={problemColorMap.get(problem.id)!}
                active={filterProblemId === problem.id}
                dimmed={filterProblemId !== null && filterProblemId !== problem.id}
                onClick={() => toggleFilter(problem.id)}
              />
            ))}
          </div>
        </div>

        {/* Tickets column */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ColHeader
            title="Suggested tickets"
            count={`${filterProblemId ? allTickets.filter((t) => t.problemId === filterProblemId).length : allTickets.length} tickets`}
          />
          <div className="max-h-[600px] overflow-y-auto p-3">
            {allTickets.map((ticket, i) => {
              if (filterProblemId && ticket.problemId !== filterProblemId) return null;
              return (
                <TicketCard
                  key={`${ticket.problemIndex}-${ticket.item.id}`}
                  item={ticket.item}
                  problemTitle={ticket.problemTitle}
                  problemColor={ticket.problemColor}
                  loading={loadingTicket === ticket.item.id}
                  selected={selectedTickets.has(ticket.item.id)}
                  onToggle={() => toggleTicket(ticket.item.id)}
                  onClick={() => handleTicketClick(ticket)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <p className="text-[13px] text-muted">
          <strong className="text-foreground">{selectedTickets.size}</strong> of{" "}
          <strong className="text-foreground">{allTickets.length}</strong> tickets selected
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setDrawerQuote(null);
              setDrawerOpen(true);
            }}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            View transcript
          </button>
          <button
            disabled={selectedTickets.size === 0}
            onClick={() => {
              if (!data) return;
              const PRIORITY_TO_COL: Record<string, "now" | "next" | "later"> = {
                High: "now", Med: "next", Low: "later",
              };
              // Build flat tickets for roadmap from selected items, including full detail if generated
              const newTickets: RoadmapTicket[] = [];
              allTickets.forEach((ticket) => {
                if (!selectedTickets.has(ticket.item.id)) return;
                const problem = data.problems[ticket.problemIndex];
                const detail = generatedDetails.get(ticket.item.id);
                newTickets.push({
                  id: ticket.item.id,
                  title: detail?.title || ticket.item.title,
                  priority: detail?.priority || ticket.item.priority,
                  problemTitle: ticket.problemTitle,
                  problemDescription: problem.description,
                  problemColor: ticket.problemColor,
                  problemQuotes: problem.quotes.slice(0, 2).map((q) => ({ text: q.text, summary: q.summary, speaker: q.speaker })),
                  column: PRIORITY_TO_COL[detail?.priority || ticket.item.priority] || "later",
                  // Full detail fields (if generated)
                  status: detail?.status,
                  problemStatement: detail?.problemStatement,
                  description: detail?.description,
                  acceptanceCriteria: detail?.acceptanceCriteria,
                  quotes: detail?.quotes,
                });
              });
              addToRoadmap(newTickets);
              setActiveTab("Roadmap");
            }}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save to roadmap &rarr;
          </button>
        </div>
      </div>

      {/* Transcript drawer */}
      {drawerOpen && (
        <TranscriptDrawer
          transcript={transcript}
          highlightQuote={drawerQuote}
          meetingTitle={data.meetingTitle}
          meetingDate={data.date}
          onClose={() => {
            setDrawerOpen(false);
            setDrawerQuote(null);
          }}
        />
      )}
    </div>
  );
}
