"use client";

import React, { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getTeamColor } from "@/lib/team-colors";

interface DriverMetric {
  id: string;
  name: string;
  code: string;
  team: string;
  consistency: number; // 0-100
  qualifyingPace: number; // 0-100
  racePace: number; // 0-100
  wetWeather: number; // 0-100
  streetCircuit: number; // 0-100
  overtakesCount: number;
}

const STATS_POOL: DriverMetric[] = [
  { id: "max_verstappen", name: "Max Verstappen", code: "VER", team: "Red Bull", consistency: 96, qualifyingPace: 98, racePace: 99, wetWeather: 98, streetCircuit: 91, overtakesCount: 42 },
  { id: "norris", name: "Lando Norris", code: "NOR", team: "McLaren", consistency: 92, qualifyingPace: 97, racePace: 96, wetWeather: 88, streetCircuit: 94, overtakesCount: 56 },
  { id: "leclerc", name: "Charles Leclerc", code: "LEC", team: "Ferrari", consistency: 89, qualifyingPace: 99, racePace: 94, wetWeather: 85, streetCircuit: 97, overtakesCount: 38 },
  { id: "piastri", name: "Oscar Piastri", code: "PIA", team: "McLaren", consistency: 91, qualifyingPace: 94, racePace: 93, wetWeather: 82, streetCircuit: 92, overtakesCount: 44 },
  { id: "sainz", name: "Carlos Sainz", code: "SAI", team: "Ferrari", consistency: 93, qualifyingPace: 92, racePace: 91, wetWeather: 89, streetCircuit: 90, overtakesCount: 35 },
  { id: "hamilton", name: "Lewis Hamilton", code: "HAM", team: "Mercedes", consistency: 94, qualifyingPace: 91, racePace: 95, wetWeather: 97, streetCircuit: 88, overtakesCount: 62 },
  { id: "russell", name: "George Russell", code: "RUS", team: "Mercedes", consistency: 88, qualifyingPace: 96, racePace: 92, wetWeather: 86, streetCircuit: 89, overtakesCount: 40 },
  { id: "perez", name: "Sergio Perez", code: "PER", team: "Red Bull", consistency: 78, qualifyingPace: 82, racePace: 88, wetWeather: 83, streetCircuit: 95, overtakesCount: 49 }
];

export function AnalyticsEngine() {
  const [driverAId, setDriverAId] = useState("max_verstappen");
  const [driverBId, setDriverBId] = useState("norris");

  const driverA = useMemo(() => STATS_POOL.find((d) => d.id === driverAId) || STATS_POOL[0], [driverAId]);
  const driverB = useMemo(() => STATS_POOL.find((d) => d.id === driverBId) || STATS_POOL[1], [driverBId]);

  const colorA = getTeamColor(driverA.team);
  const colorB = getTeamColor(driverB.team);

  // Generate dynamic lap-by-lap win probability coordinates (0 to 100 laps, 0 to 100%)
  const probabilityPoints = useMemo(() => {
    const points: { lap: number; probA: number; probB: number }[] = [];
    const currentA = 55; // Initial probability at turn 1
    
    // Simulate lap probabilities crossing
    for (let lap = 0; lap <= 50; lap += 5) {
      const variation = Math.sin(lap / 5) * 15 + (lap % 2 === 0 ? 5 : -5);
      const probA = Math.max(5, Math.min(95, currentA + variation));
      points.push({
        lap,
        probA,
        probB: 100 - probA
      });
    }
    return points;
  }, []);

  const chartPaths = useMemo(() => {
    const pathA = probabilityPoints.map((pt, idx) => {
      const x = (pt.lap / 50) * 100;
      const y = 100 - pt.probA; // SVG 0 is top
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    const pathB = probabilityPoints.map((pt, idx) => {
      const x = (pt.lap / 50) * 100;
      const y = 100 - pt.probB;
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    return { pathA, pathB };
  }, [probabilityPoints]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Selection Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Selector A */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Driver A:</span>
          <select
            value={driverAId}
            onChange={(e) => setDriverAId(e.target.value)}
            className="flex-1 bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2 px-4 rounded-xl border border-outline/30 focus:outline-none focus:border-primary/80 cursor-pointer"
          >
            {STATS_POOL.map((d) => (
              <option key={d.id} value={d.id} disabled={d.id === driverBId}>
                {d.name} ({d.team})
              </option>
            ))}
          </select>
        </div>

        {/* Selector B */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Driver B:</span>
          <select
            value={driverBId}
            onChange={(e) => setDriverBId(e.target.value)}
            className="flex-1 bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2 px-4 rounded-xl border border-outline/30 focus:outline-none focus:border-primary/80 cursor-pointer"
          >
            {STATS_POOL.map((d) => (
              <option key={d.id} value={d.id} disabled={d.id === driverAId}>
                {d.name} ({d.team})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparative Ratings Grid */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4.5 border border-outline/15">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
          Head-to-Head Statistics
        </span>

        <div className="flex flex-col gap-4">
          {/* Consistency rating row */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[12px] font-bold">
              <span style={{ color: colorA }}>{driverA.consistency}%</span>
              <span className="text-on-surface-variant uppercase">Consistency Index</span>
              <span style={{ color: colorB }}>{driverB.consistency}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-outline/15 overflow-hidden flex">
              <div className="h-full rounded-l-full" style={{ width: `${driverA.consistency / 2}%`, backgroundColor: colorA }} />
              <div className="h-full w-[1px] bg-bg" />
              <div className="h-full rounded-r-full" style={{ width: `${driverB.consistency / 2}%`, backgroundColor: colorB, marginLeft: "auto" }} />
            </div>
          </div>

          {/* Qualifying Pace */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[12px] font-bold">
              <span style={{ color: colorA }}>{driverA.qualifyingPace}%</span>
              <span className="text-on-surface-variant uppercase">Qualifying Pace</span>
              <span style={{ color: colorB }}>{driverB.qualifyingPace}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-outline/15 overflow-hidden flex">
              <div className="h-full rounded-l-full" style={{ width: `${driverA.qualifyingPace / 2}%`, backgroundColor: colorA }} />
              <div className="h-full w-[1px] bg-bg" />
              <div className="h-full rounded-r-full" style={{ width: `${driverB.qualifyingPace / 2}%`, backgroundColor: colorB, marginLeft: "auto" }} />
            </div>
          </div>

          {/* Race Pace */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[12px] font-bold">
              <span style={{ color: colorA }}>{driverA.racePace}%</span>
              <span className="text-on-surface-variant uppercase">Race Pace Rating</span>
              <span style={{ color: colorB }}>{driverB.racePace}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-outline/15 overflow-hidden flex">
              <div className="h-full rounded-l-full" style={{ width: `${driverA.racePace / 2}%`, backgroundColor: colorA }} />
              <div className="h-full w-[1px] bg-bg" />
              <div className="h-full rounded-r-full" style={{ width: `${driverB.racePace / 2}%`, backgroundColor: colorB, marginLeft: "auto" }} />
            </div>
          </div>

          {/* Wet weather rating */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[12px] font-bold">
              <span style={{ color: colorA }}>{driverA.wetWeather}%</span>
              <span className="text-on-surface-variant uppercase">Wet Performance</span>
              <span style={{ color: colorB }}>{driverB.wetWeather}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-outline/15 overflow-hidden flex">
              <div className="h-full rounded-l-full" style={{ width: `${driverA.wetWeather / 2}%`, backgroundColor: colorA }} />
              <div className="h-full w-[1px] bg-bg" />
              <div className="h-full rounded-r-full" style={{ width: `${driverB.wetWeather / 2}%`, backgroundColor: colorB, marginLeft: "auto" }} />
            </div>
          </div>

          {/* Street Track rating */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[12px] font-bold">
              <span style={{ color: colorA }}>{driverA.streetCircuit}%</span>
              <span className="text-on-surface-variant uppercase">Street Track Index</span>
              <span style={{ color: colorB }}>{driverB.streetCircuit}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-outline/15 overflow-hidden flex">
              <div className="h-full rounded-l-full" style={{ width: `${driverA.streetCircuit / 2}%`, backgroundColor: colorA }} />
              <div className="h-full w-[1px] bg-bg" />
              <div className="h-full rounded-r-full" style={{ width: `${driverB.streetCircuit / 2}%`, backgroundColor: colorB, marginLeft: "auto" }} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Win Probability Line Chart */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div>
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest font-mono">
            Interactive Forecast
          </span>
          <h3 className="text-[15px] font-black text-on-surface uppercase mt-0.5">
            Live Win Probability Curve
          </h3>
          <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium leading-tight">
            Lap-by-lap telemetry probability tracking based on sector pace history.
          </p>
        </div>

        {/* SVG Graph */}
        <div className="h-44 w-full relative mt-2 border-b border-l border-outline/25 select-none">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Horizontal 50% line */}
            <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-outline)" strokeWidth="0.4" strokeDasharray="1,2" />

            {/* Path Driver A */}
            <path
              d={chartPaths.pathA}
              fill="none"
              stroke={colorA}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path Driver B */}
            <path
              d={chartPaths.pathB}
              fill="none"
              stroke={colorB}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Legend indicators */}
          <div className="absolute top-2 left-2 text-[8px] font-mono font-bold text-on-surface-variant">100% PROBABILITY</div>
          <div className="absolute bottom-2 left-2 text-[8px] font-mono font-bold text-on-surface-variant/40">0% PROBABILITY</div>
        </div>

        {/* Legend pills */}
        <div className="flex gap-4.5 justify-center items-center text-[11px] font-mono font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-full" style={{ backgroundColor: colorA }} />
            <span className="text-on-surface">{driverA.code} ({driverA.name})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-full" style={{ backgroundColor: colorB }} />
            <span className="text-on-surface">{driverB.code} ({driverB.name})</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
