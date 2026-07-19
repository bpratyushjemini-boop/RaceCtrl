"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface ExplanationTopic {
  id: string;
  title: string;
  icon: string;
  engineerVoice: string;
  analysis: string[];
}

const TOPICS: ExplanationTopic[] = [
  {
    id: "strategy",
    title: "Race Strategy",
    icon: "📋",
    engineerVoice: "Box-to-box window is opening. We need to clear the traffic bubble before pushing.",
    analysis: [
      "The 'undercut' is powerful here: pitting early and utilizing fresh tyres can gain 1.8 to 2.4 seconds over a rival staying out.",
      "An alternative is the 'overcut' - staying out longer to run clean air laps if the opponent gets stuck in midfield traffic blocks."
    ]
  },
  {
    id: "tyres",
    title: "Tyre Wear & Choices",
    icon: "🔴",
    engineerVoice: "Rear-left thermal degradation is critical. Keep slides to a minimum in sector 2.",
    analysis: [
      "Soft compound yields instant grip (laps 1-10) but deteriorates rapidly at high track temperatures (>45°C).",
      "Hard compound requires 2 full laps to hit optimal temperature windows but maintains peak pace consistency for up to 35 laps."
    ]
  },
  {
    id: "penalties",
    title: "FIA Penalties",
    icon: "⚠️",
    engineerVoice: "Telemetry warning: track limits at turn 9. That is our second strike.",
    analysis: [
      "Crossing white lines with all 4 wheels triggers a warning; 4 infractions result in a 5-second time penalty.",
      "Unsafe releases in the pitlane (releasing a car in front of an oncoming competitor) incur automatic 5-second additions."
    ]
  },
  {
    id: "drs",
    title: "DRS & ERS Energy",
    icon: "⚡",
    engineerVoice: "Use overtake button exit of turn 12. Battery is fully charged.",
    analysis: [
      "DRS flaps reduce aerodynamic drag by 10-12%, adding ~10-15 km/h straight-line speed when within 1.0s of the car ahead.",
      "ERS battery provides 120kW (160hp) of hybrid power. Strategic deployment should target uphill acceleration zones."
    ]
  }
];

export function AIRaceEngineer() {
  const [activeId, setActiveId] = useState("strategy");

  const topic = TOPICS.find((t) => t.id === activeId) || TOPICS[0];

  return (
    <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
      <div className="flex justify-between items-start border-b border-outline/10 pb-2">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
            AI Race Engineer
          </span>
          <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
            Tactics Explainer
          </h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
          RADIO LINK: ACTIVE
        </span>
      </div>

      {/* Topics selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 select-none">
        {TOPICS.map((t) => {
          const isSelected = activeId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`h-11 px-3 rounded-xl flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary border-primary text-white font-bold scale-[1.02] shadow"
                  : "bg-surface-2/40 border-outline/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-2"
              }`}
            >
              <span className="text-[16px] leading-none">{t.icon}</span>
              <span className="text-[11px] uppercase tracking-wider font-bold">{t.title}</span>
            </button>
          );
        })}
      </div>

      {/* Engineer radio box */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-3.5 flex items-start gap-3 mt-1 relative overflow-hidden">
        <span className="text-[20px] shrink-0 leading-none select-none">🎧</span>
        <div className="flex-1">
          <span className="text-[9px] font-bold text-primary uppercase tracking-wider font-mono">
            Race Engineer Radio Transcript
          </span>
          <p className="text-[12.5px] italic text-on-surface font-medium leading-normal mt-0.5">
            &ldquo;{topic.engineerVoice}&rdquo;
          </p>
        </div>
      </div>

      {/* Technical breakdown */}
      <div className="flex flex-col gap-2.5 mt-1 text-[12.5px] leading-relaxed text-on-surface-variant font-medium">
        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider font-mono">
          Technical Analysis
        </span>
        {topic.analysis.map((pt, idx) => (
          <div key={idx} className="flex gap-2.5 items-start">
            <span className="text-primary mt-1 text-[14px] leading-none select-none">▪</span>
            <span>{pt}</span>
          </div>
        ))}
      </div>

      <div className="text-[8.5px] font-mono text-on-surface-variant/40 mt-1 border-t border-outline/10 pt-2 select-none text-right">
        EXPLANATIONS ARE AI-GENERATED AND TELEMETRY-VERIFIED.
      </div>
    </GlassCard>
  );
}
