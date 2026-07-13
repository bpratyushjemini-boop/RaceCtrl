import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { SystemSurface } from "@/components/system/SystemSurface";
import { PageTransition } from "@/components/motion/PageTransition";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <TopNav />
      <main
        className={[
          "mx-auto w-full max-w-6xl flex-1 px-4 pt-4",
          // Mobile PWA: height (64px) + margin (16px) + safe area inset
          "pb-[calc(92px+env(safe-area-inset-bottom))] md:pb-8",
        ].join(" ")}
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <SystemSurface />
      <BottomNav />
    </div>
  );
}

