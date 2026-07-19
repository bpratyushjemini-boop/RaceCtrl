import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { SystemSurface } from "@/components/system/SystemSurface";
import { PageTransition } from "@/components/motion/PageTransition";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopNav />
        <main
          className={[
            "mx-auto w-full max-w-6xl flex-1 px-4 pt-4",
            "pb-[calc(92px+env(safe-area-inset-bottom))] md:pb-8",
          ].join(" ")}
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <SystemSurface />
      <BottomNav />
    </div>
  );
}

