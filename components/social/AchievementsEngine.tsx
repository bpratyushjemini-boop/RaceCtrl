"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/lib/auth/auth-context";

interface MetricBadge {
  id: string;
  label: string;
  desc: string;
  icon: string;
  targetMetric: string;
  currentValue: number;
  targetValue: number;
}

export function AchievementsEngine() {
  const { unlockedBadges, unlockBadge, user } = useAuth();
  const [historyCount, setHistoryCount] = useState(1);
  const [predictionStreak, setPredictionStreak] = useState(2);

  const BADGE_RULES: MetricBadge[] = [
    {
      id: "watched_10",
      label: "GP Veteran",
      desc: "Watched 10+ live race weekends",
      icon: "📺",
      targetMetric: "Live races watched",
      currentValue: 10,
      targetValue: 10
    },
    {
      id: "streak_5",
      label: "Predictor Guru",
      desc: "Get 5+ correct predictions streak",
      icon: "🔮",
      targetMetric: "Prediction streak",
      currentValue: predictionStreak,
      targetValue: 5
    },
    {
      id: "history_expert",
      label: "History Scholar",
      desc: "Explore 5+ historic seasons in Archive",
      icon: "📚",
      targetMetric: "Archive seasons visited",
      currentValue: historyCount,
      targetValue: 5
    }
  ];

  const handleSimulateHistory = () => {
    const nextVal = historyCount + 1;
    setHistoryCount(nextVal);
    if (nextVal >= 5) {
      unlockBadge("history_expert");
    }
  };

  const handleSimulatePrediction = () => {
    const nextVal = predictionStreak + 1;
    setPredictionStreak(nextVal);
    if (nextVal >= 5) {
      unlockBadge("streak_5");
    }
  };

  React.useEffect(() => {
    const checkFanBadges = () => {
      if (user?.favoriteTeam.toLowerCase() === "ferrari") {
        unlockBadge("ferrari_fan");
      }
      if (user?.favoriteTeam.toLowerCase() === "mclaren") {
        unlockBadge("mclaren_legend");
      }
    };
    checkFanBadges();
  }, [user, unlockBadge]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Rules list */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div>
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest font-mono">
            Milestones Tracker
          </span>
          <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
            Badges Quest List
          </h3>
          <p className="text-[11.5px] text-on-surface-variant font-medium mt-0.5">
            Complete activities around the app to claim trophies on your public card.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {BADGE_RULES.map((rule) => {
            const unlocked = unlockedBadges.includes(rule.id);
            const percent = Math.min(100, (rule.currentValue / rule.targetValue) * 100);
            return (
              <div key={rule.id} className="flex flex-col gap-2 p-3.5 rounded-xl bg-surface-2/30 border border-outline/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[24px] select-none">{rule.icon}</span>
                    <div>
                      <h4 className="text-[13px] font-black text-on-surface uppercase">{rule.label}</h4>
                      <p className="text-[11px] text-on-surface-variant leading-none font-medium mt-0.5">{rule.desc}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border select-none ${
                    unlocked
                      ? "bg-green-500/10 border-green-500/20 text-green-500"
                      : "bg-surface-3 border-outline/15 text-on-surface-variant/60"
                  }`}>
                    {unlocked ? "CLAIMED" : `${rule.currentValue}/${rule.targetValue}`}
                  </span>
                </div>
                
                <div className="h-1.5 w-full rounded-full bg-outline/10 overflow-hidden mt-1">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Trophies Simulator Controls */}
      <GlassCard variant="structural" className="p-4 border border-outline/15 flex flex-col gap-2">
        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">
          Milestone Simulator Controls
        </span>
        <div className="flex flex-col sm:flex-row gap-2.5 mt-1.5">
          <button
            onClick={handleSimulateHistory}
            disabled={unlockedBadges.includes("history_expert")}
            className="flex-1 h-9 border border-outline/35 text-on-surface hover:bg-surface-2/40 text-[11px] font-bold uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Explore Seasons (+1)
          </button>
          
          <button
            onClick={handleSimulatePrediction}
            disabled={unlockedBadges.includes("streak_5")}
            className="flex-1 h-9 border border-outline/35 text-on-surface hover:bg-surface-2/40 text-[11px] font-bold uppercase rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Correct Prediction (+1)
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
