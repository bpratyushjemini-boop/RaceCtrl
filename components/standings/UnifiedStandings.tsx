import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StandingsEntry } from "@/lib/types";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { GlassCard } from "@/components/ui/GlassCard";

interface UnifiedStandingsProps {
  drivers: StandingsEntry[];
  constructors: StandingsEntry[];
  initialTab: "drivers" | "constructors";
  season: string;
}

export function UnifiedStandings({
  drivers,
  constructors,
  initialTab,
  season,
}: UnifiedStandingsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"drivers" | "constructors">(initialTab);

  const handleTabChange = (tab: "drivers" | "constructors") => {
    setActiveTab(tab);
    router.replace(`/standings?tab=${tab}`, { scroll: false });
  };

  const activeList = activeTab === "drivers" ? drivers : constructors;
  const leader = activeList[0] ?? null;
  const runnerUp = activeList[1] ?? null;
  const leadGap = leader && runnerUp ? leader.points - runnerUp.points : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Title block matching Figma standings hierarchy */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          {season} Championship
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

      {/* Championship Leader Context Banner */}
      {leader && (
        <GlassCard className="p-4 flex items-center justify-between border border-outline/15 shadow-sm" variant="structural">
          <div>
            <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
              {activeTab === "drivers" ? "Drivers Leader" : "Constructors Leader"}
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[15px] font-bold text-on-surface">
                {leader.name}
              </span>
              <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5 leading-none font-mono">
                {leader.points} PTS
              </span>
            </div>
          </div>
          {leadGap !== null && (
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider">
                Title Lead
              </span>
              <p className="text-[13px] font-black text-on-surface mt-1.5 font-mono">
                +{leadGap} PTS <span className="text-[10px] text-on-surface-variant font-medium uppercase font-sans">over P2</span>
              </p>
            </div>
          )}
        </GlassCard>
      )}

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
