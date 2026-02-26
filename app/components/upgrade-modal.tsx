"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { track, AnalyticsEvents } from "@/lib/analytics";

export default function UpgradeModal({
  feature,
  onClose,
}: {
  feature: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    track(AnalyticsEvents.UPGRADE_MODAL_SHOWN, { feature });
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, feature]);

  async function handleUpgrade() {
    if (!user?.email) {
      onClose();
      router.push("/pricing");
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
      if (data.url) window.location.href = data.url;
      else { onClose(); router.push("/pricing"); }
    } catch {
      onClose();
      router.push("/pricing");
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "#E8F0E8" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>

        <h2 className="mb-2 text-center text-lg font-medium text-foreground">
          Upgrade to Pro
        </h2>
        <p className="mb-6 text-center text-sm text-muted">
          <span className="font-medium text-foreground">{feature}</span> is a Pro feature. Upgrade to unlock it along with unlimited epics, signals, and briefs.
        </p>

        <div className="mb-6 rounded-lg border border-border" style={{ padding: 12 }}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Unlimited epics</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Signals & Briefs</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Unlimited product memory</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">All integrations</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-background"
          >
            Maybe later
          </button>
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "#3D5A3D" }}
          >
            {upgrading ? "Redirecting..." : "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </div>
  );
}
