"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface ReplayEvent {
  lap: number;
  type: "SC" | "VSC" | "PIT" | "FASTEST" | "RET" | "RED";
  message: string;
}

const EVENTS: ReplayEvent[] = [
  { lap: 1, type: "SC", message: "Safety Car Deployed: Collision at Turn 4 between Hamilton and Perez" },
  { lap: 4, type: "SC", message: "Safety Car Ending: Restart confirmed this lap" },
  { lap: 12, type: "PIT", message: "Pit Stop: Leclerc fits hard compounds (2.2s)" },
  { lap: 13, type: "PIT", message: "Pit Stop: Norris fits hard compounds (2.4s)" },
  { lap: 14, type: "PIT", message: "Pit Stop: Verstappen fits hard compounds (2.1s)" },
  { lap: 22, type: "VSC", message: "Virtual Safety Car: Sainz stops off-track with engine pressure drops" },
  { lap: 24, type: "VSC", message: "Virtual Safety Car Ending: Clear track sectors" },
  { lap: 35, type: "FASTEST", message: "Fastest Lap: Norris sets a new benchmark 1:19.421" },
  { lap: 42, type: "RET", message: "Retirement: Hamilton parks in the garage with a hybrid system error" },
  { lap: 48, type: "FASTEST", message: "Fastest Lap: Verstappen sets a new benchmark 1:18.992" }
];

// Driver positions progression across 50 laps (VER, NOR, LEC, PIA, RUS)
const POSITIONS: Record<string, number[]> = {
  VER: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  NOR: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  LEC: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  PIA: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  RUS: [6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
};

const DRIVER_COLORS: Record<string, string> = {
  VER: "#367125",
  NOR: "#FF8700",
  LEC: "#E80020",
  PIA: "#00E1D9",
  RUS: "#00A6FF"
};

export function RaceReplayEngine() {
  const [currentLap, setCurrentLap] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentLap((prev) => {
          if (prev >= 50) {
            setIsPlaying(false);
            return 50;
          }
          return prev + 1;
        });
      }, 1500);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (currentLap >= 50 && !isPlaying) {
      setCurrentLap(1);
    }
    setIsPlaying(!isPlaying);
  };

  // Filter messages for the current lap
  const activeEvents = useMemo(() => {
    return EVENTS.filter((e) => e.lap <= currentLap).slice(-3).reverse();
  }, [currentLap]);

  // Compute SVG paths up to the current lap
  const paths = useMemo(() => {
    const list: { code: string; path: string; color: string; currentPos: number }[] = [];
    
    Object.keys(POSITIONS).forEach((code) => {
      const history = POSITIONS[code];
      const color = DRIVER_COLORS[code] || "var(--color-primary)";
      
      const pts = [];
      for (let lap = 0; lap < currentLap; lap++) {
        const pos = history[lap] || 5;
        const x = (lap / 49) * 100;
        const y = 10 + ((pos - 1) / 5) * 80; // Map position 1-6 to y-coords 10-90
        pts.push(`${x},${y}`);
      }
      
      const currentPos = history[currentLap - 1] || 5;

      list.push({
        code,
        path: pts.length > 0 ? `M ${pts.join(" L ")}` : "",
        color,
        currentPos
      });
    });
    
    return list;
  }, [currentLap]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Control Strip */}
      <GlassCard variant="structural" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline/15">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="h-10 w-10 flex items-center justify-center bg-primary hover:bg-primary/95 text-white rounded-full transition-all cursor-pointer shadow-lg active:scale-95"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-4.5 w-4.5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <div>
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider font-mono">
              Race Replay
            </span>
            <h4 className="text-[15px] font-black text-on-surface leading-none mt-0.5 font-mono">
              LAP {currentLap}/50
            </h4>
          </div>
        </div>

        {/* Range Scrubber */}
        <div className="flex-1 w-full max-w-md flex items-center gap-3">
          <span className="text-[10px] font-mono text-on-surface-variant font-bold">L1</span>
          <input
            type="range"
            min="1"
            max="50"
            value={currentLap}
            onChange={(e) => {
              setCurrentLap(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer accent-primary bg-surface-3"
          />
          <span className="text-[10px] font-mono text-on-surface-variant font-bold">L50</span>
        </div>
      </GlassCard>

      {/* SVG Position Scrubber Chart */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
            Interactive Scrubber
          </span>
          <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
            Driver Position Tracker
          </h3>
        </div>

        <div className="h-56 w-full relative border-b border-l border-outline/25 select-none">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Draw grid lines */}
            {[10, 30, 50, 70, 90].map((y, idx) => (
              <g key={y}>
                <line x1="0" y1={y} x2="100" y2={y} stroke="var(--color-outline)" strokeWidth="0.3" strokeDasharray="1,2" />
                <text x="-2" y={y + 1.5} fontSize="3" fill="var(--color-on-surface-variant)" textAnchor="end" className="font-mono font-bold">P{idx + 1}</text>
              </g>
            ))}

            {/* Dynamic paths */}
            {paths.map((p) => (
              <g key={p.code}>
                {p.path && (
                  <path
                    d={p.path}
                    fill="none"
                    stroke={p.color}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {/* Node bubble for current lap position */}
                {currentLap > 0 && (
                  <circle
                    cx={((currentLap - 1) / 49) * 100}
                    cy={10 + ((p.currentPos - 1) / 5) * 80}
                    r="1.8"
                    fill="var(--color-bg)"
                    stroke={p.color}
                    strokeWidth="1"
                  />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Legend buttons */}
        <div className="flex gap-4 flex-wrap justify-center items-center text-[10px] font-mono font-bold">
          {paths.map((p) => (
            <div key={p.code} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-2/40 border border-outline/10">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-on-surface">{p.code} (P{p.currentPos})</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Race Control scrolling feed */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15 min-h-[160px] justify-between">
        <div className="flex items-center justify-between border-b border-outline/10 pb-2">
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest font-mono">
            Race Control Radio
          </span>
          <span className="text-[9px] font-mono text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
            LATEST EVENTS
          </span>
        </div>

        <div className="flex flex-col gap-3 flex-grow justify-center mt-2.5">
          {activeEvents.length === 0 ? (
            <p className="text-[12px] text-on-surface-variant text-center py-4">No major incidents reported. Green flag racing.</p>
          ) : (
            activeEvents.map((evt, idx) => (
              <div
                key={idx}
                className={`flex gap-3 items-start p-2 rounded-lg border text-[12.5px] leading-relaxed transition-all ${
                  evt.type === "SC" || evt.type === "RED"
                    ? "bg-red-500/10 border-red-500/25 text-red-500 font-bold animate-pulse"
                    : evt.type === "VSC"
                    ? "bg-yellow-500/10 border-yellow-500/25 text-yellow-500 font-bold"
                    : "bg-surface-2/40 border-outline/15 text-on-surface"
                }`}
              >
                <span className="font-mono font-bold uppercase shrink-0 bg-black/20 px-1.5 py-0.2 rounded text-[10px]">
                  LAP {evt.lap}
                </span>
                <span>{evt.message}</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
