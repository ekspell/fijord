"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { useAuth } from "@/app/auth-context";

const STARTER_FEATURES = [
  "Unlimited meeting recordings",
  "2 weeks product memory",
  "AI chat",
  "3 epics",
  "Basic integrations (Linear, Calendar, Figma)",
];

const PRO_FEATURES = [
  "Unlimited meeting recordings",
  "Unlimited product memory",
  "AI chat",
  "Unlimited epics",
  "All integrations (Slack, Linear, Gmail, Figma, Notion, Calendar, Teams, Trello)",
  "Briefs",
  "Signals",
];

const FAQ = [
  {
    q: "What happens after my trial ends?",
    a: "You'll automatically be downgraded to the Starter plan. Any epics beyond the 3-epic limit will remain accessible but you won't be able to create new ones.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your Pro subscription at any time from your account settings. You'll retain Pro access until the end of your billing period.",
  },
  {
    q: "Do you offer discounts for non-profits or education?",
    a: "Yes! Reach out to us at hello@fijord.app and we'll set you up with a discounted plan.",
  },
  {
    q: "What integrations are included?",
    a: "Starter includes Linear, Calendar, and Figma. Pro adds Slack, Gmail, Notion, Teams, and Trello.",
  },
  {
    q: "Is there a team or enterprise plan?",
    a: "We're working on enterprise pricing with volume discounts and SSO. Contact us for early access.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { showToast } = useNav();
  const { user } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  async function handleUpgrade() {
    if (!user?.email) {
      router.push("/login");
      return;
    }
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1T4tzgRthYZazJEOWPZ4zSDp",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast("Something went wrong. Try again.");
      }
    } catch {
      showToast("Something went wrong. Try again.");
    } finally {
      setUpgrading(false);
    }
  }

  const proPrice = annual ? 10 : 14;
  const savingsLabel = annual ? "Save 29%" : null;

  return (
    <div className="mx-auto" style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div className="mb-4 text-muted" style={{ fontSize: 13 }}>
        <button onClick={() => router.push("/")} className="hover:text-foreground">Home</button>
        {" › "}
        <span className="text-accent">Pricing</span>
      </div>

      <h1
        className="mb-2 text-center text-foreground"
        style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.5px" }}
      >
        Simple, transparent pricing
      </h1>
      <p className="mb-8 text-center text-muted" style={{ fontSize: 15 }}>
        Start free, upgrade when you need more power.
      </p>

      {/* Toggle */}
      <div className="mb-10 flex items-center justify-center gap-3">
        <span className={`text-sm ${!annual ? "font-medium text-foreground" : "text-muted"}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className="relative rounded-full transition-colors"
          style={{
            width: 44,
            height: 24,
            background: annual ? "#3D5A3D" : "#E8E6E1",
          }}
        >
          <div
            className="absolute top-1 rounded-full bg-white transition-transform"
            style={{
              width: 16,
              height: 16,
              left: annual ? 24 : 4,
            }}
          />
        </button>
        <span className={`text-sm ${annual ? "font-medium text-foreground" : "text-muted"}`}>
          Annual
        </span>
        {savingsLabel && (
          <span
            className="rounded-full font-medium"
            style={{ fontSize: 11, padding: "2px 8px", background: "#E8F0E8", color: "#3D5A3D" }}
          >
            {savingsLabel}
          </span>
        )}
      </div>

      {/* Plans */}
      <div className="mb-16 grid grid-cols-2 gap-4">
        {/* Starter */}
        <div className="rounded-xl border border-border bg-card" style={{ padding: 28 }}>
          <div className="mb-1 text-sm font-medium text-muted" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Starter
          </div>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-3xl font-medium text-foreground">Free</span>
          </div>
          <p className="mb-6 text-sm text-muted">For individuals getting started</p>

          <button
            onClick={() => showToast("You're on the Starter plan")}
            className="mb-6 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
          >
            Current plan
          </button>

          <div className="flex flex-col gap-2.5">
            {STARTER_FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </div>
            ))}
            <div className="flex items-start gap-2 text-sm text-muted/50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              No Briefs
            </div>
            <div className="flex items-start gap-2 text-sm text-muted/50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              No Signals
            </div>
          </div>
        </div>

        {/* Pro */}
        <div
          className="relative rounded-xl border-2 bg-card"
          style={{ padding: 28, borderColor: "#3D5A3D" }}
        >
          <span
            className="absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold text-white"
            style={{ background: "#3D5A3D" }}
          >
            Most popular
          </span>

          <div className="mb-1 text-sm font-medium text-muted" style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Pro
          </div>
          <div className="mb-1 flex items-baseline gap-1">
            <span className="text-3xl font-medium text-foreground">${proPrice}</span>
            <span className="text-sm text-muted">/user/month</span>
          </div>
          <p className="mb-6 text-sm text-muted">For teams who ship faster with AI</p>

          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="mb-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "#3D5A3D" }}
          >
            {upgrading ? "Redirecting..." : "Upgrade to Pro"}
          </button>

          <div className="flex flex-col gap-2.5">
            {PRO_FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom: 48 }}>
        <h2 className="mb-6 text-center text-xl font-medium text-foreground">
          Frequently asked questions
        </h2>
        <div className="flex flex-col gap-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-lg border border-border">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                {item.q}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 transition-transform"
                  style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
