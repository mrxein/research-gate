import "./globals.css";
import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { WorkspaceProvider } from "@/lib/workspace";
import { loadPapers } from "@/lib/papers";
const serif = Newsreader({ subsets: ["latin"], variable: "--f-serif" });
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--f-sans",
});
export const metadata: Metadata = { title: "Paper Vision" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${serif.variable} ${sans.variable} font-sans`}>
        <WorkspaceProvider papers={loadPapers()}>
          <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
