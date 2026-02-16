"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { ProblemsResult, solutionResult, Quote } from "@/lib/types";
import { JiraCreds } from "@/lib/jira";

export type RoadmapTicket = {
  id: string;
  title: string;
  priority: string;
  problemTitle: string;
  problemDescription: string;
  problemColor: string;
  problemQuotes: { text: string; summary?: string; speaker: string }[];
  column: "now" | "next" | "later";
  // Full detail fields (optional — populated when ticket detail is generated)
  status?: string;
  problemStatement?: string;
  description?: string;
  acceptanceCriteria?: string[];
  checkedAC?: number[];
  quotes?: Quote[];
};

const STORAGE_KEY = "fjord-roadmap-v3";
const LINEAR_KEY_STORAGE = "fjord-linear-api-key";
const JIRA_CREDS_STORAGE = "fjord-jira-creds";

function loadLinearApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LINEAR_KEY_STORAGE) || "";
}

function persistLinearApiKey(key: string) {
  if (typeof window === "undefined") return;
  if (key) localStorage.setItem(LINEAR_KEY_STORAGE, key);
  else localStorage.removeItem(LINEAR_KEY_STORAGE);
}

function loadJiraCreds(): JiraCreds | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(JIRA_CREDS_STORAGE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistJiraCreds(creds: JiraCreds | null) {
  if (typeof window === "undefined") return;
  if (creds) localStorage.setItem(JIRA_CREDS_STORAGE, JSON.stringify(creds));
  else localStorage.removeItem(JIRA_CREDS_STORAGE);
}

function loadRoadmap(): RoadmapTicket[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate from v2
      raw = localStorage.getItem("fjord-roadmap-v2");
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem("fjord-roadmap-v2");
      }
    }
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistRoadmap(items: RoadmapTicket[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

type NavContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  result: ProblemsResult | null;
  setResult: (r: ProblemsResult | null) => void;
  solutions: solutionResult[];
  setSolutions: (s: solutionResult[]) => void;
  transcript: string;
  setTranscript: (t: string) => void;
  processingTime: string;
  setProcessingTime: (t: string) => void;
  roadmap: RoadmapTicket[];
  setRoadmap: (items: RoadmapTicket[]) => void;
  addToRoadmap: (items: RoadmapTicket[]) => void;
  updateRoadmapTicket: (id: string, updates: Partial<RoadmapTicket>) => void;
  toast: { msg: string; action?: { label: string; onClick: () => void } } | null;
  showToast: (msg: string, action?: { label: string; onClick: () => void }) => void;
  linearApiKey: string;
  setLinearApiKey: (key: string) => void;
  clearLinearApiKey: () => void;
  jiraCreds: JiraCreds | null;
  setJiraCreds: (creds: JiraCreds) => void;
  clearJiraCreds: () => void;
};

const NavContext = createContext<NavContextType>({
  activeTab: "Discovery",
  setActiveTab: () => {},
  result: null,
  setResult: () => {},
  solutions: [],
  setSolutions: () => {},
  transcript: "",
  setTranscript: () => {},
  processingTime: "0",
  setProcessingTime: () => {},
  roadmap: [],
  setRoadmap: () => {},
  addToRoadmap: () => {},
  updateRoadmapTicket: () => {},
  toast: null,
  showToast: () => {},
  linearApiKey: "",
  setLinearApiKey: () => {},
  clearLinearApiKey: () => {},
  jiraCreds: null,
  setJiraCreds: () => {},
  clearJiraCreds: () => {},
});

export function NavProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("Discovery");
  const [result, setResult] = useState<ProblemsResult | null>(null);
  const [solutions, setSolutions] = useState<solutionResult[]>([]);
  const [transcript, setTranscript] = useState("");
  const [processingTime, setProcessingTime] = useState("0");
  const [roadmap, setRoadmapState] = useState<RoadmapTicket[]>([]);
  const [toast, setToast] = useState<{ msg: string; action?: { label: string; onClick: () => void } } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, action?: { label: string; onClick: () => void }) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, action });
    toastTimer.current = setTimeout(() => setToast(null), action ? 4000 : 2500);
  }, []);

  const [linearApiKey, setLinearApiKeyState] = useState("");
  const [jiraCreds, setJiraCredsState] = useState<JiraCreds | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadRoadmap();
    if (saved.length > 0) setRoadmapState(saved);
    const savedKey = loadLinearApiKey();
    if (savedKey) setLinearApiKeyState(savedKey);
    const savedJira = loadJiraCreds();
    if (savedJira) setJiraCredsState(savedJira);
  }, []);

  const setLinearApiKey = (key: string) => {
    setLinearApiKeyState(key);
    persistLinearApiKey(key);
  };

  const clearLinearApiKey = () => {
    setLinearApiKeyState("");
    persistLinearApiKey("");
  };

  const setJiraCreds = (creds: JiraCreds) => {
    setJiraCredsState(creds);
    persistJiraCreds(creds);
  };

  const clearJiraCreds = () => {
    setJiraCredsState(null);
    persistJiraCreds(null);
  };

  const setRoadmap = (items: RoadmapTicket[]) => {
    setRoadmapState(items);
    persistRoadmap(items);
  };

  const addToRoadmap = (newItems: RoadmapTicket[]) => {
    setRoadmapState((prev) => {
      const existingIds = new Set(prev.map((i) => i.id));
      const unique = newItems.filter((i) => !existingIds.has(i.id));
      const merged = [...prev, ...unique];
      persistRoadmap(merged);
      return merged;
    });
  };

  const updateRoadmapTicket = (id: string, updates: Partial<RoadmapTicket>) => {
    setRoadmapState((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      persistRoadmap(updated);
      return updated;
    });
  };

  return (
    <NavContext.Provider
      value={{
        activeTab,
        setActiveTab,
        result,
        setResult,
        solutions,
        setSolutions,
        transcript,
        setTranscript,
        processingTime,
        setProcessingTime,
        roadmap,
        setRoadmap,
        addToRoadmap,
        updateRoadmapTicket,
        toast,
        showToast,
        linearApiKey,
        setLinearApiKey,
        clearLinearApiKey,
        jiraCreds,
        setJiraCreds,
        clearJiraCreds,
      }}
    >
      {children}

      {/* Global toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[fadeInUp_0.2s_ease-out]">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            {toast.msg}
            {toast.action && (
              <button
                onClick={() => { toast.action!.onClick(); setToast(null); }}
                className="ml-1 font-semibold text-accent transition-colors hover:text-accent/80"
              >
                {toast.action.label} &rarr;
              </button>
            )}
          </div>
        </div>
      )}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
