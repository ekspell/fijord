"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { type TierInfo, type UserTier, getTrialDaysRemaining, isTrialExpired, isProUser } from "@/lib/trial";
import { track, identify as analyticsIdentify, resetAnalytics, AnalyticsEvents } from "@/lib/analytics";

const AUTH_KEY = "fjord-auth";
const TIER_KEY = "fjord-tier";

export type User = {
  id: string;
  email: string;
  name: string;
  initials: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  tierInfo: TierInfo;
  trialDaysLeft: number;
  isPro: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
};

const DEFAULT_TIER: TierInfo = {
  tier: "pro",
  trialStartedAt: null,
  stripeCustomerId: null,
  subscriptionStatus: null,
  currentPeriodEnd: null,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  tierInfo: DEFAULT_TIER,
  trialDaysLeft: 0,
  isPro: false,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  loginWithMagicLink: async () => {},
  verifyCode: async () => {},
  logout: () => {},
  resetPassword: async () => {},
});

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tierInfo, setTierInfo] = useState<TierInfo>(DEFAULT_TIER);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) setUser(JSON.parse(saved));

      const savedTier = localStorage.getItem(TIER_KEY);
      if (savedTier) {
        const parsed: TierInfo = JSON.parse(savedTier);
        // Auto-downgrade if trial expired and not paid
        if (isTrialExpired(parsed) && parsed.tier === "pro") {
          parsed.tier = "starter";
          localStorage.setItem(TIER_KEY, JSON.stringify(parsed));
        }
        setTierInfo(parsed);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    else localStorage.removeItem(AUTH_KEY);
  }, []);

  const persistTier = useCallback((t: TierInfo) => {
    setTierInfo(t);
    localStorage.setItem(TIER_KEY, JSON.stringify(t));
  }, []);

  const startTrial = useCallback(() => {
    const tier: TierInfo = {
      tier: "pro",
      trialStartedAt: new Date().toISOString(),
      stripeCustomerId: null,
      subscriptionStatus: null,
      currentPeriodEnd: null,
    };
    persistTier(tier);
  }, [persistTier]);

  const login = useCallback(async (email: string, _password: string) => {
    // Mock login — in production, call Supabase auth
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/[^a-zA-Z ]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    persist({ id: crypto.randomUUID(), email, name, initials: initials(name) });
  }, [persist]);

  const signup = useCallback(async (email: string, _password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const id = crypto.randomUUID();
    persist({ id, email, name, initials: initials(name) });
    startTrial();
    analyticsIdentify(id, { email, name });
    track(AnalyticsEvents.USER_SIGNED_UP, { method: "email" });
    track(AnalyticsEvents.TRIAL_STARTED);
  }, [persist, startTrial]);

  const loginWithGoogle = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600));
    const id = crypto.randomUUID();
    persist({ id, email: "kate@fijord.app", name: "Kate S.", initials: "KS" });
    const existing = localStorage.getItem(TIER_KEY);
    if (!existing) {
      startTrial();
      analyticsIdentify(id, { email: "kate@fijord.app", name: "Kate S." });
      track(AnalyticsEvents.USER_SIGNED_UP, { method: "google" });
      track(AnalyticsEvents.TRIAL_STARTED);
    }
  }, [persist, startTrial]);

  const loginWithMagicLink = useCallback(async (_email: string) => {
    // In production, trigger Supabase magic link email
    await new Promise((r) => setTimeout(r, 400));
  }, []);

  const verifyCode = useCallback(async (email: string, _code: string) => {
    // Mock — accepts any 6-digit code. In production, verify with Supabase OTP.
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/[^a-zA-Z ]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    persist({ id: crypto.randomUUID(), email, name, initials: initials(name) });
    // Start trial if no tier info exists yet
    const existing = localStorage.getItem(TIER_KEY);
    if (!existing) startTrial();
  }, [persist, startTrial]);

  const logout = useCallback(() => {
    persist(null);
    resetAnalytics();
  }, [persist]);

  const resetPassword = useCallback(async (_email: string) => {
    await new Promise((r) => setTimeout(r, 400));
  }, []);

  const trialDaysLeft = getTrialDaysRemaining(tierInfo.trialStartedAt);
  const isPro = isProUser(tierInfo);

  return (
    <AuthContext.Provider value={{
      user, loading, tierInfo, trialDaysLeft, isPro,
      login, signup, loginWithGoogle, loginWithMagicLink, verifyCode, logout, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
