"use client";

import { useState } from "react";
import { firefliesFetch, FIREFLIES_QUERIES, FirefliesError } from "@/lib/fireflies";

export default function FirefliesConnectModal({
  onClose,
  onConnected,
}: {
  onClose: () => void;
  onConnected: (apiKey: string) => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    const key = apiKey.trim();
    if (!key) return;

    setValidating(true);
    setError(null);

    try {
      const data = await firefliesFetch(FIREFLIES_QUERIES.user, undefined, key);
      if (data.data?.user) {
        onConnected(key);
      } else {
        setError("Could not verify your account — check your API key.");
      }
    } catch (err) {
      if (err instanceof FirefliesError) {
        if (err.status === 401) {
          setError("Invalid API key — check that you copied it correctly.");
        } else if (err.status === 429) {
          setError("Rate limited — please wait a moment and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Could not reach Fireflies — check your connection and try again.");
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9333EA]/10 text-sm font-semibold text-[#9333EA]">
            F
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Connect Fireflies.ai</h3>
            <p className="text-[13px] text-muted">Import meeting transcripts automatically</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4 rounded-lg bg-background p-3 text-[13px] text-muted">
          <p className="mb-1 font-medium text-foreground">Where to find your API key:</p>
          <ol className="list-inside list-decimal space-y-0.5">
            <li>Open <strong>app.fireflies.ai</strong></li>
            <li>Go to <strong>Settings &rarr; Integrations &rarr; Fireflies API</strong></li>
            <li>Copy your API key and paste it below</li>
          </ol>
        </div>

        {/* Input */}
        <div className="mb-3">
          <label className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-foreground">
            API key
            <a
              href="https://app.fireflies.ai/integrations/custom/fireflies"
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal text-[#9333EA] hover:underline"
            >
              Get API key &rarr;
            </a>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apiKey.trim() && !validating && handleConnect()}
            placeholder="Paste your Fireflies API key..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-[#9333EA]/40 focus:outline-none focus:ring-2 focus:ring-[#9333EA]/10"
            autoFocus
          />
          <p className="mt-1 text-[11px] text-muted">Your API key stays in your browser and is never stored on our servers</p>
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
            disabled={!apiKey.trim() || validating}
            className="flex items-center gap-2 rounded-lg bg-[#9333EA] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#9333EA]/90 disabled:cursor-not-allowed disabled:opacity-40"
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
