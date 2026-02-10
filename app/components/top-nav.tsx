"use client";

import { useNav } from "../nav-context";

const tabs = ["Discovery", "Scope", "Roadmap"];

export default function TopNav() {
  const { activeTab, setActiveTab, result, roadmap } = useNav();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/85 px-8 backdrop-blur-md" style={{ height: 56 }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <span className="text-sm font-bold text-white">F</span>
        </div>
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Fjord
        </span>
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 rounded-xl border border-border bg-card p-1">
        {tabs.map((tab) => {
          const disabled =
            (tab === "Scope" && !result) ||
            (tab === "Roadmap" && !result && roadmap.length === 0);
          return (
            <button
              key={tab}
              onClick={() => !disabled && setActiveTab(tab)}
              disabled={disabled}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : disabled
                    ? "cursor-not-allowed text-muted/40"
                    : "cursor-pointer text-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Avatar */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
        KS
      </div>
    </header>
  );
}
