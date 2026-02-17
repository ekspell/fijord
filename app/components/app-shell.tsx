"use client";

import { usePathname } from "next/navigation";
import TopNav from "./top-nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSharePage = pathname.startsWith("/share");

  if (isSharePage) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNav />
      <main className="overflow-y-auto px-8 pt-10 pb-8">
        {children}
      </main>
    </>
  );
}
