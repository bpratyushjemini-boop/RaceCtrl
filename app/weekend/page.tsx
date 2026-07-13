import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { WeekendTimeline } from "@/components/weekend/WeekendTimeline";
import { SessionCountdown } from "@/components/weekend/SessionCountdown";
import { getRelevantWeekend, getWeekendOutcomes } from "@/lib/api/f1";
import { getCircuitMetadata } from "@/lib/f1/circuit-data";
import { getCircuitTimezone } from "@/lib/f1/circuit-timezones";
import { getWeekendState } from "@/lib/f1/weekend-state";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { resolveCircuitMedia } from "@/lib/media/resolver";
import type { Session } from "@/lib/types";

export const revalidate = 300;

// Helper to determine circuit accent color from design.md
const getCircuitAccentColor = (title: string, subtitle: string): string => {
  const name = title.toLowerCase();
  const sub = subtitle.toLowerCase();
  if (name.includes("australian") || name.includes("albert park") || sub.includes("australia")) return "#FF8C42"; // Australia
  if (name.includes("monaco") || name.includes("monte carlo") || sub.includes("monaco")) return "#D4AF37"; // Monaco
  if (name.includes("british") || name.includes("silverstone") || sub.includes("united kingdom") || sub.includes("uk")) return "#0B5C36"; // UK
  if (name.includes("belgian") || name.includes("spa") || sub.includes("belgium")) return "#2E4B3D"; // Belgium
  if (name.includes("italian") || name.includes("monza") || sub.includes("italy")) return "#C8102E"; // Italy
  if (name.includes("singapore") || name.includes("marina bay")) return "#00C2D1"; // Singapore
  if (name.includes("vegas")) return "#B026FF"; // Las Vegas
  if (name.includes("abu dhabi") || name.includes("yas marina") || sub.includes("uae") || sub.includes("emirates")) return "#E8973D"; // Abu Dhabi
  return "#FF453A"; // default Race Red
};

// Helper to format date range of the weekend
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

const getNow = () => Date.now();

export default async function WeekendPage() {
  const weekend = await getRelevantWeekend();

  if (!weekend) {
    return (
      <GlassCard className="flex flex-col gap-3 p-6 min-h-[40vh] items-center justify-center text-center" variant="structural">
        <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">Weekend</span>
        <p className="text-[17px] font-semibold text-on-surface">No race weekend scheduled</p>
        <p className="text-[14px] text-on-surface-variant max-w-xs">
          The season calendar is complete or schedule data is temporarily unavailable.
        </p>
      </GlassCard>
    );
  }

  // 1. Resolve State
  const now = getNow();
  const stateInfo = getWeekendState(weekend, now);
  const nextSessionIso = stateInfo.nextSession
    ? `${stateInfo.nextSession.date}T${stateInfo.nextSession.time}`
    : null;

  // 2. Resolve Circuit Info & Timezone
  const circuitMetadata = getCircuitMetadata(weekend.circuitId);
  const ianaTimezone = getCircuitTimezone(weekend.circuitId);
  const accentColor = getCircuitAccentColor(weekend.raceName, weekend.country);
  const circuitMedia = resolveCircuitMedia(weekend.raceName);

  // 3. Resolve results / session outcomes
  const outcomes = await getWeekendOutcomes(weekend.round);

  const isSprint = weekend.sessions.some((s) => s.label === "Sprint");
  const dateRange = formatWeekendRange(weekend.sessions);

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-10">
      
      {/* ─── A. Weekend Hero ─── */}
      <GlassCard className="p-6 md:p-8 relative overflow-hidden" variant="structural">
        {/* Subtle radial accent gradient for premium telemetry aesthetic */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${accentColor} 0%, transparent 60%)`
          }}
        />
        {/* Dot-grid background pattern overlay */}
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
            {isSprint && (
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
                aria-label={`View profile for ${weekend.circuitName}`}
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

      {/* ─── B. Weekend State Header (Up Next Banner) ─── */}
      <GlassCard className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4" variant="floating">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" aria-hidden="true" />
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
              Official results available
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

      {/* ─── F. Quick Actions ─── */}
      <div className="flex flex-wrap gap-2.5">
        <Link
          href="/timing"
          className="flex-1 min-w-[120px] h-10 flex items-center justify-center gap-1.5 rounded-full bg-surface-2 hover:bg-surface-2/80 active:bg-surface-2/60 text-on-surface text-[11px] font-bold tracking-wider uppercase border border-outline/40 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Live Timing
        </Link>
        <Link
          href="/standings"
          className="flex-1 min-w-[120px] h-10 flex items-center justify-center gap-1.5 rounded-full bg-surface-2 hover:bg-surface-2/80 active:bg-surface-2/60 text-on-surface text-[11px] font-bold tracking-wider uppercase border border-outline/40 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          Standings
        </Link>
        <Link
          href={`/circuits/${weekend.circuitId}`}
          className="flex-1 min-w-[120px] h-10 flex items-center justify-center gap-1.5 rounded-full bg-surface-2 hover:bg-surface-2/80 active:bg-surface-2/60 text-on-surface text-[11px] font-bold tracking-wider uppercase border border-outline/40 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2l6 3 5.447-2.724A1 1 0 0121 3.176v10.764a1 1 0 01-.553.894L15 18l-6 2z" />
          </svg>
          Circuit
        </Link>
        <Link
          href="/settings"
          className="flex-1 min-w-[120px] h-10 flex items-center justify-center gap-1.5 rounded-full bg-surface-2 hover:bg-surface-2/80 active:bg-surface-2/60 text-on-surface text-[11px] font-bold tracking-wider uppercase border border-outline/40 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Alerts
        </Link>
      </div>

      {/* ─── C. Session Timeline ─── */}
      <ScrollReveal delay={200}>
        <GlassCard className="px-6 py-5" variant="structural">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline/40">
            <h2 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Session Schedule
            </h2>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Time ({ianaTimezone})
            </span>
          </div>
          <WeekendTimeline sessions={weekend.sessions} round={weekend.round} ianaTimezone={ianaTimezone} />
        </GlassCard>
      </ScrollReveal>

      {/* ─── D. Circuit Intelligence ─── */}
      <ScrollReveal delay={300}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Circuit Intelligence
            </span>
          </div>
          <GlassCard className="p-5 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="min-w-0">
                <Link
                  href={`/circuits/${weekend.circuitId}`}
                  className="group flex flex-col hover:opacity-85 transition-opacity"
                  aria-label={`View detailed profile for ${weekend.circuitName}`}
                >
                  <span className="text-[15px] font-bold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {weekend.circuitName}
                    <svg className="h-3 w-3 text-on-surface-variant group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span className="text-[12px] text-on-surface-variant mt-0.5">
                    {weekend.locality} · {weekend.country}
                  </span>
                </Link>
                {weekend.lat !== undefined && weekend.long !== undefined && (
                  <span className="inline-block text-[9px] text-on-surface-variant font-mono mt-1 font-tabular">
                    LAT: {weekend.lat.toFixed(4)} · LON: {weekend.long.toFixed(4)}
                  </span>
                )}
              </div>
            </div>

            {/* Stat tiles grid */}
            {circuitMetadata && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-outline/35 mt-1">
                {circuitMetadata.trackLength && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Length
                    </span>
                    <span className="text-[15px] font-bold text-on-surface telemetry-numeric mt-1">
                      {circuitMetadata.trackLength}
                    </span>
                  </div>
                )}
                {circuitMetadata.lapCount && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Laps
                    </span>
                    <span className="text-[15px] font-bold text-on-surface telemetry-numeric mt-1">
                      {circuitMetadata.lapCount}
                    </span>
                  </div>
                )}
                {circuitMetadata.raceDistance && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Distance
                    </span>
                    <span className="text-[15px] font-bold text-on-surface telemetry-numeric mt-1">
                      {circuitMetadata.raceDistance}
                    </span>
                  </div>
                )}
                {circuitMetadata.firstGrandPrix && (
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      First GP
                    </span>
                    <span className="text-[15px] font-bold text-on-surface telemetry-numeric mt-1">
                      {circuitMetadata.firstGrandPrix}
                    </span>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </ScrollReveal>

      {/* ─── E. Weekend Results / Session Outcomes ─── */}
      {outcomes.length > 0 && (
        <ScrollReveal delay={400}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5 px-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                Session Outcomes
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {outcomes.map((outcome) => (
                <GlassCard key={outcome.sessionLabel} className="p-4 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-outline/35 pb-1.5">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                      {outcome.sessionLabel}
                    </span>
                    {outcome.sessionLabel === "Race" && (
                      <Link
                        href="/timing"
                        className="text-[9px] font-bold text-on-surface-variant hover:text-on-surface uppercase tracking-wider transition-colors"
                      >
                        Full Results →
                      </Link>
                    )}
                  </div>
                  <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                    {outcome.results.map((r) => (
                      <li key={r.position} className="flex items-center justify-between text-[13px]">
                        <span className="text-on-surface-variant font-medium">
                          P{r.position} <span className="text-on-surface font-bold ml-1">{r.driverCode}</span>
                        </span>
                        <span className="text-[11px] text-on-surface-variant truncate max-w-[100px] font-medium">
                          {r.driverName.split(" ").slice(-1)[0]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Spacer to clear floating BottomNav island on mobile */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
