"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MOCK_MEETING_RECORDS, MOCK_MEETING_DETAILS, MOCK_SIGNALS } from "@/lib/mock-data";
import { MOCK_EPICS } from "@/lib/mock-epics";

type SearchResult = {
  id: string;
  type: "meeting" | "epic" | "signal" | "evidence";
  title: string;
  snippet: string;
  href: string;
  meta?: string;
};

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[#7EB07E]">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

function truncateAround(text: string, query: string, maxLen = 80): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, maxLen) + (text.length > maxLen ? "..." : "");
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + query.length + 50);
  let result = text.slice(start, end);
  if (start > 0) result = "..." + result;
  if (end < text.length) result += "...";
  return result;
}

const TYPE_ICONS: Record<SearchResult["type"], React.ReactNode> = {
  meeting: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#888]">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  epic: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#888]">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  signal: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#888]">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  evidence: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#888]">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
};

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  meeting: "Meetings",
  epic: "Epics",
  signal: "Signals",
  evidence: "Evidence",
};

function buildSearchIndex(deletedMeetings: Set<string>) {
  const meetings = MOCK_MEETING_RECORDS.filter((m) => !deletedMeetings.has(m.id));
  const details = MOCK_MEETING_DETAILS;
  const epics = MOCK_EPICS;
  const signals = MOCK_SIGNALS;

  return { meetings, details, epics, signals };
}

function search(query: string, deletedMeetings: Set<string>, maxPerCategory = 4): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  const { meetings, details, epics, signals } = buildSearchIndex(deletedMeetings);
  const results: SearchResult[] = [];

  // Meetings
  let meetingCount = 0;
  for (const m of meetings) {
    if (meetingCount >= maxPerCategory) break;
    const titleMatch = m.title.toLowerCase().includes(q);
    const participantMatch = m.participant.toLowerCase().includes(q);
    const detail = details[m.id];
    const transcriptMatch = detail?.transcript?.some((line) => line.text.toLowerCase().includes(q));
    const problemMatch = detail?.problems?.some((p) => p.title.toLowerCase().includes(q));

    if (titleMatch || participantMatch || transcriptMatch || problemMatch) {
      let snippet = m.date;
      if (m.participant) snippet += ` \u00B7 ${m.participant}`;
      if (participantMatch && !titleMatch) snippet = `Participant: ${m.participant}`;
      if (transcriptMatch && !titleMatch && !participantMatch) {
        const line = detail!.transcript!.find((l) => l.text.toLowerCase().includes(q));
        if (line) snippet = truncateAround(line.text, query);
      }
      if (problemMatch && !titleMatch && !participantMatch && !transcriptMatch) {
        const prob = detail!.problems!.find((p) => p.title.toLowerCase().includes(q));
        if (prob) snippet = `Problem: ${prob.title}`;
      }
      results.push({ id: m.id, type: "meeting", title: m.title, snippet, href: `/meeting/${m.id}` });
      meetingCount++;
    }
  }

  // Epics
  let epicCount = 0;
  for (const e of epics) {
    if (epicCount >= maxPerCategory) break;
    const titleMatch = e.title.toLowerCase().includes(q);
    const descMatch = e.description.toLowerCase().includes(q);
    if (titleMatch || descMatch) {
      const snippet = descMatch && !titleMatch
        ? truncateAround(e.description, query)
        : e.description.slice(0, 80) + (e.description.length > 80 ? "..." : "");
      results.push({ id: e.id, type: "epic", title: e.title, snippet, href: `/epic/${e.id}` });
      epicCount++;
    }
  }

  // Signals
  let signalCount = 0;
  for (const s of signals) {
    if (signalCount >= maxPerCategory) break;
    const titleMatch = s.title.toLowerCase().includes(q);
    const tagMatch = s.tags?.some((t) => t.toLowerCase().includes(q));
    if (titleMatch || tagMatch) {
      const snippet = tagMatch && !titleMatch
        ? `Tags: ${s.tags.join(", ")}`
        : `${s.meetingCount} meetings \u00B7 ${s.quoteCount} quotes`;
      results.push({ id: s.id, type: "signal", title: s.title, snippet, href: `/signals/${s.id}` });
      signalCount++;
    }
  }

  // Evidence / quotes (from signals and meeting details)
  let evidenceCount = 0;
  const seenQuotes = new Set<string>();

  for (const s of signals) {
    if (evidenceCount >= maxPerCategory) break;
    for (const quote of s.quotes ?? []) {
      if (evidenceCount >= maxPerCategory) break;
      if (quote.text.toLowerCase().includes(q)) {
        const key = quote.text.slice(0, 60);
        if (seenQuotes.has(key)) continue;
        seenQuotes.add(key);
        results.push({
          id: `quote-${s.id}-${evidenceCount}`,
          type: "evidence",
          title: `"${truncateAround(quote.text, query, 60)}"`,
          snippet: `${quote.speaker} \u00B7 ${quote.meetingTitle || s.title}`,
          href: quote.meetingId ? `/meeting/${quote.meetingId}` : `/signals/${s.id}`,
        });
        evidenceCount++;
      }
    }
  }

  if (evidenceCount < maxPerCategory) {
    for (const [meetingId, detail] of Object.entries(details)) {
      if (evidenceCount >= maxPerCategory) break;
      for (const prob of detail.problems ?? []) {
        if (evidenceCount >= maxPerCategory) break;
        for (const quote of prob.quotes ?? []) {
          if (evidenceCount >= maxPerCategory) break;
          if (quote.text.toLowerCase().includes(q)) {
            const key = quote.text.slice(0, 60);
            if (seenQuotes.has(key)) continue;
            seenQuotes.add(key);
            results.push({
              id: `quote-${meetingId}-${prob.id}-${evidenceCount}`,
              type: "evidence",
              title: `"${truncateAround(quote.text, query, 60)}"`,
              snippet: `${quote.speaker} \u00B7 ${detail.title}`,
              href: `/meeting/${meetingId}`,
            });
            evidenceCount++;
          }
        }
      }
    }
  }

  return results;
}

export default function SearchModal({
  open,
  onClose,
  deletedMeetings,
}: {
  open: boolean;
  onClose: () => void;
  deletedMeetings: Set<string>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const resultListRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => search(query, deletedMeetings), [query, deletedMeetings]);

  // Flat list of result indices for keyboard nav
  const flatResults = results;

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (!resultListRef.current) return;
    const active = resultListRef.current.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const navigate = useCallback(
    (result: SearchResult) => {
      onClose();
      router.push(result.href);
    },
    [onClose, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatResults[activeIndex]) navigate(flatResults[activeIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [flatResults, activeIndex, navigate, onClose]
  );

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  // Group results by type for rendering
  const grouped: { type: SearchResult["type"]; items: SearchResult[] }[] = [];
  const typeOrder: SearchResult["type"][] = ["meeting", "epic", "signal", "evidence"];
  for (const type of typeOrder) {
    const items = results.filter((r) => r.type === type);
    if (items.length > 0) grouped.push({ type, items });
  }

  // Build flat index map for keyboard nav
  let flatIndex = 0;
  const indexMap = new Map<string, number>();
  for (const group of grouped) {
    for (const item of group.items) {
      indexMap.set(item.id, flatIndex++);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-[600px] overflow-hidden rounded-2xl shadow-2xl"
        style={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4" style={{ borderColor: "#333" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#666"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings, epics, signals..."
            className="flex-1 bg-transparent py-4 text-[15px] text-white placeholder-[#666] outline-none"
          />
          <kbd
            className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium"
            style={{ backgroundColor: "#333", color: "#888" }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={resultListRef} className="max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#444 transparent" }}>
          {query.trim() === "" ? (
            <div className="px-4 py-10 text-center text-[13px]" style={{ color: "#666" }}>
              Start typing to search...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-10 text-center text-[13px]" style={{ color: "#666" }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="py-2">
              {grouped.map((group) => (
                <div key={group.type}>
                  <div
                    className="px-4 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: "#666" }}
                  >
                    {TYPE_LABELS[group.type]}
                  </div>
                  {group.items.map((item) => {
                    const idx = indexMap.get(item.id) ?? -1;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        data-active={isActive}
                        onClick={() => navigate(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                        style={{
                          backgroundColor: isActive ? "#2a2a2a" : "transparent",
                          borderRadius: 8,
                          margin: "0 4px",
                          width: "calc(100% - 8px)",
                        }}
                      >
                        {TYPE_ICONS[item.type]}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium text-white">
                            {highlightMatch(item.title, query)}
                          </div>
                          <div className="truncate text-[12px]" style={{ color: "#888" }}>
                            {highlightMatch(item.snippet, query)}
                          </div>
                        </div>
                        {isActive && (
                          <kbd
                            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                            style={{ backgroundColor: "#333", color: "#666" }}
                          >
                            &crarr;
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div
            className="flex items-center gap-4 border-t px-4 py-2.5 text-[11px]"
            style={{ borderColor: "#333", color: "#555" }}
          >
            <span className="flex items-center gap-1">
              <kbd className="rounded px-1 py-0.5" style={{ backgroundColor: "#2a2a2a", fontSize: 10 }}>&uarr;</kbd>
              <kbd className="rounded px-1 py-0.5" style={{ backgroundColor: "#2a2a2a", fontSize: 10 }}>&darr;</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded px-1 py-0.5" style={{ backgroundColor: "#2a2a2a", fontSize: 10 }}>&crarr;</kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded px-1 py-0.5" style={{ backgroundColor: "#2a2a2a", fontSize: 10 }}>esc</kbd>
              close
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
