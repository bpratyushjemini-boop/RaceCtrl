"use client";

import React, { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getTeamColor } from "@/lib/team-colors";

interface TelemetryPoint {
  distPercent: number; // 0 to 100
  speedA: number; // km/h
  speedB: number;
  throttleA: number; // 0 to 100
  throttleB: number;
  brakeA: number; // 0 to 100
  brakeB: number;
  gearA: number; // 1 to 8
  gearB: number;
}

const LAP_TELEMETRY: TelemetryPoint[] = [
  { distPercent: 0, speedA: 280, speedB: 278, throttleA: 100, throttleB: 100, brakeA: 0, brakeB: 0, gearA: 7, gearB: 7 },
  { distPercent: 10, speedA: 310, speedB: 308, throttleA: 100, throttleB: 100, brakeA: 0, brakeB: 0, gearA: 8, gearB: 8 },
  { distPercent: 20, speedA: 120, speedB: 125, throttleA: 0, throttleB: 0, brakeA: 95, brakeB: 90, gearA: 3, gearB: 3 }, // Hard Braking Zone
  { distPercent: 30, speedA: 145, speedB: 140, throttleA: 40, throttleB: 45, brakeA: 0, brakeB: 0, gearA: 3, gearB: 3 },
  { distPercent: 40, speedA: 240, speedB: 238, throttleA: 80, throttleB: 85, brakeA: 0, brakeB: 0, gearA: 5, gearB: 5 },
  { distPercent: 50, speedA: 295, speedB: 298, throttleA: 100, throttleB: 100, brakeA: 0, brakeB: 0, gearA: 7, gearB: 7 },
  { distPercent: 60, speedA: 160, speedB: 155, throttleA: 20, throttleB: 10, brakeA: 60, brakeB: 70, gearA: 4, gearB: 4 }, // Medium corner
  { distPercent: 70, speedA: 220, speedB: 225, throttleA: 70, throttleB: 75, brakeA: 0, brakeB: 0, gearA: 5, gearB: 5 },
  { distPercent: 80, speedA: 285, speedB: 282, throttleA: 100, throttleB: 100, brakeA: 0, brakeB: 0, gearA: 7, gearB: 7 },
  { distPercent: 90, speedA: 320, speedB: 322, throttleA: 100, throttleB: 100, brakeA: 0, brakeB: 0, gearA: 8, gearB: 8 },
  { distPercent: 100, speedA: 282, speedB: 280, throttleA: 100, throttleB: 100, brakeA: 0, brakeB: 0, gearA: 7, gearB: 7 }
];

const TELEMETRY_POOL = [
  { id: "max_verstappen", code: "VER", name: "Max Verstappen", team: "Red Bull" },
  { id: "norris", code: "NOR", name: "Lando Norris", team: "McLaren" },
  { id: "leclerc", code: "LEC", name: "Charles Leclerc", team: "Ferrari" },
  { id: "hamilton", code: "HAM", name: "Lewis Hamilton", team: "Mercedes" }
];

export function TelemetryDashboard() {
  const [driverAId, setDriverAId] = useState("max_verstappen");
  const [driverBId, setDriverBId] = useState("norris");

  const dA = useMemo(() => TELEMETRY_POOL.find((d) => d.id === driverAId) || TELEMETRY_POOL[0], [driverAId]);
  const dB = useMemo(() => TELEMETRY_POOL.find((d) => d.id === driverBId) || TELEMETRY_POOL[1], [driverBId]);

  const colorA = getTeamColor(dA.team);
  const colorB = getTeamColor(dB.team);

  // Compute SVG Line paths (0-100 distance mapped to x, speed mapped to y)
  const paths = useMemo(() => {
    const maxSpeed = 350;
    const pathA = LAP_TELEMETRY.map((p) => {
      const x = p.distPercent;
      const y = 100 - (p.speedA / maxSpeed) * 90; // SVG coordinate map (invert y)
      return `${p.distPercent === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    const pathB = LAP_TELEMETRY.map((p) => {
      const x = p.distPercent;
      const y = 100 - (p.speedB / maxSpeed) * 90;
      return `${p.distPercent === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    return { pathA, pathB };
  }, []);

  return (
    <GlassCard variant="structural" className="p-5 flex flex-col gap-4.5 border border-outline/15 w-full">
      <div className="flex justify-between items-start border-b border-outline/10 pb-2">
        <div>
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest font-mono">
            Live Telemetry Overlay
          </span>
          <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
            Lap Telemetry Comparer
          </h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded select-none">
          SYSTEM: ONLINE
        </span>
      </div>

      {/* Driver comparisons select headers */}
      <div className="grid grid-cols-2 gap-4 select-none">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-on-surface-variant uppercase font-mono">Telemetry A:</span>
          <select
            value={driverAId}
            onChange={(e) => setDriverAId(e.target.value)}
            className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[12.5px] font-bold py-2 px-3 rounded-xl border border-outline/30 focus:outline-none focus:border-primary/80 cursor-pointer"
          >
            {TELEMETRY_POOL.map((d) => (
              <option key={d.id} value={d.id} disabled={d.id === driverBId}>
                {d.code} ({d.name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-bold text-on-surface-variant uppercase font-mono">Telemetry B:</span>
          <select
            value={driverBId}
            onChange={(e) => setDriverBId(e.target.value)}
            className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[12.5px] font-bold py-2 px-3 rounded-xl border border-outline/30 focus:outline-none focus:border-primary/80 cursor-pointer"
          >
            {TELEMETRY_POOL.map((d) => (
              <option key={d.id} value={d.id} disabled={d.id === driverAId}>
                {d.code} ({d.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SVG Chart speed profile */}
      <div className="flex flex-col gap-2.5 mt-2">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase font-mono tracking-wider">
          Speed Trace (km/h)
        </span>
        <div className="h-44 w-full relative border-b border-l border-outline/25">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Guidelines */}
            {[100, 200, 300].map((s) => {
              const y = 100 - (s / 350) * 90;
              return (
                <line
                  key={s}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="var(--color-outline)"
                  strokeWidth="0.4"
                  strokeDasharray="1,2"
                  className="opacity-45"
                />
              );
            })}

            {/* Path A */}
            <path
              d={paths.pathA}
              fill="none"
              stroke={colorA}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Path B */}
            <path
              d={paths.pathB}
              fill="none"
              stroke={colorB}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute top-2 left-2 text-[8px] font-mono font-bold text-on-surface-variant">300 km/h</div>
          <div className="absolute bottom-12 left-2 text-[8px] font-mono font-bold text-on-surface-variant/70">100 km/h</div>
        </div>
      </div>

      {/* Throttle & Brake inputs indicators (micro bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 font-mono text-[11px] font-bold">
        {/* Driver A Inputs */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-2/30 border border-outline/10">
          <span className="text-[9.5px] uppercase" style={{ color: colorA }}>{dA.code} Inputs</span>
          <div className="flex flex-col gap-1.5 mt-1">
            {/* Throttle */}
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">THROTTLE:</span>
              <span className="text-green-500">100%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-outline/25 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
            </div>
            {/* Brake */}
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">BRAKE:</span>
              <span className="text-red-500">0%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-outline/25 overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: "0%" }} />
            </div>
          </div>
        </div>

        {/* Driver B Inputs */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-2/30 border border-outline/10">
          <span className="text-[9.5px] uppercase" style={{ color: colorB }}>{dB.code} Inputs</span>
          <div className="flex flex-col gap-1.5 mt-1">
            {/* Throttle */}
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">THROTTLE:</span>
              <span className="text-green-500">95%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-outline/25 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: "95%" }} />
            </div>
            {/* Brake */}
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">BRAKE:</span>
              <span className="text-red-500">5%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-outline/25 overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: "5%" }} />
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
