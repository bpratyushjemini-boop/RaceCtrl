import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { SystemSurface } from "@/components/system/SystemSurface";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <TopNav />
      <main
        className={[
          "mx-auto w-full max-w-6xl flex-1 px-4 pt-4",
          // Mobile: pb-32 accounts for the floating pill (64px) + 16px bottom margin + 16px breathing room
          // md+: pb-8 as before (desktop has no bottom tab bar)
          "pb-32 md:pb-8",
        ].join(" ")}
      >
        {children}
      </main>
      <SystemSurface />
      <BottomNav />
    </div>
  );
}

