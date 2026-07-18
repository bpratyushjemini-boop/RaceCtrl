"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StandingsEntry } from "@/lib/types";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { GlassCard } from "@/components/ui/GlassCard";
import { FreshnessIndicator } from "@/components/system/FreshnessIndicator";
import { PageContainer } from "@/components/layout/PageContainer";
import { AIInsights } from "@/components/ui/AIInsights";

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
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleTabChange = (tab: "drivers" | "constructors") => {
    setActiveTab(tab);
    setIsCompareMode(false);
    setSelectedIds([]);
    router.replace(`/standings?tab=${tab}`, { scroll: false });
  };

  const handleToggleCompareSelect = (id: string) => {
    setSelectedIds((prev) => {
      let next = [...prev];
      if (next.includes(id)) {
        next = next.filter((x) => x !== id);
      } else {
        next.push(id);
      }
      if (next.length === 2) {
        router.push(`/compare?a=${next[0]}&b=${next[1]}`);
        setIsCompareMode(false);
        return [];
      }
      return next;
    });
  };

  const activeList = activeTab === "drivers" ? drivers : constructors;
  const leader = activeList[0] ?? null;
  const runnerUp = activeList[1] ?? null;
  const leadGap = leader && runnerUp ? leader.points - runnerUp.points : null;

  return (
    <PageContainer gap="md">
      {/* Title block matching Figma standings hierarchy */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          {season} Championship
        </span>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
            Standings
          </h1>
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <FreshnessIndicator />
            {activeTab === "drivers" && (
              <button
                onClick={() => {
                  setIsCompareMode(!isCompareMode);
                  setSelectedIds([]);
                }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer shrink-0 ${
                  isCompareMode
                    ? "bg-primary text-white border border-primary hover:bg-[#D6382F]"
                    : "border border-outline/40 text-on-surface-variant hover:text-on-surface hover-glass"
                }`}
              >
                {isCompareMode ? "Cancel" : "Compare"}
              </button>
            )}
          </div>
        </div>
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

      {/* Compare Active Banner */}
      {isCompareMode && (
        <GlassCard className="p-3.5 border border-primary/30 flex items-center justify-between bg-primary/5 shadow-sm" variant="structural">
          <span className="text-[12px] font-bold text-primary uppercase tracking-wider font-mono">
            Compare Mode Active: Select 2 Drivers ({selectedIds.length}/2)
          </span>
          <button
            onClick={() => {
              setIsCompareMode(false);
              setSelectedIds([]);
            }}
            className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface uppercase tracking-wider bg-surface-2 px-2.5 py-1 rounded border border-outline/25 cursor-pointer"
          >
            Cancel
          </button>
        </GlassCard>
      )}

      {/* List content container */}
      <div className="w-full">
        {activeTab === "drivers" ? (
          <StandingsTable
            entries={drivers}
            emptyLabel="No driver standings yet"
            emptyHint="Results will appear here once a session is recorded."
            isCompareMode={isCompareMode}
            selectedCompareIds={selectedIds}
            onToggleCompareSelect={handleToggleCompareSelect}
          />
        ) : (
          <StandingsTable
            entries={constructors}
            emptyLabel="No constructor standings yet"
            emptyHint="Results will appear here once a session is recorded."
          />
        )}
      </div>

      {/* AI Assistant Insights */}
      <AIInsights
        drivers={drivers}
        constructors={constructors}
      />
    </PageContainer>
  );
}
