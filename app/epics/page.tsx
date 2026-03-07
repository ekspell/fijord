"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { useAuth } from "@/app/auth-context";
import { MOCK_EPICS, STATUS_STYLES } from "@/lib/mock-epics";
import type { Epic } from "@/lib/mock-epics";
import CreateEpicModal from "@/app/components/create-epic-modal";
import UpgradeModal from "@/app/components/upgrade-modal";

function useEpicMetrics(epic: Epic) {
  const { detectedSignals, convertedSignals, roadmap } = useNav();

  // For epics with built-in tickets, use static metrics
  if ((epic.tickets ?? []).length > 0) return epic.metrics;

  // Count roadmap tickets directly assigned to this epic
  const assignedTickets = roadmap.filter((t) => t.epicId === epic.id);
  if (assignedTickets.length > 0) {
    const linkedSignals = detectedSignals.filter(
      (s) => s.epicId === epic.id || convertedSignals[s.id]?.epicId === epic.id
    );
    const signalMeetingIds = new Set<string>();
    for (const signal of linkedSignals) {
      for (const quote of signal.quotes ?? []) {
        signalMeetingIds.add(quote.meetingId);
      }
    }
    const totalQuotes = linkedSignals.reduce((sum, s) => sum + (s.quoteCount || 0), 0);

    return {
      tickets: assignedTickets.length,
      meetings: signalMeetingIds.size || epic.metrics.meetings,
      quotes: totalQuotes || epic.metrics.quotes,
    };
  }

  return epic.metrics;
}

function EpicCard({ epic, onDelete }: { epic: Epic; onDelete?: (id: string) => void }) {
  const router = useRouter();
  const status = STATUS_STYLES[epic.status];
  const metrics = useEpicMetrics(epic);
  const progressPercent =
    epic.progress.total > 0
      ? Math.round((epic.progress.shipped / epic.progress.total) * 100)
      : 0;
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
      onClick={() => router.push(`/epic/${epic.id}?from=epics`)}
      className="group cursor-pointer rounded-xl border border-border bg-card transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
      style={{ padding: 20, transform: "translateY(0)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <h2 className="font-medium" style={{ fontSize: 16 }}>
          {epic.title}
        </h2>
        <div className="flex items-center gap-2">
          <div
            className="flex shrink-0 items-center gap-1.5 rounded-md font-medium"
            style={{
              fontSize: 12,
              padding: "4px 10px",
              background: status.bg,
              color: status.text,
            }}
          >
            <span
              className="rounded-full"
              style={{
                width: 6,
                height: 6,
                background: "currentColor",
              }}
            />
            {status.label}
          </div>
          {onDelete && (
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
                      onDelete(epic.id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-600 transition-colors hover:bg-red-50"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                    Delete epic
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p
        className="mb-3.5 leading-relaxed text-muted"
        style={{ fontSize: 14 }}
      >
        {epic.description}
      </p>

      {/* Metrics */}
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
          <span className="font-medium text-foreground">
            {metrics.tickets}
          </span>{" "}
          tickets
        </div>
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
          <span className="font-medium text-foreground">
            {metrics.meetings}
          </span>{" "}
          meetings
        </div>
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
          <span className="font-medium text-foreground">
            {metrics.quotes}
          </span>{" "}
          quotes
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3.5">
        <div
          className="mb-1.5 overflow-hidden rounded-full bg-border"
          style={{ height: 6 }}
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-muted" style={{ fontSize: 12 }}>
          {metrics.tickets > 0 && epic.progressLabel === "No tickets yet"
            ? `${metrics.tickets} ticket${metrics.tickets !== 1 ? "s" : ""} from staging`
            : epic.progressLabel}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center gap-3 border-t border-border"
        style={{ paddingTop: 14 }}
      >
        <div className="flex items-center gap-2">
          <div
            className="rounded-full bg-border"
            style={{ width: 24, height: 24 }}
          />
          <span className="text-muted" style={{ fontSize: 13 }}>
            {epic.owner.name}
          </span>
        </div>
        <span className="ml-auto text-muted" style={{ fontSize: 12 }}>
          {epic.dateLabel}
        </span>
      </div>
    </div>
  );
}

const TABS = ["All", "On track", "At risk", "Blocked"] as const;
type Tab = (typeof TABS)[number];

const TAB_TO_STATUS: Record<Tab, string | null> = {
  All: null,
  "On track": "on-track",
  "At risk": "at-risk",
  Blocked: "blocked",
};

export default function EpicsPage() {
  const router = useRouter();
  const { demoMode, userEpics, removeEpic, showToast } = useNav();
  const { isPro } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const allEpics = demoMode ? [...MOCK_EPICS, ...userEpics] : [...userEpics];

  const statusFilter = TAB_TO_STATUS[activeTab];
  const epics = statusFilter
    ? allEpics.filter((e) => e.status === statusFilter)
    : allEpics;

  function handleCreateEpic() {
    if (!isPro && allEpics.length >= 3) {
      setShowUpgrade(true);
    } else {
      setShowCreateModal(true);
    }
  }

  return (
    <div className="mx-auto flex flex-col" style={{ maxWidth: 1000, paddingTop: 36 }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background pt-2 pb-0">
        {/* Title row + Create button */}
        <div className="flex items-center justify-between">
          <h1
            className="text-foreground"
            style={{
              fontSize: 48,
              letterSpacing: "-1px",
              lineHeight: "74.4px",
              fontWeight: 300,
            }}
          >
            Epics
          </h1>
          <button
            onClick={handleCreateEpic}
            className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ background: "#3D5A3D" }}
          >
            + Create Epic
          </button>
        </div>
        <p className="mb-5 text-muted" style={{ fontSize: 15 }}>
          Your active projects and initiatives. Click into an epic to see
          discovery, scope, and roadmap.
        </p>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            const count =
              tab === "All"
                ? allEpics.length
                : allEpics.filter((e) => e.status === TAB_TO_STATUS[tab]).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-3 text-sm font-medium transition-colors ${
                  isActive ? "" : "hover:text-foreground"
                }`}
                style={{
                  color: isActive ? "var(--color-foreground)" : "var(--color-muted)",
                }}
              >
                {tab}
                <span
                  className="ml-1.5 text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  {count}
                </span>
                {isActive && (
                  <span
                    className="absolute left-0 right-0"
                    style={{ height: 2, bottom: -1, background: "var(--color-foreground)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Epic cards */}
      <div className="pt-6">
        {allEpics.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9C978E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-foreground">No epics yet</p>
            <p className="mt-1.5 text-[13px] text-muted">
              Create an epic to organize related problems and track them to shipped work.
            </p>
            <button
              onClick={handleCreateEpic}
              className="mt-5 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-accent/25 transition-colors hover:bg-accent/90"
            >
              Create your first epic &rarr;
            </button>
          </div>
        ) : epics.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
            <p className="mb-1 text-sm text-muted">
              No {activeTab.toLowerCase()} epics.
            </p>
            <button
              onClick={() => setActiveTab("All")}
              className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
            >
              View all epics →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {epics.map((epic) => (
              <EpicCard
                key={epic.id}
                epic={epic}
                onDelete={userEpics.some((e) => e.id === epic.id) ? setConfirmDeleteId : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateEpicModal onClose={() => setShowCreateModal(false)} />
      )}
      {showUpgrade && (
        <UpgradeModal feature="unlimited epics" onClose={() => setShowUpgrade(false)} />
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (() => {
        const epicToDelete = userEpics.find((e) => e.id === confirmDeleteId);
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
                Delete epic?
              </h2>
              <p className="mb-6 text-sm text-muted">
                This will permanently delete <strong>{epicToDelete?.title}</strong> and unlink its tickets. The tickets will remain in staging. This action cannot be undone.
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
                    removeEpic(confirmDeleteId);
                    setConfirmDeleteId(null);
                    showToast(`Epic deleted`);
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
