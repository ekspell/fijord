"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { useAuth } from "@/app/auth-context";
import { MOCK_EPICS, STATUS_STYLES } from "@/lib/mock-epics";
import type { Epic } from "@/lib/mock-epics";
import CreateEpicModal from "@/app/components/create-epic-modal";
import UpgradeModal from "@/app/components/upgrade-modal";

function EpicCard({ epic }: { epic: Epic }) {
  const router = useRouter();
  const status = STATUS_STYLES[epic.status];
  const progressPercent =
    epic.progress.total > 0
      ? Math.round((epic.progress.shipped / epic.progress.total) * 100)
      : 0;

  return (
    <div
      onClick={() => router.push(`/epic/${epic.id}?from=epics`)}
      className="cursor-pointer rounded-xl border border-border bg-card transition-all hover:border-border-hover hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
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
            {epic.metrics.tickets}
          </span>{" "}
          tickets
        </div>
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
          <span className="font-medium text-foreground">
            {epic.metrics.meetings}
          </span>{" "}
          meetings
        </div>
        <div className="flex items-center gap-1.5 text-muted" style={{ fontSize: 13 }}>
          <span className="font-medium text-foreground">
            {epic.metrics.quotes}
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
          {epic.progressLabel}
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
  const { demoMode } = useNav();
  const { isPro } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const allEpics = demoMode ? [] : MOCK_EPICS;

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
    <div className="mx-auto flex flex-col" style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
        <button onClick={() => router.push("/")} className="hover:text-foreground">Home</button>
        {" › "}
        <span className="text-accent">Epics</span>
      </div>

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
          <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-border">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">No epics yet</p>
            <p className="mb-6 text-sm text-muted">
              Create your first epic or wait for signals to emerge from meetings.
            </p>
            <button
              onClick={handleCreateEpic}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ background: "#3D5A3D" }}
            >
              + Create epic
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
              <EpicCard key={epic.id} epic={epic} />
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
    </div>
  );
}
