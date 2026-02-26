"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const AUTH_KEY = "fjord-auth";

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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const persist = useCallback((u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    else localStorage.removeItem(AUTH_KEY);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    // Mock login — in production, call Supabase auth
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/[^a-zA-Z ]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    persist({ id: crypto.randomUUID(), email, name, initials: initials(name) });
  }, [persist]);

  const signup = useCallback(async (email: string, _password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 600));
    persist({ id: crypto.randomUUID(), email, name, initials: initials(name) });
  }, [persist]);

  const loginWithGoogle = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600));
    persist({ id: crypto.randomUUID(), email: "kate@fijord.app", name: "Kate S.", initials: "KS" });
  }, [persist]);

  const loginWithMagicLink = useCallback(async (_email: string) => {
    // In production, trigger Supabase magic link email
    await new Promise((r) => setTimeout(r, 400));
  }, []);

  const verifyCode = useCallback(async (email: string, _code: string) => {
    // Mock — accepts any 6-digit code. In production, verify with Supabase OTP.
    await new Promise((r) => setTimeout(r, 600));
    const name = email.split("@")[0].replace(/[^a-zA-Z ]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    persist({ id: crypto.randomUUID(), email, name, initials: initials(name) });
  }, [persist]);

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const resetPassword = useCallback(async (_email: string) => {
    await new Promise((r) => setTimeout(r, 400));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, loginWithMagicLink, verifyCode, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
