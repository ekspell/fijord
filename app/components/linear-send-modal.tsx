"use client";

import { useState, useEffect } from "react";
import {
  linearFetch,
  LINEAR_QUERIES,
  LinearError,
  PRIORITY_MAP,
  buildIssueDescription,
} from "@/lib/linear";

export type TicketToSend = {
  id: string;
  title: string;
  priority: "High" | "Med" | "Low";
  description?: string;
  acceptanceCriteria?: string[];
  shareUrl?: string;
};

type CreatedIssue = {
  id: string;
  identifier: string;
  url: string;
  title: string;
};

export default function LinearSendModal({
  tickets,
  apiKey,
  onClose,
  onSuccess,
}: {
  tickets: TicketToSend[];
  apiKey: string;
  onClose: () => void;
  onSuccess: (results: CreatedIssue[]) => void;
}) {
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Fetch teams on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await linearFetch(LINEAR_QUERIES.teams, undefined, apiKey);
        const nodes = data.data?.teams?.nodes || [];
        setTeams(nodes);
        if (nodes.length === 1) setSelectedTeamId(nodes[0].id);
      } catch (err) {
        if (err instanceof LinearError && err.status === 401) {
          setError("API key is no longer valid — please reconnect.");
        } else {
          setError("Failed to load teams — check your connection.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [apiKey]);

  // Fetch projects when team changes
  useEffect(() => {
    if (!selectedTeamId) {
      setProjects([]);
      setSelectedProjectId("");
      return;
    }
    (async () => {
      try {
        const data = await linearFetch(
          LINEAR_QUERIES.teamProjects,
          { teamId: selectedTeamId },
          apiKey
        );
        setProjects(data.data?.team?.projects?.nodes || []);
      } catch {
        setProjects([]);
      }
    })();
  }, [selectedTeamId, apiKey]);

  const handleSend = async () => {
    if (!selectedTeamId) return;

    setSending(true);
    setError(null);
    setProgress({ sent: 0, total: tickets.length });

    const results: CreatedIssue[] = [];
    const failed: string[] = [];

    for (const ticket of tickets) {
      try {
        const input: Record<string, unknown> = {
          teamId: selectedTeamId,
          title: ticket.title,
          description: buildIssueDescription(ticket.description, ticket.acceptanceCriteria, ticket.shareUrl),
          priority: PRIORITY_MAP[ticket.priority] ?? 3,
        };
        if (selectedProjectId) {
          input.projectId = selectedProjectId;
        }

        const data = await linearFetch(LINEAR_QUERIES.createIssue, { input }, apiKey);
        if (data.data?.issueCreate?.success) {
          results.push(data.data.issueCreate.issue);
        } else {
          failed.push(ticket.id);
        }
      } catch {
        failed.push(ticket.id);
      }
      setProgress({ sent: results.length + failed.length, total: tickets.length });
    }

    setSending(false);

    if (failed.length > 0 && results.length === 0) {
      setError("Failed to create issues — check your permissions and try again.");
    } else if (failed.length > 0) {
      setError(`${results.length} of ${tickets.length} tickets sent — ${failed.length} failed.`);
    } else {
      onSuccess(results);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-fade-in" onClick={onClose}>
      <div className="fixed inset-0 bg-black/20" />
      <div
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5E6AD2]/10">
            <svg width="20" height="20" viewBox="0 0 100 100" fill="#5E6AD2">
              <path d="M3.35 55.2a3.05 3.05 0 010-4.31L46.9 7.34a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L22.52 55.24a3.05 3.05 0 01-4.31 0L3.35 55.2zm17.76 17.76a3.05 3.05 0 010-4.31L57.25 32.51a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31l-36.14 36.14a3.05 3.05 0 01-4.31 0l-7.45-7.45zm41.38 23.69a3.05 3.05 0 01-4.31 0l-7.45-7.45a3.05 3.05 0 010-4.31l36.14-36.14a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L62.49 96.65z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Send to Linear</h3>
            <p className="text-[13px] text-muted">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} ready to export
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-[#5E6AD2]" />
            <span className="text-sm text-muted">Loading teams...</span>
          </div>
        ) : (
          <>
            {/* Team select */}
            <div className="mb-3">
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">Team</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-[#5E6AD2]/40 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/10"
              >
                <option value="">Select a team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project select (optional) */}
            {selectedTeamId && projects.length > 0 && (
              <div className="mb-3">
                <label className="mb-1.5 block text-[13px] font-medium text-foreground">
                  Project <span className="font-normal text-muted">(optional)</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-[#5E6AD2]/40 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/10"
                >
                  <option value="">No project</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ticket preview */}
            <div className="mb-4 max-h-[200px] overflow-y-auto rounded-lg border border-border bg-background p-3">
              {tickets.map((t) => (
                <div key={t.id} className="flex items-center gap-2 py-1.5">
                  <span className="text-[11px] font-semibold text-muted">{t.id}</span>
                  <span className="truncate text-[13px] text-foreground">{t.title}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="mb-3 flex items-start gap-2 text-[13px] text-red-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={sending}
            className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedTeamId || sending || loading}
            className="flex items-center gap-2 rounded-lg bg-[#5E6AD2] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#5E6AD2]/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending && (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {sending
              ? `Sending ${progress.sent} of ${progress.total}...`
              : `Send ${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
