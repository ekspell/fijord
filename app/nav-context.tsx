"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { ProblemsResult, solutionResult, Quote } from "@/lib/types";
import { JiraCreds } from "@/lib/jira";
import type { RoadmapLane, EpicBrief, Epic } from "@/lib/mock-epics";
import { FeedbackButton, FeedbackModal } from "./components/feedback-modal";
import SearchModal from "./components/search-modal";

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
  editedAt?: string;
};

const DEMO_MODE_KEY = "fjord-demo-mode";
const STORAGE_KEY = "fjord-roadmap-v3";
const RESULT_KEY = "fjord-result";
const SOLUTIONS_KEY = "fjord-solutions";
const TRANSCRIPT_KEY = "fjord-transcript";
const LINEAR_KEY_STORAGE = "fjord-linear-api-key";
const JIRA_CREDS_STORAGE = "fjord-jira-creds";
const FIREFLIES_KEY_STORAGE = "fjord-fireflies-api-key";
const CONVERTED_SIGNALS_KEY = "fjord-converted-signals";
const STAGING_OVERRIDES_KEY = "fjord-staging-overrides";
const BRIEF_KEY = "fjord-brief";
const USER_EPICS_KEY = "fjord-user-epics";
const DELETED_MEETINGS_KEY = "fjord-deleted-meetings";
const SAVED_MEETINGS_KEY = "fjord-saved-meetings";
const DETECTED_SIGNALS_KEY = "fjord-signals";
const SIGNALS_DETECTED_AT_KEY = "fjord-signals-detected-at";
const SIGNALS_STALE_MS = 5 * 60 * 1000; // 5 minutes

export type ConvertedSignalInfo = { epicId: string; epicTitle: string };

export type SavedMeetingProblem = {
  title: string;
  description: string;
  quotes: { text: string; speaker: string }[];
};

export type SavedMeeting = {
  id: string;
  title: string;
  participants: string;
  date: string;
  problemCount: number;
  ticketCount: number;
  savedAt: string;
  problems?: SavedMeetingProblem[];
};

function loadSavedMeetings(): SavedMeeting[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_MEETINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSavedMeetings(meetings: SavedMeeting[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_MEETINGS_KEY, JSON.stringify(meetings));
}

function loadDetectedSignals(): import("@/lib/mock-data").Signal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DETECTED_SIGNALS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistDetectedSignals(signals: import("@/lib/mock-data").Signal[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DETECTED_SIGNALS_KEY, JSON.stringify(signals));
}

function loadConvertedSignals(): Record<string, ConvertedSignalInfo> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CONVERTED_SIGNALS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistConvertedSignals(data: Record<string, ConvertedSignalInfo>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONVERTED_SIGNALS_KEY, JSON.stringify(data));
}

function loadDeletedMeetings(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_MEETINGS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persistDeletedMeetings(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DELETED_MEETINGS_KEY, JSON.stringify([...ids]));
}

function loadUserEpics(): Epic[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_EPICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistUserEpics(epics: Epic[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_EPICS_KEY, JSON.stringify(epics));
}

function loadStagingOverrides(): Record<string, RoadmapLane> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STAGING_OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistStagingOverrides(data: Record<string, RoadmapLane>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STAGING_OVERRIDES_KEY, JSON.stringify(data));
}

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
    const raw = localStorage.getItem(STORAGE_KEY);
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
  removeFromRoadmap: (id: string) => void;
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
  convertedSignals: Record<string, ConvertedSignalInfo>;
  convertSignal: (signalId: string, epicId: string, epicTitle: string) => void;
  isSignalConverted: (signalId: string) => boolean;
  stagingOverrides: Record<string, RoadmapLane>;
  setStagingLane: (ticketId: string, lane: RoadmapLane) => void;
  brief: EpicBrief | null;
  setBrief: (b: EpicBrief | null) => void;
  userEpics: Epic[];
  addEpic: (epic: Epic) => void;
  savedMeetings: SavedMeeting[];
  saveMeeting: (meeting: SavedMeeting) => void;
  detectedSignals: import("@/lib/mock-data").Signal[];
  detectSignals: () => Promise<void>;
  detectSignalsIfStale: () => Promise<void>;
  signalsLoading: boolean;
  deletedMeetings: Set<string>;
  deleteMeeting: (id: string) => void;
  clearSession: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
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
  removeFromRoadmap: () => {},
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
  convertedSignals: {},
  convertSignal: () => {},
  isSignalConverted: () => false,
  stagingOverrides: {},
  setStagingLane: () => {},
  brief: null,
  setBrief: () => {},
  userEpics: [],
  addEpic: () => {},
  savedMeetings: [],
  saveMeeting: () => {},
  detectedSignals: [],
  detectSignals: async () => {},
  detectSignalsIfStale: async () => {},
  signalsLoading: false,
  deletedMeetings: new Set(),
  deleteMeeting: () => {},
  clearSession: () => {},
  searchOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
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
  const [convertedSignals, setConvertedSignals] = useState<Record<string, ConvertedSignalInfo>>({});
  const [stagingOverrides, setStagingOverrides] = useState<Record<string, RoadmapLane>>({});
  const [brief, setBriefState] = useState<EpicBrief | null>(null);
  const [userEpics, setUserEpics] = useState<Epic[]>([]);
  const [savedMeetings, setSavedMeetings] = useState<SavedMeeting[]>([]);
  const [detectedSignals, setDetectedSignals] = useState<import("@/lib/mock-data").Signal[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [signalsDetectedAt, setSignalsDetectedAt] = useState<number>(0);
  const [deletedMeetings, setDeletedMeetings] = useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Global Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const saveMeeting = useCallback((meeting: SavedMeeting) => {
    setSavedMeetings((prev) => {
      // Don't duplicate — update if same id exists
      const filtered = prev.filter((m) => m.id !== meeting.id);
      const next = [meeting, ...filtered];
      persistSavedMeetings(next);
      return next;
    });
  }, []);

  const detectSignals = useCallback(async () => {
    const currentMeetings = loadSavedMeetings();
    console.log(`[signals] Saved meetings: ${currentMeetings.length}, with problems: ${currentMeetings.filter((m) => m.problems && m.problems.length > 0).length}`);
    if (currentMeetings.length < 2) {
      console.log("[signals] Skipped: need 2+ saved meetings");
      return;
    }

    const meetingsWithProblems = currentMeetings.filter((m) => m.problems && m.problems.length > 0);
    if (meetingsWithProblems.length < 2) {
      console.log("[signals] Skipped: need 2+ meetings with problems data");
      return;
    }

    setSignalsLoading(true);
    try {
      const payload = meetingsWithProblems.map((m) => ({
        id: m.id,
        title: m.title,
        date: m.date,
        problems: (m.problems || []).map((p) => ({
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.date,
          problemTitle: p.title,
          problemDescription: p.description,
          quotes: p.quotes,
        })),
      }));

      console.log(`[signals] Sending ${payload.length} meetings to detect-signals API`);
      const res = await fetch("/api/detect-signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetings: payload }),
      });

      if (res.ok) {
        const data = await res.json();
        const signals = data.signals || [];
        console.log(`[signals] Detected ${signals.length} signals`);
        setDetectedSignals(signals);
        persistDetectedSignals(signals);
        const now = Date.now();
        setSignalsDetectedAt(now);
        if (typeof window !== "undefined") {
          localStorage.setItem(SIGNALS_DETECTED_AT_KEY, String(now));
        }
      } else {
        const errorText = await res.text();
        console.error(`[signals] API error ${res.status}:`, errorText);
      }
    } catch (err) {
      console.error("[signals] Detection failed:", err);
    } finally {
      setSignalsLoading(false);
    }
  }, []);

  const detectSignalsIfStale = useCallback(async () => {
    const elapsed = Date.now() - signalsDetectedAt;
    if (elapsed > SIGNALS_STALE_MS) {
      await detectSignals();
    }
  }, [signalsDetectedAt, detectSignals]);

  const deleteMeeting = useCallback((id: string) => {
    setDeletedMeetings((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistDeletedMeetings(next);
      return next;
    });
    // Also remove from saved meetings
    setSavedMeetings((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persistSavedMeetings(next);
      return next;
    });
  }, []);

  const clearSession = useCallback(() => {
    setResultState(null);
    setSolutionsState([]);
    setTranscriptState("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(RESULT_KEY);
      localStorage.removeItem(SOLUTIONS_KEY);
      localStorage.removeItem(TRANSCRIPT_KEY);
    }
  }, []);

  const addEpic = useCallback((epic: Epic) => {
    setUserEpics((prev) => {
      const next = [...prev, epic];
      persistUserEpics(next);
      return next;
    });
  }, []);

  const setStagingLane = useCallback((ticketId: string, lane: RoadmapLane) => {
    setStagingOverrides((prev) => {
      const next = { ...prev, [ticketId]: lane };
      persistStagingOverrides(next);
      return next;
    });
  }, []);

  const convertSignal = useCallback((signalId: string, epicId: string, epicTitle: string) => {
    setConvertedSignals((prev) => {
      const next = { ...prev, [signalId]: { epicId, epicTitle } };
      persistConvertedSignals(next);
      return next;
    });
  }, []);

  const isSignalConverted = useCallback(
    (signalId: string) => signalId in convertedSignals,
    [convertedSignals]
  );

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
      if (r) localStorage.setItem(RESULT_KEY, JSON.stringify(r));
      else localStorage.removeItem(RESULT_KEY);
    }
  }, []);

  const setSolutions = useCallback((s: solutionResult[]) => {
    setSolutionsState(s);
    if (typeof window !== "undefined") {
      if (s.length > 0) localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(s));
      else localStorage.removeItem(SOLUTIONS_KEY);
    }
  }, []);

  const setTranscript = useCallback((t: string) => {
    setTranscriptState(t);
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem(TRANSCRIPT_KEY, t);
      else localStorage.removeItem(TRANSCRIPT_KEY);
    }
  }, []);

  const setBrief = useCallback((b: EpicBrief | null) => {
    setBriefState(b);
    if (typeof window !== "undefined") {
      if (b) localStorage.setItem(BRIEF_KEY, JSON.stringify(b));
      else localStorage.removeItem(BRIEF_KEY);
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
    const savedConverted = loadConvertedSignals();
    if (Object.keys(savedConverted).length > 0) setConvertedSignals(savedConverted);
    const savedStagingOverrides = loadStagingOverrides();
    if (Object.keys(savedStagingOverrides).length > 0) setStagingOverrides(savedStagingOverrides);
    const savedUserEpics = loadUserEpics();
    if (savedUserEpics.length > 0) setUserEpics(savedUserEpics);
    const savedDeletedMeetings = loadDeletedMeetings();
    if (savedDeletedMeetings.size > 0) setDeletedMeetings(savedDeletedMeetings);
    const savedMeetingsList = loadSavedMeetings();
    if (savedMeetingsList.length > 0) setSavedMeetings(savedMeetingsList);
    const savedSignals = loadDetectedSignals();
    if (savedSignals.length > 0) setDetectedSignals(savedSignals);
    const savedDetectedAt = localStorage.getItem(SIGNALS_DETECTED_AT_KEY);
    if (savedDetectedAt) setSignalsDetectedAt(Number(savedDetectedAt));

    // Restore session data
    try {
      const savedResult = localStorage.getItem(RESULT_KEY);
      if (savedResult) {
        setResultState(JSON.parse(savedResult));
      }
      const savedSolutions = localStorage.getItem(SOLUTIONS_KEY);
      if (savedSolutions) setSolutionsState(JSON.parse(savedSolutions));
      const savedTranscript = localStorage.getItem(TRANSCRIPT_KEY);
      if (savedTranscript) setTranscriptState(savedTranscript);
      const savedBrief = localStorage.getItem(BRIEF_KEY);
      if (savedBrief) setBriefState(JSON.parse(savedBrief));
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

  const removeFromRoadmap = useCallback((id: string) => {
    setRoadmapState((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      persistRoadmap(filtered);
      return filtered;
    });
  }, []);

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
        removeFromRoadmap,
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
        convertedSignals,
        convertSignal,
        isSignalConverted,
        stagingOverrides,
        setStagingLane,
        brief,
        setBrief,
        userEpics,
        addEpic,
        savedMeetings,
        saveMeeting,
        detectedSignals,
        detectSignals,
        detectSignalsIfStale,
        signalsLoading,
        deletedMeetings,
        deleteMeeting,
        clearSession,
        searchOpen,
        openSearch,
        closeSearch,
      }}
    >
      {children}

      {/* Global search modal */}
      <SearchModal open={searchOpen} onClose={closeSearch} deletedMeetings={deletedMeetings} />

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
