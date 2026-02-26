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

const ROLES = ["PM", "Eng Lead", "Designer", "Founder", "Other"] as const;

const TICKET_TOOLS = [
  { id: "jira", label: "Jira" },
  { id: "linear", label: "Linear" },
  { id: "none", label: "I don't use one" },
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
      <div className={`w-full px-6 ${step >= 5 && step <= 6 ? "max-w-lg" : "max-w-sm"}`}>

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
            <h1 className="mt-5 mb-6 text-xl font-medium text-foreground">
              What&apos;s your role?
            </h1>

            <div className="mb-5 flex w-full flex-wrap justify-center gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    role === r
                      ? "border-accent bg-accent-green-light text-accent"
                      : "border-border bg-card text-foreground hover:border-border-hover"
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

            <button
              onClick={back}
              className="mt-5 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
            </button>
          </div>
        )}

        {/* ─── Step 4: Where do you manage tickets? ─── */}
        {step === 4 && (
          <div className="flex flex-col items-center">
            <FijordMark size={36} />
            <h1 className="mt-5 mb-6 text-xl font-medium text-foreground">
              Where do you manage tickets?
            </h1>

            <div className="mb-5 w-full space-y-2">
              {TICKET_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setTicketTool(tool.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    ticketTool === tool.id
                      ? "border-accent bg-accent-green-light text-accent"
                      : "border-border bg-card text-foreground hover:border-border-hover"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      ticketTool === tool.id
                        ? "border-accent"
                        : "border-border"
                    }`}
                  >
                    {ticketTool === tool.id && (
                      <div className="h-2 w-2 rounded-full bg-accent" />
                    )}
                  </div>
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

            <button
              onClick={back}
              className="mt-5 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
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

            <div className="mb-5 grid w-full grid-cols-3 gap-2">
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
            <FijordMark size={36} />
            <h1 className="mt-5 mb-6 text-xl font-medium text-foreground">
              Select a plan
            </h1>

            <div className="mb-5 grid w-full grid-cols-2 gap-3">
              {/* Starter */}
              <button
                onClick={() => setPlan("starter")}
                className={`relative flex flex-col rounded-lg border p-4 text-left transition-colors ${
                  plan === "starter"
                    ? "border-accent bg-accent-green-light"
                    : "border-border bg-card hover:border-border-hover"
                }`}
              >
                <span className="text-sm font-medium text-foreground">Starter</span>
                <span className="mt-1 text-xl font-semibold text-foreground">Free</span>
                <span className="mt-2 text-xs text-muted">For individuals getting started</span>
              </button>

              {/* Pro */}
              <button
                onClick={() => setPlan("pro")}
                className={`relative flex flex-col rounded-lg p-4 text-left transition-colors ${
                  plan === "pro"
                    ? "border-2 border-accent bg-accent-green-light"
                    : "border-2 border-accent bg-card hover:bg-accent-green-light/50"
                }`}
              >
                <div className="absolute -top-2.5 right-3 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  Most popular
                </div>
                <span className="text-sm font-medium text-foreground">Pro</span>
                <span className="mt-1 text-xl font-semibold text-foreground">
                  $14<span className="text-sm font-normal text-muted">/mo</span>
                </span>
                <span className="mt-2 text-xs text-muted">For teams shipping product</span>
              </button>
            </div>

            <button
              onClick={next}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
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
