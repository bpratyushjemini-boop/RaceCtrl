import type { ReactNode } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <TopNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-4 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
