"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { useAuth } from "@/app/auth-context";
import { SIGNAL_STATUS_STYLES } from "@/lib/mock-data";
import type { Signal } from "@/lib/mock-data";
import UpgradeModal from "@/app/components/upgrade-modal";
import { PAYWALL_ENABLED } from "@/lib/config";
import { rankSignals, detectSignalSeverity, SEVERITY_DISPLAY } from "@/lib/ranking";

function SignalCard({ signal, converted, conversionEpicId, onDelete }: { signal: Signal; converted?: boolean; conversionEpicId?: string; onDelete: (id: string) => void }) {
  const router = useRouter();
  const effectiveStatus = converted ? "converted" as const : signal.status;
  const status = SIGNAL_STATUS_STYLES[effectiveStatus];
  const isProject = signal.status === "project";
  const showSuggestion =
    !converted && signal.status === "stable" && signal.strength >= 50;
  const sev = SEVERITY_DISPLAY[detectSignalSeverity(signal)];
  const showReadyBadge = !converted && signal.readyForEpic && signal.status !== "project";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div
      onClick={() => router.push(`/signals/${signal.id}?from=signals`)}
      className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
    >
      {/* Header row */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="shrink-0 rounded-full"
            style={{
              width: 10,
              height: 10,
              background: signal.color,
            }}
          />
          <span
            className="truncate font-medium text-foreground"
            style={{ fontSize: 16 }}
          >
            {signal.title}
          </span>
          <span
            className="shrink-0 flex items-center gap-1 rounded-md font-medium"
            style={{
              fontSize: 12,
              padding: "2px 10px",
              background: status.bg,
              color: status.text,
            }}
          >
            {status.label}
            {!converted && isProject && " \u2713"}
          </span>
          <span
            className="shrink-0 flex items-center gap-1 rounded-md font-medium"
            style={{
              fontSize: 11,
              padding: "2px 8px",
              background: sev.bg,
              color: sev.text,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sev.dot }} />
            {sev.label}
          </span>
          {showReadyBadge && (
            <span
              className="shrink-0 flex items-center gap-1 rounded-md font-medium"
              style={{
                fontSize: 11,
                padding: "2px 8px",
                background: "#E8F0E8",
                color: "#3D5A3D",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Ready for epic
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {signal.recentDelta && (
            <span className="text-muted" style={{ fontSize: 13 }}>
              {signal.recentDelta}
            </span>
          )}
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted/0 transition-colors hover:bg-background hover:text-muted group-hover:text-muted"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-border bg-card py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(signal.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                  Delete signal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {signal.description && (
        <p className="mb-3 text-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>
          {signal.description}
        </p>
      )}

      {/* Metrics + tags row */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {signal.meetingCount} of {signal.totalMeetings} meetings
        </div>
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {signal.peopleCount} {signal.peopleCount === 1 ? "person" : "people"}
        </div>
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {signal.quoteCount} quotes
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {signal.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-border text-muted"
              style={{ fontSize: 12, padding: "2px 8px" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Signal strength + confidence */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-muted" style={{ fontSize: 12 }}>
            Signal strength
          </span>
          <span className="flex items-center gap-3 text-muted" style={{ fontSize: 12 }}>
            <span>{signal.confidence}% confidence</span>
            <span>{signal.strength}% strength</span>
          </span>
        </div>
        <div
          className="overflow-hidden rounded-full bg-border"
          style={{ height: 6 }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${signal.strength}%`,
              background: signal.color,
            }}
          />
        </div>
      </div>

      {/* Action row */}
      {converted && conversionEpicId && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/epic/${conversionEpicId}?from=signals`);
          }}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: "#3D5A3D" }}
        >
          Open epic →
        </button>
      )}

      {!converted && isProject && signal.epicId && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/epic/${signal.epicId}?from=signals`);
          }}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: "#3D5A3D" }}
        >
          Open epic →
        </button>
      )}

      {showSuggestion && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/signals/${signal.id}?from=signals`);
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#3D5A3D" }}
          >
            Create epic from pattern →
          </button>
          <span style={{ fontSize: 13, color: "#92400E" }}>
            ⚡ Enough signal — consider a dedicated project
          </span>
        </div>
      )}

      {!converted && signal.status === "new" && !showSuggestion && (
        <div className="text-muted" style={{ fontSize: 13 }}>
          Tracking — needs more data to confirm pattern
        </div>
      )}
    </div>
  );
}

export default function SignalsPage() {
  const router = useRouter();
  const { demoMode, isSignalConverted, convertedSignals, detectedSignals, detectSignalsIfStale, signalsLoading, removeSignal, showToast } = useNav();
  const { isPro } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showConverted, setShowConverted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Refresh signal detection when visiting the page (if data is stale >5 min)
  useEffect(() => {
    if (!demoMode) detectSignalsIfStale().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allSignals = demoMode ? [] : detectedSignals;
  const convertedCount = allSignals.filter((s) => isSignalConverted(s.id)).length;
  const filteredSignals = showConverted
    ? allSignals
    : allSignals.filter((s) => !isSignalConverted(s.id));
  const rankedSignals = rankSignals(filteredSignals);
  const signals = rankedSignals.slice(0, visibleCount);
  const totalSignals = rankedSignals.length;

  if (PAYWALL_ENABLED && !isPro) {
    return (
      <>
        <div className="mx-auto" style={{ maxWidth: 1000, paddingTop: 36 }}>
          <h1
            className="mb-1.5 flex items-center gap-3 text-foreground"
            style={{ fontSize: 48, letterSpacing: "-1px", lineHeight: "74.4px", fontWeight: 300 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Signals
          </h1>
          <div className="mt-8 rounded-xl border border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#E8F0E8" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">Signals is a Pro feature</p>
            <p className="mb-6 text-sm text-muted">
              Upgrade to detect recurring themes across your meetings automatically.
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ background: "#3D5A3D" }}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal feature="Signals" onClose={() => setShowUpgrade(false)} />}
      </>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 1000, paddingTop: 36 }}>
      {/* Header */}
      <h1
        className="mb-1.5 flex items-center gap-3 text-foreground"
        style={{
          fontSize: 48,
          letterSpacing: "-1px",
          lineHeight: "74.4px",
          fontWeight: 300,
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        Signals
      </h1>
      <p className="mb-6 text-muted" style={{ fontSize: 15 }}>
        Recurring themes detected across your meetings. When a pattern has
        enough signal, turn it into an epic.
      </p>

      {/* Converted toggle */}
      {convertedCount > 0 && (
        <button
          onClick={() => setShowConverted(!showConverted)}
          className="mb-6 flex items-center gap-3"
        >
          <span
            className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
            style={{ background: showConverted ? "#3D5A3D" : "#D0CEC9" }}
            role="switch"
            aria-checked={showConverted}
          >
            <span
              className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
              style={{ transform: showConverted ? "translateX(18px)" : "translateX(3px)" }}
            />
          </span>
          <span className="text-sm text-muted">
            Show converted signals ({convertedCount})
          </span>
        </button>
      )}

      {/* Signal cards */}
      {signalsLoading && allSignals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-border border-t-accent" />
          <p className="text-[15px] font-semibold text-foreground">Detecting patterns...</p>
          <p className="mt-1.5 text-[13px] text-muted">
            Analyzing problems across your meetings for recurring themes.
          </p>
        </div>
      ) : rankedSignals.length === 0 && allSignals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9C978E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-foreground">No signals detected yet</p>
          <p className="mt-1.5 text-[13px] text-muted">
            Process at least two meetings and Fijord will find patterns across your conversations.
          </p>
          <button
            onClick={() => router.push("/meeting/new?from=signals")}
            className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/25 transition-colors hover:bg-accent/90"
          >
            Process a meeting &rarr;
          </button>
        </div>
      ) : rankedSignals.length === 0 && !showConverted ? (
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
          <p className="mb-1 text-sm font-medium text-foreground">
            All signals have been converted to epics
          </p>
          <p className="text-sm text-muted">
            Toggle &ldquo;Show converted signals&rdquo; above to view them.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {signals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                converted={isSignalConverted(signal.id)}
                conversionEpicId={convertedSignals[signal.id]?.epicId}
                onDelete={setConfirmDeleteId}
              />
            ))}
          </div>
          {visibleCount < totalSignals && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="text-[13px] text-muted">
                Showing {signals.length} of {totalSignals} signals
              </span>
              <button
                onClick={() => setVisibleCount((c) => Math.min(c + 5, totalSignals))}
                className="rounded-lg border border-border px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-background"
              >
                See more
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (() => {
        const signalToDelete = detectedSignals.find((s) => s.id === confirmDeleteId);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setConfirmDeleteId(null)}
          >
            <div
              className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="mb-2 text-lg font-medium text-foreground">
                Delete signal?
              </h2>
              <p className="mb-6 text-sm text-muted">
                This will remove <strong>{signalToDelete?.title}</strong> from your detected signals. It may be re-detected in future analyses.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    removeSignal(confirmDeleteId);
                    setConfirmDeleteId(null);
                    showToast("Signal deleted");
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                  style={{ background: "#DC2626" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
