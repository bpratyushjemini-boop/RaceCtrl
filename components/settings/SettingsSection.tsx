import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Group header section */}
      <div className="flex items-center gap-1.5 px-1">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
          {title}
        </span>
      </div>

      {/* Card wrapper */}
      <GlassCard variant="structural" className="overflow-hidden">
        <ul className="list-none p-0 m-0 divide-y divide-outline/35">
          {children}
        </ul>
      </GlassCard>
    </div>
  );
}
