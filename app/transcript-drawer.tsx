"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Quote } from "@/lib/types";

/**
 * Parse raw transcript text into structured lines.
 * Handles formats like:
 *   "Speaker Name: What they said..."
 *   "[00:12:34] Speaker Name: What they said..."
 */
type TranscriptLine = {
  speaker: string;
  text: string;
  raw: string;
  index: number;
};

function parseTranscript(raw: string): TranscriptLine[] {
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  const parsed: TranscriptLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match optional timestamp + speaker: text
    const match = line.match(/^(?:\[[\d:]+\]\s*)?([^:]+):\s*(.+)/);
    if (match) {
      parsed.push({ speaker: match[1].trim(), text: match[2].trim(), raw: line, index: i });
    } else {
      // Continuation line — append to previous speaker or treat as standalone
      if (parsed.length > 0) {
        parsed[parsed.length - 1].text += " " + line;
        parsed[parsed.length - 1].raw += "\n" + line;
      } else {
        parsed.push({ speaker: "", text: line, raw: line, index: i });
      }
    }
  }
  return parsed;
}

/**
 * Find the transcript line index that best matches a quote.
 * Uses normalized substring matching.
 */
function findQuoteInTranscript(lines: TranscriptLine[], quoteText: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[""''"\u2018\u2019\u201C\u201D]/g, "").replace(/\s+/g, " ").trim();

  const normalizedQuote = normalize(quoteText);

  // Try exact substring match first
  for (let i = 0; i < lines.length; i++) {
    if (normalize(lines[i].text).includes(normalizedQuote)) return i;
  }

  // Try matching with a shorter portion (first 40 chars)
  const shortQuote = normalizedQuote.slice(0, 40);
  if (shortQuote.length >= 15) {
    for (let i = 0; i < lines.length; i++) {
      if (normalize(lines[i].text).includes(shortQuote)) return i;
    }
  }

  // Try word overlap scoring
  const quoteWords = new Set(normalizedQuote.split(" ").filter((w) => w.length > 3));
  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineWords = normalize(lines[i].text).split(" ");
    const score = lineWords.filter((w) => quoteWords.has(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx >= 0 ? bestIdx : 0;
}

export default function TranscriptDrawer({
  transcript,
  highlightQuote,
  meetingTitle,
  meetingDate,
  onClose,
}: {
  transcript: string;
  highlightQuote: Quote | null;
  meetingTitle: string;
  meetingDate: string;
  onClose: () => void;
}) {
  const lines = parseTranscript(transcript);
  const highlightRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // "above" = highlight is above viewport (scroll up), "below" = below (scroll down), null = visible
  const [highlightDir, setHighlightDir] = useState<"above" | "below" | null>(null);

  const matchedLineIdx = highlightQuote ? findQuoteInTranscript(lines, highlightQuote.text) : -1;

  // Check whether the highlighted element is above, below, or within the scroll viewport
  const checkHighlightPosition = useCallback(() => {
    if (!highlightRef.current || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const el = highlightRef.current;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    if (elRect.bottom < containerRect.top) {
      setHighlightDir("above");
    } else if (elRect.top > containerRect.bottom) {
      setHighlightDir("below");
    } else {
      setHighlightDir(null);
    }
  }, []);

  // Close on Escape key + lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Auto-scroll to highlighted quote on open
  useEffect(() => {
    if (highlightRef.current && scrollContainerRef.current) {
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [matchedLineIdx]);

  // Track scroll position to update banner direction
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || matchedLineIdx < 0) return;
    // Initial check after scroll animation settles
    const initTimer = setTimeout(checkHighlightPosition, 600);
    container.addEventListener("scroll", checkHighlightPosition, { passive: true });
    return () => {
      clearTimeout(initTimer);
      container.removeEventListener("scroll", checkHighlightPosition);
    };
  }, [matchedLineIdx, checkHighlightPosition]);

  const scrollToHighlight = () => {
    highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="backdrop-fade-in fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="drawer-slide-in fixed right-0 top-0 z-50 flex h-full w-[520px] max-w-[90vw] flex-col border-l border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Transcript</h2>
            <p className="mt-0.5 text-[13px] text-muted">
              {meetingTitle} &mdash; {meetingDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-background hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Highlight banner — always visible when a quote is highlighted, flips direction on scroll */}
        {highlightQuote && (
          <button
            onClick={scrollToHighlight}
            className="flex items-center gap-2 border-b border-[#E5D9A8] bg-[#FDF6E3] px-6 py-2.5 text-left text-[13px] font-medium text-[#8B7520] transition-colors hover:bg-[#FCF0D0]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: highlightDir === "above" ? "rotate(180deg)" : undefined }}
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
            {highlightDir === "above" ? "Scroll up to highlighted quote" : highlightDir === "below" ? "Scroll down to highlighted quote" : "Viewing highlighted quote"}
          </button>
        )}

        {/* Transcript body */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4">
            {lines.map((line, i) => {
              const isHighlighted = i === matchedLineIdx;
              return (
                <div
                  key={i}
                  ref={isHighlighted ? highlightRef : undefined}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    isHighlighted
                      ? "bg-[#FDF6E3] ring-1 ring-[#E5D9A8]"
                      : ""
                  }`}
                >
                  {line.speaker && (
                    <p className={`mb-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                      isHighlighted ? "text-[#8B7520]" : "text-muted"
                    }`}>
                      {line.speaker}
                    </p>
                  )}
                  <p className={`text-[13px] leading-relaxed ${
                    isHighlighted ? "font-medium text-foreground" : "text-foreground/80"
                  }`}>
                    {line.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
