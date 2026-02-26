"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, identify } from "@/lib/analytics";
import { useAuth } from "@/app/auth-context";

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Initialize PostHog once
  useEffect(() => {
    initAnalytics();
  }, []);

  // Identify user when they log in
  useEffect(() => {
    if (user) {
      identify(user.id, { email: user.email, name: user.name });
    }
  }, [user]);

  // Track page views on route changes
  useEffect(() => {
    // PostHog captures pageviews automatically with capture_pageview: true
    // This hook is here if we need custom page tracking later
  }, [pathname]);

  return <>{children}</>;
}
