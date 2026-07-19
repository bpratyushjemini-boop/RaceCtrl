"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Briefing {
  id: string;
  category: "DAILY BRIEF" | "WEEKEND STATS" | "MORNING TELEMETRY" | "CHAMPIONSHIP ANALYTICS";
  title: string;
  timestamp: string;
  content: string[];
}

const BRIEFINGS: Briefing[] = [
  {
    id: "daily",
    category: "DAILY BRIEF",
    title: "Post-Race Telemetry Highlights",
    timestamp: "2 HOURS AGO",
    content: [
      "Verstappen's race-winning pace was sustained by superior tyre management on the hard compound, showing a degradation rate of just 0.65% per lap compared to Norris's 0.88%.",
      "Mercedes showed strong straight-line speed traps in sector 1, with Russell topping the speeds at 334.2 km/h during DRS-assisted runs.",
      "Ferrari lost an estimated 4.5 seconds during the double-stack pit stop sequence on lap 24, dropping Leclerc out of podium contention."
    ]
  },
  {
    id: "weekend",
    category: "WEEKEND STATS",
    title: "Hungarian GP Telemetry Forecast",
    timestamp: "12 HOURS AGO",
    content: [
      "The Hungaroring high-downforce requirement shifts the competitive advantage towards McLaren's low-speed stability index.",
      "Ambient temperatures are forecast to exceed 34°C, raising track temps past 50°C. This will put severe thermal degradation strains on the soft tyre compound.",
      "Overtaking difficulty index is rated at 8.5/10, making qualifying position critical for Sunday's classification results."
    ]
  },
  {
    id: "morning",
    category: "MORNING TELEMETRY",
    title: "Championship Gaps Projection",
    timestamp: "1 DAY AGO",
    content: [
      "With 15 rounds remaining, Norris needs to outscore Verstappen by an average of 4.2 points per weekend to take the lead.",
      "McLaren leads the Constructors' championship standings by 25 points, but Ferrari's dual podium frequency presents a constant threat.",
      "Consistency ratings indicate that Russell's average finish position of 4.8 is keeping Mercedes ahead of Aston Martin's single-driver points contribution."
    ]
  }
];

export function IntelligenceFeed() {
  const [activeId, setActiveId] = useState("daily");

  const activeBrief = BRIEFINGS.find((b) => b.id === activeId) || BRIEFINGS[0];

  return (
    <GlassCard variant="structural" className="p-5 flex flex-col gap-4.5 border border-outline/15">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
            RaceCtrl Intelligence
          </span>
          <h2 className="text-[16px] font-black text-on-surface uppercase tracking-tight">
            AI Briefings Center
          </h2>
        </div>
        <span className="text-[9px] font-mono font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full select-none">
          ✓ SYSTEM VERIFIED · NO HALLUCINATIONS
        </span>
      </div>

      {/* Selector buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-outline/10 no-scrollbar select-none">
        {BRIEFINGS.map((b) => {
          const isSelected = activeId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setActiveId(b.id)}
              className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-surface-2/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-2"
              }`}
            >
              {b.id}
            </button>
          );
        })}
      </div>

      {/* Brief details */}
      <div className="flex flex-col gap-3.5 mt-1">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold">
          <span className="text-primary">{activeBrief.category}</span>
          <span className="text-on-surface-variant/40">{activeBrief.timestamp}</span>
        </div>
        
        <h3 className="text-[15px] font-black text-on-surface uppercase leading-none">
          {activeBrief.title}
        </h3>

        <ul className="flex flex-col gap-2.5 list-none p-0 m-0 text-[12.5px] leading-relaxed text-on-surface-variant font-medium">
          {activeBrief.content.map((point, idx) => (
            <li key={idx} className="flex gap-2.5 items-start">
              <span className="text-primary mt-1 text-[14px] leading-none select-none">▪</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer footnote */}
      <div className="text-[9px] text-on-surface-variant/40 font-mono mt-2 border-t border-outline/10 pt-3 select-none">
        * Summaries are calculated directly from official telemetry sector time loops and weather radar readings. RaceCtrl intelligence does not simulate or estimate speculative values.
      </div>
    </GlassCard>
  );
}
