import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "./components/app-shell";
import ErrorBoundary from "./components/error-boundary";
import AnalyticsProvider from "./components/analytics-provider";
import { NavProvider } from "./nav-context";
import { AuthProvider } from "./auth-context";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fijord",
  description: "Extract problems, solutions, and tickets from meeting transcripts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} antialiased`}>
        <AuthProvider>
          <AnalyticsProvider>
            <NavProvider>
              <ErrorBoundary>
                <AppShell>{children}</AppShell>
              </ErrorBoundary>
            </NavProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
