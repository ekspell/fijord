"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useNav } from "@/app/nav-context";
import { useAuth } from "@/app/auth-context";
import { MOCK_EPICS, STATUS_STYLES } from "@/lib/mock-epics";
import { MOCK_SIGNALS, MOCK_MEETING_RECORDS } from "@/lib/mock-data";
import CreateEpicModal from "./create-epic-modal";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast, demoMode, toggleDemoMode } = useNav();
  const { user, logout, trialDaysLeft, isPro, tierInfo } = useAuth();
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateEpic, setShowCreateEpic] = useState(false);

  function handleLogoClick() {
    router.push("/");
    logoClickCount.current++;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 2000);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      toggleDemoMode();
      // After toggle, demoMode flips — show what the new state will be
      showToast(demoMode ? "Mock data restored" : "Empty state mode — no data shown");
    }
  }

  const isEpicsActive =
    pathname === "/epics" || pathname.startsWith("/epic/");
  const isSignalsActive =
    pathname === "/signals" || pathname.startsWith("/signals/");

  const epics = demoMode ? [] : MOCK_EPICS;
  const signals = demoMode ? [] : MOCK_SIGNALS;
  const meetings = demoMode ? [] : MOCK_MEETING_RECORDS;

  // Dynamic counts from data
  const signalCount = signals.length;
  const newSignalCount = signals.filter((s) => s.status === "new").length;

  // Extract current epic id from path
  const currentEpicId = pathname.startsWith("/epic/")
    ? pathname.split("/")[2]
    : null;

  return (
    <>
    {/* Mobile hamburger */}
    <button
      onClick={() => setShowUserMenu(false)}
      className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card md:hidden"
      aria-label="Toggle menu"
      id="sidebar-toggle"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card max-md:hidden"
      style={{ width: 240 }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5"
        style={{ paddingTop: 20, marginBottom: 24 }}
      >
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 text-lg font-semibold text-foreground"
        >
          <svg
            width="109"
            height="54"
            viewBox="0 0 109 54"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-auto"
          >
            <path
              d="M34.6914 20.9738L31.3892 17.6658L18.9455 17.6543L16 20.6286V20.7091H29.4965L16.2244 33.9927L18.376 36.1328L25.2048 29.2868V34.6313H25.268L28.156 31.7376L28.2078 26.301L31.6538 22.8607V36.3457H31.7401L34.6914 33.3944V20.9738Z"
              fill="currentColor"
            />
            <path
              d="M49.8852 33V21.0617H57.5087V22.716H51.9318V26.2122H56.4854V27.8324H51.9318V33H49.8852ZM58.7678 33V24.4556H60.8143V33H58.7678ZM59.7911 23.0571C59.4159 23.0571 59.1032 22.9434 58.8531 22.716C58.6143 22.4886 58.4949 22.2044 58.4949 21.8633C58.4949 21.5108 58.6143 21.2266 58.8531 21.0106C59.1032 20.7832 59.4159 20.6695 59.7911 20.6695C60.1663 20.6695 60.4733 20.7832 60.712 21.0106C60.9622 21.2266 61.0872 21.5108 61.0872 21.8633C61.0872 22.2044 60.9622 22.4886 60.712 22.716C60.4733 22.9434 60.1663 23.0571 59.7911 23.0571ZM61.0138 36.752V35.0125H61.696C62.0826 35.0125 62.3554 34.9329 62.5146 34.7737C62.6852 34.6259 62.7704 34.3644 62.7704 33.9892V24.4556H64.817V34.0062C64.817 34.6657 64.7033 35.1944 64.4759 35.5923C64.2485 36.0016 63.9245 36.2972 63.5038 36.4792C63.0945 36.6611 62.5999 36.752 62.02 36.752H61.0138ZM63.7937 23.0571C63.4185 23.0571 63.1115 22.9434 62.8728 22.716C62.634 22.4886 62.5146 22.2044 62.5146 21.8633C62.5146 21.5108 62.634 21.2266 62.8728 21.0106C63.1115 20.7832 63.4242 20.6695 63.8108 20.6695C64.186 20.6695 64.493 20.7832 64.7317 21.0106C64.9705 21.2266 65.0899 21.5108 65.0899 21.8633C65.0899 22.2044 64.9705 22.4886 64.7317 22.716C64.493 22.9434 64.1803 23.0571 63.7937 23.0571ZM70.627 33.2047C69.8198 33.2047 69.0864 33.0171 68.427 32.6419C67.7789 32.2666 67.2673 31.7436 66.8921 31.0728C66.5169 30.3906 66.3293 29.6118 66.3293 28.7363C66.3293 27.8381 66.5169 27.0536 66.8921 26.3828C67.2786 25.712 67.796 25.189 68.444 24.8138C69.1035 24.4386 69.8368 24.251 70.6441 24.251C71.4741 24.251 72.2131 24.4386 72.8612 24.8138C73.5093 25.189 74.0209 25.712 74.3961 26.3828C74.7713 27.0536 74.9589 27.8381 74.9589 28.7363C74.9589 29.6118 74.7713 30.3906 74.3961 31.0728C74.0209 31.7436 73.5036 32.2666 72.8442 32.6419C72.1961 33.0171 71.457 33.2047 70.627 33.2047ZM70.6441 31.448C71.0534 31.448 71.4229 31.3457 71.7527 31.141C72.0937 30.9364 72.3666 30.6351 72.5713 30.2371C72.7759 29.8278 72.8783 29.3219 72.8783 28.7193C72.8783 28.1167 72.7759 27.6164 72.5713 27.2185C72.378 26.8205 72.1108 26.5192 71.7697 26.3146C71.4286 26.1099 71.0591 26.0076 70.6612 26.0076C70.2632 26.0076 69.8937 26.1099 69.5526 26.3146C69.2115 26.5192 68.9386 26.8205 68.734 27.2185C68.5293 27.6164 68.427 28.1167 68.427 28.7193C68.427 29.3219 68.5293 29.8278 68.734 30.2371C68.9386 30.6351 69.2058 30.9364 69.5355 31.141C69.8766 31.3457 70.2462 31.448 70.6441 31.448ZM76.4507 33V24.4556H78.2755L78.4631 26.0587C78.6678 25.6722 78.9179 25.3481 79.2135 25.0866C79.5205 24.8138 79.8787 24.6091 80.288 24.4727C80.6973 24.3249 81.1521 24.251 81.6524 24.251V26.3998H80.9872C80.6348 26.3998 80.305 26.4453 79.9981 26.5363C79.6911 26.6159 79.4239 26.7523 79.1965 26.9456C78.9691 27.1275 78.7929 27.3833 78.6678 27.7131C78.5541 28.0428 78.4972 28.4521 78.4972 28.941V33H76.4507ZM86.3047 33.2047C85.5088 33.2047 84.7982 33.0114 84.1729 32.6248C83.5589 32.2382 83.07 31.7038 82.7062 31.0217C82.3537 30.3395 82.1775 29.572 82.1775 28.7193C82.1775 27.8552 82.3537 27.0877 82.7062 26.4169C83.07 25.7461 83.5646 25.2174 84.1899 24.8308C84.8266 24.4442 85.5486 24.251 86.3559 24.251C86.9926 24.251 87.5497 24.376 88.0272 24.6262C88.5161 24.8649 88.9027 25.206 89.1869 25.6494V20.7206H91.2335V33H89.4086L89.1869 31.755C89.0164 32.0051 88.8004 32.2439 88.5388 32.4713C88.2773 32.6873 87.9647 32.8636 87.6008 33C87.237 33.1364 86.805 33.2047 86.3047 33.2047ZM86.7481 31.431C87.237 31.431 87.6634 31.3173 88.0272 31.0899C88.4024 30.8511 88.6923 30.5328 88.897 30.1348C89.113 29.7255 89.221 29.2537 89.221 28.7193C89.221 28.1849 89.113 27.7187 88.897 27.3208C88.6923 26.9115 88.4024 26.5931 88.0272 26.3657C87.652 26.1383 87.22 26.0246 86.7311 26.0246C86.2649 26.0246 85.8442 26.1383 85.469 26.3657C85.0938 26.5931 84.7982 26.9115 84.5822 27.3208C84.3775 27.7187 84.2752 28.1849 84.2752 28.7193C84.2752 29.2537 84.3775 29.7255 84.5822 30.1348C84.7982 30.5328 85.0938 30.8511 85.469 31.0899C85.8442 31.3173 86.2706 31.431 86.7481 31.431Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* Search (coming soon) */}
      <div
        className="mx-4 mb-5 flex w-[calc(100%-32px)] cursor-default items-center gap-2 rounded-lg bg-background text-left text-[15px] text-muted/50"
        style={{ padding: "10px 12px" }}
        title="Search — coming soon"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        Search
        <span
          className="ml-auto rounded border border-border bg-card text-xs"
          style={{ padding: "2px 6px", fontSize: 12 }}
        >
          ⌘K
        </span>
      </div>

      {/* Main nav */}
      <nav className="mb-6">
        {/* Home */}
        <button
          onClick={() => router.push("/")}
          className={`flex w-full items-center gap-2.5 px-5 py-2.5 text-[15px] transition-all ${
            pathname === "/"
              ? "bg-accent-green-light text-accent"
              : "text-muted hover:bg-background hover:text-foreground"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </button>

        {/* Signals */}
        <button
          onClick={() => router.push("/signals")}
          className={`flex w-full items-center gap-2.5 px-5 py-2.5 text-[15px] transition-all ${
            isSignalsActive
              ? "bg-accent-green-light text-accent"
              : "text-muted hover:bg-background hover:text-foreground"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Signals
          {signalCount > 0 && (
            <span
              className="ml-auto rounded-full text-xs font-semibold text-white"
              style={{
                background: "#3D5A3D",
                padding: "2px 6px",
                fontSize: 10,
              }}
            >
              {signalCount}
            </span>
          )}
          {newSignalCount > 0 && (
            <span
              className="rounded-full text-xs font-semibold"
              style={{
                background: "#E8F0E8",
                color: "#3D5A3D",
                padding: "2px 6px",
                fontSize: 10,
              }}
            >
              NEW
            </span>
          )}
        </button>

        {/* Epics */}
        <button
          onClick={() => router.push("/epics")}
          className={`flex w-full items-center gap-2.5 px-5 py-2.5 text-[15px] transition-all ${
            isEpicsActive
              ? "bg-accent-green-light text-accent"
              : "text-muted hover:bg-background hover:text-foreground"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          Epics
        </button>
      </nav>

      {/* Epics list */}
      <div className="mb-6">
        <div
          className="px-5 text-muted"
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 8,
          }}
        >
          Epics
        </div>
        {epics.map((epic) => {
          const isActive = currentEpicId === epic.id;
          const dotColor = STATUS_STYLES[epic.status].text;
          return (
            <button
              key={epic.id}
              onClick={() => router.push(`/epic/${epic.id}`)}
              className={`flex w-full items-center gap-2.5 px-5 py-2 text-left transition-all ${
                isActive
                  ? "bg-accent-green-light text-accent"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
              style={{ fontSize: 14 }}
            >
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: dotColor,
                }}
              />
              {epic.title}
            </button>
          );
        })}
        <button
          onClick={() => setShowCreateEpic(true)}
          className="flex w-full items-center gap-2.5 px-5 py-2 text-muted transition-all hover:text-accent"
          style={{ fontSize: 14 }}
        >
          + New project
        </button>
      </div>

      {/* Recent Meetings */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="px-5 text-muted"
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 8,
          }}
        >
          Recent Meetings
        </div>
        {meetings.map((meeting) => (
          <button
            key={meeting.id}
            onClick={() => router.push(`/meeting/${meeting.id}`)}
            className="flex w-full items-center gap-2.5 px-5 py-2 text-left text-muted transition-all hover:bg-background hover:text-foreground"
            style={{ fontSize: 14 }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {meeting.title} · {meeting.date}
          </button>
        ))}
      </div>

      {/* Trial badge */}
      {tierInfo.tier === "pro" && tierInfo.trialStartedAt && trialDaysLeft > 0 && (
        <div className="mx-3 mt-auto mb-2">
          <button
            onClick={() => router.push("/pricing")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent-green-light"
            style={{ background: "#E8F0E8" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs font-medium" style={{ color: "#3D5A3D" }}>
              {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left in trial
            </span>
          </button>
        </div>
      )}
      {tierInfo.tier === "starter" && (
        <div className="mx-3 mt-auto mb-2">
          <button
            onClick={() => router.push("/pricing")}
            className="flex w-full items-center gap-2 rounded-lg border border-accent px-3 py-2 text-left transition-colors hover:bg-accent-green-light"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D5A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xs font-medium text-accent">Upgrade to Pro</span>
          </button>
        </div>
      )}

      {/* User */}
      <div className={`relative ${tierInfo.tier !== "pro" || !tierInfo.trialStartedAt || trialDaysLeft <= 0 ? "mt-auto" : ""} border-t border-border`}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex w-full items-center gap-2.5 transition-colors hover:bg-background"
          style={{ padding: "16px 20px" }}
        >
          <div
            className="flex shrink-0 items-center justify-center rounded-full font-semibold"
            style={{
              width: 32,
              height: 32,
              background: "#E8F0E8",
              color: "#3D5A3D",
              fontSize: 12,
            }}
          >
            {user?.initials ?? "KS"}
          </div>
          <div className="text-left">
            <div className="font-medium" style={{ fontSize: 15 }}>
              {user?.name ?? "Kate S."}
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              PM · Fijord AI
            </div>
          </div>
        </button>

        {showUserMenu && (
          <div
            className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border border-border bg-card shadow-lg"
            style={{ padding: 4 }}
          >
            <div
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted/50 cursor-default"
              title="Coming soon"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              Settings
              <span className="ml-auto text-[10px] text-muted/40">Soon</span>
            </div>
            <button
              onClick={() => { router.push("/pricing"); setShowUserMenu(false); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-background"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              Pricing
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={() => { logout(); setShowUserMenu(false); router.push("/login"); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-accent-red transition-colors hover:bg-accent-red-light"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>
      {showCreateEpic && (
        <CreateEpicModal onClose={() => setShowCreateEpic(false)} />
      )}
    </aside>
    </>
  );
}
