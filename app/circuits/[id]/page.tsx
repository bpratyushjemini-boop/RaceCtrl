import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { LocationSignal } from "@/components/weekend/LocationSignal";
import { WeekendTimeline } from "@/components/weekend/WeekendTimeline";
import { getCircuitInfo, getRecentWinners, getRaceSchedule } from "@/lib/api/f1";
import { getCircuitMetadata } from "@/lib/f1/circuit-data";
import { getCircuitTimezone } from "@/lib/f1/circuit-timezones";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CircuitProfilePage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch circuit info from Ergast API
  const circuitInfo = await getCircuitInfo(id);
  if (!circuitInfo) {
    notFound();
  }

  // 2. Fetch recent winners, schedule, and metadata in parallel
  const [recentWinners, schedule, metadata] = await Promise.all([
    getRecentWinners(id),
    getRaceSchedule(),
    getCircuitMetadata(id),
  ]);

  // Find if this circuit is part of the current season calendar
  const currentRace = schedule.find(
    (race) =>
      race.circuitId === id ||
      race.circuitName.toLowerCase().includes(circuitInfo.circuitName.toLowerCase())
  );

  const ianaTimezone = getCircuitTimezone(id);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
      {/* ─── Back Button & Navigation ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/weekend"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-on-surface-variant hover:text-on-surface uppercase transition-colors"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Weekend
        </Link>
        <div className="text-[10px] font-mono text-outline font-bold tracking-tight">
          ID: {id.toUpperCase()} // TZ: {ianaTimezone}
        </div>
      </div>

      {/* ─── Section: Circuit Profile Hero ─── */}
      <GlassCard className="p-6 md:p-8 relative overflow-hidden" variant="floating">
        {/* Abstract design element */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
              Circuit Profile
            </span>
            {currentRace && (
              <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                · Round {currentRace.round}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface leading-tight break-words">
            {circuitInfo.circuitName}
          </h1>
          <p className="text-[14px] text-on-surface-variant mt-2.5 flex items-center gap-1.5 font-medium">
            <svg className="h-4 w-4 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {circuitInfo.locality}, {circuitInfo.country}
          </p>
        </div>
      </GlassCard>

      {/* ─── Grid: Map and Technical Specs ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
        {/* Left: Location Signal */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Circuit Signal
            </span>
          </div>
          <LocationSignal
            lat={circuitInfo.lat}
            long={circuitInfo.long}
            circuitName={circuitInfo.circuitName}
          />
        </div>

        {/* Right: Technical Specifications */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Technical Specifications
            </span>
          </div>

          <GlassCard className="p-4 flex flex-col gap-4 min-h-[160px] md:min-h-[220px]">
            {metadata ? (
              <div className="grid grid-cols-2 gap-4 my-auto">
                {metadata.trackLength && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Track Length
                    </span>
                    <span className="text-xl font-bold text-on-surface telemetry-numeric mt-1">
                      {metadata.trackLength}
                    </span>
                  </div>
                )}
                {metadata.lapCount && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Laps
                    </span>
                    <span className="text-xl font-bold text-on-surface telemetry-numeric mt-1">
                      {metadata.lapCount}
                    </span>
                  </div>
                )}
                {metadata.raceDistance && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Race Distance
                    </span>
                    <span className="text-xl font-bold text-on-surface telemetry-numeric mt-1">
                      {metadata.raceDistance}
                    </span>
                  </div>
                )}
                {metadata.firstGrandPrix && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      First Grand Prix
                    </span>
                    <span className="text-xl font-bold text-on-surface telemetry-numeric mt-1">
                      {metadata.firstGrandPrix}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="my-auto text-center py-6">
                <p className="text-[13px] text-on-surface-variant">
                  No verified technical specifications are currently catalogued for this circuit.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* ─── Grid: Current Race Schedule & Historical Winners ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start mt-2">
        {/* Left: Current Race Schedule (Timeline) */}
        {currentRace ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5 px-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                {currentRace.raceName} Schedule
              </span>
            </div>
            <GlassCard className="p-5" variant="structural">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline/35">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                  Session
                </span>
                <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                  Time
                </span>
              </div>
              <WeekendTimeline sessions={currentRace.sessions} round={currentRace.round} />
            </GlassCard>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5 px-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                Calendar Status
              </span>
            </div>
            <GlassCard className="p-6 text-center">
              <p className="text-[13px] text-on-surface-variant">
                This circuit is not on the current season calendar.
              </p>
            </GlassCard>
          </div>
        )}

        {/* Right: Recent Winners */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Recent Winners
            </span>
          </div>
          <GlassCard className="p-5" variant="structural">
            {recentWinners.length > 0 ? (
              <ul className="list-none p-0 m-0 divide-y divide-outline/30">
                {recentWinners.map((winner, idx) => (
                  <li key={`${winner.year}-${idx}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[14px] font-bold text-on-surface leading-none">
                        {winner.winner}
                      </span>
                      <span className="text-[11px] text-on-surface-variant mt-1 leading-none">
                        {winner.constructor}
                      </span>
                    </div>
                    <span className="text-[14px] font-bold text-primary telemetry-numeric shrink-0">
                      {winner.year}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-[13px] text-on-surface-variant">
                  No historical winner records could be retrieved for this circuit.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
