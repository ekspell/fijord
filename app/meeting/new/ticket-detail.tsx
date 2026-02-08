"use client";

import { TicketContext } from "@/lib/types";

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-amber-100 text-amber-700",
  Med: "bg-yellow-50 text-yellow-700",
  Low: "bg-gray-100 text-gray-600",
};

const PRIORITY_DOT: Record<string, string> = {
  High: "bg-red-500",
  Med: "bg-yellow-500",
  Low: "bg-gray-400",
};

export default function TicketDetailView({
  context,
  activeTab,
  setActiveTab,
  onBack,
}: {
  context: TicketContext;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBack: () => void;
}) {
  const { ticket, problem, problemIndex, meetingTitle, meetingDate } = context;

  const tabs = [
    { label: "Discovery", badge: null },
    { label: "Scope", badge: null },
    { label: "Roadmap", badge: null },
    { label: "Brief", badge: "NEW" },
  ];

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
                tab.label === "Scope"
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

      {/* Breadcrumb */}
      <div className="px-8 pb-2">
        <nav className="flex items-center gap-2 text-sm text-muted">
          <button onClick={onBack} className="hover:text-foreground">
            Scope
          </button>
          <span className="text-muted/50">&rsaquo;</span>
          <span className="font-medium text-foreground">{ticket.id}</span>
        </nav>
      </div>

      {/* Sub-breadcrumb */}
      <div className="px-8 pb-6">
        <nav className="flex items-center gap-2 text-sm">
          <span className="text-muted">{meetingTitle}</span>
          <span className="text-muted/50">&rsaquo;</span>
          <span className="font-semibold text-foreground">{ticket.id}</span>
        </nav>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 px-8 pb-24">
        {/* Main content card */}
        <div className="w-2/3">
          <div className="rounded-xl border border-border bg-card p-8">
            {/* Header: ID, priority badge, status badge */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm font-medium text-muted">{ticket.id}</span>
              <span
                className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase ${
                  PRIORITY_STYLES[ticket.priority] || ""
                }`}
              >
                {ticket.priority}
              </span>
              <span className="rounded-full border border-border px-3 py-0.5 text-xs font-medium text-muted">
                {ticket.status || "Ready for design"}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-2xl font-semibold text-foreground">
              {ticket.title}
            </h1>

            {/* Problem link */}
            <button
              onClick={onBack}
              className="mb-8 flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Problem {problemIndex + 1}: {problem.title}
            </button>

            {/* Problem Statement */}
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-700">
                Problem Statement
              </h2>
              <p className="text-sm leading-relaxed text-foreground">
                {ticket.problemStatement}
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-700">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-foreground">
                {ticket.description}
              </p>
            </div>

            {/* Acceptance Criteria */}
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-700">
                Acceptance Criteria
              </h2>
              <ul className="flex flex-col gap-2.5">
                {ticket.acceptanceCriteria.map((criteria, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#3D5A3D"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mt-0.5 shrink-0"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm leading-relaxed text-foreground">
                      {criteria}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-1/3 flex flex-col gap-4">
          {/* User Quotes */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                User Quotes
              </h3>
              <span className="text-xs font-medium text-muted">
                {ticket.quotes.length} QUOTE{ticket.quotes.length !== 1 ? "S" : ""}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {ticket.quotes.map((quote, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <p className="text-sm italic leading-relaxed text-foreground">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {quote.speaker} &middot; {quote.timestamp}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
              Details
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Priority</span>
                <span className="text-sm font-medium text-foreground">
                  {ticket.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Problem</span>
                <button
                  onClick={onBack}
                  className="text-sm font-medium text-amber-700 hover:text-amber-800"
                >
                  {problem.title.length > 20
                    ? problem.title.slice(0, 20) + "..."
                    : problem.title}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Roadmap</span>
                <span className="text-sm font-medium text-foreground">Now</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Created</span>
                <span className="text-sm font-medium text-foreground">
                  {today}
                </span>
              </div>
            </div>
          </div>

          {/* Source Transcript */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">
              Source Transcript
            </h3>
            <button
              onClick={onBack}
              className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-background"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="shrink-0 text-amber-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                />
              </svg>
              <span className="text-sm font-medium text-foreground">
                {meetingTitle} &mdash; {meetingDate}
              </span>
            </button>
          </div>

          {/* View design brief button */}
          <button className="w-full rounded-xl bg-accent px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent-light">
            View design brief &#10022;
          </button>
        </div>
      </div>
    </div>
  );
}
