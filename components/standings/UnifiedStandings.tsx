"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StandingsEntry } from "@/lib/types";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface UnifiedStandingsProps {
  drivers: StandingsEntry[];
  constructors: StandingsEntry[];
  initialTab: "drivers" | "constructors";
}

export function UnifiedStandings({
  drivers,
  constructors,
  initialTab,
}: UnifiedStandingsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"drivers" | "constructors">(initialTab);

  const handleTabChange = (tab: "drivers" | "constructors") => {
    setActiveTab(tab);
    router.replace(`/standings?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title block matching Figma standings hierarchy */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          Championship
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
          Standings
        </h1>
      </div>

      {/* Segmented control: Drivers / Constructors */}
      <div className="w-full max-w-sm">
        <div className="flex h-10 p-[3px] bg-surface-2/65 border border-outline/30 rounded-full">
          <button
            type="button"
            onClick={() => handleTabChange("drivers")}
            className={`flex-1 flex items-center justify-center text-[13px] font-bold tracking-widest uppercase rounded-full transition-all cursor-pointer select-none ${
              activeTab === "drivers"
                ? "bg-surface text-on-surface border border-outline/35 shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Drivers
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("constructors")}
            className={`flex-1 flex items-center justify-center text-[13px] font-bold tracking-widest uppercase rounded-full transition-all cursor-pointer select-none ${
              activeTab === "constructors"
                ? "bg-surface text-on-surface border border-outline/35 shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Constructors
          </button>
        </div>
      </div>

      {/* List content container */}
      <ScrollReveal delay={0}>
        <div className="w-full">
          {activeTab === "drivers" ? (
            <StandingsTable
              entries={drivers}
              emptyLabel="No driver standings yet"
              emptyHint="Results will appear here once a session is recorded."
            />
          ) : (
            <StandingsTable
              entries={constructors}
              emptyLabel="No constructor standings yet"
              emptyHint="Results will appear here once a session is recorded."
            />
          )}
        </div>
      </ScrollReveal>
    </div>
  );
}
