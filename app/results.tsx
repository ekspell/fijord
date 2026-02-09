"use client";

import { useState } from "react";
import { ProblemsResult, ExtractedProblem, solutionResult, WorkItem, TicketDetail, TicketContext } from "@/lib/types";
import TicketDetailView from "./ticket-detail";

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-amber-100 text-amber-700",
  Med: "bg-yellow-50 text-yellow-700",
  Low: "bg-gray-100 text-gray-600",
};

export default function Results({
  data,
  transcript,
  processingTime,
}: {
  data: ProblemsResult;
  transcript: string;
  processingTime: string;
}) {
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null);
  const [solutionResults, setsolutionResults] = useState<Record<number, solutionResult>>({});
  const [loadingsolution, setLoadingsolution] = useState<number | null>(null);
  const [ticketContext, setTicketContext] = useState<TicketContext | null>(null);
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);

  const selected = selectedProblem !== null ? data.problems[selectedProblem] : null;
  const currentsolution = selectedProblem !== null ? solutionResults[selectedProblem] : null;

  const handleSelectProblem = async (index: number) => {
    setSelectedProblem(index);

    // Already loaded
    if (solutionResults[index]) return;

    setLoadingsolution(index);
    try {
      const res = await fetch("/api/generate-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          problem: data.problems[index],
        }),
      });

      if (!res.ok) throw new Error("Failed to generate solution");

      const result: solutionResult = await res.json();
      setsolutionResults((prev) => ({ ...prev, [index]: result }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingsolution(null);
    }
  };

  const handleWorkItemClick = async (item: WorkItem) => {
    if (!selected || selectedProblem === null || !currentsolution) return;

    setLoadingTicket(item.id);
    try {
      const res = await fetch("/api/generate-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          problem: selected,
          solution: currentsolution.solution,
          workItem: item,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate ticket");

      const ticket: TicketDetail = await res.json();
      setTicketContext({
        ticket,
        problem: selected,
        problemIndex: selectedProblem,
        solution: currentsolution.solution,
        meetingTitle: data.meetingTitle,
        meetingDate: data.date,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTicket(null);
    }
  };

  const totalTickets = Object.values(solutionResults).reduce(
    (sum, pr) => sum + pr.workItems.length,
    0
  );

  if (ticketContext) {
    return (
      <TicketDetailView
        context={ticketContext}
        onBack={() => setTicketContext(null)}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Success banner */}
      <div className="rounded-xl bg-accent p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {data.problems.length} problems found &mdash; select one to generate solutions
            </p>
            <p className="mt-0.5 text-sm text-white/70">
              Processed in {processingTime} seconds
            </p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-xl font-semibold text-foreground">
          {data.meetingTitle}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {data.date} &middot; {data.participants}
        </p>
      </div>

      {/* Problems / Solutions split */}
      <div className="flex flex-1 gap-6 pb-24">
        {/* Problems column */}
        <div className="w-1/2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Problems
              </h2>
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
                {data.problems.length} found
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {data.problems.map((problem, i) => (
                <button
                  key={problem.id}
                  onClick={() => handleSelectProblem(i)}
                  style={selectedProblem !== i ? { borderColor: '#E8E6E1' } : {}}
                  className={`rounded-xl border p-5 text-left transition-colors ${
                    selectedProblem === i
                      ? "border-amber-400 bg-amber-50/30 shadow-sm"
                      : "hover:border-amber-200"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    Problem {i + 1}
                  </p>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">
                    {problem.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {problem.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-medium text-amber-600">
                      &darr; {problem.quotes.length} supporting quotes
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Solutions column */}
        <div className="w-1/2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Solutions
            </h2>
            {currentsolution ? (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
                {currentsolution.workItems.length} work items
              </span>
            ) : (
              <span className="text-xs text-muted">&mdash;</span>
            )}
          </div>

          {!selected ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-12 py-32 text-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-muted/40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <p className="text-sm text-muted">
                Select a problem to see its solution
              </p>
            </div>
          ) : loadingsolution === selectedProblem ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-12 py-32 text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
              <p className="text-sm text-muted">
                Generating solution &amp; work items...
              </p>
            </div>
          ) : currentsolution ? (
            <div className="flex flex-col gap-3">
              {/* solution card */}
              <div className="rounded-xl border p-5 shadow-sm" style={{ borderColor: '#2C5F2D', backgroundColor: '#EEF4EE' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#2C5F2D' }}>
                  solution
                </p>
                <h3 className="mt-2 text-sm font-semibold text-foreground">
                  {currentsolution.solution.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {currentsolution.solution.description}
                </p>
              </div>

              {/* Work item cards */}
              {currentsolution.workItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleWorkItemClick(item)}
                  disabled={loadingTicket !== null}
                  className="rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-accent/30 disabled:opacity-60"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">
                      {item.id}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        PRIORITY_STYLES[item.priority] || ""
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h4>
                  {loadingTicket === item.id && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
                      <span className="text-xs text-muted">Generating ticket...</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card px-8 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground">{data.problems.length} problems</span> found
            {totalTickets > 0 && (
              <> &middot; <span className="font-semibold text-foreground">{totalTickets} work items</span> generated</>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background">
              Share with [X]
            </button>
            <button className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-light">
              Save to roadmap &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
