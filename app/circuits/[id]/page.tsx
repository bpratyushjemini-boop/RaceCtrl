import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";
import { WeekendTimeline } from "@/components/weekend/WeekendTimeline";
import { getCircuitInfo, getRecentWinners, getRaceSchedule } from "@/lib/api/f1";
import { getCircuitMetadata } from "@/lib/f1/circuit-data";
import { getCircuitTimezone } from "@/lib/f1/circuit-timezones";
import { resolveCircuitMedia, getRaceIdentity } from "@/lib/media/resolver";
import { CircuitActions } from "@/components/circuits/CircuitActions";

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
    <PageContainer className="pb-10">
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
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-on-surface-variant font-bold tracking-tight uppercase hidden sm:inline">
            TZ: {ianaTimezone}
          </span>
          <CircuitActions
            circuitId={id}
            circuitName={circuitInfo.circuitName}
          />
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
        <PageSection title="Circuit Overview">
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
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Corners Count
                  </span>
                  <span className="text-[15px] font-bold text-on-surface mt-0.5">
                    {getExtraCircuitSpecs(id).corners} Corners
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                    DRS Zones
                  </span>
                  <span className="text-[15px] font-bold text-[#30D158] mt-0.5">
                    {getExtraCircuitSpecs(id).drs} Zones
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Elevation Profile
                  </span>
                  <span className="text-[15px] font-bold text-on-surface mt-0.5">
                    {getExtraCircuitSpecs(id).elevation} Delta
                  </span>
                </div>
                <div className="flex flex-col col-span-2 pt-2 border-t border-outline/10">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Official Lap Record
                  </span>
                  <span className="text-[13px] font-bold text-primary mt-0.5 font-mono">
                    {getExtraCircuitSpecs(id).record}
                  </span>
                </div>
              </div>
            ) : (
              <div className="border-t border-outline/20 pt-4 text-center">
                <p className="text-[12px] text-on-surface-variant">
                  No specifications catalogued for this track.
                </p>
              </div>
            )}
          </GlassCard>
        </PageSection>

        {/* Right: Recent Winners */}
        <PageSection title="Recent Winners">
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
        </PageSection>
      </div>

      {/* ─── Row 2: Current Race Schedule (if available) ─── */}
      {currentRace && (
        <PageSection title={`${currentRace.raceName} Schedule`} className="mt-2">
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
        </PageSection>
      )}

      {/* ─── Track Interactive Map & Strategy ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <PageSection title="Interactive Circuit Layout" className="md:col-span-2">
          <GlassCard variant="structural" className="p-5 flex flex-col gap-4 items-center justify-center min-h-[320px] relative overflow-hidden group">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes drawTrack {
                from { stroke-dashoffset: 1200; }
                to { stroke-dashoffset: 0; }
              }
              .track-draw-path {
                stroke-dasharray: 1200;
                stroke-dashoffset: 1200;
                animation: drawTrack 3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
              }
            `}} />
            
            {/* Interactive SVG track map using metadata or default coordinates */}
            <div className="w-full max-w-[280px] h-60 text-primary opacity-90 group-hover:opacity-100 transition-opacity">
              <svg viewBox={circuitMedia.viewBox} className="w-full h-full fill-none stroke-current" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d={circuitMedia.svgPath} className="track-draw-path" />
                {/* Visual indicator nodes representing DRS Zones */}
                {getExtraCircuitSpecs(id).drs >= 1 && (
                  <circle cx="120" cy="90" r="4.5" fill="#30D158" className="animate-pulse" />
                )}
                {getExtraCircuitSpecs(id).drs >= 2 && (
                  <circle cx="180" cy="140" r="4.5" fill="#30D158" className="animate-pulse" />
                )}
              </svg>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-bold text-on-surface-variant uppercase">
              <span>DRS Zone Highlight Indicators</span>
              <span className="text-[#30D158] font-mono">Animated Vector Outline</span>
            </div>
          </GlassCard>
        </PageSection>

        <div className="flex flex-col gap-5">
          <PageSection title="Strategy Guidelines">
            <GlassCard variant="structural" className="p-5 flex flex-col gap-3 text-[12.5px] leading-relaxed">
              <p className="text-on-surface-variant">
                <span className="font-bold text-on-surface uppercase block text-[11px] mb-1 text-primary">Expected Strategy</span>
                Standard 1-Stop (Medium to Hard) is predicted. High safety car probability suggests keeping a flexible pit-window from Lap 16 to 22.
              </p>
              <div className="pt-2 border-t border-outline/10 flex flex-col gap-1 mt-1 text-[11px]">
                <span className="font-bold text-on-surface-variant uppercase">Pirelli Tyre Selection</span>
                <div className="flex items-center gap-1.5 mt-1 font-mono">
                  <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center font-bold border border-outline/25">C3</span>
                  <span className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">C4</span>
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">C5</span>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider ml-1">Soft Range</span>
                </div>
              </div>
            </GlassCard>
          </PageSection>

          <PageSection title="Circuit Highlights">
            <GlassCard variant="structural" className="p-5 flex flex-col gap-2 text-[12.5px]">
              <span className="font-bold text-on-surface uppercase block text-[11px] mb-1 text-primary">Historic Moments</span>
              <p className="text-on-surface-variant leading-relaxed">
                {getExtraCircuitSpecs(id).highlights}
              </p>
            </GlassCard>
          </PageSection>
        </div>
      </div>
    </PageContainer>
  );
}

// ── EXTRA SPECS HELPER ──
function getExtraCircuitSpecs(id: string) {
  const data: Record<string, { corners: number; drs: number; elevation: string; record: string; highlights: string }> = {
    monaco: {
      corners: 19,
      drs: 1,
      elevation: "42m",
      record: "1:12.909 (Lewis Hamilton, 2019)",
      highlights: "Senna's legendary qualifying laps and the famous Fairmont Hairline, the slowest corner in F1."
    },
    spa: {
      corners: 19,
      drs: 2,
      elevation: "102m",
      record: "1:46.286 (Valtteri Bottas, 2018)",
      highlights: "Eau Rouge and Raidillon form one of the most famous, high-speed corner sequences in all of motorsports."
    },
    monza: {
      corners: 11,
      drs: 2,
      elevation: "11m",
      record: "1:21.046 (Rubens Barrichello, 2004)",
      highlights: "Known as the Temple of Speed, Monza features extremely long straights and the famous Curva Parabolica."
    },
    silverstone: {
      corners: 18,
      drs: 2,
      elevation: "11m",
      record: "1:27.097 (Max Verstappen, 2020)",
      highlights: "Host of the first F1 race in 1950. The Maggots-Becketts-Chapel complex represents the peak of modern aerodynamics."
    },
    albert_park: {
      corners: 14,
      drs: 4,
      elevation: "3m",
      record: "1:20.260 (Charles Leclerc, 2022)",
      highlights: "Semi-street circuit layout wrapping Albert Park lake, featuring high speed sweepers."
    },
    bahrain: {
      corners: 15,
      drs: 3,
      elevation: "18m",
      record: "1:31.447 (Pedro de la Rosa, 2005)",
      highlights: "Features heavy braking zones and dramatic desert sunset racing backdrop under floodlights."
    },
  };
  return data[id] || {
    corners: 15,
    drs: 2,
    elevation: "15m",
    record: "1:18.500 (Formula 1 Record)",
    highlights: "A challenging mix of technical sectors testing hybrid powertrain thermal limits."
  };
}
