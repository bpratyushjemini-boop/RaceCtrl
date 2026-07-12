import Link from "next/link";
import type { RaceResult } from "@/lib/types";
import { getTeamColor } from "@/lib/team-colors";

/** Whether this result represents a classified finish (same lap count as leader or lapped). */
function isClassifiedFinish(status: string): boolean {
  const s = status.toLowerCase();
  return s === "finished" || s.startsWith("+") || s.includes("lap");
}

export function TimingRow({ result }: { result: RaceResult }) {
  const teamColor = getTeamColor(result.team);
  const isFinished = isClassifiedFinish(result.status);
  const isDNF = !isFinished;
  const isFastestLap = result.fastestLapRank === 1;

  // Position badge styling
  let positionBg = "bg-[#2C2C2E]/70 text-on-surface border border-outline/30";
  if (result.position === 1) positionBg = "bg-primary/20 text-primary border border-primary/30";
  else if (result.position === 2) positionBg = "bg-[#2C2C2E] text-on-surface border border-outline/25";
  else if (result.position === 3) positionBg = "bg-[#2C2C2E] text-on-surface-variant border border-outline/20";

  return (
    <li
      className={`border-b border-outline/30 last:border-b-0 hover:bg-white/5 transition-colors ${isDNF ? "opacity-50" : ""}`}
    >
      <Link
        href={`/drivers/${result.driverId}`}
        className="flex items-center h-[52px] gap-3 px-4 w-full"
        aria-label={`View profile for driver ${result.driverName}`}
      >
        {/* Position badge */}
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${positionBg}`}
        >
          {result.positionText}
        </span>

        {/* Team color strip */}
        <div
          className="h-7 w-[3px] shrink-0 rounded-full"
          style={{ backgroundColor: teamColor }}
        />

        {/* Driver code + team name */}
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-on-surface leading-tight tracking-tight flex items-center gap-1.5">
            {result.driverCode}
            {isFastestLap && (
              <span className="text-[10px] font-bold text-fastest px-1.5 py-0.5 rounded-full bg-fastest/15 border border-fastest/25 leading-none tracking-widest">
                FL
              </span>
            )}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-none truncate">
            {result.team}
          </p>
        </div>

        {/* Gap / time — right-aligned tabular */}
        <div className="shrink-0 text-right">
          <span
            className={`telemetry-numeric text-[14px] leading-none ${
              result.position === 1
                ? "text-on-surface"
                : isDNF
                ? "text-on-surface-variant text-[12px]"
                : "text-on-surface"
            }`}
          >
            {result.gap}
          </span>
          {isFastestLap && result.fastestLapTime && (
            <p className="text-[10px] text-fastest font-tabular mt-0.5 leading-none">
              {result.fastestLapTime}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
