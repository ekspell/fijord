"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { MOCK_MEETING_RECORDS } from "@/lib/mock-data";
import type { Epic, EpicStatus } from "@/lib/mock-epics";

const STATUS_OPTIONS: { value: EpicStatus; label: string }[] = [
  { value: "on-track", label: "On track" },
  { value: "at-risk", label: "At risk" },
  { value: "blocked", label: "Blocked" },
];

export default function CreateEpicModal({
  defaultTitle,
  defaultDescription,
  onClose,
  onCreated,
}: {
  defaultTitle?: string;
  defaultDescription?: string;
  onClose: () => void;
  onCreated?: (epicId: string, epicTitle: string) => void;
}) {
  const router = useRouter();
  const { showToast, demoMode, addEpic } = useNav();
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [description, setDescription] = useState(defaultDescription ?? "");
  const [status, setStatus] = useState<EpicStatus>("on-track");
  const [owner, setOwner] = useState("");
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function toggleMeeting(id: string) {
    setSelectedMeetings((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function handleCreate() {
    if (!title.trim()) return;
    const slug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const initials = owner.trim()
      ? owner.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").join("").slice(0, 2)
      : "ME";

    const newEpic: Epic = {
      id: slug,
      title: title.trim(),
      description: description.trim(),
      status,
      metrics: { tickets: 0, meetings: selectedMeetings.length, quotes: 0 },
      progress: { shipped: 0, total: 0 },
      progressLabel: "No tickets yet",
      owner: { name: owner.trim() || "Me", initials },
      dateLabel: `Started ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    };

    addEpic(newEpic);
    onClose();
    showToast(`Epic "${title}" created`);
    onCreated?.(slug, title);
    router.push(`/epic/${slug}`);
  }

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
          {defaultTitle ? "Create epic from signal" : "Create new epic"}
        </h2>

        {/* Title */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Title <span className="text-accent-red">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Onboarding redesign"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
          />
        </div>

        {/* Description */}
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

        {/* Status + Owner row */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EpicStatus)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent/40 focus:outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
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
        </div>

        {/* Assign meetings — only show when meetings exist */}
        {!demoMode && MOCK_MEETING_RECORDS.length > 0 && (
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Assign meetings <span className="font-normal text-muted">(optional)</span>
            </label>
            <div
              className="flex max-h-36 flex-col gap-1 overflow-y-auto rounded-lg border border-border bg-background p-2"
            >
              {MOCK_MEETING_RECORDS.slice(0, 8).map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent-green-light"
                >
                  <input
                    type="checkbox"
                    checked={selectedMeetings.includes(m.id)}
                    onChange={() => toggleMeeting(m.id)}
                    className="accent-[#3D5A3D]"
                  />
                  <span className="text-sm text-foreground">{m.title}</span>
                  <span className="ml-auto text-xs text-muted">{m.date}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-background"
          >
            Cancel
          </button>
          <button
            disabled={!title.trim()}
            onClick={handleCreate}
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
