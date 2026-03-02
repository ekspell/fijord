"use client";

import { useState, useEffect, useRef } from "react";
import { useNav, RoadmapTicket } from "./nav-context";
import { solutionResult, WorkItem, TicketDetail, TicketContext, Quote, PROBLEM_COLORS, ExtractedProblem } from "@/lib/types";
import TicketDetailView from "./ticket-detail";
import TranscriptDrawer from "./transcript-drawer";
import LinearConnectModal from "./components/linear-connect-modal";
import LinearSendModal from "./components/linear-send-modal";
import JiraConnectModal from "./components/jira-connect-modal";
import JiraSendModal from "./components/jira-send-modal";
import { createShareBundle } from "@/lib/share";
import { ShareTicket } from "@/lib/kv";
import { rankProblems, problemSeverity, SEVERITY_DISPLAY } from "@/lib/ranking";

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

function EvidenceCard({ quote, color, dimmed, onClick }: { quote: Quote; color?: string; dimmed?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`mb-2 cursor-pointer rounded-lg bg-background p-3.5 transition-all ${dimmed ? "opacity-30" : "hover:bg-[#F9F8F6]"}`}
      style={{ borderLeft: `3px solid ${color || "#D4CFC5"}` }}
    >
      <p className="text-[13px] italic leading-relaxed text-foreground">
        {quote.summary || quote.text}
      </p>
      <p className="mt-1.5 text-[11px] font-medium text-muted">
        {quote.speaker} &mdash; {quote.timestamp}
      </p>
    </div>
  );
}

function ProblemCard({ problem, index, color, active, dimmed, onClick }: { problem: ExtractedProblem; index: number; color: string; active?: boolean; dimmed?: boolean; onClick?: () => void }) {
  const sev = SEVERITY_DISPLAY[problemSeverity(problem as ExtractedProblem)];
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
              <p className="text-sm font-medium leading-snug text-foreground">
                {problem.title}
              </p>
            </div>
            <span
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: sev.bg, color: sev.text }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sev.dot }} />
              {sev.label}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            {problem.description}
          </p>
          <p className="mt-2 text-[11px] font-medium text-muted">
            {problem.quotes.length} mention{problem.quotes.length !== 1 ? "s" : ""}
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
  failed,
  selected,
  expanded,
  detail,
  onToggle,
  onExpand,
  onViewTicket,
}: {
  item: WorkItem;
  problemTitle: string;
  problemColor: string;
  loading: boolean;
  failed: boolean;
  selected: boolean;
  expanded: boolean;
  detail?: TicketDetail;
  onToggle: () => void;
  onExpand: () => void;
  onViewTicket: () => void;
}) {
  const ps = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Low;
  return (
    <div
      className={`mb-2 rounded-lg border bg-card transition-all ${
        selected ? "border-accent/40 ring-1 ring-accent/20" : "border-border hover:bg-[#F9F8F6]"
      }`}
    >
      <div className="p-3.5">
        <div className="mb-1.5 flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="h-4 w-4 shrink-0 cursor-pointer rounded border-2 border-border accent-accent"
          />
          <span className="text-[11px] font-semibold text-muted">{item.id}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${ps.bg} ${ps.text}`}
          >
            {item.priority}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-auto shrink-0 cursor-pointer transition-transform"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              color: "#9B9B9B",
            }}
            onClick={onExpand}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        <button
          onClick={onExpand}
          className="w-full text-left"
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
        </button>
        {loading && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-accent" />
            <span className="text-[11px] text-muted">Generating ticket...</span>
          </div>
        )}
        {failed && !loading && (
          <button onClick={onExpand} className="mt-2 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span className="text-[11px] text-red-700">Failed to load — click to retry</span>
          </button>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border bg-background px-3.5 pb-3.5 pt-3">
          {!detail && loading && (
            <div className="flex items-center gap-2 py-2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-accent" />
              <span className="text-[12px] text-muted">Generating details...</span>
            </div>
          )}
          {detail && (
            <>
              {detail.description && (
                <div className="mb-3">
                  <div className="mb-1 text-[12px] font-medium text-foreground">Description</div>
                  <p className="text-[13px] leading-relaxed text-muted">{detail.description}</p>
                </div>
              )}
              {detail.acceptanceCriteria && detail.acceptanceCriteria.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5 text-[12px] font-medium text-foreground">Acceptance criteria</div>
                  <div className="flex flex-col gap-1.5">
                    {detail.acceptanceCriteria.map((ac, i) => (
                      <div key={i} className="flex items-start gap-2 text-[13px] text-muted">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#D0CEC9" }} />
                        {ac}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detail.quotes && detail.quotes.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5 text-[12px] font-medium text-foreground">Source evidence</div>
                  <div
                    className="text-[13px] leading-relaxed text-muted"
                    style={{ paddingLeft: 12, borderLeft: `3px solid ${problemColor}` }}
                  >
                    &ldquo;{detail.quotes[0].text}&rdquo;
                  </div>
                </div>
              )}
              <button
                onClick={onViewTicket}
                className="mt-1 text-[13px] font-medium text-accent transition-colors hover:text-accent/80"
              >
                View ticket &rarr;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Results() {
  const { result: data, solutions, transcript, processingTime, setActiveTab, addToRoadmap, showToast, linearApiKey, setLinearApiKey, jiraCreds, setJiraCreds, triggerFeedback } = useNav();
  const [ticketContext, setTicketContext] = useState<TicketContext | null>(null);
  const [loadingTicket, setLoadingTicket] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [filterProblemId, setFilterProblemId] = useState<string | null>(null);
  const [drawerQuote, setDrawerQuote] = useState<Quote | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [generatedDetails, setGeneratedDetails] = useState<Map<string, TicketDetail>>(new Map());
  const [failedTicket, setFailedTicket] = useState<string | null>(null);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [showLinearConnect, setShowLinearConnect] = useState(false);
  const [showLinearSend, setShowLinearSend] = useState(false);
  const [preparingLinear, setPreparingLinear] = useState<{ done: number; total: number } | null>(null);
  const [showJiraConnect, setShowJiraConnect] = useState(false);
  const [showJiraSend, setShowJiraSend] = useState(false);
  const [preparingJira, setPreparingJira] = useState<{ done: number; total: number } | null>(null);
  const [shareUrls, setShareUrls] = useState<Map<string, string>>(new Map());
  const [visibleCount, setVisibleCount] = useState(7);
  const interactionCountRef = useRef(0);
  const feedbackShownRef = useRef(false);

  const trackInteraction = () => {
    if (feedbackShownRef.current) return;
    interactionCountRef.current += 1;
    if (interactionCountRef.current >= 2) {
      feedbackShownRef.current = true;
      triggerFeedback();
    }
  };

  // Count scope generation as the first interaction
  const scopeCountedRef = useRef(false);
  useEffect(() => {
    if (data && solutions.length > 0 && !scopeCountedRef.current) {
      scopeCountedRef.current = true;
      interactionCountRef.current += 1;
    }
  }, [data, solutions]);

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

  // Rank problems by pain-language severity, then quote frequency
  const sortedProblems = rankProblems(data.problems);

  // Assign colors to sorted problems (full list for stable colors)
  const problemColorMap = new Map<string, string>();
  sortedProblems.forEach((p, i) => {
    problemColorMap.set(p.id, PROBLEM_COLORS[i % PROBLEM_COLORS.length]);
  });

  // Build ALL tickets from all problems, then sort by priority
  const allTicketsUnsorted: {
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
      allTicketsUnsorted.push({
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
  allTicketsUnsorted.sort(
    (a, b) => (SEVERITY_ORDER[a.item.priority] ?? 1) - (SEVERITY_ORDER[b.item.priority] ?? 1)
  );

  // Progressive disclosure: show top N tickets
  const totalTickets = allTicketsUnsorted.length;
  const allTickets = allTicketsUnsorted.slice(0, visibleCount);

  // Derive visible problems & evidence from visible tickets
  const visibleProblemIds = new Set(allTickets.map((t) => t.problemId));
  const visibleProblems = sortedProblems.filter((p) => visibleProblemIds.has(p.id));
  const totalProblems = sortedProblems.length;

  // Build evidence with color threading — only for visible problems
  const coloredQuotes = visibleProblems.flatMap((p) =>
    p.quotes.map((q) => ({ quote: q, color: problemColorMap.get(p.id)!, problemId: p.id }))
  );

  const generateDetail = async (ticket: typeof allTickets[0]): Promise<TicketDetail | null> => {
    const existing = generatedDetails.get(ticket.item.id);
    if (existing) return existing;

    setLoadingTicket(ticket.item.id);
    setFailedTicket(null);
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
      trackInteraction();
      return ticketDetail;
    } catch (err) {
      console.error(err);
      setFailedTicket(ticket.item.id);
      return null;
    } finally {
      setLoadingTicket(null);
    }
  };

  const handleTicketClick = async (ticket: typeof allTickets[0]) => {
    const detail = await generateDetail(ticket);
    if (detail) {
      setTicketContext({
        ticket: detail,
        problem: data.problems[ticket.problemIndex],
        problemIndex: ticket.problemIndex,
        problemColor: ticket.problemColor,
        solution: ticket.solution.solution,
        meetingTitle: data.meetingTitle,
        meetingDate: data.date,
      });
    }
  };

  const handleExpandToggle = (ticket: typeof allTickets[0]) => {
    const id = ticket.item.id;
    if (expandedTicketId === id) {
      setExpandedTicketId(null);
    } else {
      setExpandedTicketId(id);
      if (!generatedDetails.has(id)) {
        generateDetail(ticket);
      }
    }
  };

  const buildShareTickets = (ticketList: typeof allTickets): ShareTicket[] =>
    ticketList.map((t) => {
      const detail = generatedDetails.get(t.item.id);
      const problem = data.problems[t.problemIndex];
      return {
        id: t.item.id,
        title: detail?.title || t.item.title,
        priority: detail?.priority || t.item.priority,
        status: detail?.status,
        problemStatement: detail?.problemStatement,
        description: detail?.description,
        acceptanceCriteria: detail?.acceptanceCriteria,
        quotes: detail?.quotes,
        problemTitle: problem.title,
        problemDescription: problem.description,
        problemColor: t.problemColor,
        problemQuotes: problem.quotes.slice(0, 2).map((q) => ({ text: q.text, speaker: q.speaker, summary: q.summary })),
      };
    });

  const prepareAndSendToLinear = async () => {
    // Find selected tickets that don't have generated details yet
    const selectedList = allTicketsUnsorted.filter((t) => selectedTickets.has(t.item.id));
    const missing = selectedList.filter((t) => !generatedDetails.has(t.item.id));

    if (missing.length === 0) {
      // All details already generated — create share bundle then open modal
      const urls = await createShareBundle(data.meetingTitle, data.date, buildShareTickets(selectedList));
      setShareUrls(urls);
      setShowLinearSend(true);
      return;
    }

    // Generate missing details with progress
    setPreparingLinear({ done: 0, total: missing.length });

    let done = 0;
    // Generate 3 at a time to balance speed vs rate limits
    for (let i = 0; i < missing.length; i += 3) {
      const batch = missing.slice(i, i + 3);
      const results = await Promise.allSettled(
        batch.map(async (ticket) => {
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
          return res.json() as Promise<TicketDetail>;
        })
      );

      results.forEach((r) => {
        if (r.status === "fulfilled") {
          setGeneratedDetails((prev) => new Map(prev).set(r.value.id, r.value));
        }
      });

      done += batch.length;
      setPreparingLinear({ done, total: missing.length });
    }

    setPreparingLinear(null);
    const urls = await createShareBundle(data.meetingTitle, data.date, buildShareTickets(selectedList));
    setShareUrls(urls);
    setShowLinearSend(true);
  };

  const prepareAndSendToJira = async () => {
    const selectedList = allTicketsUnsorted.filter((t) => selectedTickets.has(t.item.id));
    const missing = selectedList.filter((t) => !generatedDetails.has(t.item.id));

    if (missing.length === 0) {
      const urls = await createShareBundle(data.meetingTitle, data.date, buildShareTickets(selectedList));
      setShareUrls(urls);
      setShowJiraSend(true);
      return;
    }

    setPreparingJira({ done: 0, total: missing.length });

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
              problem: data.problems[ticket.problemIndex],
              solution: ticket.solution.solution,
              workItem: ticket.item,
            }),
          });
          if (!res.ok) throw new Error("Failed to generate ticket");
          return res.json() as Promise<TicketDetail>;
        })
      );

      results.forEach((r) => {
        if (r.status === "fulfilled") {
          setGeneratedDetails((prev) => new Map(prev).set(r.value.id, r.value));
        }
      });

      done += batch.length;
      setPreparingJira({ done, total: missing.length });
    }

    setPreparingJira(null);
    const urls = await createShareBundle(data.meetingTitle, data.date, buildShareTickets(selectedList));
    setShareUrls(urls);
    setShowJiraSend(true);
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
    <div className="mx-auto max-w-[1100px]">
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
              {totalTickets} tickets from {totalProblems} problems &rarr; ranked by priority
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
            {data.meetingTitle}
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            {data.date} &middot; {data.participants}
          </p>
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
              {visibleProblems.find((p) => p.id === filterProblemId)?.title}
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
        <div className="mb-5" />
      )}

      {/* 3-column grid */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
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
            count={`${filterProblemId ? 1 : visibleProblems.length} of ${totalProblems}`}
          />
          <div className="max-h-[600px] overflow-y-auto p-3">
            {visibleProblems.map((problem, i) => (
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
            count={`${filterProblemId ? allTickets.filter((t) => t.problemId === filterProblemId).length : allTickets.length} of ${totalTickets}`}
          />
          <div className="max-h-[600px] overflow-y-auto p-3">
            <div className="mb-2 flex items-center justify-between rounded-lg bg-accent/5 px-3 py-2">
              <span className="text-[11px] text-muted">
                {selectedTickets.size === 0
                  ? "Select tickets to add to staging"
                  : `${selectedTickets.size} selected`}
              </span>
              <button
                onClick={() => {
                  const visibleIds = allTickets
                    .filter((t) => !filterProblemId || t.problemId === filterProblemId)
                    .map((t) => t.item.id);
                  const allSelected = visibleIds.every((id) => selectedTickets.has(id));
                  if (allSelected) {
                    setSelectedTickets(new Set());
                  } else {
                    setSelectedTickets(new Set(visibleIds));
                  }
                }}
                className="text-[11px] font-medium text-accent transition-colors hover:text-accent/80"
              >
                {allTickets
                  .filter((t) => !filterProblemId || t.problemId === filterProblemId)
                  .every((t) => selectedTickets.has(t.item.id))
                  ? "Deselect all"
                  : "Select all"}
              </button>
            </div>
            {allTickets.map((ticket, i) => {
              if (filterProblemId && ticket.problemId !== filterProblemId) return null;
              return (
                <TicketCard
                  key={`${ticket.problemIndex}-${ticket.item.id}`}
                  item={ticket.item}
                  problemTitle={ticket.problemTitle}
                  problemColor={ticket.problemColor}
                  loading={loadingTicket === ticket.item.id}
                  failed={failedTicket === ticket.item.id}
                  selected={selectedTickets.has(ticket.item.id)}
                  expanded={expandedTicketId === ticket.item.id}
                  detail={generatedDetails.get(ticket.item.id)}
                  onToggle={() => toggleTicket(ticket.item.id)}
                  onExpand={() => handleExpandToggle(ticket)}
                  onViewTicket={() => handleTicketClick(ticket)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* See more / progressive disclosure */}
      {visibleCount < totalTickets && (
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="text-[13px] text-muted">
            Showing {allTickets.length} of {totalTickets} tickets
          </span>
          <button
            onClick={() => setVisibleCount((c) => Math.min(c + 7, totalTickets))}
            className="rounded-lg border border-border px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-background"
          >
            See more
          </button>
        </div>
      )}

      {/* Bottom action bar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <p className="text-[13px] text-muted">
          <strong className="text-foreground">{selectedTickets.size}</strong> of{" "}
          <strong className="text-foreground">{totalTickets}</strong> tickets selected
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
            disabled={selectedTickets.size === 0 || !!preparingLinear}
            onClick={() => {
              if (!linearApiKey) setShowLinearConnect(true);
              else prepareAndSendToLinear();
            }}
            className="flex items-center gap-2 rounded-lg border border-[#5E6AD2]/20 bg-[#5E6AD2]/5 px-4 py-2 text-sm font-medium text-[#5E6AD2] transition-colors hover:bg-[#5E6AD2]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {preparingLinear ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#5E6AD2]/30 border-t-[#5E6AD2]" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 100 100" fill="currentColor">
                <path d="M3.35 55.2a3.05 3.05 0 010-4.31L46.9 7.34a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L22.52 55.24a3.05 3.05 0 01-4.31 0L3.35 55.2zm17.76 17.76a3.05 3.05 0 010-4.31L57.25 32.51a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31l-36.14 36.14a3.05 3.05 0 01-4.31 0l-7.45-7.45zm41.38 23.69a3.05 3.05 0 01-4.31 0l-7.45-7.45a3.05 3.05 0 010-4.31l36.14-36.14a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L62.49 96.65z" />
              </svg>
            )}
            {preparingLinear
              ? `Preparing ${preparingLinear.done}/${preparingLinear.total}...`
              : "Send to Linear"}
          </button>
          <button
            disabled={selectedTickets.size === 0 || !!preparingJira}
            onClick={() => {
              if (!jiraCreds) setShowJiraConnect(true);
              else prepareAndSendToJira();
            }}
            className="flex items-center gap-2 rounded-lg border border-[#0052CC]/20 bg-[#0052CC]/5 px-4 py-2 text-sm font-medium text-[#0052CC] transition-colors hover:bg-[#0052CC]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {preparingJira ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0052CC]/30 border-t-[#0052CC]" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 24V12.518a1.005 1.005 0 00-1.005-1.005z" />
                <path d="M11.575 0H0a5.217 5.217 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 12.487V1.005A1.005 1.005 0 0011.575 0z" opacity=".65" transform="translate(5.714 5.713)" />
              </svg>
            )}
            {preparingJira
              ? `Preparing ${preparingJira.done}/${preparingJira.total}...`
              : "Send to Jira"}
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
              allTicketsUnsorted.forEach((ticket) => {
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
              const count = newTickets.length;
              addToRoadmap(newTickets);
              setSelectedTickets(new Set());
              setActiveTab("Staging");
              trackInteraction();
            }}
            className={`rounded-lg px-5 py-2 text-sm font-medium text-white transition-all ${
              selectedTickets.size > 0
                ? "bg-accent shadow-md shadow-accent/25 hover:bg-accent/90"
                : "bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            }`}
          >
            Save to staging &rarr;
          </button>
        </div>
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
          tickets={allTicketsUnsorted
            .filter((t) => selectedTickets.has(t.item.id))
            .map((t) => {
              const detail = generatedDetails.get(t.item.id);
              return {
                id: t.item.id,
                title: detail?.title || t.item.title,
                priority: (detail?.priority || t.item.priority) as "High" | "Med" | "Low",
                description: detail?.description,
                acceptanceCriteria: detail?.acceptanceCriteria,
                shareUrl: shareUrls.get(t.item.id),
              };
            })}
          apiKey={linearApiKey}
          onClose={() => setShowLinearSend(false)}
          onSuccess={(results) => {
            setShowLinearSend(false);
            setSelectedTickets(new Set());
            const count = results.length;
            const firstUrl = results[0]?.url;
            showToast(
              `${count} ticket${count !== 1 ? "s" : ""} sent to Linear`,
              firstUrl ? { label: "Open in Linear", onClick: () => window.open(firstUrl, "_blank") } : undefined
            );
          }}
        />
      )}

      {/* Jira modals */}
      {showJiraConnect && (
        <JiraConnectModal
          onClose={() => setShowJiraConnect(false)}
          onConnected={(creds) => {
            setJiraCreds(creds);
            setShowJiraConnect(false);
            prepareAndSendToJira();
          }}
        />
      )}
      {showJiraSend && jiraCreds && (
        <JiraSendModal
          tickets={allTicketsUnsorted
            .filter((t) => selectedTickets.has(t.item.id))
            .map((t) => {
              const detail = generatedDetails.get(t.item.id);
              return {
                id: t.item.id,
                title: detail?.title || t.item.title,
                priority: (detail?.priority || t.item.priority) as "High" | "Med" | "Low",
                description: detail?.description,
                acceptanceCriteria: detail?.acceptanceCriteria,
                shareUrl: shareUrls.get(t.item.id),
              };
            })}
          creds={jiraCreds}
          onClose={() => setShowJiraSend(false)}
          onSuccess={(results) => {
            setShowJiraSend(false);
            setSelectedTickets(new Set());
            const count = results.length;
            const firstUrl = results[0]?.url;
            showToast(
              `${count} ticket${count !== 1 ? "s" : ""} sent to Jira`,
              firstUrl ? { label: "Open in Jira", onClick: () => window.open(firstUrl, "_blank") } : undefined
            );
          }}
        />
      )}

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
