"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { type TierInfo, type UserTier, getTrialDaysRemaining, isTrialExpired, isProUser } from "@/lib/trial";
import { track, identify as analyticsIdentify, resetAnalytics, AnalyticsEvents } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { PAYWALL_ENABLED } from "@/lib/config";
import type { User as SupabaseUser } from "@supabase/supabase-js";

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
  loginWithMagicLink: (email: string, shouldCreateUser?: boolean) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  loginAsGuest: () => void;
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
  loginAsGuest: () => {},
  logout: () => {},
  resetPassword: async () => {},
});

function computeInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  const email = supabaseUser.email ?? "";
  const name =
    supabaseUser.user_metadata?.full_name ||
    email.split("@")[0].replace(/[^a-zA-Z ]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: supabaseUser.id,
    email,
    name,
    initials: computeInitials(name),
    avatar: supabaseUser.user_metadata?.avatar_url,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tierInfo, setTierInfo] = useState<TierInfo>(DEFAULT_TIER);

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

  useEffect(() => {
    // Load tier info from localStorage
    try {
      const savedTier = localStorage.getItem(TIER_KEY);
      if (savedTier) {
        const parsed: TierInfo = JSON.parse(savedTier);
        if (isTrialExpired(parsed) && parsed.tier === "pro") {
          parsed.tier = "starter";
          localStorage.setItem(TIER_KEY, JSON.stringify(parsed));
        }
        setTierInfo(parsed);
      }
    } catch { /* ignore */ }

    // Check for existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
    startTrial();
    if (data.user) {
      analyticsIdentify(data.user.id, { email, name });
    }
    track(AnalyticsEvents.USER_SIGNED_UP, { method: "email" });
    track(AnalyticsEvents.TRIAL_STARTED);
  }, [startTrial]);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
    // Browser redirects to Google — onAuthStateChange handles the rest after callback
  }, []);

  const loginWithMagicLink = useCallback(async (email: string, shouldCreateUser = true) => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser } });
    if (error) throw error;
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (error) throw error;
    // Start trial if no tier info exists yet (new user)
    const existing = localStorage.getItem(TIER_KEY);
    if (!existing) startTrial();
  }, [startTrial]);

  const loginAsGuest = useCallback(() => {
    const guest: User = {
      id: "guest",
      email: "guest@fijord.app",
      name: "Guest User",
      initials: "GU",
    };
    setUser(guest);
    startTrial();
  }, [startTrial]);

  const logout = useCallback(() => {
    supabase.auth.signOut();
    setUser(null);
    resetAnalytics();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const trialDaysLeft = getTrialDaysRemaining(tierInfo.trialStartedAt);
  const isPro = !PAYWALL_ENABLED || isProUser(tierInfo);

  return (
    <AuthContext.Provider value={{
      user, loading, tierInfo, trialDaysLeft, isPro,
      login, signup, loginWithGoogle, loginWithMagicLink, verifyCode, loginAsGuest, logout, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
