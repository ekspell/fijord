"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProblemsResult, solutionResult, Quote } from "@/lib/types";

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
});

export function NavProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("Discovery");
  const [result, setResult] = useState<ProblemsResult | null>(null);
  const [solutions, setSolutions] = useState<solutionResult[]>([]);
  const [transcript, setTranscript] = useState("");
  const [processingTime, setProcessingTime] = useState("0");
  const [roadmap, setRoadmapState] = useState<RoadmapTicket[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadRoadmap();
    if (saved.length > 0) setRoadmapState(saved);
  }, []);

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
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
