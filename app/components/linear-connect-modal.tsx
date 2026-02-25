"use client";

import { useEffect, useState } from "react";
import { linearFetch, LINEAR_QUERIES, LinearError } from "@/lib/linear";

export default function LinearConnectModal({
  onClose,
  onConnected,
}: {
  onClose: () => void;
  onConnected: (apiKey: string) => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleConnect = async () => {
    const key = apiKey.trim();
    if (!key) return;

    setValidating(true);
    setError(null);

    try {
      const data = await linearFetch(LINEAR_QUERIES.teams, undefined, key);
      if (data.data?.teams?.nodes?.length > 0) {
        onConnected(key);
      } else {
        setError("No teams found — check that your API key has the right permissions.");
      }
    } catch (err) {
      if (err instanceof LinearError) {
        if (err.status === 401) {
          setError("Invalid API key — check that you copied it correctly.");
        } else if (err.status === 429) {
          setError("Rate limited — please wait a moment and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Could not reach Linear — check your connection and try again.");
      }
    } finally {
      setValidating(false);
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
            <h3 className="text-sm font-semibold text-foreground">Connect Linear</h3>
            <p className="text-[13px] text-muted">Export tickets directly to your workspace</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4 rounded-lg bg-background p-3 text-[13px] text-muted">
          <p className="mb-1 font-medium text-foreground">Where to find your API key:</p>
          <ol className="list-inside list-decimal space-y-0.5">
            <li>Open <strong>linear.app</strong></li>
            <li>Go to <strong>Settings &rarr; API &rarr; Personal API keys</strong></li>
            <li>Create a new key and paste it below</li>
          </ol>
        </div>

        {/* Input */}
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConnect()}
          placeholder="lin_api_..."
          className="mb-3 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-[#5E6AD2]/40 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2]/10"
          autoFocus
        />

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
            disabled={!apiKey.trim() || validating}
            className="flex items-center gap-2 rounded-lg bg-[#5E6AD2] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#5E6AD2]/90 disabled:cursor-not-allowed disabled:opacity-40"
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
