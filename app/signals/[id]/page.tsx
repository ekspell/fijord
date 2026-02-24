"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { MOCK_SIGNALS, SIGNAL_STATUS_STYLES } from "@/lib/mock-data";
import type { Quote } from "@/lib/mock-data";

/* ─── Create Epic Modal ─── */

function CreateEpicModal({
  defaultTitle,
  onClose,
  onCreate,
}: {
  defaultTitle: string;
  onClose: () => void;
  onCreate: (title: string) => void;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-medium text-foreground">
          Create epic from signal
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
            onClick={() => onCreate(title)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "#3D5A3D" }}
          >
            Create epic
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Meeting Group ─── */

function MeetingGroup({
  meetingId,
  meetingTitle,
  meetingDate,
  quotes,
  signalColor,
  defaultOpen,
}: {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  quotes: Quote[];
  signalColor: string;
  defaultOpen: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Meeting header */}
      <div
        onClick={() => setOpen(!open)}
        className="flex cursor-pointer items-center gap-2.5 border border-border bg-card transition-colors hover:bg-accent-green-light"
        style={{
          padding: "12px 16px",
          borderRadius: open ? "10px 10px 0 0" : 10,
        }}
      >
        {/* Calendar icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-muted"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>

        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-muted transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>

        <span
          className="flex-1 font-medium text-foreground"
          style={{ fontSize: 14 }}
        >
          {meetingTitle}
        </span>
        <span className="text-muted" style={{ fontSize: 12 }}>
          {meetingDate}
        </span>
        <span
          className="rounded text-muted"
          style={{
            fontSize: 12,
            padding: "2px 8px",
            background: "#FAF9F6",
          }}
        >
          {quotes.length} {quotes.length === 1 ? "quote" : "quotes"}
        </span>
      </div>

      {/* Quotes */}
      {open && (
        <div
          className="border border-t-0 border-border"
          style={{ borderRadius: "0 0 10px 10px" }}
        >
          {quotes.map((quote, i) => (
            <div
              key={i}
              className="bg-card"
              style={{
                padding: "16px 20px",
                borderBottom:
                  i < quotes.length - 1 ? "1px solid var(--color-border)" : "none",
              }}
            >
              <p
                className="leading-relaxed text-foreground"
                style={{
                  fontSize: 14,
                  marginBottom: 10,
                  paddingLeft: 12,
                  borderLeft: `3px solid ${signalColor}`,
                }}
              >
                &ldquo;{quote.text}&rdquo;
              </p>
              <div
                className="flex gap-3"
                style={{ fontSize: 12, color: "var(--color-muted)" }}
              >
                <span
                  className="font-medium"
                  style={{ color: "var(--color-foreground-secondary, #6B6B6B)" }}
                >
                  {quote.speaker}
                </span>
                <span>{quote.timestamp}</span>
              </div>
            </div>
          ))}

          {/* Navigate to meeting link */}
          <button
            onClick={() => router.push(`/meeting/${meetingId}`)}
            className="w-full bg-card text-left text-muted transition-colors hover:text-foreground"
            style={{
              padding: "10px 20px",
              fontSize: 12,
              borderTop: "1px solid var(--color-border)",
              borderRadius: "0 0 10px 10px",
            }}
          >
            View full meeting →
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Signal Detail Page ─── */

export default function SignalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useNav();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tags, setTags] = useState<string[] | null>(null);
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");

  const signal = MOCK_SIGNALS.find((s) => s.id === id);

  if (!signal) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <h1 className="mb-2 text-xl font-medium text-foreground">
          Signal not found
        </h1>
        <p className="mb-6 text-sm text-muted">
          The signal you&apos;re looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/signals")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          style={{ background: "#3D5A3D" }}
        >
          Back to Signals
        </button>
      </div>
    );
  }

  const status = SIGNAL_STATUS_STYLES[signal.status];
  const activeTags = tags ?? signal.tags;
  const quotes = signal.quotes ?? [];
  const timeline = signal.timeline ?? [];

  // Group quotes by meeting
  const meetingGroups: {
    meetingId: string;
    meetingTitle: string;
    meetingDate: string;
    quotes: Quote[];
  }[] = [];
  for (const quote of quotes) {
    const existing = meetingGroups.find(
      (g) => g.meetingId === quote.meetingId
    );
    if (existing) {
      existing.quotes.push(quote);
    } else {
      meetingGroups.push({
        meetingId: quote.meetingId,
        meetingTitle: quote.meetingTitle,
        meetingDate: quote.meetingDate,
        quotes: [quote],
      });
    }
  }

  function removeTag(tag: string) {
    setTags(activeTags.filter((t) => t !== tag));
  }

  function addTag() {
    const trimmed = newTag.trim();
    if (trimmed && !activeTags.includes(trimmed)) {
      setTags([...activeTags, trimmed]);
    }
    setNewTag("");
    setAddingTag(false);
  }

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
          onClick={() => router.push("/signals")}
          className="hover:text-foreground"
        >
          Signals
        </button>
        {" › "}
        <span className="text-accent">{signal.title}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  background: signal.color,
                }}
              />
              <h1 className="font-medium" style={{ fontSize: 26 }}>
                {signal.title}
              </h1>
              <span
                className="rounded-md font-medium"
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  background: status.bg,
                  color: status.text,
                }}
              >
                {status.label}
              </span>
            </div>
          </div>

          {signal.status !== "project" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ background: "#3D5A3D" }}
            >
              + Create Epic
            </button>
          )}
          {signal.status === "project" && signal.epicId && (
            <button
              onClick={() => router.push(`/epic/${signal.epicId}`)}
              className="flex shrink-0 items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ background: "#3D5A3D" }}
            >
              Open epic →
            </button>
          )}
        </div>

        {/* Strength bar */}
        <div className="flex items-center">
          <div
            className="overflow-hidden rounded-full bg-border"
            style={{ height: 8, width: 300 }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${signal.strength}%`,
                background: signal.color,
              }}
            />
          </div>
          <span className="text-muted" style={{ fontSize: 13, marginLeft: 12 }}>
            <span className="font-medium text-foreground">
              {signal.strength}%
            </span>{" "}
            signal strength
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="flex gap-6 rounded-xl border border-border bg-card"
        style={{ padding: "16px 20px", marginBottom: 32 }}
      >
        <div className="flex items-center gap-2" style={{ fontSize: 14 }}>
          <span className="font-medium text-foreground">
            {signal.meetingCount}
          </span>
          <span className="text-muted">meetings</span>
        </div>
        <div className="flex items-center gap-2" style={{ fontSize: 14 }}>
          <span className="font-medium text-foreground">
            {signal.quoteCount}
          </span>
          <span className="text-muted">quotes</span>
        </div>
        {signal.firstDetected && (
          <div className="flex items-center gap-2" style={{ fontSize: 14 }}>
            <span className="font-medium text-foreground">First detected:</span>
            <span className="text-muted">{signal.firstDetected}</span>
          </div>
        )}
      </div>

      {/* Related topics */}
      <h2 className="font-medium" style={{ fontSize: 16, marginBottom: 12 }}>
        Related topics
      </h2>
      <div
        className="flex flex-wrap gap-2"
        style={{ marginBottom: 32 }}
      >
        {activeTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-muted"
            style={{ fontSize: 13, padding: "6px 12px" }}
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-muted transition-colors hover:text-foreground"
              style={{ fontSize: 11, marginLeft: 2 }}
            >
              ✕
            </button>
          </span>
        ))}

        {addingTag ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTag();
            }}
            className="inline-flex"
          >
            <input
              autoFocus
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onBlur={addTag}
              placeholder="tag name"
              className="rounded-md border border-accent bg-card px-2 py-1.5 text-foreground outline-none"
              style={{ fontSize: 13, width: 100 }}
            />
          </form>
        ) : (
          <button
            onClick={() => setAddingTag(true)}
            className="rounded-md border border-dashed border-border text-muted transition-colors hover:border-accent hover:text-accent"
            style={{ fontSize: 13, padding: "6px 12px" }}
          >
            + Add tag
          </button>
        )}
      </div>

      {/* Evidence */}
      <div style={{ marginBottom: 32 }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium" style={{ fontSize: 16 }}>
            Evidence
          </h2>
          <span className="text-muted" style={{ fontSize: 13 }}>
            {signal.quoteCount} quotes from {signal.meetingCount} meetings
          </span>
        </div>

        {quotes.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
            <p className="text-sm text-muted">
              No evidence collected yet. Process meetings to gather quotes.
            </p>
          </div>
        ) : (
          meetingGroups.map((group, i) => (
            <MeetingGroup
              key={group.meetingId}
              meetingId={group.meetingId}
              meetingTitle={group.meetingTitle}
              meetingDate={group.meetingDate}
              quotes={group.quotes}
              signalColor={signal.color}
              defaultOpen={i === 0}
            />
          ))
        )}
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <>
          <h2 className="font-medium" style={{ fontSize: 16, marginBottom: 12 }}>
            Timeline
          </h2>
          <div className="relative" style={{ paddingLeft: 24 }}>
            {/* Vertical line */}
            <div
              className="absolute bg-border"
              style={{
                left: 7,
                top: 8,
                bottom: 8,
                width: 2,
              }}
            />

            {timeline.map((event, i) => (
              <div
                key={i}
                className="relative"
                style={{ paddingBottom: i < timeline.length - 1 ? 20 : 0 }}
              >
                {/* Dot */}
                <div
                  className="absolute rounded-full"
                  style={{
                    left: -20,
                    top: 4,
                    width: 10,
                    height: 10,
                    background: signal.color,
                  }}
                />
                <div className="text-muted" style={{ fontSize: 14 }}>
                  <span className="font-medium text-foreground">
                    {event.label}
                  </span>
                  : {event.description}
                </div>
                <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
                  {event.date}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create Epic Modal */}
      {showCreateModal && (
        <CreateEpicModal
          defaultTitle={signal.title}
          onClose={() => setShowCreateModal(false)}
          onCreate={(epicTitle) => {
            setShowCreateModal(false);
            showToast(`Epic "${epicTitle}" created`);
          }}
        />
      )}
    </div>
  );
}
