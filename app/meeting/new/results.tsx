"use client";

import { useState } from "react";
import { ProcessingResult } from "@/lib/types";

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-amber-100 text-amber-700",
  Med: "bg-yellow-50 text-yellow-700",
  Low: "bg-gray-100 text-gray-600",
};

export default function Results({
  activeTab,
  setActiveTab,
  data,
  processingTime,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  data: ProcessingResult;
  processingTime: string;
}) {
  const [selectedProblem, setSelectedProblem] = useState<number | null>(null);

  const tabs = [
    { label: "Inputs", badge: null },
    { label: "Tickets", badge: null },
    { label: "Roadmap", badge: null },
    { label: "Brief", badge: "NEW" },
  ];

  const selected = selectedProblem !== null ? data.problems[selectedProblem] : null;

  return (
    <div className="-m-8 flex min-h-screen flex-col">
      {/* Tab bar */}
      <header className="flex justify-center py-6">
        <nav className="flex gap-1.5 rounded-xl border border-border bg-card p-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.label
                  ? "bg-background text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-1.5 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Success banner */}
      <div className="mx-8 rounded-xl bg-accent p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {data.summary.problemCount} problems found, backed by {data.summary.quoteCount} quotes &rarr; {data.summary.ticketCount} tickets ready
            </p>
            <p className="mt-0.5 text-sm text-white/70">
              Processed in {processingTime} seconds &middot; A PM would typically spend 45&ndash;60 min on this
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
      <div className="flex flex-1 gap-6 px-8 pb-24">
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
                  key={problem.label}
                  onClick={() => setSelectedProblem(i)}
                  className={`rounded-xl border p-5 text-left transition-colors ${
                    selectedProblem === i
                      ? "border-amber-400 bg-amber-50/30 shadow-sm"
                      : "border-border hover:border-amber-200"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    {problem.label}
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
            {selected ? (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
                {selected.tickets.length} tickets
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
          ) : (
            <div className="flex flex-col gap-3">
              {/* Patch card */}
              <div className="rounded-xl border border-amber-400 bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                  {selected.patch.label}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-foreground">
                  {selected.patch.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {selected.patch.description}
                </p>
              </div>

              {/* Ticket cards */}
              {selected.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">
                      {ticket.id}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        PRIORITY_STYLES[ticket.priority] || ""
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {ticket.title}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {ticket.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-56 right-0 border-t border-border bg-card px-8 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            <span className="font-semibold text-foreground">{data.summary.ticketCount} tickets</span>{" "}
            ready to add to your roadmap. You can edit, merge, or discard before saving.
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
