"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_EPICS, STATUS_STYLES } from "@/lib/mock-epics";
import type { Epic } from "@/lib/mock-epics";

function EpicCard({ epic }: { epic: Epic }) {
  const router = useRouter();
  const status = STATUS_STYLES[epic.status];
  const progressPercent =
    epic.progress.total > 0
      ? Math.round((epic.progress.shipped / epic.progress.total) * 100)
      : 0;

  return (
    <div
      onClick={() => router.push(`/epic/${epic.id}`)}
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
      <div className="mb-3 flex gap-4">
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

function CreateEpicModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");

  return (
    <div
      className="backdrop-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-medium text-foreground">
          Create new epic
        </h2>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Onboarding redesign"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What problem does this epic address?"
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Owner
          </label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="e.g. Kate S."
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-background"
          >
            Cancel
          </button>
          <button
            disabled={!title.trim()}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create epic
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EpicsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="mx-auto" style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
        <span className="cursor-pointer hover:text-foreground">Home</span>
        {" › "}
        <span className="text-accent">Epics</span>
      </div>

      {/* Header */}
      <h1
        className="mb-1.5 text-foreground"
        style={{
          fontSize: 48,
          letterSpacing: "-1px",
          lineHeight: "74.4px",
          fontWeight: 300,
        }}
      >
        Epics
      </h1>
      <p className="mb-8 text-muted" style={{ fontSize: 15 }}>
        Your active projects and initiatives. Click into an epic to see
        discovery, scope, and roadmap.
      </p>

      {/* Epic cards */}
      <div className="flex flex-col gap-3">
        {MOCK_EPICS.map((epic) => (
          <EpicCard key={epic.id} epic={epic} />
        ))}

        {/* Create new */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border font-medium text-muted transition-all hover:border-accent hover:bg-accent-green-light hover:text-accent"
          style={{ padding: 28, fontSize: 14 }}
        >
          + Create new epic
        </div>
      </div>

      {showCreateModal && (
        <CreateEpicModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
