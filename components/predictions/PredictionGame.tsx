"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface PredictionState {
  pole: string;
  winner: string;
  fastestLap: string;
  safetyCar: boolean;
  rain: boolean;
}

const DRIVERS_LIST = [
  { code: "VER", name: "Max Verstappen" },
  { code: "NOR", name: "Lando Norris" },
  { code: "LEC", name: "Charles Leclerc" },
  { code: "PIA", name: "Oscar Piastri" },
  { code: "HAM", name: "Lewis Hamilton" },
  { code: "RUS", name: "George Russell" }
];

export function PredictionGame() {
  const [predictions, setPredictions] = useState<PredictionState>({
    pole: "VER",
    winner: "VER",
    fastestLap: "NOR",
    safetyCar: false,
    rain: false
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div className="flex items-center justify-between border-b border-outline/10 pb-2">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
              Prediction Center
            </span>
            <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
              GP Prediction Board
            </h3>
          </div>
          <span className="text-[9px] font-mono text-on-surface-variant font-bold uppercase bg-surface-2 px-2.5 py-0.5 rounded border border-outline/10 select-none">
            ROUND 11 · HUNGARY
          </span>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
            <span className="text-[36px] select-none">🔮</span>
            <h4 className="text-[15px] font-black text-on-surface uppercase leading-none">Predictions Locked!</h4>
            <p className="text-[12px] text-on-surface-variant font-medium max-w-xs leading-relaxed">
              Your configurations have been synced. Leaderboards will update following the race classification release.
            </p>
            
            <div className="w-full max-w-xs bg-surface-2/40 border border-outline/10 rounded-xl p-3 text-left flex flex-col gap-1.5 text-[12px] mt-2 font-mono">
              <div><span className="text-on-surface-variant uppercase">POLE:</span> <span className="text-primary font-bold">{predictions.pole}</span></div>
              <div><span className="text-on-surface-variant uppercase">WINNER:</span> <span className="text-primary font-bold">{predictions.winner}</span></div>
              <div><span className="text-on-surface-variant uppercase">FASTEST LAP:</span> <span className="text-primary font-bold">{predictions.fastestLap}</span></div>
              <div><span className="text-on-surface-variant uppercase">SAFETY CAR:</span> <span className="text-primary font-bold">{predictions.safetyCar ? "YES" : "NO"}</span></div>
              <div><span className="text-on-surface-variant uppercase">RAIN:</span> <span className="text-primary font-bold">{predictions.rain ? "YES" : "NO"}</span></div>
            </div>

            <button
              onClick={handleReset}
              className="mt-4 px-4 h-8 border border-outline/35 text-on-surface hover:bg-surface-2/45 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
            >
              Modify Selections
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Pole Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Pole Position</label>
              <select
                value={predictions.pole}
                onChange={(e) => setPredictions({ ...predictions, pole: e.target.value })}
                className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2 px-4 rounded-xl border border-outline/30 focus:outline-none cursor-pointer"
              >
                {DRIVERS_LIST.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Winner Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Race Winner</label>
              <select
                value={predictions.winner}
                onChange={(e) => setPredictions({ ...predictions, winner: e.target.value })}
                className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2 px-4 rounded-xl border border-outline/30 focus:outline-none cursor-pointer"
              >
                {DRIVERS_LIST.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Fastest Lap Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fastest Lap</label>
              <select
                value={predictions.fastestLap}
                onChange={(e) => setPredictions({ ...predictions, fastestLap: e.target.value })}
                className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2 px-4 rounded-xl border border-outline/30 focus:outline-none cursor-pointer"
              >
                {DRIVERS_LIST.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4.5 pt-2 select-none">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2/30 border border-outline/10">
                <span className="text-[12px] font-bold text-on-surface uppercase">Safety Car</span>
                <input
                  type="checkbox"
                  checked={predictions.safetyCar}
                  onChange={(e) => setPredictions({ ...predictions, safetyCar: e.target.checked })}
                  className="h-4.5 w-4.5 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2/30 border border-outline/10">
                <span className="text-[12px] font-bold text-on-surface uppercase">Rain Forecast</span>
                <input
                  type="checkbox"
                  checked={predictions.rain}
                  onChange={(e) => setPredictions({ ...predictions, rain: e.target.checked })}
                  className="h-4.5 w-4.5 rounded text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-primary hover:bg-primary/95 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center mt-3"
            >
              Lock Predictions
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
