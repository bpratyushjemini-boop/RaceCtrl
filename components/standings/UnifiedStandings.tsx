"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StandingsEntry } from "@/lib/types";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

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
        <SegmentedControl
          options={[
            { label: "Drivers", value: "drivers" },
            { label: "Constructors", value: "constructors" },
          ]}
          selectedValue={activeTab}
          onChange={handleTabChange}
        />
      </div>

      {/* List content container */}
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
    </div>
  );
}
