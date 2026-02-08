import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Good morning, Kate
        </h1>
        <p className="mt-1 text-sm text-muted">
          Here&apos;s what&apos;s happening across your discovery calls.
        </p>
      </div>

      {/* Action cards */}
      <div className="mb-10 grid grid-cols-2 gap-4">
        <Link
          href="/meeting/new"
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-accent/30"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8E6E1]/60">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H16C16.5304 20 17.0391 19.7893 17.4142 19.4142C17.7893 19.0391 18 18.5304 18 18V7L13 2Z" stroke="#8C8C8C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 2V7H18" stroke="#8C8C8C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">New meeting</p>
            <p className="text-xs text-muted">Paste a transcript or begin recording</p>
          </div>
        </Link>

        <button className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors hover:border-accent/30">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE9F6]">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="10" width="16" height="2" rx="1" fill="#4A90D9"/>
              <path d="M7 10L11 6L15 10" stroke="#E74C3C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 6V2" stroke="#E74C3C" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M3 12L3 16C3 17.1046 3.89543 18 5 18H17C18.1046 18 19 17.1046 19 16V12" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Upload documents</p>
            <p className="text-xs text-muted">Upload artifacts to extract evidence</p>
          </div>
        </button>
      </div>

      {/* Emerging patterns */}
      <div className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Emerging patterns</h2>
          <Link href="/patterns" className="text-sm font-medium text-accent hover:text-accent-light">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {([
            {
              title: "Users lose context switching tabs",
              calls: 5,
              totalCalls: 6,
              quotes: 14,
              color: "#3D5A3D",
              tags: ["navigation", "tabs", "context"],
              progress: 83,
            },
            {
              title: "Onboarding flow too long",
              calls: 5,
              totalCalls: 6,
              quotes: 14,
              color: "#2856C3",
              tags: ["roles", "empty-state", "invite-flow"],
              progress: 83,
            },
            {
              title: "Search results not relevant",
              calls: 5,
              totalCalls: 6,
              quotes: 14,
              color: "#C49A20",
              tags: ["roles", "empty-state", "invite-flow"],
              progress: 83,
              suggestion: "Recurring pattern \u2014 consider creating a project",
            },
            {
              title: "Mobile nav is confusing",
              calls: 3,
              totalCalls: 6,
              quotes: 8,
              color: "#7C3AED",
              tags: ["mobile", "hamburger", "gestures"],
              progress: 50,
            },
          ] as const).map((pattern) => (
            <div
              key={pattern.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: pattern.color }}
                  />
                  <h3 className="text-sm font-semibold text-foreground">
                    {pattern.title}
                  </h3>
                </div>
                <span
                  className="shrink-0 rounded-md border px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    color: pattern.color,
                    borderColor: `${pattern.color}33`,
                    backgroundColor: `${pattern.color}0D`,
                  }}
                >
                  Project
                </span>
              </div>

              <p className="mt-1.5 pl-5 text-xs text-muted">
                Mentioned in {pattern.calls} of {pattern.totalCalls} calls &middot; {pattern.quotes} quotes
              </p>

              <div className="mt-3 ml-5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pattern.progress}%`,
                    backgroundColor: pattern.color,
                  }}
                />
              </div>

              <div className="mt-3 flex gap-2 pl-5">
                {pattern.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-background px-2.5 py-1 text-xs text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {"suggestion" in pattern && pattern.suggestion && (
                <p className="mt-3 pl-5 text-xs font-medium text-amber-600">
                  &#x26A1; {pattern.suggestion}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Epics */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Epics</h2>
          <Link href="/epics" className="text-sm font-medium text-accent hover:text-accent-light">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {([
            {
              title: "Onboarding confusion",
              description: "Users report unclear steps during initial setup and role assignment.",
              owner: "Lauren Baker",
              duration: 74,
              status: "On track",
              color: "#3D5A3D",
            },
            {
              title: "Search relevance",
              description: "Search results don't surface the most relevant content for common queries.",
              owner: "Lauren Baker",
              duration: 45,
              status: "On track",
              color: "#2856C3",
            },
            {
              title: "Context switching",
              description: "Users lose context when navigating between tabs and workspaces.",
              owner: "Lauren Baker",
              duration: 30,
              status: "On track",
              color: "#3D5A3D",
            },
            {
              title: "Mobile navigation",
              description: "Hamburger menu and gesture navigation confuse new mobile users.",
              owner: "Lauren Baker",
              duration: 12,
              status: "On track",
              color: "#7C3AED",
            },
          ] as const).map((epic) => (
            <div
              key={epic.title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {epic.title}
                </h3>
                <span
                  className="flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    color: epic.color,
                    borderColor: `${epic.color}33`,
                    backgroundColor: `${epic.color}0D`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: epic.color }}
                  />
                  {epic.status}
                </span>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-muted">
                {epic.description}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 overflow-hidden rounded-full bg-border">
                    <svg viewBox="0 0 24 24" fill="none" className="h-full w-full text-muted">
                      <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.5"/>
                      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="currentColor" opacity="0.3"/>
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-foreground">
                    {epic.owner}
                  </span>
                </div>
                <span className="rounded-md bg-background px-2.5 py-1 text-xs text-muted">
                  Duration: {epic.duration} days
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
