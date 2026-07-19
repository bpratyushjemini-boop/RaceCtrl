"use client";

import React, { useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TyreDegradation {
  compound: "Soft" | "Medium" | "Hard";
  color: string;
  wearRate: number; // Slope
  optimalWindow: [number, number];
}

const COMPOUNDS: TyreDegradation[] = [
  { compound: "Soft", color: "#E80020", wearRate: 2.2, optimalWindow: [12, 16] },
  { compound: "Medium", color: "#FFB800", wearRate: 1.3, optimalWindow: [18, 25] },
  { compound: "Hard", color: "#FFFFFF", wearRate: 0.7, optimalWindow: [28, 38] }
];

export function PitPredictor() {
  const chartPaths = useMemo(() => {
    return COMPOUNDS.map((c) => {
      const pts = [];
      for (let lap = 0; lap <= 40; lap += 2) {
        const grip = Math.max(10, 100 - lap * c.wearRate);
        const x = (lap / 40) * 100;
        const y = 100 - grip;
        pts.push(`${x},${y}`);
      }
      return {
        compound: c.compound,
        color: c.color,
        path: `M ${pts.join(" L ")}`
      };
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Degradation Chart */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
            Tyre Degradation
          </span>
          <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
            Grip Life Forecast
          </h3>
          <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
            Wear rate curves plotting grip levels vs lap counts.
          </p>
        </div>

        <div className="h-40 w-full relative border-b border-l border-outline/25 select-none mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Draw 50% line */}
            <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-outline)" strokeWidth="0.4" strokeDasharray="1,2" />
            
            {/* Draw curve lines */}
            {chartPaths.map((p) => (
              <path
                key={p.compound}
                d={p.path}
                fill="none"
                stroke={p.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-4.5 justify-center items-center text-[10px] font-mono font-bold">
          {COMPOUNDS.map((c) => (
            <div key={c.compound} className="flex items-center gap-1.5">
              <span className="w-3.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-on-surface uppercase">{c.compound}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Pit Windows */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4.5 border border-outline/15">
        <span className="text-[10px] font-black text-secondary uppercase tracking-widest font-mono">
          Strategy Windows
        </span>
        
        <div className="flex flex-col gap-4">
          {COMPOUNDS.map((c) => (
            <div key={c.compound} className="flex flex-col gap-1.5 text-[12px] font-bold">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-on-surface uppercase">{c.compound}</span>
                </div>
                <span className="text-on-surface-variant font-mono">LAPS {c.optimalWindow[0]} - {c.optimalWindow[1]}</span>
              </div>
              
              <div className="h-3 w-full rounded-full bg-outline/10 relative overflow-hidden">
                {/* Highlight optimal window bar */}
                <div
                  className="h-full absolute rounded-full opacity-80"
                  style={{
                    left: `${(c.optimalWindow[0] / 50) * 100}%`,
                    width: `${((c.optimalWindow[1] - c.optimalWindow[0]) / 50) * 100}%`,
                    backgroundColor: c.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recommended Strategy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassCard variant="structural" className="p-4 border border-outline/10 flex flex-col gap-1.5 justify-between">
          <div>
            <span className="text-[9px] font-black text-primary font-mono uppercase tracking-wider">Option A (One Stop)</span>
            <h4 className="text-[13px] font-black text-on-surface uppercase mt-0.5">Medium ➔ Hard Strategy</h4>
            <p className="text-[11.5px] text-on-surface-variant leading-relaxed mt-1 font-medium">
              Start on Mediums, pit on Lap 22 for Hard compound. Recommended strategy for track-position retention.
            </p>
          </div>
          <div className="text-[10px] font-mono text-primary font-bold mt-2 select-none uppercase">
            RISK: LOW · OVERTAKES NEEDED: MINIMAL
          </div>
        </GlassCard>

        <GlassCard variant="structural" className="p-4 border border-outline/10 flex flex-col gap-1.5 justify-between">
          <div>
            <span className="text-[9px] font-black text-secondary font-mono uppercase tracking-wider">Option B (Two Stop)</span>
            <h4 className="text-[13px] font-black text-on-surface uppercase mt-0.5">Soft ➔ Medium ➔ Soft</h4>
            <p className="text-[11.5px] text-on-surface-variant leading-relaxed mt-1 font-medium">
              Start on Softs, pit on Lap 13 for Mediums, and pit again on Lap 36 for scrubbed Softs. Maximum aggression.
            </p>
          </div>
          <div className="text-[10px] font-mono text-secondary font-bold mt-2 select-none uppercase">
            RISK: MEDIUM · OVERTAKES NEEDED: HIGH
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
