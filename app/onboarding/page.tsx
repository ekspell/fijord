"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-context";

/* ─── Fijord Arrow Mark ─── */

function FijordMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M29.5744 21.1023V36.3184H23.8929L23.6667 20.1988L29.5744 21.1023Z"
        fill="currentColor"
      />
      <path
        d="M6 11.8471L32.0183 11.8471L6.42628 37.4392L10.5608 41.5737L36.1529 15.9817V42H36.3184L42 36.3184L42 12.3728L35.6272 6L11.6783 6L6 11.6783V11.8471Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ─── Types ─── */

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type OnboardingData = {
  fullName: string;
  workspaceName: string;
  companyName: string;
  role: string;
  ticketTool: string;
  plan: string;
};

/* ─── Constants ─── */

const ROLES = ["Product Manager", "Founder", "Designer", "Engineering Lead", "Other"] as const;

const TICKET_TOOLS = [
  { id: "linear", label: "Linear" },
  { id: "jira", label: "Jira" },
  { id: "none", label: "Set up later" },
] as const;

const DECORATIVE_PILLS = [
  "Meeting",
  "Evidence",
  "Signals",
  "Epics",
  "Tickets",
  "Decisions",
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
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const initialStep = (() => {
    const s = parseInt(searchParams.get("step") || "1", 10);
    return (s >= 1 && s <= 7 ? s : 1) as Step;
  })();

  // Restore onboarding progress after Stripe redirect
  const saved = typeof window !== "undefined" ? sessionStorage.getItem("fjord-onboarding-progress") : null;
  const restored = saved ? JSON.parse(saved) as Partial<OnboardingData> : null;

  const [step, setStep] = useState<Step>(initialStep);
  const [fullName, setFullName] = useState(restored?.fullName || "");
  const [workspaceName, setWorkspaceName] = useState(restored?.workspaceName || "");
  const [companyName, setCompanyName] = useState(restored?.companyName || "");
  const [role, setRole] = useState(restored?.role || "");
  const [customRole, setCustomRole] = useState("");
  const [ticketTool, setTicketTool] = useState(restored?.ticketTool || "");
  const [plan, setPlan] = useState(restored?.plan || "pro");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

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

  function handleComplete() {
    const data: OnboardingData = {
      fullName,
      workspaceName,
      companyName,
      role: role === "Other" ? customRole : role,
      ticketTool,
      plan,
    };
    localStorage.setItem("fjord-onboarding", JSON.stringify(data));
    sessionStorage.removeItem("fjord-onboarding-progress");
    router.push("/");
  }

  async function handleProCheckout() {
    const email = user?.email;
    if (!email || email === "guest@fijord.app") {
      setCheckoutError("Please sign up with a real email to subscribe.");
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError("");
    // Save progress so it survives the Stripe redirect
    sessionStorage.setItem("fjord-onboarding-progress", JSON.stringify({
      fullName, workspaceName, companyName,
      role: role === "Other" ? customRole : role,
      ticketTool, plan: "pro",
    }));
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          priceId: "price_1T4tzgRthYZazJEOWPZ4zSDp",
          successUrl: `${window.location.origin}/onboarding?step=7`,
          cancelUrl: `${window.location.origin}/onboarding?step=6`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong");
      setCheckoutLoading(false);
    }
  }

  const canAdvance = (): boolean => {
    switch (step) {
      case 2: return fullName.trim().length > 0;
      case 3: return workspaceName.trim().length > 0;
      case 4: return role !== "" && (role !== "Other" || customRole.trim().length > 0);
      case 5: return ticketTool !== "";
      default: return true;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background" style={step === 7 ? { background: "#F5F5F5" } : undefined}>
      <div className={`w-full px-6 ${step === 6 ? "max-w-[640px]" : step === 7 ? "max-w-2xl" : "max-w-sm"}`}>

        {/* ─── Step 1: Welcome ─── */}
        {step === 1 && (
          <div className="flex flex-col items-center">
            <FijordMark />
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

        {/* ─── Step 2: What should we call you? ─── */}
        {step === 2 && (
          <div className="flex flex-col items-center">
            <FijordMark />
            <h1 className="mt-5 mb-6 text-xl font-medium text-foreground">
              What should we call you?
            </h1>

            <div className="mb-5 w-full">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canAdvance() && next()}
                placeholder="e.g. Jane Smith"
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-foreground/30 focus:outline-none"
                autoFocus
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

        {/* ─── Step 3: Create your workspace ─── */}
        {step === 3 && (
          <div className="flex flex-col items-center">
            <FijordMark />
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

        {/* ─── Step 4: What's your role? ─── */}
        {step === 4 && (
          <div className="flex flex-col items-center">
            <FijordMark />
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
                      ? "rounded-lg border-2 border-[#2E90FA] bg-[#EEEEEE] px-4 py-3 font-medium text-foreground"
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

            <button
              onClick={back}
              className="mt-5 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
            </button>
          </div>
        )}

        {/* ─── Step 5: Where do you manage tickets? ─── */}
        {step === 5 && (
          <div className="flex flex-col items-center">
            <FijordMark />
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
                  className={`flex w-full items-center gap-3.5 rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-colors ${
                    ticketTool === tool.id
                      ? "border-[#2E90FA] bg-[#EEEEEE] text-foreground"
                      : "border-border text-foreground hover:border-border-hover"
                  }`}
                >
                  {tool.id === "linear" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 100 100" fill="#5E6AD2">
                        <path d="M3.35 55.2a3.05 3.05 0 010-4.31L46.9 7.34a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L22.52 55.24a3.05 3.05 0 01-4.31 0L3.35 55.2zm17.76 17.76a3.05 3.05 0 010-4.31L57.25 32.51a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31l-36.14 36.14a3.05 3.05 0 01-4.31 0l-7.45-7.45zm41.38 23.69a3.05 3.05 0 01-4.31 0l-7.45-7.45a3.05 3.05 0 010-4.31l36.14-36.14a3.05 3.05 0 014.31 0l7.45 7.45a3.05 3.05 0 010 4.31L62.49 96.65z" />
                      </svg>
                    </div>
                  )}
                  {tool.id === "jira" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#0052CC">
                        <path d="M11.571 11.513H0a5.218 5.218 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 24V12.518a1.005 1.005 0 00-1.005-1.005z" />
                        <path d="M11.575 0H0a5.217 5.217 0 005.232 5.215h2.13v2.057A5.215 5.215 0 0012.575 12.487V1.005A1.005 1.005 0 0011.575 0z" opacity=".65" transform="translate(5.714 5.713)" />
                      </svg>
                    </div>
                  )}
                  {tool.id === "none" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9C978E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            <div className="mb-0 grid w-full grid-cols-2 gap-4" style={{ gridTemplateColumns: "300px 300px" }}>
              {/* Starter */}
              <div
                onClick={() => setPlan("starter")}
                className={`flex cursor-pointer flex-col items-center text-center transition-colors ${
                  plan === "starter"
                    ? "ring-1 ring-foreground/20"
                    : "hover:ring-1 hover:ring-border-hover"
                }`}
                style={{
                  padding: "24px 40px 40px",
                  gap: "40px",
                  background: "white",
                  border: "1px solid #e5e5e5",
                  borderRadius: "24px",
                }}
              >
                <span className="text-[24px] leading-[34px] text-foreground" style={{ fontFamily: "var(--font-dm-mono)" }}>Starter</span>
                <span className="text-sm text-muted">$0/user/mo</span>

                <div className="mt-5 flex flex-col gap-2">
                  <span className="text-xs text-muted">Unlimited meeting recordings</span>
                  <span className="text-xs text-muted">2 weeks product memory</span>
                  <span className="flex items-center justify-center gap-1 text-xs text-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    AI chat
                  </span>
                  <span className="text-xs text-muted">3 epics</span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  {/* Linear */}
                  <svg width="20" height="20" viewBox="0 0 256 256"><path fill="#5E6AD2" d="m8.174 102.613l145.213 145.213c2.12 2.12 1.097 5.72-1.85 6.27a128 128 0 0 1-15.02 1.896a3.78 3.78 0 0 1-2.92-1.109L1.117 122.403a3.78 3.78 0 0 1-1.109-2.92c.34-5.095.978-10.107 1.896-15.02c.55-2.947 4.15-3.97 6.27-1.85m-4.092 58.796c-.97-3.614 3.3-5.894 5.946-3.248l87.81 87.811c2.647 2.646.367 6.915-3.247 5.946c-44.03-11.805-78.704-46.478-90.51-90.509m12.727-97.245c1.233-2.135 4.147-2.463 5.89-.719L192.556 233.3c1.744 1.744 1.417 4.658-.72 5.891a128 128 0 0 1-11.1 5.705c-1.43.65-3.11.322-4.22-.79L11.893 79.487c-1.111-1.112-1.439-2.79-.79-4.221a128 128 0 0 1 5.706-11.1M127.86 0C198.63 0 256 57.37 256 128.14c0 37.57-16.168 71.362-41.926 94.8c-1.487 1.354-3.768 1.264-5.19-.157L33.217 47.116c-1.421-1.422-1.51-3.703-.158-5.19C56.498 16.168 90.291 0 127.86 0"/></svg>
                  {/* Calendar */}
                  <svg width="20" height="20" viewBox="0 0 256 256"><path fill="#FFF" d="M195.368 60.632H60.632v134.736h134.736z"/><path fill="#EA4335" d="M195.368 256L256 195.368l-30.316-5.172l-30.316 5.172l-5.533 27.73z"/><path fill="#188038" d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316l-6.225-30.316l-33.033-5.172z"/><path fill="#1967D2" d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422q-5.532 22.554-5.533 33.196q0 10.641 5.533 27.436q20.115 5.76 30.316 5.76T256 60.631"/><path fill="#FBBC04" d="M256 60.632h-60.632v134.736H256z"/><path fill="#34A853" d="M195.368 195.368H60.632V256h134.736z"/><path fill="#4285F4" d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736z"/></svg>
                  {/* Figma */}
                  <svg width="14" height="20" viewBox="0 0 256 384"><path fill="#0ACF83" d="M64 384c35.328 0 64-28.672 64-64v-64H64c-35.328 0-64 28.672-64 64s28.672 64 64 64"/><path fill="#A259FF" d="M0 192c0-35.328 28.672-64 64-64h64v128H64c-35.328 0-64-28.672-64-64"/><path fill="#F24E1E" d="M0 64C0 28.672 28.672 0 64 0h64v128H64C28.672 128 0 99.328 0 64"/><path fill="#FF7262" d="M128 0h64c35.328 0 64 28.672 64 64s-28.672 64-64 64h-64z"/><path fill="#1ABCFE" d="M256 192c0 35.328-28.672 64-64 64s-64-28.672-64-64s28.672-64 64-64s64 28.672 64 64"/></svg>
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
                  onClick={(e) => { e.stopPropagation(); setPlan("starter"); next(); }}
                  className="mt-auto w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-opacity hover:opacity-70"
                >
                  Your current plan &rarr;
                </button>
              </div>

              {/* Pro */}
              <div
                onClick={() => setPlan("pro")}
                className={`flex cursor-pointer flex-col items-center text-center transition-colors ${
                  plan === "pro"
                    ? "ring-1 ring-accent/30"
                    : "hover:ring-1 hover:ring-border-hover"
                }`}
                style={{
                  padding: "24px 40px 40px",
                  gap: "40px",
                  background: "linear-gradient(180deg, rgba(10, 186, 14, 0.2) 0%, rgba(10, 186, 14, 0) 100%)",
                  border: "1px solid #e5e5e5",
                  borderRadius: "24px",
                }}
              >
                <span className="text-[24px] leading-[34px] text-foreground" style={{ fontFamily: "var(--font-dm-mono)" }}>Pro</span>
                <span className="text-sm text-muted">$14/user/mo</span>

                <div className="mt-5 flex flex-col gap-2">
                  <span className="text-xs text-foreground">Unlimited meeting recordings</span>
                  <span className="text-xs font-medium text-foreground">Unlimited product memory</span>
                  <span className="flex items-center justify-center gap-1 text-xs text-foreground">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    AI chat
                  </span>
                  <span className="text-xs text-foreground">Unlimited epics</span>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  {/* Slack */}
                  <svg width="20" height="20" viewBox="0 0 256 256"><path fill="#E01E5A" d="M53.841 161.32c0 14.832-11.987 26.82-26.819 26.82S.203 176.152.203 161.32c0-14.831 11.987-26.818 26.82-26.818H53.84zm13.41 0c0-14.831 11.987-26.818 26.819-26.818s26.819 11.987 26.819 26.819v67.047c0 14.832-11.987 26.82-26.82 26.82c-14.83 0-26.818-11.988-26.818-26.82z"/><path fill="#36C5F0" d="M94.07 53.638c-14.832 0-26.82-11.987-26.82-26.819S79.239 0 94.07 0s26.819 11.987 26.819 26.819v26.82zm0 13.613c14.832 0 26.819 11.987 26.819 26.819s-11.987 26.819-26.82 26.819H26.82C11.987 120.889 0 108.902 0 94.069c0-14.83 11.987-26.818 26.819-26.818z"/><path fill="#2EB67D" d="M201.55 94.07c0-14.832 11.987-26.82 26.818-26.82s26.82 11.988 26.82 26.82s-11.988 26.819-26.82 26.819H201.55zm-13.41 0c0 14.832-11.988 26.819-26.82 26.819c-14.831 0-26.818-11.987-26.818-26.82V26.82C134.502 11.987 146.489 0 161.32 0s26.819 11.987 26.819 26.819z"/><path fill="#ECB22E" d="M161.32 201.55c14.832 0 26.82 11.987 26.82 26.818s-11.988 26.82-26.82 26.82c-14.831 0-26.818-11.988-26.818-26.82V201.55zm0-13.41c-14.831 0-26.818-11.988-26.818-26.82c0-14.831 11.987-26.818 26.819-26.818h67.25c14.832 0 26.82 11.987 26.82 26.819s-11.988 26.819-26.82 26.819z"/></svg>
                  {/* Linear */}
                  <svg width="20" height="20" viewBox="0 0 256 256"><path fill="#5E6AD2" d="m8.174 102.613l145.213 145.213c2.12 2.12 1.097 5.72-1.85 6.27a128 128 0 0 1-15.02 1.896a3.78 3.78 0 0 1-2.92-1.109L1.117 122.403a3.78 3.78 0 0 1-1.109-2.92c.34-5.095.978-10.107 1.896-15.02c.55-2.947 4.15-3.97 6.27-1.85m-4.092 58.796c-.97-3.614 3.3-5.894 5.946-3.248l87.81 87.811c2.647 2.646.367 6.915-3.247 5.946c-44.03-11.805-78.704-46.478-90.51-90.509m12.727-97.245c1.233-2.135 4.147-2.463 5.89-.719L192.556 233.3c1.744 1.744 1.417 4.658-.72 5.891a128 128 0 0 1-11.1 5.705c-1.43.65-3.11.322-4.22-.79L11.893 79.487c-1.111-1.112-1.439-2.79-.79-4.221a128 128 0 0 1 5.706-11.1M127.86 0C198.63 0 256 57.37 256 128.14c0 37.57-16.168 71.362-41.926 94.8c-1.487 1.354-3.768 1.264-5.19-.157L33.217 47.116c-1.421-1.422-1.51-3.703-.158-5.19C56.498 16.168 90.291 0 127.86 0"/></svg>
                  {/* Gmail */}
                  <svg width="20" height="20" viewBox="0 0 512 512"><path fill="#EA4335" d="M48 512h80V248L0 168v296c0 26.5 21.5 48 48 48z"/><path fill="#4285F4" d="M384 512h80c26.5 0 48-21.5 48-48V168l-128 80z"/><path fill="#FBBC05" d="M384 48v200l128-80V72c0-29.6-33.9-46.5-57.6-28.8z"/><path fill="#EA4335" d="M128 248V48L256 132l128-84v200L256 312z"/><path fill="#34A853" d="M0 72v96l128 80V48L70.4 19.2C46.6 1.5 0 18.4 0 48z"/></svg>
                  {/* Figma */}
                  <svg width="14" height="20" viewBox="0 0 256 384"><path fill="#0ACF83" d="M64 384c35.328 0 64-28.672 64-64v-64H64c-35.328 0-64 28.672-64 64s28.672 64 64 64"/><path fill="#A259FF" d="M0 192c0-35.328 28.672-64 64-64h64v128H64c-35.328 0-64-28.672-64-64"/><path fill="#F24E1E" d="M0 64C0 28.672 28.672 0 64 0h64v128H64C28.672 128 0 99.328 0 64"/><path fill="#FF7262" d="M128 0h64c35.328 0 64 28.672 64 64s-28.672 64-64 64h-64z"/><path fill="#1ABCFE" d="M256 192c0 35.328-28.672 64-64 64s-64-28.672-64-64s28.672-64 64-64s64 28.672 64 64"/></svg>
                  {/* Notion */}
                  <svg width="20" height="21" viewBox="0 0 256 268"><path fill="#FFF" d="M16.092 11.538L164.09.608c18.179-1.56 22.85-.508 34.28 7.801l47.243 33.282C253.406 47.414 256 48.975 256 55.207v182.527c0 11.439-4.155 18.205-18.696 19.24L65.44 267.378c-10.913.517-16.11-1.043-21.825-8.327L8.826 213.814C2.586 205.487 0 199.254 0 191.97V29.726c0-9.352 4.155-17.153 16.092-18.188"/><path d="M164.09.608L16.092 11.538C4.155 12.573 0 20.374 0 29.726v162.245c0 7.284 2.585 13.516 8.826 21.843l34.789 45.237c5.715 7.284 10.912 8.844 21.825 8.327l171.864-10.404c14.532-1.035 18.696-7.801 18.696-19.24V55.207c0-5.911-2.336-7.614-9.21-12.66l-1.185-.856L198.37 8.409C186.94.1 182.27-.952 164.09.608M69.327 52.22c-14.033.945-17.216 1.159-25.186-5.323L23.876 30.778c-2.06-2.086-1.026-4.69 4.163-5.207l142.274-10.395c11.947-1.043 18.17 3.12 22.842 6.758l24.401 17.68c1.043.525 3.638 3.637.517 3.637L71.146 52.095zm-16.36 183.954V81.222c0-6.767 2.077-9.887 8.3-10.413L230.02 60.93c5.724-.517 8.31 3.12 8.31 9.879v153.917c0 6.767-1.044 12.49-10.387 13.008l-161.487 9.361c-9.343.517-13.489-2.594-13.489-10.921"/></svg>
                  {/* Calendar */}
                  <svg width="20" height="20" viewBox="0 0 256 256"><path fill="#FFF" d="M195.368 60.632H60.632v134.736h134.736z"/><path fill="#EA4335" d="M195.368 256L256 195.368l-30.316-5.172l-30.316 5.172l-5.533 27.73z"/><path fill="#188038" d="M0 195.368v40.421C0 246.956 9.044 256 20.21 256h40.422l6.225-30.316l-6.225-30.316l-33.033-5.172z"/><path fill="#1967D2" d="M256 60.632V20.21C256 9.044 246.956 0 235.79 0h-40.422q-5.532 22.554-5.533 33.196q0 10.641 5.533 27.436q20.115 5.76 30.316 5.76T256 60.631"/><path fill="#FBBC04" d="M256 60.632h-60.632v134.736H256z"/><path fill="#34A853" d="M195.368 195.368H60.632V256h134.736z"/><path fill="#4285F4" d="M195.368 0H20.211C9.044 0 0 9.044 0 20.21v175.158h60.632V60.632h134.736z"/></svg>
                  {/* Teams */}
                  <svg width="20" height="19" viewBox="0 0 256 239"><path fill="#5059C9" d="M178.563 89.302h66.125c6.248 0 11.312 5.065 11.312 11.312v60.231c0 22.96-18.613 41.574-41.573 41.574h-.197c-22.96.003-41.576-18.607-41.579-41.568V95.215a5.91 5.91 0 0 1 5.912-5.913"/><circle cx="223.256" cy="50.605" r="26.791" fill="#5059C9"/><circle cx="139.907" cy="38.698" r="38.698" fill="#7B83EB"/><path fill="#7B83EB" d="M191.506 89.302H82.355c-6.173.153-11.056 5.276-10.913 11.449v68.697c-.862 37.044 28.445 67.785 65.488 68.692c37.043-.907 66.35-31.648 65.489-68.692v-68.697c.143-6.173-4.74-11.296-10.913-11.449"/><path fill="#5059C9" d="M10.913 53.581h109.15c6.028 0 10.914 4.886 10.914 10.913v109.151c0 6.027-4.886 10.913-10.913 10.913H10.913C4.886 184.558 0 179.672 0 173.645V64.495C0 58.466 4.886 53.58 10.913 53.58"/><path fill="#FFF" d="M94.208 95.125h-21.82v59.416H58.487V95.125H36.769V83.599h57.439z"/></svg>
                  {/* Trello */}
                  <svg width="20" height="20" viewBox="0 0 128 128"><rect fill="#0079BF" x="0" y="0" width="128" height="128" rx="12.5"/><rect fill="#fff" x="16.64" y="16.64" width="27.04" height="76" rx="6"/><rect fill="#fff" x="55.68" y="16.64" width="27.04" height="44" rx="6"/></svg>
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
                  onClick={(e) => { e.stopPropagation(); setPlan("pro"); handleProCheckout(); }}
                  disabled={checkoutLoading}
                  className="mt-auto w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checkoutLoading ? "Redirecting to Stripe..." : "Continue with Pro \u2192"}
                </button>
                {checkoutError && (
                  <p className="mt-2 text-center text-xs text-red-500">{checkoutError}</p>
                )}
              </div>
            </div>

            <button
              onClick={back}
              className="mt-6 text-sm text-muted transition-colors hover:text-foreground"
            >
              &larr; Go back
            </button>
          </div>
        )}

        {/* ─── Step 7: Final ─── */}
        {step === 7 && (
          <div className="flex flex-col items-center">
            <FijordMark />
            <h1 className="mt-5 mb-12 text-xl font-medium text-foreground">
              Structured. Explainable. Grounded.
            </h1>

            <div className="mb-14 flex items-center justify-center gap-4">
              {DECORATIVE_PILLS.map((pill, i) => (
                <div key={pill} className="flex items-center gap-4">
                  <span className="text-[15px] font-medium text-foreground">{pill}</span>
                  {i < DECORATIVE_PILLS.length - 1 && (
                    <svg width="32" height="10" viewBox="0 0 32 10" fill="none" className="shrink-0">
                      <path d="M0 5 L28 5" stroke="#C0BDB6" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M24 1 L29 5 L24 9" stroke="#C0BDB6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleComplete}
              className="max-w-[340px] w-full rounded-[10px] bg-foreground px-4 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
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
