import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || typeof window === "undefined") return;

  posthog.init(key, {
    api_host: "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage",
  });
  initialized = true;
}

export function identify(userId: string, properties?: Record<string, string>) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, properties);
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function resetAnalytics() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

// Pre-defined event names for type safety
export const AnalyticsEvents = {
  USER_SIGNED_UP: "user_signed_up",
  TRIAL_STARTED: "trial_started",
  TRANSCRIPT_PROCESSED: "transcript_processed",
  TICKET_EXPORTED: "ticket_exported",
  UPGRADE_MODAL_SHOWN: "upgrade_modal_shown",
  UPGRADE_COMPLETED: "upgrade_completed",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
} as const;
