"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { RaceCtrlLiveSession } from "@/lib/providers/types";

interface LiveTimingWidgetProps {
  round: number;
  initialSessionName?: string;
}

export function LiveTimingWidget({ round, initialSessionName = "Race" }: LiveTimingWidgetProps) {
  const [data, setData] = useState<RaceCtrlLiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchTiming() {
      try {
        const res = await fetch(`/api/live-timing?round=${round}&session=${initialSessionName}`);
        if (!res.ok) {
          throw new Error(`Timing fetch error: ${res.status}`);
        }
        const json = (await res.json()) as RaceCtrlLiveSession;
        if (active) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (active) {
          console.warn("Live timing fetch failed:", err);
          setError("Session Timing Offline");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchTiming();
    const interval = setInterval(fetchTiming, 5000); // Poll every 5s

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [round, initialSessionName]);

  if (loading && !data) {
    return (
      <GlassCard className="p-5 flex flex-col items-center justify-center min-h-[200px]" variant="structural">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
        <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
          Initializing Live Timing...
        </span>
      </GlassCard>
    );
  }

  // Fallback if error is present and no data has been loaded
  if (error && !data) {
    return (
      <GlassCard className="p-5 flex flex-col items-center justify-center min-h-[160px] border-outline/25" variant="structural">
        <span className="text-[12px] font-bold text-outline uppercase tracking-widest mb-1.5">Timing Feed Unavailable</span>
        <p className="text-[11px] text-on-surface-variant text-center max-w-xs">
          Live F1 connection is inactive or session data is missing. Timing details will sync when the session starts.
        </p>
      </GlassCard>
    );
  }

  const session = data;
  if (!session) return null;

  // Track Flag styling configurations
  const getFlagDetails = (flag: string) => {
    switch (flag) {
      case "SAFETY_CAR":
        return {
          bg: "bg-[#FF9500]/10 border-[#FF9500]/30",
          text: "text-[#FF9500]",
          label: "SAFETY CAR DEPLOYED",
          indicator: "bg-[#FF9500] animate-pulse"
        };
      case "VSC":
        return {
          bg: "bg-[#FFCC00]/10 border-[#FFCC00]/30",
          text: "text-[#FFCC00]",
          label: "VIRTUAL SAFETY CAR",
          indicator: "bg-[#FFCC00] animate-pulse"
        };
      case "RED":
        return {
          bg: "bg-[#FF3B30]/10 border-[#FF3B30]/30",
          text: "text-[#FF3B30]",
          label: "RED FLAG - SESSION SUSPENDED",
          indicator: "bg-[#FF3B30] animate-ping"
        };
      case "YELLOW":
        return {
          bg: "bg-[#FFCC00]/10 border-[#FFCC00]/20",
          text: "text-[#FFCC00]",
          label: "YELLOW FLAG",
          indicator: "bg-[#FFCC00] animate-pulse"
        };
      case "GREEN":
      default:
        return {
          bg: "bg-[#34C759]/10 border-[#34C759]/20",
          text: "text-[#34C759]",
          label: "TRACK CLEAR - GREEN FLAG",
          indicator: "bg-[#34C759]"
        };
    }
  };

  const flagConfig = getFlagDetails(session.trackFlag);

  return (
    <GlassCard className="overflow-hidden flex flex-col gap-4" variant="structural">
      {/* Title Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-outline/35">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <h3 className="text-[11px] font-black tracking-widest text-on-surface uppercase flex items-center gap-1.5">
            Live Timing Hub
            <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-mono font-medium font-tabular">
              LIVEF1
            </span>
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-on-surface-variant/80 tracking-widest uppercase">
          Lap {session.currentLap}/{session.totalLaps} · Clock {session.sessionClock}
        </span>
      </div>

      {/* Flag Alert Status Panel */}
      <div className={`mx-6 px-4 py-2.5 rounded-lg border flex items-center justify-between gap-3 ${flagConfig.bg}`}>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${flagConfig.indicator}`} />
          <span className={`text-[11px] font-bold tracking-widest uppercase font-mono ${flagConfig.text}`}>
            {flagConfig.label}
          </span>
        </div>
        {session.controlMessages.length > 0 && (
          <span className="text-[9px] font-mono text-on-surface-variant font-bold truncate max-w-[200px]">
            {session.controlMessages[session.controlMessages.length - 1]}
          </span>
        )}
      </div>

      {/* Live Classification Grid Table */}
      <div className="overflow-x-auto px-6 pb-5">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-outline/25 text-on-surface-variant/75 font-mono uppercase tracking-widest font-bold">
              <th className="py-2 w-8 text-center">POS</th>
              <th className="py-2 w-16">DRV</th>
              <th className="py-2">TEAM</th>
              <th className="py-2 text-right">GAP</th>
              <th className="py-2 text-right">INT</th>
              <th className="py-2 text-center w-12">TYRE</th>
              <th className="py-2 text-right w-20">LAST LAP</th>
              <th className="py-2 text-right w-20">BEST LAP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/10 font-medium">
            {session.classification.map((row) => {
              const isPit = row.status === "Pit";
              const isDnf = row.status === "DNF";
              
              let tyreColor = "border-outline/40 text-on-surface";
              if (row.tyreCompound === "SOFT") tyreColor = "bg-[#E10600]/10 border-[#E10600]/30 text-[#E10600]";
              if (row.tyreCompound === "MEDIUM") tyreColor = "bg-[#FFD200]/10 border-[#FFD200]/30 text-[#FFD200]";
              if (row.tyreCompound === "HARD") tyreColor = "bg-white/10 border-white/30 text-on-surface";

              return (
                <tr key={row.driverCode} className="hover:bg-surface-2/45 transition-colors">
                  <td className="py-2 text-center font-mono font-bold text-on-surface">
                    {row.positionText}
                  </td>
                  <td className="py-2 font-mono font-black text-on-surface">
                    {row.driverCode}
                  </td>
                  <td className="py-2 text-on-surface-variant truncate max-w-[120px]">
                    {row.team}
                  </td>
                  <td className={`py-2 text-right font-mono font-bold ${isDnf ? "text-red-500" : "text-on-surface"}`}>
                    {row.gap}
                  </td>
                  <td className="py-2 text-right font-mono text-on-surface-variant">
                    {row.interval}
                  </td>
                  <td className="py-2 text-center">
                    {row.tyreCompound !== "—" && (
                      <span className={`inline-block text-[9px] font-mono font-bold border rounded px-1.5 py-0.2 ${tyreColor}`}>
                        {row.tyreCompound[0]}
                      </span>
                    )}
                  </td>
                  <td className={`py-2 text-right font-mono ${isPit ? "text-[#FFCC00]" : "text-on-surface-variant"}`}>
                    {isPit ? "IN PIT" : row.lastLapTime}
                  </td>
                  <td className="py-2 text-right font-mono text-primary font-bold">
                    {row.bestLapTime}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Meta */}
      <div className="bg-surface-2/30 px-6 py-2 border-t border-outline/35 flex justify-between items-center text-[9px] text-outline font-mono font-bold">
        <span>POLLING ACTIVE (5S)</span>
        <span>SOURCE: LIVEF1 TIMING FEED</span>
      </div>
    </GlassCard>
  );
}
