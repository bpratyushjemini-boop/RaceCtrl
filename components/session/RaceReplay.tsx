"use client";

import React, { useState, useEffect, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getTeamColor } from "@/lib/team-colors";

interface DisplayClassificationEntry {
  position: number;
  positionText: string;
  driverCode: string;
  driverName: string;
  team: string;
  status?: string;
  gap?: string;
  points?: number;
}

interface RaceReplayProps {
  classificationList: DisplayClassificationEntry[];
  sessionName: string;
  round: number;
}

export function RaceReplay({ classificationList, sessionName, round }: RaceReplayProps) {
  const totalLaps = useMemo(() => {
    const isSprint = sessionName.toLowerCase().includes("sprint");
    if (isSprint) return 19;
    // Guess total laps based on round/session
    const lapMap: Record<number, number> = {
      1: 57, // Bahrain
      2: 50, // Saudi
      3: 58, // Melbourne
      4: 53, // Suzuka
      5: 56, // Shanghai
      6: 57, // Miami
      7: 63, // Imola
      8: 78, // Monaco
      9: 70, // Montreal
      10: 66, // Barcelona
      11: 71, // Spielberg
      12: 52, // Silverstone
      13: 70, // Budapest
      14: 44, // Spa
      15: 72, // Zandvoort
      16: 53, // Monza
      17: 51, // Baku
      18: 62, // Singapore
      19: 56, // Austin
      20: 71, // Mexico
      21: 71, // Interlagos
      22: 50, // Las Vegas
      23: 57, // Qatar
      24: 58, // Abu Dhabi
    };
    return lapMap[round] || 52;
  }, [round, sessionName]);

  const [activeLap, setActiveLap] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveLap((prev) => {
        if (prev >= totalLaps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, totalLaps]);

  // Determine current flag status
  const flagStatus = useMemo(() => {
    if (activeLap === 0) return { label: "GRID START", color: "border-primary bg-primary/5 text-primary" };
    if (activeLap === totalLaps) return { label: "CHEQUERED FLAG", color: "border-on-surface bg-on-surface/5 text-on-surface" };
    
    // Safety car periods
    if (activeLap >= 4 && activeLap <= 6) {
      return { label: "VIRTUAL SAFETY CAR", color: "border-yellow-500 bg-yellow-500/5 text-yellow-500" };
    }
    if (activeLap >= 20 && activeLap <= 24) {
      return { label: "SAFETY CAR", color: "border-yellow-500 bg-yellow-500/5 text-yellow-500" };
    }
    if (activeLap === 15) {
      return { label: "YELLOW FLAG - SECTOR 2", color: "border-yellow-500 bg-yellow-500/5 text-yellow-500" };
    }
    
    return { label: "GREEN FLAG", color: "border-green-500 bg-green-500/5 text-green-500" };
  }, [activeLap, totalLaps]);

  // Deterministic positions lookup at active lap
  const simulatedLeaderboard = useMemo(() => {
    return classificationList
      .map((driver, index) => {
        // Grid slot (start position) is shuffled deterministically
        const startPos = ((driver.position * 7) % classificationList.length) + 1;
        const progress = activeLap / totalLaps;
        
        // Linear shift towards final position
        const currentFloatPos = startPos + (driver.position - startPos) * progress;
        
        // Add dynamic lap noise to simulate overtakes
        let noise = 0;
        if (activeLap > 0 && activeLap < totalLaps) {
          noise = Math.sin(index + activeLap) * 0.4;
        }
        
        return {
          ...driver,
          simulatedPos: currentFloatPos + noise,
          startPos,
        };
      })
      // Sort by simulated float value
      .sort((a, b) => a.simulatedPos - b.simulatedPos)
      .map((d, index) => {
        const finalPos = index + 1;
        const posChange = d.startPos - finalPos;
        
        return {
          ...d,
          currentPos: finalPos,
          posChange,
        };
      });
  }, [classificationList, activeLap, totalLaps]);

  // Dynamic log generator based on lap
  const replayLogs = useMemo(() => {
    const logs: { lap: number; text: string; category: "system" | "incident" | "pit" }[] = [
      { lap: 0, text: "Grid formation complete. Temperature: 23°C. Wind: 1.2 m/s.", category: "system" },
      { lap: 1, text: "Lights out! Clean start for the front runners. Turn 1 clear.", category: "system" },
      { lap: 3, text: "DRS has been enabled.", category: "system" },
      { lap: 4, text: "VSC deployed: Haas spins at Turn 11. Debris clearing.", category: "incident" },
      { lap: 6, text: "VSC ending. Drivers preparation for green flag.", category: "system" },
      { lap: 7, text: "Green flag. Track clear.", category: "system" },
      { lap: 12, text: "Tyre pitstops: Early soft tyre runner pitting for Mediums.", category: "pit" },
      { lap: 15, text: "Yellow Flag: Localized caution in Sector 2 due to running wide.", category: "incident" },
      { lap: 20, text: "Safety Car Deployed: Contact on Sector 3. Field bunching up.", category: "incident" },
      { lap: 24, text: "Safety car returning. Green Flag on the next lap.", category: "system" },
      { lap: 25, text: "Green flag. Racing resumes at full speed.", category: "system" },
      { lap: 30, text: "First pit window closes. Medium to Hard tyre stint strategy.", category: "pit" },
      { lap: 40, text: "Telemetry reports slight tailwind down the back straight.", category: "system" },
      { lap: 44, text: "Fastest lap set by race leader (1:18.293).", category: "system" },
      { lap: totalLaps, text: "Chequered Flag! Race winner crosses the finish line.", category: "system" },
    ];

    return logs.filter((log) => log.lap <= activeLap).reverse();
  }, [activeLap, totalLaps]);

  return (
    <GlassCard variant="structural" className="p-5 flex flex-col gap-5">
      {/* Top Banner with Flag and Lap status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline/10 pb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">Race Replay Mode</span>
          <h3 className="text-[18px] font-black text-on-surface uppercase tracking-tight">Interactive Timeline</h3>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Flag indicator */}
          <div className={`px-3 py-1.5 rounded border text-[11px] font-black tracking-wider uppercase font-mono ${flagStatus.color}`}>
            {flagStatus.label}
          </div>

          <div className="bg-surface-2 px-3 py-1.5 rounded border border-outline/25 text-[11px] font-black tracking-wider uppercase text-on-surface font-mono">
            Lap {activeLap} / {totalLaps}
          </div>
        </div>
      </div>

      {/* Main Grid: Leaderboard & Logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left/Leaderboard: md:col-span-2 */}
        <div className="md:col-span-2 flex flex-col gap-2 max-h-[460px] overflow-y-auto pr-1">
          <div className="grid grid-cols-12 px-3 py-1 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline/5 pb-2">
            <span className="col-span-2">POS</span>
            <span className="col-span-6">DRIVER</span>
            <span className="col-span-4 text-right">START / DIFF</span>
          </div>

          {simulatedLeaderboard.map((d) => {
            const teamColor = getTeamColor(d.team);
            const isGain = d.posChange > 0;
            return (
              <div
                key={d.driverCode}
                className="grid grid-cols-12 items-center bg-surface-2/15 border border-outline/10 rounded-lg p-2 px-3 text-[13px] font-medium text-on-surface hover:bg-surface-2/30 transition-colors"
              >
                {/* Pos */}
                <span className="col-span-2 font-mono font-black text-on-surface-variant">
                  P{d.currentPos}
                </span>

                {/* Team stripe and Code */}
                <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                  <span className="h-3 w-1.5 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
                  <span className="font-bold text-on-surface">{d.driverCode}</span>
                  <span className="text-[11px] text-on-surface-variant truncate hidden sm:inline">{d.driverName}</span>
                </div>

                {/* Diff */}
                <div className="col-span-4 text-right flex items-center justify-end gap-1.5 font-mono text-[11px]">
                  <span className="text-on-surface-variant/40">G{d.startPos}</span>
                  {d.posChange !== 0 ? (
                    <span className={`font-bold ${isGain ? "text-green-500" : "text-red-500"}`}>
                      {isGain ? `+${d.posChange}` : d.posChange}
                    </span>
                  ) : (
                    <span className="text-on-surface-variant/30">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right/Logs: md:col-span-1 */}
        <div className="md:col-span-1 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">Race Events Log</span>
          
          <div className="flex-1 min-h-[220px] md:max-h-[420px] overflow-y-auto bg-surface-2/20 border border-outline/15 rounded-xl p-3 flex flex-col gap-2.5">
            {replayLogs.length === 0 ? (
              <p className="text-[11px] text-on-surface-variant text-center py-10">Start simulation to stream events.</p>
            ) : (
              replayLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-[11px] ${
                    log.category === "incident"
                      ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400"
                      : log.category === "pit"
                      ? "border-primary/20 bg-primary/5 text-primary"
                      : "border-outline/10 text-on-surface-variant"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold text-[9px] mb-1 uppercase">
                    <span>{log.category} event</span>
                    <span>Lap {log.lap}</span>
                  </div>
                  <p className="leading-relaxed font-medium">{log.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: slider, play/pause and speeds */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-2/40 border border-outline/35 rounded-xl p-4 mt-2">
        {/* Play Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`h-9 px-4 rounded-full font-bold text-[11px] tracking-wider uppercase cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${
            isPlaying ? "bg-primary text-white" : "border border-outline/30 text-on-surface hover:bg-surface-2/70"
          }`}
        >
          {isPlaying ? (
            <>
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Replay
            </>
          )}
        </button>

        {/* Lap Slider */}
        <div className="flex-1 flex items-center gap-2.5 w-full">
          <span className="text-[10px] font-bold text-on-surface-variant font-mono">Lap 0</span>
          <input
            type="range"
            min="0"
            max={totalLaps}
            value={activeLap}
            onChange={(e) => {
              setIsPlaying(false);
              setActiveLap(parseInt(e.target.value, 10));
            }}
            className="flex-1 h-1.5 rounded bg-surface-2 accent-primary appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-bold text-on-surface-variant font-mono">Lap {totalLaps}</span>
        </div>

        {/* Speed multiplier */}
        <div className="flex bg-surface-2 border border-outline/25 rounded-lg p-0.5 shrink-0">
          {([1, 2, 5, 10] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSpeed(m)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                speed === m ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {m}x
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
