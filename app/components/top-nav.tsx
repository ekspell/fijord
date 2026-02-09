"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Discovery", href: "/" },
  { label: "Scope", href: "/scope" },
  { label: "Roadmap", href: "/roadmap" },
];

export default function TopNav() {
  const pathname = usePathname();

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
          const isActive =
            tab.href === "/"
              ? pathname === "/" || pathname.startsWith("/meeting")
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
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
