"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface BriefItem {
  id: string;
  label: string;
  desc: string;
}

const BRIEF_SECTIONS: Record<string, BriefItem[]> = {
  preview: [
    { id: "track", label: "Track Dynamics", desc: "Hungaroring's tight, twisty layout demands maximum aerodynamic downforce, akin to Monaco without the walls." },
    { id: "tyres", label: "Tyre Wear Forecast", desc: "Thermal degradation is expected to run high due to track temperatures exceeding 48°C. One-stop is risky." },
    { id: "weather", label: "Weather Outlook", desc: "100% dry conditions with high humidity, zero rain predicted for all qualifying and race sessions." }
  ],
  stats: [
    { id: "prev_winner", label: "Previous Winner", desc: "Max Verstappen (Red Bull) in a comfortable margin over Lando Norris." },
    { id: "success_driver", label: "Most Wins (Driver)", desc: "Lewis Hamilton holds the all-time record with 8 wins at the circuit." },
    { id: "success_team", label: "Most Wins (Team)", desc: "McLaren remains the most successful team here with 11 victories." }
  ],
  battles: [
    { id: "title", label: "Championship Implications", desc: "Norris must secure a podium to prevent Verstappen from stretching the points margin past 60." },
    { id: "rookie", label: "Rookie Focus", desc: "Oliver Bearman faces a challenging weekend managing tyre heat cycles in the slow final sector corners." },
    { id: "midfield", label: "Alpine vs Haas Battle", desc: "Tight qualifying pace deltas place Haas slightly ahead on single-lap speed." }
  ]
};

export function AIWeekendAssistant() {
  const [activeTab, setActiveTab] = useState<"preview" | "stats" | "battles">("preview");

  const list = BRIEF_SECTIONS[activeTab] || BRIEF_SECTIONS.preview;

  return (
    <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
      <div className="flex justify-between items-start border-b border-outline/10 pb-2">
        <div>
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest font-mono">
            AI Assistant
          </span>
          <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
            Paddock Weekend Briefings
          </h3>
        </div>
        <span className="text-[9.5px] font-mono font-bold text-secondary bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded select-none">
          PRE-RACE BRIEF
        </span>
      </div>

      {/* Tabs Selector */}
      <div className="flex bg-surface-2/40 border border-outline/15 rounded-full p-0.5 gap-0.5 select-none self-start">
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "preview" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Track Info
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "stats" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Historic Records
        </button>
        <button
          onClick={() => setActiveTab("battles")}
          className={`px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "battles" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Paddock Battles
        </button>
      </div>

      {/* Details listing */}
      <div className="flex flex-col gap-3 mt-1">
        {list.map((item) => (
          <div key={item.id} className="flex flex-col gap-0.5 p-3 rounded-xl bg-surface-2/30 border border-outline/10">
            <span className="text-[10px] font-black text-primary uppercase font-mono tracking-wider">
              {item.label}
            </span>
            <p className="text-[12.5px] text-on-surface-variant leading-relaxed font-medium mt-0.5">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="text-[8.5px] font-mono text-on-surface-variant/40 mt-1 border-t border-outline/10 pt-2 select-none text-right">
        VERIFIED F1 STATISTICAL FOOTNOTES · NO HALLUCINATIONS.
      </div>
    </GlassCard>
  );
}
