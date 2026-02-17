"use client";

import { useState, useEffect } from "react";
import { jiraFetch, JiraCreds, JiraError, JIRA_PRIORITY_MAP, buildJiraDescription } from "@/lib/jira";

export type JiraTicketToSend = {
  id: string;
  title: string;
  priority: "High" | "Med" | "Low";
  description?: string;
  acceptanceCriteria?: string[];
  shareUrl?: string;
};

type CreatedIssue = {
  id: string;
  key: string;
  self: string;
  url: string;
};

export default function JiraSendModal({
  tickets,
  creds,
  onClose,
  onSuccess,
}: {
  tickets: JiraTicketToSend[];
  creds: JiraCreds;
  onClose: () => void;
  onSuccess: (results: CreatedIssue[]) => void;
}) {
  const [projects, setProjects] = useState<{ id: string; key: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [issueTypes, setIssueTypes] = useState<{ id: string; name: string }[]>([]);
  const [selectedIssueTypeId, setSelectedIssueTypeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await jiraFetch("project", "GET", undefined, creds);
        const projectList = (data as { id: string; key: string; name: string }[]).map((p) => ({
          id: p.id,
          key: p.key,
          name: p.name,
        }));
        setProjects(projectList);
        if (projectList.length === 1) setSelectedProjectId(projectList[0].id);
      } catch (err) {
        if (err instanceof JiraError && err.status === 401) {
          setError("Credentials are no longer valid — please reconnect.");
        } else {
          setError("Failed to load projects — check your connection.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [creds]);

  // Fetch issue types when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setIssueTypes([]);
      setSelectedIssueTypeId("");
      return;
    }
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return;

    (async () => {
      try {
        const data = await jiraFetch(
          `issue/createmeta?projectKeys=${project.key}&expand=projects.issuetypes`,
          "GET",
          undefined,
          creds
        );
        const proj = data.projects?.[0];
        if (proj?.issuetypes) {
          const types = (proj.issuetypes as { id: string; name: string; subtask: boolean }[])
            .filter((t) => !t.subtask)
            .map((t) => ({ id: t.id, name: t.name }));
          setIssueTypes(types);
          // Auto-select "Task" or first type
          const taskType = types.find((t) => t.name === "Task");
          setSelectedIssueTypeId(taskType?.id || types[0]?.id || "");
        }
      } catch {
        // Fallback: try the simpler issuetype endpoint
        try {
          const data = await jiraFetch("issuetype", "GET", undefined, creds);
          const types = (data as { id: string; name: string; subtask: boolean }[])
            .filter((t) => !t.subtask)
            .map((t) => ({ id: t.id, name: t.name }));
          setIssueTypes(types);
          const taskType = types.find((t) => t.name === "Task");
          setSelectedIssueTypeId(taskType?.id || types[0]?.id || "");
        } catch {
          setIssueTypes([]);
        }
      }
    })();
  }, [selectedProjectId, projects, creds]);

  const handleSend = async () => {
    if (!selectedProjectId || !selectedIssueTypeId) return;

    setSending(true);
    setError(null);
    setProgress({ sent: 0, total: tickets.length });

    const results: CreatedIssue[] = [];
    const failed: string[] = [];

    for (const ticket of tickets) {
      try {
        const fields: Record<string, unknown> = {
          project: { id: selectedProjectId },
          summary: ticket.title,
          issuetype: { id: selectedIssueTypeId },
          description: buildJiraDescription(ticket.description, ticket.acceptanceCriteria, ticket.shareUrl),
        };

        const priorityName = JIRA_PRIORITY_MAP[ticket.priority];
        if (priorityName) {
          fields.priority = { name: priorityName };
        }

        const data = await jiraFetch("issue", "POST", { fields }, creds);
        if (data.key) {
          results.push({
            id: data.id,
            key: data.key,
            self: data.self,
            url: `https://${creds.domain}/browse/${data.key}`,
          });
        } else {
          failed.push(ticket.id);
        }
      } catch (err) {
        if (err instanceof JiraError && err.status === 403) {
          failed.push(ticket.id);
          if (results.length === 0 && failed.length === 1) {
            setError("You don't have permission to create issues in this project.");
            setSending(false);
            return;
          }
        } else {
          failed.push(ticket.id);
        }
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0052CC]/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0052CC">
              <path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 24V12.518a1.005 1.005 0 00-1.005-1.005z" />
              <path d="M11.575 0H0a5.217 5.217 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 12.487V1.005A1.005 1.005 0 0011.575 0z" opacity=".65" transform="translate(5.714 5.713)" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Send to Jira</h3>
            <p className="text-[13px] text-muted">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} ready to export
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-[#0052CC]" />
            <span className="text-sm text-muted">Loading projects...</span>
          </div>
        ) : (
          <>
            {/* Project select */}
            <div className="mb-3">
              <label className="mb-1.5 block text-[13px] font-medium text-foreground">Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-[#0052CC]/40 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/10"
              >
                <option value="">Select a project...</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.key} — {proj.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue type select */}
            {selectedProjectId && issueTypes.length > 0 && (
              <div className="mb-3">
                <label className="mb-1.5 block text-[13px] font-medium text-foreground">Issue type</label>
                <select
                  value={selectedIssueTypeId}
                  onChange={(e) => setSelectedIssueTypeId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-[#0052CC]/40 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/10"
                >
                  {issueTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
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
            disabled={!selectedProjectId || !selectedIssueTypeId || sending || loading}
            className="flex items-center gap-2 rounded-lg bg-[#0052CC] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0052CC]/90 disabled:cursor-not-allowed disabled:opacity-40"
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
