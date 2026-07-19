"use client";

import React, { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface CompareMetric {
  label: string;
  valA: number;
  valB: number;
  displayA: string;
  displayB: string;
}

interface CrossComparisonProfile {
  id: string;
  title: string;
  nameA: string;
  nameB: string;
  metrics: CompareMetric[];
}

const PROFILES: CrossComparisonProfile[] = [
  {
    id: "cars",
    title: "Formula 1 vs IndyCar Tech Profiles",
    nameA: "Formula 1 Car",
    nameB: "IndyCar Chassis",
    metrics: [
      { label: "Engine Max Output (hp)", valA: 1000, valB: 750, displayA: "1000 HP", displayB: "750 HP" },
      { label: "Minimum Weight (kg)", valA: 798, valB: 770, displayA: "798 kg", displayB: "770 kg" },
      { label: "Top Speed (km/h)", valA: 360, valB: 380, displayA: "360 km/h", displayB: "380 km/h" }
    ]
  },
  {
    id: "legends",
    title: "Lewis Hamilton vs Valentino Rossi (MotoGP)",
    nameA: "Lewis Hamilton",
    nameB: "Valentino Rossi",
    metrics: [
      { label: "World Championships", valA: 7, valB: 9, displayA: "7 Titles", displayB: "9 Titles" },
      { label: "Grand Prix Wins", valA: 105, valB: 115, displayA: "105 Wins", displayB: "115 Wins" },
      { label: "Pole Positions", valA: 104, valB: 65, displayA: "104 Poles", displayB: "65 Poles" }
    ]
  }
];

export function CrossCompare() {
  const [activeProfileId, setActiveProfileId] = useState("cars");

  const prof = useMemo(() => PROFILES.find((p) => p.id === activeProfileId) || PROFILES[0], [activeProfileId]);

  return (
    <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15 w-full mt-2">
      <div className="flex justify-between items-start border-b border-outline/10 pb-2 select-none">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
            Cross-Series Compare
          </span>
          <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
            Vehicle & Driver Battle
          </h3>
        </div>
        <select
          value={activeProfileId}
          onChange={(e) => setActiveProfileId(e.target.value)}
          className="bg-surface-2 hover:bg-surface-3 text-on-surface text-[11px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg border border-outline/25 focus:outline-none cursor-pointer"
        >
          {PROFILES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id === "cars" ? "Vehicles (F1 vs IndyCar)" : "Legends (Hamilton vs Rossi)"}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center text-[12.5px] font-black uppercase border-b border-outline/5 pb-2">
        <span className="text-primary">{prof.nameA}</span>
        <span className="text-on-surface-variant font-mono text-[10px]">vs</span>
        <span className="text-secondary">{prof.nameB}</span>
      </div>

      {/* Comparison metrics bars */}
      <div className="flex flex-col gap-4 mt-1">
        {prof.metrics.map((m, idx) => {
          const maxVal = Math.max(m.valA, m.valB);
          const percentA = (m.valA / maxVal) * 100;
          const percentB = (m.valB / maxVal) * 100;

          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <span className="text-[10.5px] font-bold text-on-surface-variant uppercase tracking-wide">
                {m.label}
              </span>
              
              <div className="flex items-center gap-3 text-[12px] font-mono font-bold">
                <span className="text-primary w-20 text-left">{m.displayA}</span>
                
                {/* Horizontal comparative split bar */}
                <div className="flex-1 h-2 rounded-full bg-outline/15 overflow-hidden flex relative">
                  <div
                    className="h-full bg-primary rounded-l-full"
                    style={{ width: `${percentA / 2}%` }}
                  />
                  <div className="h-full w-[1px] bg-bg shrink-0" />
                  <div
                    className="h-full bg-secondary rounded-r-full"
                    style={{ width: `${percentB / 2}%`, marginLeft: "auto" }}
                  />
                </div>

                <span className="text-secondary w-20 text-right">{m.displayB}</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
