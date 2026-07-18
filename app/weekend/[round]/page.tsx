import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { WeekendTimeline } from "@/components/weekend/WeekendTimeline";
import { SessionCountdown } from "@/components/weekend/SessionCountdown";
import { 
  getRaceSchedule, 
  getWeekendOutcomes, 
  getRecentWinners, 
  getDriverStandings, 
  getConstructorStandings 
} from "@/lib/api/f1";
import { getCircuitMetadata } from "@/lib/f1/circuit-data";
import { getCircuitTimezone } from "@/lib/f1/circuit-timezones";
import { getWeekendState } from "@/lib/f1/weekend-state";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { resolveCircuitMedia, getRaceIdentity } from "@/lib/media/resolver";
import { FreshnessIndicator } from "@/components/system/FreshnessIndicator";
import { LiveTimingWidget } from "@/components/weekend/LiveTimingWidget";
import type { Session } from "@/lib/types";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ round: string }>;
}

function formatWeekendRange(sessions?: Session[]) {
  if (!sessions || sessions.length === 0) return "";
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const start = new Date(sorted[0].date);
  const end = new Date(sorted[sorted.length - 1].date);
  
  const startMonth = start.toLocaleString("en-US", { month: "short" });
  const endMonth = end.toLocaleString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${String(startDay).padStart(2, "0")} - ${String(endDay).padStart(2, "0")} ${endMonth} ${year}`;
  } else {
    return `${String(startDay).padStart(2, "0")} ${startMonth} - ${String(endDay).padStart(2, "0")} ${endMonth} ${year}`;
  }
}

// Maps round/circuit to Pirelli tyre selections realistically
function getTyreAllocation(circuitId: string): { hard: string; medium: string; soft: string; range: string } {
  const hardTracks = ["bahrain", "silverstone", "spa", "barcelona", "losail", "suzuka"];
  const softTracks = ["monaco", "marina_bay", "vegas", "baku", "villeneuve"];

  if (hardTracks.includes(circuitId)) {
    return { hard: "C1 (Hard)", medium: "C2 (Medium)", soft: "C3 (Soft)", range: "C1 - C3 (Hardest Range)" };
  }
  if (softTracks.includes(circuitId)) {
    return { hard: "C3 (Hard)", medium: "C4 (Medium)", soft: "C5 (Soft)", range: "C3 - C5 (Softest Range)" };
  }
  return { hard: "C2 (Hard)", medium: "C3 (Medium)", soft: "C4 (Soft)", range: "C2 - C4 (Standard Range)" };
}

export default async function WeekendPageForRound({ params }: PageProps) {
  const { round: rawRound } = await params;
  const roundNumber = Number(rawRound);

  if (isNaN(roundNumber) || roundNumber < 1 || roundNumber > 30) {
    notFound();
  }

  // 1. Fetch schedule and verify round
  const schedule = await getRaceSchedule();
  const weekend = schedule.find((r) => r.round === roundNumber);

  if (!weekend) {
    notFound();
  }

  // 2. Fetch concurrent datasets
  const [outcomes, recentWinners, driverStandings, constructorStandings] = await Promise.all([
    getWeekendOutcomes(roundNumber),
    getRecentWinners(weekend.circuitId),
    getDriverStandings().catch(() => []),
    getConstructorStandings().catch(() => []),
  ]);

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const stateInfo = getWeekendState(weekend, now);
  const nextSessionIso = stateInfo.nextSession
    ? `${stateInfo.nextSession.date}T${stateInfo.nextSession.time}`
    : null;

  const circuitMetadata = getCircuitMetadata(weekend.circuitId);
  const ianaTimezone = getCircuitTimezone(weekend.circuitId);
  const circuitMedia = resolveCircuitMedia(weekend.circuitId);
  const identity = getRaceIdentity(weekend.circuitId);
  const accentColor = identity.visualAccent;
  const dateRange = formatWeekendRange(weekend.sessions);
  const tyres = getTyreAllocation(weekend.circuitId);

  // Standings context
  const leaderDriver = driverStandings[0];
  const leaderConstructor = constructorStandings[0];

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-10">
      
      {/* ─── Back to Weekend Calendar Link ─── */}
      <div className="flex items-center justify-between">
        <Link
          href="/weekend"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-on-surface-variant hover:text-on-surface uppercase transition-colors"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Active Race Hub
        </Link>
        <span className="text-[10px] font-mono text-outline font-bold tracking-tight uppercase">
          Grand Prix Hub · Round {roundNumber}
        </span>
      </div>

      {/* ─── A. Weekend Hero ─── */}
      <GlassCard 
        className="p-6 md:p-8 relative overflow-hidden" 
        variant="structural"
        style={{ background: identity.fallbackGradient }}
      >
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(var(--sys-text) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />
        
        {/* Compact Circuit Outline SVG */}
        <div 
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-28 h-28 md:w-36 md:h-36 pointer-events-none select-none z-0 opacity-[0.05] dark:opacity-[0.12] text-on-surface"
          style={{
            color: accentColor,
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

        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span 
              className="h-1.5 w-1.5 rounded-full" 
              style={{ backgroundColor: accentColor }}
            />
            <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant font-tabular">
              Round {weekend.round}
            </span>
            {weekend.sessions.some((s) => s.label === "Sprint") && (
              <span className="text-[9px] font-bold tracking-widest text-secondary bg-secondary/10 border border-secondary/25 rounded-full px-2.5 py-0.5 uppercase">
                Sprint Weekend
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface uppercase leading-none mt-1">
            {weekend.raceName.replace("Grand Prix", "").trim()}
            <span className="block text-xl md:text-2xl font-bold tracking-wide text-primary mt-1">
              Grand Prix
            </span>
          </h1>

          <div className="mt-4 pt-4 border-t border-outline/35 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="min-w-0">
              <Link 
                href={`/circuits/${weekend.circuitId}`}
                className="text-[14px] font-bold text-on-surface hover:text-primary transition-colors block truncate"
              >
                {weekend.circuitName}
              </Link>
              <span className="text-[12px] text-on-surface-variant block mt-0.5">
                {weekend.locality} · {weekend.country}
              </span>
            </div>
            {dateRange && (
              <span className="text-[12px] font-bold text-on-surface bg-surface-2 border border-outline/35 rounded-full px-3.5 py-1 self-start md:self-auto font-tabular">
                {dateRange}
              </span>
            )}
          </div>
        </div>
      </GlassCard>

      {/* ─── B. Countdown / Session Status Bar ─── */}
      <GlassCard className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4" variant="floating">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" />
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
              {stateInfo.statusLabel}
            </span>
          </div>
          {stateInfo.nextSession ? (
            <p className="text-[17px] font-semibold text-on-surface">
              Next · {stateInfo.nextSession.label}
            </p>
          ) : (
            <p className="text-[17px] font-semibold text-on-surface">
              Grand Prix Completed
            </p>
          )}
        </div>
        {stateInfo.nextSession && nextSessionIso && (
          <div className="text-left md:text-right shrink-0">
            <p className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase mb-1">
              Starts In
            </p>
            <SessionCountdown targetIso={nextSessionIso} />
          </div>
        )}
      </GlassCard>

      {/* ─── C. Primary Content Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        
        {/* Left column (span 2): Timeline Schedule */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <ScrollReveal delay={50}>
            <LiveTimingWidget round={roundNumber} />
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <GlassCard className="px-6 py-5" variant="structural">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline/40">
                <div className="flex items-center gap-2">
                  <h2 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                    Weekend Command Center
                  </h2>
                  <FreshnessIndicator />
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  Track Time ({ianaTimezone})
                </span>
              </div>
              <WeekendTimeline 
                sessions={weekend.sessions} 
                round={weekend.round} 
                ianaTimezone={ianaTimezone} 
                outcomes={outcomes}
              />
            </GlassCard>
          </ScrollReveal>

          {/* Championship Context Banner */}
          {leaderDriver && (
            <ScrollReveal delay={150}>
              <GlassCard className="p-4 flex flex-col gap-1 border border-primary/15" variant="floating">
                <span className="text-[9px] font-bold tracking-widest text-primary uppercase">Championship Snapshot</span>
                <p className="text-[13px] text-on-surface mt-1 font-medium leading-relaxed">
                  Heading into this weekend, <span className="font-bold text-primary">{leaderDriver.name}</span> leads the drivers standings with <span className="font-mono font-bold">{leaderDriver.points} PTS</span>. 
                  {leaderConstructor && (
                    <> In constructors, <span className="font-bold text-on-surface">{leaderConstructor.name}</span> leads with <span className="font-mono font-bold">{leaderConstructor.points} PTS</span>.</>
                  )}
                </p>
              </GlassCard>
            </ScrollReveal>
          )}
        </div>

        {/* Right column (span 1): Circuit Spec and Tyres */}
        <div className="flex flex-col gap-5">
          {/* Timezone Comparison Widget */}
          <ScrollReveal delay={200}>
            <GlassCard className="p-4 flex flex-col gap-3.5" variant="structural">
              <span className="text-[9px] font-bold tracking-widest text-on-surface-variant/80 uppercase">Timezone Conversion</span>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-on-surface-variant">Circuit Time:</span>
                  <span className="font-bold font-mono text-on-surface">{ianaTimezone}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-on-surface-variant">User Time:</span>
                  <span className="font-bold font-mono text-primary">Device Local</span>
                </div>
              </div>
            </GlassCard>
          </ScrollReveal>

          {/* Circuit details */}
          {circuitMetadata && (
            <ScrollReveal delay={250}>
              <GlassCard className="p-4 flex flex-col gap-3.5" variant="structural">
                <span className="text-[9px] font-bold tracking-widest text-on-surface-variant/80 uppercase">Circuit Specification</span>
                <div className="flex flex-col gap-2.5 text-[12px] divide-y divide-outline/10">
                  <div className="flex justify-between py-1.5">
                    <span className="text-on-surface-variant">Corners:</span>
                    <span className="font-bold font-mono text-on-surface">{circuitMetadata.corners || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-on-surface-variant">DRS Zones:</span>
                    <span className="font-bold font-mono text-on-surface">{circuitMetadata.drsZones || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-on-surface-variant">Track Length:</span>
                    <span className="font-bold font-mono text-on-surface">{circuitMetadata.trackLength}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-on-surface-variant">Lap Record:</span>
                    <span className="font-bold font-mono text-on-surface text-right max-w-[150px] truncate leading-tight">
                      {circuitMetadata.lapRecord ? (
                        <>
                          <span className="block text-primary">{circuitMetadata.lapRecord.time}</span>
                          <span className="text-[10px] text-on-surface-variant font-sans">
                            {circuitMetadata.lapRecord.driver} ({circuitMetadata.lapRecord.year})
                          </span>
                        </>
                      ) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-on-surface-variant">Pole Record:</span>
                    <span className="font-bold font-mono text-on-surface text-right max-w-[150px] truncate leading-tight">
                      {circuitMetadata.poleRecord ? (
                        <>
                          <span className="block text-primary">{circuitMetadata.poleRecord.time}</span>
                          <span className="text-[10px] text-on-surface-variant font-sans">
                            {circuitMetadata.poleRecord.driver} ({circuitMetadata.poleRecord.year})
                          </span>
                        </>
                      ) : "—"}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          )}

          {/* Weather summary */}
          {circuitMetadata?.weatherSummary && (
            <ScrollReveal delay={300}>
              <GlassCard className="p-4 flex flex-col gap-2 border border-outline/10" variant="structural">
                <span className="text-[9px] font-bold tracking-widest text-on-surface-variant/80 uppercase">Expected Weather</span>
                <p className="text-[12px] text-on-surface leading-relaxed mt-1 font-medium">
                  {circuitMetadata.weatherSummary}
                </p>
              </GlassCard>
            </ScrollReveal>
          )}

          {/* Tyre Selection */}
          <ScrollReveal delay={350}>
            <GlassCard className="p-4 flex flex-col gap-2.5" variant="structural">
              <span className="text-[9px] font-bold tracking-widest text-on-surface-variant/80 uppercase">Pirelli Compounds</span>
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-outline/35 shrink-0" />
                  <span className="text-[12px] font-bold font-mono">{tyres.hard}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FFD200] shrink-0" />
                  <span className="text-[12px] font-bold font-mono">{tyres.medium}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#E10600] shrink-0" />
                  <span className="text-[12px] font-bold font-mono">{tyres.soft}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/70 uppercase font-bold tracking-wider mt-1.5 font-mono">
                  {tyres.range}
                </p>
              </div>
            </GlassCard>
          </ScrollReveal>

          {/* Previous Winners */}
          {recentWinners.length > 0 && (
            <ScrollReveal delay={400}>
              <GlassCard className="p-4 flex flex-col gap-3" variant="structural">
                <span className="text-[9px] font-bold tracking-widest text-on-surface-variant/80 uppercase">Recent Winners</span>
                <ul className="list-none p-0 m-0 divide-y divide-outline/10 text-[12px]">
                  {recentWinners.slice(0, 3).map((w) => (
                    <li key={w.year} className="flex justify-between py-1.5 first:pt-0 last:pb-0">
                      <span className="text-on-surface font-bold">{w.winner}</span>
                      <span className="font-mono text-primary font-bold">{w.year}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </ScrollReveal>
          )}

        </div>
      </div>
      
      {/* Spacer to clear floating BottomNav island on mobile */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
