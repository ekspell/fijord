"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { ProblemsResult, solutionResult, Quote } from "@/lib/types";
import { JiraCreds } from "@/lib/jira";
import { FeedbackButton, FeedbackModal } from "./components/feedback-modal";

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

const DEMO_MODE_KEY = "fjord-demo-mode";
const STORAGE_KEY = "fjord-roadmap-v3";
const RESULT_KEY = "fjord-result";
const SOLUTIONS_KEY = "fjord-solutions";
const TRANSCRIPT_KEY = "fjord-transcript";
const LINEAR_KEY_STORAGE = "fjord-linear-api-key";
const JIRA_CREDS_STORAGE = "fjord-jira-creds";
const FIREFLIES_KEY_STORAGE = "fjord-fireflies-api-key";

function loadLinearApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LINEAR_KEY_STORAGE) || "";
}

function persistLinearApiKey(key: string) {
  if (typeof window === "undefined") return;
  if (key) localStorage.setItem(LINEAR_KEY_STORAGE, key);
  else localStorage.removeItem(LINEAR_KEY_STORAGE);
}

function loadFirefliesApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(FIREFLIES_KEY_STORAGE) || "";
}

function persistFirefliesApiKey(key: string) {
  if (typeof window === "undefined") return;
  if (key) localStorage.setItem(FIREFLIES_KEY_STORAGE, key);
  else localStorage.removeItem(FIREFLIES_KEY_STORAGE);
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
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistRoadmap(items: RoadmapTicket[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
  firefliesApiKey: string;
  setFirefliesApiKey: (key: string) => void;
  clearFirefliesApiKey: () => void;
  showLanding: boolean;
  setShowLanding: (v: boolean) => void;
  triggerFeedback: () => void;
  demoMode: boolean;
  toggleDemoMode: () => void;
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
  firefliesApiKey: "",
  setFirefliesApiKey: () => {},
  clearFirefliesApiKey: () => {},
  showLanding: true,
  setShowLanding: () => {},
  triggerFeedback: () => {},
  demoMode: false,
  toggleDemoMode: () => {},
});

export function NavProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("Discovery");
  const [result, setResultState] = useState<ProblemsResult | null>(null);
  const [solutions, setSolutionsState] = useState<solutionResult[]>([]);
  const [transcript, setTranscriptState] = useState("");
  const [processingTime, setProcessingTime] = useState("0");
  const [roadmap, setRoadmapState] = useState<RoadmapTicket[]>([]);
  const [showLanding, setShowLanding] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const toggleDemoMode = useCallback(() => {
    setDemoMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        if (next) localStorage.setItem(DEMO_MODE_KEY, "1");
        else localStorage.removeItem(DEMO_MODE_KEY);
      }
      return next;
    });
  }, []);

  const setResult = useCallback((r: ProblemsResult | null) => {
    setResultState(r);
    if (typeof window !== "undefined") {
      if (r) sessionStorage.setItem(RESULT_KEY, JSON.stringify(r));
      else sessionStorage.removeItem(RESULT_KEY);
    }
  }, []);

  const setSolutions = useCallback((s: solutionResult[]) => {
    setSolutionsState(s);
    if (typeof window !== "undefined") {
      if (s.length > 0) sessionStorage.setItem(SOLUTIONS_KEY, JSON.stringify(s));
      else sessionStorage.removeItem(SOLUTIONS_KEY);
    }
  }, []);

  const setTranscript = useCallback((t: string) => {
    setTranscriptState(t);
    if (typeof window !== "undefined") {
      if (t) sessionStorage.setItem(TRANSCRIPT_KEY, t);
      else sessionStorage.removeItem(TRANSCRIPT_KEY);
    }
  }, []);

  const triggerFeedback = useCallback(() => {
    setShowFeedbackModal(true);
  }, []);
  const [toast, setToast] = useState<{ msg: string; action?: { label: string; onClick: () => void } } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, action?: { label: string; onClick: () => void }) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, action });
    toastTimer.current = setTimeout(() => setToast(null), action ? 4000 : 2500);
  }, []);

  const [linearApiKey, setLinearApiKeyState] = useState("");
  const [jiraCreds, setJiraCredsState] = useState<JiraCreds | null>(null);
  const [firefliesApiKey, setFirefliesApiKeyState] = useState("");

  // Load from storage on mount
  useEffect(() => {
    const saved = loadRoadmap();
    if (saved.length > 0) setRoadmapState(saved);
    const savedKey = loadLinearApiKey();
    if (savedKey) setLinearApiKeyState(savedKey);
    const savedJira = loadJiraCreds();
    if (savedJira) setJiraCredsState(savedJira);
    const savedFireflies = loadFirefliesApiKey();
    if (savedFireflies) setFirefliesApiKeyState(savedFireflies);
    const savedDemo = localStorage.getItem(DEMO_MODE_KEY);
    if (savedDemo === "1") setDemoMode(true);

    // Restore session data
    try {
      const savedResult = sessionStorage.getItem(RESULT_KEY);
      if (savedResult) {
        setResultState(JSON.parse(savedResult));
      }
      const savedSolutions = sessionStorage.getItem(SOLUTIONS_KEY);
      if (savedSolutions) setSolutionsState(JSON.parse(savedSolutions));
      const savedTranscript = sessionStorage.getItem(TRANSCRIPT_KEY);
      if (savedTranscript) setTranscriptState(savedTranscript);
    } catch { /* ignore parse errors */ }
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

  const setFirefliesApiKey = (key: string) => {
    setFirefliesApiKeyState(key);
    persistFirefliesApiKey(key);
  };

  const clearFirefliesApiKey = () => {
    setFirefliesApiKeyState("");
    persistFirefliesApiKey("");
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
        firefliesApiKey,
        setFirefliesApiKey,
        clearFirefliesApiKey,
        showLanding,
        setShowLanding,
        triggerFeedback,
        demoMode,
        toggleDemoMode,
      }}
    >
      {children}

      {/* Floating feedback button */}
      <FeedbackButton showToast={showToast} hidden={showLanding} />

      {/* Triggered feedback modal */}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onSubmitted={() => {
            setShowFeedbackModal(false);
            showToast("Thanks for your feedback!");
          }}
        />
      )}

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
