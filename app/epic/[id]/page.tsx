"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_EPICS, STATUS_STYLES } from "@/lib/mock-epics";

const TABS = ["Discovery", "Scope", "Roadmap", "Brief"] as const;

export default function EpicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Discovery");

  const epic = MOCK_EPICS.find((e) => e.id === id);

  if (!epic) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h1 className="mb-2 text-xl font-medium text-foreground">
          Epic not found
        </h1>
        <p className="mb-6 text-sm text-muted">
          The epic you&apos;re looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/epics")}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-foreground/90"
        >
          Back to Epics
        </button>
      </div>
    );
  }

  const status = STATUS_STYLES[epic.status];
  const progressPercent =
    epic.progress.total > 0
      ? Math.round((epic.progress.shipped / epic.progress.total) * 100)
      : 0;

  return (
    <div className="mx-auto" style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
        <button
          onClick={() => router.push("/")}
          className="hover:text-foreground"
        >
          Home
        </button>
        {" › "}
        <button
          onClick={() => router.push("/epics")}
          className="hover:text-foreground"
        >
          Epics
        </button>
        {" › "}
        <span className="text-accent">{epic.title}</span>
      </div>

      {/* Header */}
      <div className="mb-1.5 flex items-center gap-3">
        <h1 className="font-medium" style={{ fontSize: 26 }}>
          {epic.title}
        </h1>
        <div
          className="flex items-center gap-1.5 rounded-md font-medium"
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
      <p className="mb-2 text-muted" style={{ fontSize: 15 }}>
        {epic.description}
      </p>

      {/* Meta row */}
      <div className="mb-6 flex items-center gap-4">
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
        <span className="text-muted" style={{ fontSize: 12 }}>
          · {epic.owner.name} · {epic.dateLabel}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-8">
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

      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-xl border border-border bg-card p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm"
                : "cursor-pointer text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-border bg-card p-8">
        {activeTab === "Discovery" && (
          <div className="text-center">
            <div className="mb-3 text-3xl">🔍</div>
            <h3 className="mb-2 text-base font-medium text-foreground">
              Discovery
            </h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">
              Meeting transcripts and user interviews linked to this epic will
              appear here. Process a transcript to get started.
            </p>
          </div>
        )}
        {activeTab === "Scope" && (
          <div className="text-center">
            <div className="mb-3 text-3xl">📋</div>
            <h3 className="mb-2 text-base font-medium text-foreground">
              Scope
            </h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">
              Evidence, problems, and suggested tickets for this epic. Run
              discovery first to populate the scope.
            </p>
          </div>
        )}
        {activeTab === "Roadmap" && (
          <div className="text-center">
            <div className="mb-3 text-3xl">🗺️</div>
            <h3 className="mb-2 text-base font-medium text-foreground">
              Roadmap
            </h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">
              Now / Next / Later kanban for this epic&apos;s tickets. Save
              tickets from Scope to see them here.
            </p>
          </div>
        )}
        {activeTab === "Brief" && (
          <div className="text-center">
            <div className="mb-3 text-3xl">📝</div>
            <h3 className="mb-2 text-base font-medium text-foreground">
              Brief
            </h3>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">
              Auto-generated project brief summarizing the problem space,
              proposed solutions, and key metrics for this epic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
