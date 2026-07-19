"use client";

import React, { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Scenario {
  id: string;
  title: string;
  actualSummary: string;
  simulatedSummary: string;
  actualGapSec: number;
  simulatedGapSec: number;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "undercut",
    title: "Verstappen pits 3 Laps Earlier (Undercut)",
    actualSummary: "Verstappen pitted on Lap 24, exiting behind Norris and finishing P2 with a +2.1s gap.",
    simulatedSummary: "Verstappen pits on Lap 21, gaining fresh tyres to lap 1.2s quicker, finishing P1 with a -1.8s lead.",
    actualGapSec: 2.1,
    simulatedGapSec: -1.8,
    explanation: "Pitting early enables Verstappen to exploit fresh soft compound grip in clean air, avoiding the mid-pack traffic loop that slowed Norris's out-lap."
  },
  {
    id: "rain",
    title: "Rain Starts 10 Laps Sooner",
    actualSummary: "Rain fell on Lap 38, allowing standard transitions to intermediate tyre compounds.",
    simulatedSummary: "Rain falls on Lap 28. Ferrari double-stacks. Leclerc loses 6.5s in the pit lane, dropping to P5.",
    actualGapSec: 0.5,
    simulatedGapSec: 6.5,
    explanation: "An earlier rain window catches teams during their primary fuel-weight stints. Ferrari's double pitlane stack drops Leclerc behind both Mercedes cars."
  },
  {
    id: "no_sc",
    title: "No Safety Car on Lap 18",
    actualSummary: "Safety Car bunched the grid, wiping out Hamilton's 14.2s gap to Russell.",
    simulatedSummary: "No Safety Car. Hamilton maintains tyre preservation and finishes P3, 12.8s ahead of Russell.",
    actualGapSec: -0.8, // Russell ahead
    simulatedGapSec: 12.8, // Hamilton ahead
    explanation: "Without the safety car neutralization phase, Russell is unable to close the tyre-age offset gap, leaving Hamilton to cruise home in clean air."
  }
];

export function StrategySimulator() {
  const [activeId, setActiveId] = useState("undercut");

  const sc = useMemo(() => SCENARIOS.find((s) => s.id === activeId) || SCENARIOS[0], [activeId]);

  // Compute SVG bar coordinates comparing gaps (actual vs simulated)
  const barWidths = useMemo(() => {
    const maxVal = 15; // Max scale in seconds
    const actualWidth = Math.min(100, (Math.abs(sc.actualGapSec) / maxVal) * 100);
    const simulatedWidth = Math.min(100, (Math.abs(sc.simulatedGapSec) / maxVal) * 100);
    return { actualWidth, simulatedWidth };
  }, [sc]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div className="flex justify-between items-start border-b border-outline/10 pb-2">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
              Strategy Sandbox
            </span>
            <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
              &ldquo;What If?&rdquo; Race Simulator
            </h3>
          </div>
          <span className="text-[9px] font-mono font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded select-none">
            ⚠️ SIMULATED DATA ONLY
          </span>
        </div>

        {/* Scenarios List Toggles */}
        <div className="flex flex-col gap-2 select-none">
          {SCENARIOS.map((s) => {
            const isSelected = activeId === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary/45 text-on-surface scale-[1.01]"
                    : "bg-surface-2/40 border-outline/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-2"
                }`}
              >
                <h4 className="text-[13px] font-black uppercase">{s.title}</h4>
              </button>
            );
          })}
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5 pt-2 text-[12.5px] border-t border-outline/10">
          {/* Actual Finish Card */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-2/30 border border-outline/10">
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Actual Classification</span>
            <p className="text-on-surface-variant font-medium leading-relaxed">{sc.actualSummary}</p>
            <div className="h-2 w-full bg-outline/15 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-on-surface-variant rounded-full" style={{ width: `${barWidths.actualWidth}%` }} />
            </div>
            <span className="text-[10px] font-mono font-bold text-on-surface-variant mt-1 uppercase">
              GAP: {Math.abs(sc.actualGapSec)} SECONDS
            </span>
          </div>

          {/* Simulated Finish Card */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider font-mono">Simulated Projection</span>
            <p className="text-on-surface-variant font-medium leading-relaxed">{sc.simulatedSummary}</p>
            <div className="h-2 w-full bg-outline/15 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: `${barWidths.simulatedWidth}%` }} />
            </div>
            <span className="text-[10px] font-mono font-bold text-primary mt-1 uppercase">
              GAP: {Math.abs(sc.simulatedGapSec)} SECONDS {sc.simulatedGapSec < 0 ? "LEAD" : "DEFICIT"}
            </span>
          </div>
        </div>

        {/* Explanatory insights */}
        <div className="flex flex-col gap-1 bg-surface-2/20 border border-outline/10 p-3.5 rounded-xl text-[12.5px] leading-relaxed">
          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Simulation Explanation</span>
          <p className="text-on-surface-variant font-medium mt-0.5">
            {sc.explanation}
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
