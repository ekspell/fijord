"use client";

import { useState } from "react";
import { useNav, SavedInitiative } from "./nav-context";
import { solutionResult, WorkItem, TicketDetail, TicketContext, Quote } from "@/lib/types";
import TicketDetailView from "./ticket-detail";

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  High: { bg: "bg-red-50", text: "text-red-700" },
  Med: { bg: "bg-amber-50", text: "text-amber-700" },
  Low: { bg: "bg-blue-50", text: "text-blue-700" },
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

function EvidenceCard({ quote }: { quote: Quote }) {
  return (
    <div className="mb-2 rounded-lg bg-background p-3.5" style={{ borderLeft: "3px solid #D4CFC5" }}>
      <p className="text-[13px] italic leading-relaxed text-foreground">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="mt-1.5 text-[11px] font-medium text-muted">
        {quote.speaker} &mdash; {quote.timestamp}
      </p>
    </div>
  );
}

function ProblemCard({ problem, index }: { problem: { title: string; description: string; quotes: Quote[] }; index: number }) {
  return (
    <div
      className="mb-2 rounded-lg border p-3.5"
      style={{ backgroundColor: "#FDF6E3", borderColor: "#EDE2C4" }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#B5860B" }}>
        Problem {index + 1}
      </p>
      <h4 className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
        {problem.title}
      </h4>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        {problem.description}
      </p>
      <p className="mt-2 text-[11px] font-medium" style={{ color: "#B5860B" }}>
        &darr; {problem.quotes.length} supporting quotes
      </p>
    </div>
  );
}

function TicketCard({
  item,
  problemLabel,
  loading,
  onClick,
}: {
  item: WorkItem;
  problemLabel: string;
  loading: boolean;
  onClick: () => void;
}) {
  const ps = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Low;
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="mb-2 w-full rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:border-accent/30 disabled:opacity-60"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-muted">{item.id}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${ps.bg} ${ps.text}`}
        >
          {item.priority}
        </span>
      </div>
      <h4 className="text-sm font-medium leading-snug text-foreground">
        {item.title}
      </h4>
      <p className="mt-1.5 text-[11px] text-muted">
        &larr; <span style={{ color: "#B5860B" }} className="font-medium">{problemLabel}</span>
      </p>
      {loading && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-accent" />
          <span className="text-[11px] text-muted">Generating ticket...</span>
        </div>
      )}
    </button>
  );
}

export default function Results() {
  const { result: data, solutions, transcript, processingTime, setActiveTab, addToRoadmap } = useNav();
  const [ticketContext, setTicketContext] = useState<TicketContext | null>(null);
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);

  if (!data) return null;

  const allQuotes = data.problems.flatMap((p) => p.quotes);

  const allTickets: { item: WorkItem; problemIndex: number; problemLabel: string; solution: solutionResult }[] = [];
  solutions.forEach((sol, i) => {
    sol.workItems.forEach((item) => {
      allTickets.push({
        item,
        problemIndex: i,
        problemLabel: `Problem ${i + 1}`,
        solution: sol,
      });
    });
  });

  const handleTicketClick = async (ticket: typeof allTickets[0]) => {
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
      setTicketContext({
        ticket: ticketDetail,
        problem: data.problems[ticket.problemIndex],
        problemIndex: ticket.problemIndex,
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

  if (ticketContext) {
    return (
      <TicketDetailView
        context={ticketContext}
        onBack={() => setTicketContext(null)}
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
              {data.problems.length} problems, {allQuotes.length} quotes &rarr; {allTickets.length} tickets
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
            {allQuotes.length} quotes
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            {data.problems.length} problems
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
            {allTickets.length} tickets
          </span>
        </div>
      </div>

      {/* Flow indicator */}
      <div className="mb-5 flex items-center justify-center gap-2 text-xs text-muted">
        <span>Evidence from the call</span>
        <span className="text-border">&rarr;</span>
        <span>Grouped into problems</span>
        <span className="text-border">&rarr;</span>
        <span>Turned into work</span>
      </div>

      {/* 3-column grid */}
      <div className="mb-8 grid grid-cols-3 gap-5">
        {/* Evidence column */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ColHeader title="Evidence" count={`${allQuotes.length} quotes`} />
          <div className="max-h-[600px] overflow-y-auto p-3">
            {allQuotes.map((quote, i) => (
              <EvidenceCard key={i} quote={quote} />
            ))}
          </div>
        </div>

        {/* Problems column */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ColHeader title="Problems" count={`${data.problems.length} found`} />
          <div className="max-h-[600px] overflow-y-auto p-3">
            {data.problems.map((problem, i) => (
              <ProblemCard key={problem.id} problem={problem} index={i} />
            ))}
          </div>
        </div>

        {/* Tickets column */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ColHeader title="Suggested tickets" count={`${allTickets.length} tickets`} />
          <div className="max-h-[600px] overflow-y-auto p-3">
            {allTickets.map((ticket) => (
              <TicketCard
                key={ticket.item.id}
                item={ticket.item}
                problemLabel={ticket.problemLabel}
                loading={loadingTicket === ticket.item.id}
                onClick={() => handleTicketClick(ticket)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <p className="text-[13px] text-muted">
          <strong className="text-foreground">{allTickets.length} tickets</strong> ready to go.
        </p>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background">
            View transcript
          </button>
          <button
            onClick={() => {
              if (!data) return;
              const PRIORITY_TO_COL: Record<string, "now" | "next" | "later"> = {
                High: "now", Med: "next", Low: "later",
              };
              const newInitiatives: SavedInitiative[] = data.problems.map((problem, i) => {
                const sol = solutions[i];
                const items = sol?.workItems || [];
                const highest = items.length > 0
                  ? items.reduce((best, item) =>
                      ({ High: 0, Med: 1, Low: 2 }[item.priority] ?? 2) <
                      ({ High: 0, Med: 1, Low: 2 }[best.priority] ?? 2)
                        ? item : best
                    ).priority
                  : "Low";
                return {
                  id: `init-${Date.now()}-${i}`,
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
                  column: PRIORITY_TO_COL[highest] || "later",
                };
              });
              addToRoadmap(newInitiatives);
              setActiveTab("Roadmap");
            }}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Save to roadmap &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
