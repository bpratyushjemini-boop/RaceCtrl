import { GlassCard } from "@/components/ui/GlassCard";
import { WeekendTimeline } from "@/components/weekend/WeekendTimeline";
import { SessionCountdown } from "@/components/weekend/SessionCountdown";
import { getRelevantWeekend, getNextSession } from "@/lib/api/f1";

export const revalidate = 300;

export default async function WeekendPage() {
  let weekend = null;
  try {
    weekend = await getRelevantWeekend();
  } catch {
    // API failure — render fallback
  }

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

  const nextSession = getNextSession(weekend);
  const nextSessionIso = nextSession
    ? `${nextSession.date}T${nextSession.time}`
    : null;

  // Determine if sprint weekend (has Sprint session)
  const isSprint = weekend.sessions.some((s) => s.label === "Sprint");

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* ─── Page Header ─── */}
      <GlassCard className="px-6 py-5" variant="structural">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
                Weekend
              </span>
              <span className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
                · Round {weekend.round}
              </span>
              {isSprint && (
                <span className="text-[10px] font-bold tracking-widest text-secondary bg-secondary/10 border border-secondary/25 rounded-full px-2 py-0.5 uppercase">
                  Sprint
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface leading-tight">
              {weekend.raceName}
            </h1>
            <p className="text-[13px] text-on-surface-variant mt-1 flex items-center gap-1">
              <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {weekend.locality}, {weekend.country}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* ─── Up Next Banner ─── */}
      {nextSession && nextSessionIso && (
        <GlassCard className="px-6 py-4" variant="floating">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                  Up Next
                </span>
              </div>
              <p className="text-[17px] font-semibold text-on-surface">
                {nextSession.label}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] font-bold tracking-wider text-on-surface-variant uppercase mb-1">
                Starts In
              </p>
              <SessionCountdown targetIso={nextSessionIso} />
            </div>
          </div>
        </GlassCard>
      )}

      {/* ─── Session Timeline ─── */}
      <GlassCard className="px-6 py-5" variant="structural">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline/40">
          <h2 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
            Session Schedule
          </h2>
          <span className="text-[11px] text-on-surface-variant">
            Local time
          </span>
        </div>
        <WeekendTimeline sessions={weekend.sessions} />
      </GlassCard>
    </div>
  );
}
