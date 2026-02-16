"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Results from "./results";
import Roadmap from "./roadmap";
import { useNav } from "./nav-context";
import { ProblemsResult, solutionResult } from "@/lib/types";
import { firefliesFetch, FIREFLIES_QUERIES, formatTranscript, FirefliesTranscript, FirefliesError } from "@/lib/fireflies";
import FirefliesConnectModal from "./components/fireflies-connect-modal";

type Step = {
  title: string;
  detail: string;
  status: "done" | "active" | "pending";
};

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const BoltIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const STEP_ICONS = [SearchIcon, SearchIcon, BoltIcon, ClipboardIcon];

export default function Discovery() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [localTranscript, setLocalTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTime = useRef<number>(0);

  const [showFirefliesConnect, setShowFirefliesConnect] = useState(false);
  const [firefliesTranscripts, setFirefliesTranscripts] = useState<FirefliesTranscript[]>([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(false);
  const [fetchingTranscriptId, setFetchingTranscriptId] = useState<string | null>(null);

  const {
    activeTab,
    setActiveTab,
    result,
    setResult,
    solutions,
    setSolutions,
    setTranscript,
    setProcessingTime,
    roadmap,
    showToast,
    firefliesApiKey,
    setFirefliesApiKey,
  } = useNav();

  const [steps, setSteps] = useState<Step[]>([
    { title: "Reading transcript", detail: "Parsing input...", status: "pending" },
    { title: "Detecting problems", detail: "Finding pain points...", status: "pending" },
    { title: "Designing solutions", detail: "Connecting problems to fixes...", status: "pending" },
    { title: "Writing tickets", detail: "Structuring work items...", status: "pending" },
  ]);

  const updateStep = (index: number, status: Step["status"], detail?: string) => {
    setSteps((prev) =>
      prev.map((s, i) => {
        if (i < index) return { ...s, status: "done" };
        if (i === index) return { ...s, status, detail: detail || s.detail };
        return s;
      })
    );
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleProcess = async () => {
    if (!localTranscript.trim()) return;
    setIsProcessing(true);
    setError(null);
    startTime.current = Date.now();

    try {
      updateStep(0, "active", "Parsing input...");

      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: localTranscript }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Processing failed");
      }

      const problemsData: ProblemsResult = await res.json();

      updateStep(1, "active", `Found ${problemsData.problems.length} problems`);
      updateStep(2, "active", `Generating for ${problemsData.problems.length} problems...`);

      const solutionPromises = problemsData.problems.map((problem) =>
        fetch("/api/generate-solution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: localTranscript, problem }),
        }).then(async (r) => {
          if (!r.ok) throw new Error("Failed to generate solution");
          return r.json() as Promise<solutionResult>;
        })
      );

      const solutionResults = await Promise.all(solutionPromises);

      // Assign sequential IDs, continuing from the highest existing roadmap ticket
      const maxExisting = roadmap.reduce((max, t) => {
        const match = t.id.match(/^FJD-(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 100);
      let ticketNum = maxExisting + 1;
      solutionResults.forEach((sol) => {
        sol.workItems.forEach((item) => {
          item.id = `FJD-${ticketNum++}`;
        });
      });

      const totalTickets = solutionResults.reduce((sum, s) => sum + s.workItems.length, 0);
      updateStep(3, "done", `${totalTickets} tickets created`);

      const elapsed = ((Date.now() - startTime.current) / 1000).toFixed(1);

      // Store in shared context
      setResult(problemsData);
      setSolutions(solutionResults);
      setTranscript(localTranscript);
      setProcessingTime(elapsed);
      setActiveTab("Scope");
      setIsProcessing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsProcessing(false);
      setSteps([
        { title: "Reading transcript", detail: "Parsing input...", status: "pending" },
        { title: "Detecting problems", detail: "Finding pain points...", status: "pending" },
        { title: "Generating solutions", detail: "Creating solutions...", status: "pending" },
        { title: "Writing tickets", detail: "Structuring work items...", status: "pending" },
      ]);
    }
  };

  // Load Fireflies transcripts when connected
  const loadFirefliesTranscripts = useCallback(async () => {
    if (!firefliesApiKey) return;
    setLoadingTranscripts(true);
    try {
      const data = await firefliesFetch(FIREFLIES_QUERIES.transcripts, undefined, firefliesApiKey);
      const transcripts = data.data?.transcripts || [];
      setFirefliesTranscripts(transcripts.slice(0, 5));
    } catch {
      // Silently fail — user can still paste manually
    } finally {
      setLoadingTranscripts(false);
    }
  }, [firefliesApiKey]);

  useEffect(() => {
    if (firefliesApiKey) loadFirefliesTranscripts();
  }, [firefliesApiKey, loadFirefliesTranscripts]);

  const handleFirefliesConnect = (key: string) => {
    setFirefliesApiKey(key);
    setShowFirefliesConnect(false);
    showToast("Fireflies connected — select a transcript to import");
  };

  const handleSelectTranscript = async (transcript: FirefliesTranscript) => {
    if (!firefliesApiKey) return;
    setFetchingTranscriptId(transcript.id);
    try {
      const data = await firefliesFetch(
        FIREFLIES_QUERIES.transcript,
        { id: transcript.id },
        firefliesApiKey
      );
      const sentences = data.data?.transcript?.sentences || [];
      if (sentences.length === 0) {
        showToast("No transcript content found for this meeting");
        return;
      }
      const formatted = formatTranscript(sentences);
      setLocalTranscript(formatted);
      showToast(`Imported "${transcript.title}" — click Process to continue`);
    } catch (err) {
      if (err instanceof FirefliesError) {
        showToast(err.message);
      } else {
        showToast("Failed to load transcript — try again");
      }
    } finally {
      setFetchingTranscriptId(null);
    }
  };

  // Tab-based rendering
  if (activeTab === "Scope" && result) {
    return <Results />;
  }

  if (activeTab === "Roadmap") {
    return <Roadmap />;
  }

  if (isProcessing) {
    return (
      <div className="flex min-h-[80vh] flex-col">
        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md text-center">
            <div className="relative mx-auto mb-8 h-20 w-20">
              <div className="h-20 w-20 animate-spin rounded-full border-[3px] border-border border-t-accent" />
              <svg
                className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-accent"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>

            <h1 className="mb-3 text-2xl font-medium text-foreground">
              Analyzing transcript...
            </h1>
            <p className="mb-12 text-[15px] leading-relaxed text-muted">
              Extracting problems, generating solutions, and writing
              tickets. This usually takes 10&ndash;20 seconds.
            </p>

            <div className="rounded-xl border border-border bg-card p-6 text-left">
              {steps.map((step, i) => {
                const Icon = STEP_ICONS[i];
                return (
                  <div
                    key={step.title}
                    className={`flex items-start gap-4 py-3 ${
                      i < steps.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        step.status === "done"
                          ? "bg-accent text-white"
                          : step.status === "active"
                            ? "animate-pulse bg-accent/15 text-accent"
                            : "bg-border text-muted/70"
                      }`}
                    >
                      {step.status === "done" ? <CheckIcon /> : <Icon />}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          step.status === "pending" ? "text-muted/70" : "text-foreground"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p
                        className={`text-[13px] ${
                          step.status === "pending" ? "text-muted/50" : "text-muted"
                        }`}
                      >
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px]" style={{ paddingTop: 80 }}>
      <div className="mb-2">
        <h1
          className="text-foreground"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '48px',
            letterSpacing: '-1px',
            lineHeight: '74.4px',
            fontWeight: 300,
          }}
        >
          Process a Transcript
        </h1>
        <p className="mt-2 text-sm text-muted">
          Record a meeting or upload a transcript to extract issues, evidence,
          and suggested work.
        </p>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <div className="w-full">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <textarea
            value={localTranscript}
            onChange={(e) => setLocalTranscript(e.target.value)}
            placeholder="Paste a meeting transcript here..."
            className="h-40 w-full resize-none rounded-xl border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted/60 focus:border-accent/40 focus:outline-none"
          />
          <button
            onClick={handleProcess}
            disabled={!localTranscript.trim()}
            className="mt-3 w-full rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Process transcript
          </button>
        </div>

        <div className="my-8 flex w-full items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">or import from</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Integration cards */}
        <div className="flex w-full flex-col gap-2.5">
          <button
            onClick={() => showToast("Granola integration — coming soon")}
            className="flex w-full items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-all hover:border-border/80 hover:bg-[#F9F8F6]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold" style={{ backgroundColor: "#FFF8E7", color: "#B8860B" }}>
              G
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Granola</p>
              <p className="text-[12px] text-muted">Connect to import transcripts</p>
            </div>
            <span className="text-[12px] font-medium text-muted">
              Connect <span className="ml-0.5">&rarr;</span>
            </span>
          </button>

          <button
            onClick={() => showToast("Otter.ai integration — coming soon")}
            className="flex w-full items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-all hover:border-border/80 hover:bg-[#F9F8F6]"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold" style={{ backgroundColor: "#E8F4FC", color: "#1E88E5" }}>
              O
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Otter.ai</p>
              <p className="text-[12px] text-muted">Connect to import transcripts</p>
            </div>
            <span className="text-[12px] font-medium text-muted">
              Connect <span className="ml-0.5">&rarr;</span>
            </span>
          </button>

          {firefliesApiKey ? (
            <>
              <button
                onClick={loadFirefliesTranscripts}
                className="flex w-full items-center gap-3.5 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3.5 text-left transition-all hover:bg-accent/10"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold" style={{ backgroundColor: "#F3E8FF", color: "#9333EA" }}>
                  F
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Fireflies.ai</p>
                  <p className="text-[12px] text-muted">Import your recent meetings</p>
                </div>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Connected
                </span>
              </button>

              {/* Recent transcripts */}
              <div className="ml-[50px] rounded-lg border border-border bg-card px-4 py-3">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Recent from Fireflies</p>
                {loadingTranscripts ? (
                  <div className="flex items-center gap-2 py-2 text-[13px] text-muted">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted/30 border-t-muted" />
                    Loading transcripts...
                  </div>
                ) : firefliesTranscripts.length === 0 ? (
                  <p className="py-2 text-[13px] text-muted">No recent transcripts found</p>
                ) : (
                  firefliesTranscripts.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTranscript(t)}
                      disabled={fetchingTranscriptId !== null}
                      className="flex w-full items-center justify-between border-b border-border py-2 text-left last:border-b-0 hover:text-accent disabled:opacity-50"
                    >
                      <span className="text-[13px] font-medium">
                        {fetchingTranscriptId === t.id ? (
                          <span className="flex items-center gap-2 text-muted">
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted/30 border-t-muted" />
                            Importing...
                          </span>
                        ) : (
                          t.title || "Untitled meeting"
                        )}
                      </span>
                      <span className="text-[12px] text-muted">
                        {t.date ? new Date(parseInt(t.date)).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowFirefliesConnect(true)}
              className="flex w-full items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5 text-left transition-all hover:border-border/80 hover:bg-[#F9F8F6]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold" style={{ backgroundColor: "#F3E8FF", color: "#9333EA" }}>
                F
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Fireflies.ai</p>
                <p className="text-[12px] text-muted">Connect to import transcripts</p>
              </div>
              <span className="text-[12px] font-medium text-muted">
                Connect <span className="ml-0.5">&rarr;</span>
              </span>
            </button>
          )}
        </div>

        {/* Tip box */}
        <div className="mt-8 flex w-full items-start gap-2.5 rounded-xl bg-accent/5 px-4 py-3.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-accent">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p className="text-[13px] leading-relaxed text-accent">
            Don&apos;t have a transcript tool? No problem — just paste any text from your notes, Google Docs, or email thread.
          </p>
        </div>
      </div>

      {/* Fireflies connect modal */}
      {showFirefliesConnect && (
        <FirefliesConnectModal
          onClose={() => setShowFirefliesConnect(false)}
          onConnected={handleFirefliesConnect}
        />
      )}
    </div>
  );
}
