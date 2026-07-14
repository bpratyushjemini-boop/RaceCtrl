import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { WeekendTimeline } from "@/components/weekend/WeekendTimeline";
import { getCircuitInfo, getRecentWinners, getRaceSchedule } from "@/lib/api/f1";
import { getCircuitMetadata } from "@/lib/f1/circuit-data";
import { getCircuitTimezone } from "@/lib/f1/circuit-timezones";
import { resolveCircuitMedia, getRaceIdentity } from "@/lib/media/resolver";

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

  const circuitMedia = resolveCircuitMedia(id);
  const identity = getRaceIdentity(circuitMedia.id);

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
          ID: {id.toUpperCase()} · TZ: {ianaTimezone}
        </div>
      </div>

      {/* ─── Section: Circuit Profile Hero ─── */}
      <GlassCard 
        className="p-6 md:p-8 relative overflow-hidden" 
        variant="floating"
        style={{ background: identity.fallbackGradient }}
      >
        {/* Dynamic Circuit Background Hero Image (if registered) */}
        {circuitMedia.heroImage && (
          <div className="absolute inset-0 pointer-events-none select-none z-0">
            <Image
              src={circuitMedia.heroImage}
              alt={circuitInfo.circuitName}
              fill
              className="object-cover transition-opacity duration-300 opacity-20 dark:opacity-30"
              style={{ objectPosition: circuitMedia.focalPosition || "center" }}
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-transparent z-0" />
          </div>
        )}

        {/* Dynamic Location Watermark for Missing Assets */}
        {!circuitMedia.heroImage && (
          <div className="absolute -left-6 bottom-1/4 text-[76px] md:text-[96px] font-black uppercase tracking-tighter select-none pointer-events-none text-on-surface/[0.02] dark:text-on-surface/[0.03] font-mono leading-none rotate-[-4deg] z-0">
            {identity.locationLabel}
          </div>
        )}

        {/* Decorative SVG track outline in background with gradient masking */}
        <div 
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-28 h-28 md:w-36 md:h-36 pointer-events-none select-none z-0 opacity-[0.05] dark:opacity-[0.14] text-on-surface"
          style={{
            color: identity.visualAccent,
            maskImage: "linear-gradient(to left, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)",
            WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)",
          }}
        >
          <svg
            viewBox={circuitMedia.viewBox}
            className="w-full h-full fill-none stroke-current"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={circuitMedia.svgPath} />
          </svg>
        </div>

        <div className="min-w-0 z-10 relative">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: identity.visualAccent }} />
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: identity.visualAccent }}>
              Circuit Profile
            </span>
            {currentRace && (
              <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                · Round {currentRace.round}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface leading-tight break-words uppercase">
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

      {/* ─── Grid: Overview and Winners ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
        {/* Left: Circuit Overview */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Circuit Overview
            </span>
          </div>
          <GlassCard className="p-5 flex flex-col gap-5 justify-between min-h-[220px]" variant="structural">
            <div>
              <h2 className="text-xl font-bold text-on-surface uppercase tracking-tight">
                {circuitInfo.circuitName}
              </h2>
              <p className="text-[13px] text-on-surface-variant mt-1.5 flex items-center gap-1.5 font-medium">
                <svg className="h-3.5 w-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {circuitInfo.locality}, {circuitInfo.country}
              </p>
            </div>

            {metadata ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-outline/20 pt-4 font-tabular">
                {metadata.trackLength && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Track Length
                    </span>
                    <span className="text-[15px] font-bold text-on-surface mt-0.5">
                      {metadata.trackLength}
                    </span>
                  </div>
                )}
                {metadata.lapCount && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Laps
                    </span>
                    <span className="text-[15px] font-bold text-on-surface mt-0.5">
                      {metadata.lapCount}
                    </span>
                  </div>
                )}
                {metadata.raceDistance && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Race Distance
                    </span>
                    <span className="text-[15px] font-bold text-on-surface mt-0.5">
                      {metadata.raceDistance}
                    </span>
                  </div>
                )}
                {metadata.firstGrandPrix && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      First Grand Prix
                    </span>
                    <span className="text-[15px] font-bold text-on-surface mt-0.5">
                      {metadata.firstGrandPrix}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-t border-outline/20 pt-4 text-center">
                <p className="text-[12px] text-on-surface-variant">
                  No specifications catalogued for this track.
                </p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right: Recent Winners */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Recent Winners
            </span>
          </div>
          <GlassCard className="p-5 min-h-[220px] flex flex-col justify-center" variant="structural">
            {recentWinners.length > 0 ? (
              <ul className="list-none p-0 m-0 divide-y divide-outline/20 w-full">
                {recentWinners.slice(0, 4).map((winner, idx) => (
                  <li key={`${winner.year}-${idx}`} className="flex items-center justify-between py-2 first:pt-0 last:pb-0 font-sans">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-on-surface leading-none">
                        {winner.winner}
                      </span>
                      <span className="text-[10px] text-on-surface-variant mt-0.5 leading-none">
                        {winner.constructor}
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-primary telemetry-numeric shrink-0">
                      {winner.year}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-6">
                <p className="text-[12px] text-on-surface-variant">
                  No historical winner records catalogued.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* ─── Row 2: Current Race Schedule (if available) ─── */}
      {currentRace && (
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              {currentRace.raceName} Schedule
            </span>
          </div>
          <GlassCard className="p-5" variant="structural">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline/20">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Session
              </span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Time
              </span>
            </div>
            <WeekendTimeline sessions={currentRace.sessions} round={currentRace.round} />
          </GlassCard>
        </div>
      )}
    </div>
  );
}
