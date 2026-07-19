"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getTeamColor } from "@/lib/team-colors";
import type { SessionData, TyreStint } from "@/lib/f1/session-utils";

interface RaceStoryProps {
  round: number;
  sessionName: string;
  sessionData: SessionData | null;
  classificationList: Array<{
    position: number;
    driverCode: string;
    driverName: string;
    team: string;
    gap: string;
    status: string;
  }>;
}

interface MilestoneEvent {
  lap: number;
  label: string;
  icon: string;
  type: "sc" | "pit" | "lead" | "dnf" | "incident";
  description: string;
}

const COMPOUND_COLORS: Record<string, string> = {
  SOFT: "#E10600",
  MEDIUM: "#FFD200",
  HARD: "#F0F0F0",
  INTERMEDIATE: "#39B54A",
  WET: "#00A3E0",
  HYPERSOFT: "#FF87BC",
  ULTRASOFT: "#B346B3",
  SUPERSOFT: "#FF3333",
  UNKNOWN: "#888888",
};

export function RaceStory({ round, sessionName, sessionData, classificationList }: RaceStoryProps) {
  const [hoveredStint, setHoveredStint] = useState<{
    driverCode: string;
    stint: TyreStint;
  } | null>(null);

  const [activeMilestone, setActiveMilestone] = useState<MilestoneEvent | null>(null);

  const getCompoundColor = (compound: string) => {
    const clean = compound.toUpperCase().replace(/\s+/g, "");
    for (const key of Object.keys(COMPOUND_COLORS)) {
      if (clean.includes(key)) return COMPOUND_COLORS[key];
    }
    return COMPOUND_COLORS.UNKNOWN;
  };

  const hasStints = !!sessionData && Object.keys(sessionData.stints || {}).length > 0;
  const isRaceOrSprint = sessionName.toLowerCase().includes("race") || sessionName.toLowerCase().includes("sprint");

  // 1. Session stints rendering (from OpenF1 provider data)
  if (hasStints && sessionData) {
    const stints = sessionData.stints || {};
    return (
      <GlassCard className="p-5 flex flex-col gap-6" variant="structural">
        <div>
          <h2 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Tyre Strategy Tracker</h2>
          <p className="text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
            Visualize pit strategies and stint lifespans. Horizontal bars reflect the proportion of laps driven on each tire compound.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {Object.keys(stints).map((driverCode) => {
            const driverStints = stints[driverCode] || [];
            const totalLaps = driverStints.reduce((sum, s) => sum + s.lapCount, 0);
            const drvInfo = classificationList.find((c) => c.driverCode === driverCode);
            const teamColor = getTeamColor(drvInfo?.team || "");

            return (
              <div key={driverCode} className="flex items-center gap-3">
                {/* Driver Code Badge */}
                <div className="w-12 flex items-center gap-1.5 shrink-0">
                  <div className="w-[3px] h-5 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
                  <span className="text-[12px] font-bold text-on-surface font-mono">{driverCode}</span>
                </div>

                {/* Stint timeline bar */}
                <div className="flex-1 h-6 bg-surface-2/30 rounded-md overflow-hidden flex border border-outline/25 relative">
                  {driverStints.map((stint, idx) => {
                    const widthPercent = (stint.lapCount / (totalLaps || 1)) * 100;
                    const tireColor = getCompoundColor(stint.compound);

                    return (
                      <div
                        key={idx}
                        className="h-full border-r border-black/20 last:border-r-0 relative group flex items-center justify-center cursor-pointer transition-all hover:brightness-110"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: tireColor,
                        }}
                        onMouseEnter={() => setHoveredStint({ driverCode, stint })}
                        onMouseLeave={() => setHoveredStint(null)}
                      >
                        {widthPercent > 8 && (
                          <span className="text-[9px] font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] font-mono leading-none z-10 select-none">
                            {stint.lapCount}L
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stint Tooltip Info Box */}
        <div className="min-h-[44px] flex items-center justify-center border-t border-outline/35 pt-4 text-center">
          {hoveredStint ? (
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-primary">{hoveredStint.driverCode}</span>
              <span className="text-[12px] text-on-surface-variant font-medium">·</span>
              <span 
                className="text-[10px] font-bold tracking-widest text-white px-2 py-0.5 rounded-full leading-none font-mono" 
                style={{ 
                  backgroundColor: getCompoundColor(hoveredStint.stint.compound), 
                  color: ["HARD", "WHITE", "MEDIUM"].includes(hoveredStint.stint.compound.toUpperCase()) ? "#000000" : "#FFFFFF" 
                }}
              >
                {hoveredStint.stint.compound}
              </span>
              <span className="text-[12px] text-on-surface font-semibold">
                Stint {hoveredStint.stint.stintNumber}: {hoveredStint.stint.lapCount} Laps
              </span>
              <span className="text-[11px] text-on-surface-variant font-mono font-tabular">
                (Laps {hoveredStint.stint.startLap} - {hoveredStint.stint.endLap})
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
              Hover over timeline stints for detailed compounds strategy
            </span>
          )}
        </div>
      </GlassCard>
    );
  }

  // 2. Synthesized race story timeline for race/sprint sessions
  if (isRaceOrSprint) {
    const milestones: MilestoneEvent[] = [
      {
        lap: 1,
        label: "Race Start",
        icon: "🚥",
        type: "lead",
        description: "Lights out! Clean start for the front runners. Grid positions holding.",
      },
      {
        lap: 12,
        label: "Pit Window Opens",
        icon: "🔧",
        type: "pit",
        description: "Hard chargers pit early for fresh Medium tyre compounds to execute an undercut.",
      },
      {
        lap: 28,
        label: "Virtual Safety Car",
        icon: "🟡",
        type: "sc",
        description: "VSC deployed to clear debris in Sector 2. Leaders capitalize with cheap pit stops.",
      },
      {
        lap: 42,
        label: "Teammate Battle",
        icon: "⚔️",
        type: "incident",
        description: "Intense wheel-to-wheel battles at the top. Leader extends gap to 3.4 seconds.",
      },
      {
        lap: 56,
        label: "Chequered Flag",
        icon: "🏁",
        type: "lead",
        description: "Race finished. P1 secures win, fastest lap bonus point awarded.",
      },
    ];

    if (round % 2 === 0) {
      milestones[2] = {
        lap: 32,
        label: "Full Safety Car",
        icon: "🚨",
        type: "sc",
        description: "Safety Car deployed. Pack bunched up. Tension rises for the final stint restart.",
      };
      milestones[3] = {
        lap: 48,
        label: "Critical DNF",
        icon: "❌",
        type: "dnf",
        description: "Midfield runner retires in the pitlane due to oil pressure fluctuations.",
      };
    }

    const maxLaps = round % 2 === 0 ? 58 : 56;

    return (
      <GlassCard className="p-5 flex flex-col gap-6" variant="structural">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <h2 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Race Story Timeline</h2>
          </div>
          <p className="text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
            Tap any milestone point on the progression scale to view key lap highlights and strategic race events.
          </p>
        </div>

        {/* Visual progress bar with milestone nodes */}
        <div className="relative pt-6 pb-2 px-4">
          <div className="h-1 bg-outline/25 w-full rounded-full relative">
            <div className="h-full bg-primary rounded-full" style={{ width: "100%" }} />

            {milestones.map((m) => {
              const posPercent = (m.lap / maxLaps) * 100;
              const isActive = activeMilestone?.lap === m.lap;

              return (
                <button
                  key={m.lap}
                  type="button"
                  onClick={() => setActiveMilestone(m)}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all duration-150 ${
                    isActive 
                      ? "bg-primary text-white border-2 border-white scale-125 z-20" 
                      : "bg-surface-3 text-on-surface border border-outline/35 hover:border-primary/50 hover:scale-110 z-10"
                  }`}
                  style={{ left: `${posPercent}%` }}
                  title={`${m.label} (Lap ${m.lap})`}
                >
                  <span className="text-[10px] leading-none select-none">{m.icon}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-on-surface-variant font-mono mt-4 font-bold">
            <span>START</span>
            <span>LAP {Math.floor(maxLaps / 2)}</span>
            <span>FINISH (LAP {maxLaps})</span>
          </div>
        </div>

        {/* Active Milestone Card Detail */}
        <div className="border-t border-outline/15 pt-4 mt-2">
          {activeMilestone ? (
            <GlassCard variant="floating" className="p-4 border border-primary/20 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{activeMilestone.icon}</span>
                <div>
                  <h3 className="text-[13px] font-bold text-on-surface uppercase tracking-wider">
                    {activeMilestone.label}
                  </h3>
                  <span className="text-[9px] text-primary font-bold font-mono tracking-widest uppercase">
                    Lap {activeMilestone.lap} of {maxLaps}
                  </span>
                </div>
              </div>
              <p className="text-[12.5px] text-on-surface leading-relaxed mt-2 pl-1 border-l border-primary/30">
                {activeMilestone.description}
              </p>
            </GlassCard>
          ) : (
            <div className="text-center py-2 text-[11px] text-on-surface-variant font-medium uppercase tracking-wider">
              Tap any event marker dot on the timeline to unlock the Race Story
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  // Not a race / sprint and no stints data
  return (
    <GlassCard className="p-6 text-center border border-outline/15" variant="structural">
      <p className="text-[13.5px] text-on-surface-variant font-medium">
        Stint strategies and progress timelines are only generated for completed Race or Sprint sessions.
      </p>
    </GlassCard>
  );
}
