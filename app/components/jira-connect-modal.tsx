"use client";

import { useState } from "react";
import { jiraFetch, JiraCreds, JiraError } from "@/lib/jira";

export default function JiraConnectModal({
  onClose,
  onConnected,
}: {
  onClose: () => void;
  onConnected: (creds: JiraCreds) => void;
}) {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanDomain = (raw: string) =>
    raw.trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")         // strip any path after domain
      .replace(/\s/g, "")           // strip whitespace
      .toLowerCase();

  const handleConnect = async () => {
    const d = cleanDomain(domain);
    const e = email.trim();
    const t = apiToken.trim();
    if (!d || !e || !t) return;

    if (!d.includes(".")) {
      setError("Domain should look like yourcompany.atlassian.net");
      return;
    }

    setValidating(true);
    setError(null);

    const creds: JiraCreds = { domain: d, email: e, apiToken: t };

    try {
      const data = await jiraFetch("myself", "GET", undefined, creds);
      if (data.accountId) {
        onConnected(creds);
      } else if (data.errorMessage) {
        setError(`Jira responded: ${data.errorMessage}. Check that "${d}" is your correct Jira domain.`);
      } else {
        setError("Could not verify your account — check your credentials.");
      }
    } catch (err) {
      if (err instanceof JiraError) {
        if (err.status === 401) {
          setError("Invalid credentials — check your email and API token.");
        } else if (err.status === 429) {
          setError("Rate limited — please wait a moment and try again.");
        } else if (err.message.includes("Site temporarily unavailable")) {
          setError(`Could not reach "${d}" — double-check your Jira domain.`);
        } else {
          setError(err.message);
        }
      } else {
        setError("Could not reach Jira — check your connection and domain.");
      }
    } finally {
      setValidating(false);
    }
  };

  const canSubmit = domain.trim() && email.trim() && apiToken.trim() && !validating;

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
            <h3 className="text-sm font-semibold text-foreground">Connect Jira</h3>
            <p className="text-[13px] text-muted">Export tickets directly to your Jira workspace</p>
          </div>
        </div>

        {/* Domain input */}
        <div className="mb-3">
          <label className="mb-1.5 block text-[13px] font-medium text-foreground">Jira domain</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => {
              // Extract just the domain from whatever the user types or pastes
              const v = e.target.value
                .replace(/^https?:\/\//, "")
                .replace(/\/.*$/, "")
                .trim();
              setDomain(v);
            }}
            placeholder="yourcompany.atlassian.net"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-[#0052CC]/40 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/10"
            autoFocus
          />
          <p className="mt-1 text-[11px] text-muted">Open Jira in your browser and copy the URL — it looks like yourcompany.atlassian.net</p>
        </div>

        {/* Email input */}
        <div className="mb-3">
          <label className="mb-1.5 block text-[13px] font-medium text-foreground">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-[#0052CC]/40 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/10"
          />
          <p className="mt-1 text-[11px] text-muted">The email address associated with your Atlassian account</p>
        </div>

        {/* API token input */}
        <div className="mb-3">
          <label className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-foreground">
            API token
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal text-[#0052CC] hover:underline"
            >
              Create API token &rarr;
            </a>
          </label>
          <input
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && handleConnect()}
            placeholder="Paste your API token..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-[#0052CC]/40 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/10"
          />
          <p className="mt-1 text-[11px] text-muted">Generate a token from your Atlassian account security settings</p>
        </div>

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
            className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!canSubmit}
            className="flex items-center gap-2 rounded-lg bg-[#0052CC] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0052CC]/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {validating && (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {validating ? "Validating..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
