import { GlassCard } from "@/components/ui/GlassCard";
import { FlagBanner } from "@/components/timing/FlagBanner";
import { TimingRow } from "@/components/timing/TimingRow";
import {
  getIsWeekendActive,
  getLastRaceResults,
  getResolvedSeason,
} from "@/lib/api/f1";

export const revalidate = 300;

export default async function TimingPage() {
  const [lastRace, isWeekendActive] = await Promise.all([
    getLastRaceResults(),
    getIsWeekendActive(),
  ]);

  const formatRaceDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const resolvedSeason = getResolvedSeason();

  return (
    <div className="flex flex-col gap-0 -mx-4 md:mx-0 md:gap-4">
      {/* ── Session Header Card ─────────────────────────────────── */}
      <GlassCard
        variant="floating"
        className="rounded-none md:rounded-md px-4 py-5 flex flex-col gap-4"
      >
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
                {lastRace
                  ? `${resolvedSeason} Season · Round ${lastRace.round} · ${isWeekendActive ? "Active" : "Latest Classification"}`
                  : "Live Timing"}
              </span>
            </div>
            <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight text-on-surface leading-tight">
              {lastRace?.raceName ?? "No session data"}
            </h1>
            {lastRace && (
              <p className="text-[13px] text-on-surface-variant mt-1">
                {formatRaceDate(lastRace.date)}
              </p>
            )}
          </div>

          {/* Status chip */}
          <div className="shrink-0">
            {isWeekendActive ? (
              <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-primary/15 border border-primary/30">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
                  Active
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-surface-2/80 border border-outline/25">
                <span className="h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
                <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                  Results
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Stats row: winner, team, time */}
        {lastRace && lastRace.results.length > 0 && (
          <div className="flex items-center gap-4 border-t border-outline/30 pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                Winner
              </span>
              <span className="text-[15px] font-bold text-on-surface">
                {lastRace.results[0].driverCode}
              </span>
            </div>
            <div className="h-8 w-px bg-outline/30" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                Team
              </span>
              <span className="text-[15px] font-bold text-on-surface truncate max-w-[140px]">
                {lastRace.results[0].team}
              </span>
            </div>
            <div className="h-8 w-px bg-outline/30" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                Time
              </span>
              <span className="telemetry-numeric text-[14px] text-on-surface">
                {lastRace.results[0].gap}
              </span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ── State Banner ────────────────────────────────────────── */}
      {isWeekendActive ? (
        <FlagBanner
          variant="info"
          message="Weekend active · Classification reports latest completed sessions"
        />
      ) : (
        <FlagBanner
          variant="neutral"
          message="Official classification source · Live timing is not available from the current provider"
        />
      )}

      {/* ── Leaderboard Table ───────────────────────────────────── */}
      {lastRace && lastRace.results.length > 0 ? (
        <div className="flex flex-col gap-0">
          {/* Column headers */}
          <div className="flex items-center h-9 px-4 gap-3 bg-surface/60 border-b border-outline/30">
            <span className="w-7 shrink-0 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-center">
              Pos
            </span>
            <div className="w-[3px] shrink-0" />
            <span className="flex-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              Driver
            </span>
            <span className="shrink-0 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              Gap / Status
            </span>
          </div>

          {/* Rows */}
          <GlassCard
            variant="structural"
            className="rounded-none md:rounded-md overflow-hidden"
          >
            <ul className="list-none p-0 m-0">
              {lastRace.results.map((result) => (
                <TimingRow key={result.position} result={result} />
              ))}
            </ul>
          </GlassCard>
        </div>
      ) : (
        /* ── Empty / No Data ──────────────────────────────────── */
        <GlassCard
          variant="structural"
          className="mx-4 md:mx-0 rounded-md px-6 py-12 text-center"
        >
          <div className="flex flex-col items-center gap-3">
            <svg
              className="h-10 w-10 text-on-surface-variant"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h18v4H3V3zm0 4h4v4H3V7zm4 0h4v4H7V7zm4 0h4v4h-4V7zm4 0h4v4h-4V7zM3 11h4v4H3v-4zm4 0h4v4H7v-4zm4 0h4v4h-4v-4zm4 0h4v4h-4v-4z"
              />
            </svg>
            <p className="text-[15px] font-semibold text-on-surface">
              No race results yet
            </p>
            <p className="text-[13px] text-on-surface-variant max-w-[240px]">
              Results appear here after each session completes.
            </p>
          </div>
        </GlassCard>
      )}

      {/* ── Fastest Lap Legend ──────────────────────────────────── */}
      {lastRace && lastRace.results.some((r) => r.fastestLapRank === 1) && (
        <div className="px-4 md:px-0 pt-2 pb-1 flex items-center gap-2">
          <span className="text-[10px] font-bold text-fastest px-2 py-0.5 rounded-full bg-fastest/15 border border-fastest/25 tracking-widest uppercase">
            FL
          </span>
          <span className="text-[11px] text-on-surface-variant">
            Fastest Lap of the Race
          </span>
        </div>
      )}
    </div>
  );
}
