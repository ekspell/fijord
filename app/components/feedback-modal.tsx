"use client";

import { useState, useEffect, useCallback } from "react";

type Reaction = "useful" | "meh" | "confusing";
type Step = "emoji" | "questions" | "submitting";

const FEEDBACK_PROMPTED_KEY = "fjord-feedback-prompted";

const REACTIONS: { key: Reaction; emoji: string; label: string }[] = [
  { key: "useful", emoji: "\u{1F60D}", label: "Useful" },
  { key: "meh", emoji: "\u{1F610}", label: "Meh" },
  { key: "confusing", emoji: "\u{1F615}", label: "Confusing" },
];

/* ─── Feedback Modal ─────────────────────────────────────── */

function FeedbackModal({
  onClose,
  onSubmitted,
  initialReaction,
}: {
  onClose: () => void;
  onSubmitted: () => void;
  initialReaction?: Reaction;
}) {
  const [step, setStep] = useState<Step>(initialReaction ? "questions" : "emoji");
  const [reaction, setReaction] = useState<Reaction | null>(initialReaction ?? null);

  // Question fields
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [useAgain, setUseAgain] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const handleSelectReaction = (r: Reaction) => {
    setReaction(r);
    setStep("questions");
  };

  const handleSubmit = async () => {
    if (!reaction) return;
    setStep("submitting");

    const payload: Record<string, unknown> = {
      reaction,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
    };

    if (reaction === "useful") {
      payload.standOut = field1;
      payload.useAgain = useAgain;
    } else if (reaction === "meh") {
      payload.hopingToSee = field1;
      payload.moreUseful = field2;
    } else {
      payload.gotStuck = field1;
      payload.expected = field2;
    }

    if (email.trim()) payload.email = email.trim();

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Silently fail — feedback is best-effort
    }

    onSubmitted();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-fade-in"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/20" />
      <div
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted transition-colors hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {step === "emoji" && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">How was your experience?</h2>
            <p className="mb-6 text-[13px] text-muted">Your feedback helps us improve Fijord.</p>
            <div className="flex justify-center gap-4">
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleSelectReaction(r.key)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background px-6 py-4 transition-all hover:border-accent/40 hover:bg-accent/5"
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <span className="text-[13px] font-medium text-foreground">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "questions" && reaction && (
          <div>
            <h2 className="mb-1 text-lg font-semibold text-foreground">
              {reaction === "useful" && "Glad to hear it!"}
              {reaction === "meh" && "We can do better."}
              {reaction === "confusing" && "Sorry about that."}
            </h2>
            <p className="mb-5 text-[13px] text-muted">A few quick questions so we can improve.</p>

            {reaction === "useful" && (
              <>
                <label className="mb-1.5 block text-[13px] font-medium text-foreground">What stood out most?</label>
                <textarea
                  value={field1}
                  onChange={(e) => setField1(e.target.value)}
                  placeholder="e.g. the evidence quotes, ticket quality..."
                  className="mb-4 h-20 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
                />
                <label className="mb-2 block text-[13px] font-medium text-foreground">Would you use this again?</label>
                <div className="mb-4 flex gap-2">
                  {["Definitely", "Maybe", "Probably not"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setUseAgain(opt)}
                      className={`rounded-lg border px-4 py-2 text-[13px] font-medium transition-all ${
                        useAgain === opt
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-background text-foreground hover:border-accent/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {reaction === "meh" && (
              <>
                <label className="mb-1.5 block text-[13px] font-medium text-foreground">What were you hoping to see?</label>
                <textarea
                  value={field1}
                  onChange={(e) => setField1(e.target.value)}
                  placeholder="e.g. more specific tickets, better problem analysis..."
                  className="mb-4 h-20 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
                />
                <label className="mb-1.5 block text-[13px] font-medium text-foreground">What would make this more useful?</label>
                <textarea
                  value={field2}
                  onChange={(e) => setField2(e.target.value)}
                  placeholder="Any ideas welcome..."
                  className="mb-4 h-20 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
                />
              </>
            )}

            {reaction === "confusing" && (
              <>
                <label className="mb-1.5 block text-[13px] font-medium text-foreground">Where did you get stuck?</label>
                <textarea
                  value={field1}
                  onChange={(e) => setField1(e.target.value)}
                  placeholder="e.g. didn't know what to do after processing..."
                  className="mb-4 h-20 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
                />
                <label className="mb-1.5 block text-[13px] font-medium text-foreground">What did you expect to happen?</label>
                <textarea
                  value={field2}
                  onChange={(e) => setField2(e.target.value)}
                  placeholder="e.g. expected to see a summary first..."
                  className="mb-4 h-20 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
                />
              </>
            )}

            <label className="mb-1.5 block text-[13px] font-medium text-foreground">
              Can we follow up? <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mb-5 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/40 focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent/90"
              >
                Submit feedback
              </button>
            </div>
          </div>
        )}

        {step === "submitting" && (
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
            <span className="text-sm text-muted">Submitting...</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Floating Feedback Button ───────────────────────────── */

export function FeedbackButton({ showToast }: { showToast: (msg: string) => void }) {
  const [showModal, setShowModal] = useState(false);

  const handleSubmitted = () => {
    setShowModal(false);
    showToast("Thanks for your feedback!");
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="feedback-bounce fixed bottom-6 right-6 z-40 flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-muted shadow-md transition-all hover:border-foreground/20 hover:text-foreground hover:shadow-lg"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        Feedback
      </button>

      {showModal && (
        <FeedbackModal onClose={() => setShowModal(false)} onSubmitted={handleSubmitted} />
      )}
    </>
  );
}

/* ─── Post-Generation Feedback Banner ────────────────────── */

export function FeedbackBanner({ showToast }: { showToast: (msg: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<Reaction | null>(null);

  useEffect(() => {
    // Only show once per user
    if (typeof window !== "undefined" && localStorage.getItem(FEEDBACK_PROMPTED_KEY)) return;

    const timer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(FEEDBACK_PROMPTED_KEY, "1");
    }
  }, []);

  const handleSelectReaction = (r: Reaction) => {
    setSelectedReaction(r);
    setShowModal(true);
    handleDismiss();
  };

  const handleSubmitted = () => {
    setShowModal(false);
    showToast("Thanks for your feedback!");
  };

  if (!visible || dismissed) {
    return showModal ? (
      <FeedbackModal
        onClose={() => setShowModal(false)}
        onSubmitted={handleSubmitted}
        initialReaction={selectedReaction ?? undefined}
      />
    ) : null;
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 banner-slide-in">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5 shadow-lg">
          <p className="text-[13px] font-medium text-foreground">
            First time? We&apos;d love your gut reaction.
          </p>
          <div className="flex items-center gap-2">
            {REACTIONS.map((r) => (
              <button
                key={r.key}
                onClick={() => handleSelectReaction(r.key)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] font-medium text-foreground transition-all hover:border-accent/40 hover:bg-accent/5"
              >
                <span>{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleDismiss}
            className="ml-1 text-muted transition-colors hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {showModal && (
        <FeedbackModal
          onClose={() => setShowModal(false)}
          onSubmitted={handleSubmitted}
          initialReaction={selectedReaction ?? undefined}
        />
      )}
    </>
  );
}
