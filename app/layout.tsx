import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import TopNav from "./components/top-nav";
import { NavProvider } from "./nav-context";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fjord",
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
        <NavProvider>
          <TopNav />
          <main className="overflow-y-auto px-8 pt-4 pb-8">
            {children}
          </main>
        </NavProvider>
      </body>
    </html>
  );
}
