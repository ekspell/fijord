"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ProblemsResult, solutionResult } from "@/lib/types";

export type SavedInitiative = {
  id: string;
  title: string;
  description: string;
  ticketCount: number;
  quoteCount: number;
  problemLabel: string;
  items: { name: string; id: string; priority: string }[];
  column: "now" | "next" | "later";
};

const STORAGE_KEY = "fjord-roadmap";

function loadRoadmap(): SavedInitiative[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistRoadmap(items: SavedInitiative[]) {
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
  roadmap: SavedInitiative[];
  setRoadmap: (items: SavedInitiative[]) => void;
  addToRoadmap: (items: SavedInitiative[]) => void;
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
});

export function NavProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState("Discovery");
  const [result, setResult] = useState<ProblemsResult | null>(null);
  const [solutions, setSolutions] = useState<solutionResult[]>([]);
  const [transcript, setTranscript] = useState("");
  const [processingTime, setProcessingTime] = useState("0");
  const [roadmap, setRoadmapState] = useState<SavedInitiative[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadRoadmap();
    if (saved.length > 0) setRoadmapState(saved);
  }, []);

  const setRoadmap = (items: SavedInitiative[]) => {
    setRoadmapState(items);
    persistRoadmap(items);
  };

  const addToRoadmap = (newItems: SavedInitiative[]) => {
    setRoadmapState((prev) => {
      // Deduplicate by id
      const existingIds = new Set(prev.map((i) => i.id));
      const unique = newItems.filter((i) => !existingIds.has(i.id));
      const merged = [...prev, ...unique];
      persistRoadmap(merged);
      return merged;
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
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
