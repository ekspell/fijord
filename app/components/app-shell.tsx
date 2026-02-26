"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/app/auth-context";
import Sidebar from "./sidebar";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password"];
const NO_SHELL_PATHS = ["/share", "/login", "/signup", "/forgot-password", "/onboarding"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isNoShell = NO_SHELL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/share");

  // Redirect to login if not authenticated on protected routes
  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic && pathname !== "/") {
      router.replace("/login");
    }
    if (user && PUBLIC_PATHS.some((p) => pathname === p)) {
      router.replace("/");
    }
    if (user && pathname !== "/onboarding" && !localStorage.getItem("fjord-onboarding")) {
      router.replace("/onboarding");
    }
  }, [user, loading, pathname, isPublic, router]);

  if (isNoShell) {
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
