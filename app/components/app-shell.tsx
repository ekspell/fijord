"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSharePage = pathname.startsWith("/share");

  if (isSharePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto pb-8"
        style={{ marginLeft: 240, paddingTop: 32, paddingLeft: 48, paddingRight: 48 }}
      >
        {children}
      </main>
    </div>
  );
}
