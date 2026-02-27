"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";

/* ─── Fijord Arrow Mark ─── */

function FijordMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.69 10.97L18.34 8.67L9.49 8.66L7 11.78V11.84H16.6L7.16 21.29L8.69 22.81L13.55 17.94V21.74L13.6 21.74L15.65 19.68L15.69 15.82L18.14 13.37V22.97H18.2L20.3 20.87V10.97Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ─── Types ─── */

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type OnboardingData = {
  workspaceName: string;
  companyName: string;
  role: string;
  ticketTool: string;
  integrations: string[];
  plan: string;
};

/* ─── Constants ─── */

const ROLES = ["Product Manager", "Founder", "Designer", "Engineering Lead", "Other"] as const;

const TICKET_TOOLS = [
  { id: "linear", label: "Linear" },
  { id: "jira", label: "Jira" },
  { id: "none", label: "Set up later" },
] as const;

const INTEGRATIONS = [
  { id: "slack", label: "Slack", letter: "S", color: "#4A154B" },
  { id: "linear", label: "Linear", letter: "L", color: "#5E6AD2" },
  { id: "jira", label: "Jira", letter: "J", color: "#0052CC" },
  { id: "figma", label: "Figma", letter: "F", color: "#F24E1E" },
  { id: "notion", label: "Notion", letter: "N", color: "#000000" },
  { id: "calendar", label: "Calendar", letter: "C", color: "#4285F4" },
  { id: "gmail", label: "Gmail", letter: "G", color: "#EA4335" },
  { id: "teams", label: "Teams", letter: "T", color: "#6264A7" },
  { id: "trello", label: "Trello", letter: "T", color: "#0079BF" },
] as const;

const DECORATIVE_PILLS = [
  "Meeting",
  "Incidents",
  "Fragments",
  "Epics",
  "Templates",
  "Milestones",
] as const;

/* ─── Progress Dots ─── */

function ProgressDots({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="rounded-full transition-colors"
          style={{
            width: 8,
            height: 8,
            backgroundColor: i + 1 === current ? "#1A1A1A" : "#E8E6E1",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Onboarding Page ─── */

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [ticketTool, setTicketTool] = useState("");
  const [integrations, setIntegrations] = useState<string[]>([]);
  const [plan, setPlan] = useState("pro");

  // Auth guard
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (typeof window !== "undefined" && localStorage.getItem("fjord-onboarding")) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Prevent flash while loading/redirecting
  if (loading || !user) return null;
  if (typeof window !== "undefined" && localStorage.getItem("fjord-onboarding")) return null;

  function next() {
    if (step < 7) setStep((step + 1) as Step);
  }

  function back() {
    if (step > 1) setStep((step - 1) as Step);
  }

  function toggleIntegration(id: string) {
    setIntegrations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleComplete() {
    const data: OnboardingData = {
      workspaceName,
      companyName,
      role: role === "Other" ? customRole : role,
      ticketTool,
      integrations,
      plan,
    };
    localStorage.setItem("fjord-onboarding", JSON.stringify(data));
    router.push("/");
  }

  const canAdvance = (): boolean => {
    switch (step) {
      case 2: return workspaceName.trim().length > 0;
      case 3: return role !== "" && (role !== "Other" || customRole.trim().length > 0);
      case 4: return ticketTool !== "";
      default: return true;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className={`w-full px-6 ${step === 5 ? "max-w-lg" : step === 6 ? "max-w-xl" : "max-w-sm"}`}>

        {/* ─── Step 1: Welcome ─── */}
        {step === 1 && (
          <div className="flex flex-col items-center">
            <FijordMark size={48} />
            <h1 className="mt-5 mb-2 text-xl font-medium text-foreground">
              Welcome to Fijord
            </h1>
            <p className="mb-8 text-center text-sm text-muted">
              Let&apos;s set up your workspace in a few quick steps.
            </p>
            <button
              onClick={next}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Get started
            </button>
          </div>
        )}

        {/* ─── Step 2: Create your workspace ─── */}
        {step === 2 && (
          <div className="flex flex-col items-center">
            <FijordMark size={36} />
            <h1 className="mt-5 mb-6 text-xl font-medium text-foreground">
              Create your workspace
            </h1>

            <div className="mb-3 w-full">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Workspace name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canAdvance() && next()}
                placeholder="e.g. Acme Product"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-foreground/30 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="mb-5 w-full">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Company name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canAdvance() && next()}
                placeholder="e.g. Acme Inc."
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-foreground/30 focus:outline-none"
              />
            </div>

            <button
              onClick={next}
              disabled={!canAdvance()}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>

            <button
              onClick={back}
              className="mt-5 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
            </button>
          </div>
        )}

        {/* ─── Step 3: What's your role? ─── */}
        {step === 3 && (
          <div className="flex flex-col items-center">
            <FijordMark size={36} />
            <h1 className="mt-5 mb-1.5 text-xl font-medium text-foreground">
              What&apos;s your role?
            </h1>
            <p className="mb-6 text-sm text-muted">
              This helps tailor briefs and structure.
            </p>

            <div className="mb-5 w-full">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex w-full items-center text-left text-sm transition-colors ${
                    role === r
                      ? "rounded-lg border border-foreground/20 bg-card px-4 py-3 font-medium text-foreground"
                      : "px-4 py-3 text-foreground hover:text-foreground/70"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {role === "Other" && (
              <div className="mb-5 w-full">
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canAdvance() && next()}
                  placeholder="Enter your role"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-foreground/30 focus:outline-none"
                  autoFocus
                />
              </div>
            )}

            <button
              onClick={next}
              disabled={!canAdvance()}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* ─── Step 4: Where do you manage tickets? ─── */}
        {step === 4 && (
          <div className="flex flex-col items-center">
            <FijordMark size={36} />
            <h1 className="mt-5 mb-1.5 text-xl font-medium text-foreground">
              Where do you manage tickets?
            </h1>
            <p className="mb-6 text-sm text-muted">
              Fjord can sync structured tickets directly.
            </p>

            <div className="mb-5 w-full space-y-3">
              {TICKET_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setTicketTool(tool.id)}
                  className={`flex w-full items-center gap-3.5 rounded-xl border px-5 py-4 text-left text-sm font-medium transition-colors ${
                    ticketTool === tool.id
                      ? "border-foreground/30 bg-card text-foreground"
                      : "border-border bg-card text-foreground hover:border-border-hover"
                  }`}
                >
                  {tool.id === "linear" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "#5E6AD2" }}>
                      <svg width="16" height="16" viewBox="0 0 100 100" fill="white">
                        <path d="M3.35 55.2a3.05 3.05 0 010-4.31L46.9 7.34a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L22.52 55.24a3.05 3.05 0 01-4.31 0L3.35 55.2zm17.76 17.76a3.05 3.05 0 010-4.31L57.25 32.51a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31l-36.14 36.14a3.05 3.05 0 01-4.31 0l-7.45-7.45zm41.38 23.69a3.05 3.05 0 01-4.31 0l-7.45-7.45a3.05 3.05 0 010-4.31l36.14-36.14a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L62.49 96.65z" />
                      </svg>
                    </div>
                  )}
                  {tool.id === "jira" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "#0052CC" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 24V12.518a1.005 1.005 0 00-1.005-1.005z" />
                        <path d="M11.575 0H0a5.217 5.217 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 12.487V1.005A1.005 1.005 0 0011.575 0z" opacity=".65" transform="translate(5.714 5.713)" />
                      </svg>
                    </div>
                  )}
                  {tool.id === "none" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-border">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9C978E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c1.3 0 1.9.5 2.5 1" />
                        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                      </svg>
                    </div>
                  )}
                  {tool.label}
                </button>
              ))}
            </div>

            <button
              onClick={next}
              disabled={!canAdvance()}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {/* ─── Step 5: Connect your tools ─── */}
        {step === 5 && (
          <div className="flex flex-col items-center">
            <FijordMark size={36} />
            <h1 className="mt-5 mb-6 text-xl font-medium text-foreground">
              Connect your tools
            </h1>

            <div className="mb-5 grid w-full grid-cols-2 sm:grid-cols-3 gap-2">
              {INTEGRATIONS.map((intg) => {
                const selected = integrations.includes(intg.id);
                return (
                  <button
                    key={intg.id}
                    onClick={() => toggleIntegration(intg.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-lg border px-3 py-4 text-xs font-medium transition-colors ${
                      selected
                        ? "border-accent bg-accent-green-light text-accent"
                        : "border-border bg-card text-foreground hover:border-border-hover"
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-1.5 right-1.5">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M11.67 3.5L5.25 9.92L2.33 7"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ backgroundColor: intg.color }}
                    >
                      {intg.letter}
                    </div>
                    {intg.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={next}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {integrations.length > 0 ? "Continue" : "Skip for now"}
            </button>

            <button
              onClick={back}
              className="mt-5 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
            </button>
          </div>
        )}

        {/* ─── Step 6: Select a plan ─── */}
        {step === 6 && (
          <div className="flex flex-col items-center">
            <h1 className="mb-6 text-xl font-medium text-foreground">
              Select a plan
            </h1>

            <div className="mb-0 grid w-full grid-cols-2 gap-4">
              {/* Starter */}
              <div
                onClick={() => setPlan("starter")}
                className={`flex cursor-pointer flex-col items-center rounded-2xl border p-6 text-center transition-colors ${
                  plan === "starter"
                    ? "border-foreground/20 bg-card"
                    : "border-border bg-card hover:border-border-hover"
                }`}
              >
                <span className="text-lg font-semibold text-foreground">Starter</span>
                <span className="mt-1 text-sm text-muted">$0/user/mo</span>

                <div className="mt-5 flex flex-col gap-2">
                  <span className="text-xs text-muted">Unlimited meeting recordings</span>
                  <span className="text-xs text-muted">2 weeks product memory</span>
                  <span className="flex items-center justify-center gap-1 text-xs text-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    AI chat
                  </span>
                  <span className="text-xs text-muted">3 epics</span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: "#5E6AD2" }}>
                    <svg width="10" height="10" viewBox="0 0 100 100" fill="white"><path d="M3.35 55.2a3.05 3.05 0 010-4.31L46.9 7.34a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L22.52 55.24a3.05 3.05 0 01-4.31 0L3.35 55.2zm17.76 17.76a3.05 3.05 0 010-4.31L57.25 32.51a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31l-36.14 36.14a3.05 3.05 0 01-4.31 0l-7.45-7.45zm41.38 23.69a3.05 3.05 0 01-4.31 0l-7.45-7.45a3.05 3.05 0 010-4.31l36.14-36.14a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L62.49 96.65z" /></svg>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: "#0052CC" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 24V12.518a1.005 1.005 0 00-1.005-1.005z" /><path d="M11.575 0H0a5.217 5.217 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 12.487V1.005A1.005 1.005 0 0011.575 0z" opacity=".65" transform="translate(5.714 5.713)" /></svg>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded" style={{ background: "#F24E1E" }}>
                    <span className="text-[8px] font-bold text-white">F</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <span className="flex items-center justify-center gap-1 text-xs text-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    Briefs
                  </span>
                  <span className="flex items-center justify-center gap-1 text-xs text-muted">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    Signals
                  </span>
                </div>

                <button
                  className="mt-5 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted cursor-default"
                >
                  Your current plan
                </button>
              </div>

              {/* Pro */}
              <div
                onClick={() => setPlan("pro")}
                className={`flex cursor-pointer flex-col items-center rounded-2xl border p-6 text-center transition-colors ${
                  plan === "pro"
                    ? "border-accent/30"
                    : "border-border hover:border-border-hover"
                }`}
                style={{ background: "linear-gradient(180deg, #E8F0E8 0%, #F5F4F0 100%)" }}
              >
                <span className="text-lg font-semibold text-foreground">Pro</span>
                <span className="mt-1 text-sm text-muted">$14/user/mo</span>

                <div className="mt-5 flex flex-col gap-2">
                  <span className="text-xs text-foreground">Unlimited meeting recordings</span>
                  <span className="text-xs font-medium text-foreground">Unlimited product memory</span>
                  <span className="flex items-center justify-center gap-1 text-xs text-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    AI chat
                  </span>
                  <span className="text-xs text-foreground">Unlimited epics</span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5">
                  {[
                    { bg: "#4A154B", letter: "S" },
                    { bg: "#5E6AD2", letter: "L" },
                    { bg: "#EA4335", letter: "G" },
                    { bg: "#0052CC", letter: "J" },
                    { bg: "#000000", letter: "N" },
                    { bg: "#F24E1E", letter: "F" },
                    { bg: "#4285F4", letter: "C" },
                    { bg: "#6264A7", letter: "T" },
                  ].map((icon, i) => (
                    <div key={i} className="flex h-5 w-5 items-center justify-center rounded" style={{ background: icon.bg }}>
                      <span className="text-[8px] font-bold text-white">{icon.letter}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <span className="flex items-center justify-center gap-1 text-xs text-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Briefs
                  </span>
                  <span className="flex items-center justify-center gap-1 text-xs text-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    Signals
                  </span>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); setPlan("pro"); next(); }}
                  className="mt-5 w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Continue with the Pro &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 7: Final ─── */}
        {step === 7 && (
          <div className="flex flex-col items-center">
            <FijordMark size={48} />
            <h1 className="mt-5 mb-2 text-xl font-medium text-foreground">
              Structured. Explainable. Grounded.
            </h1>
            <p className="mb-6 text-center text-sm text-muted">
              Your workspace is ready.
            </p>

            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {DECORATIVE_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted"
                >
                  {pill}
                </span>
              ))}
            </div>

            <button
              onClick={handleComplete}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Enter workspace
            </button>
          </div>
        )}

      </div>

      {/* ─── Progress Dots ─── */}
      <div className="fixed bottom-8">
        <ProgressDots current={step} total={7} />
      </div>
    </div>
  );
}
