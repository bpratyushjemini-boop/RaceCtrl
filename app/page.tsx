import { CountdownCard } from "@/components/dashboard/CountdownCard";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { StandingsPreview } from "@/components/dashboard/StandingsPreview";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
  getConstructorStandings,
  getDriverStandings,
  getNextRace,
  getNextSession,
  getResolvedSeason,
} from "@/lib/api/f1";

export const revalidate = 300;

export default async function Page() {
  const [nextRace, drivers, constructors] = await Promise.all([
    getNextRace(),
    getDriverStandings(),
    getConstructorStandings(),
  ]);

  const raceSession = nextRace?.sessions.find((s) => s.label === "Race") ?? null;
  const nextSession = nextRace ? getNextSession(nextRace) : null;
  const season = getResolvedSeason();

  return (
    <div className="grid grid-cols-6 gap-4 md:gap-6 items-start">
      <div className="col-span-6 md:col-span-4">
        {nextRace && raceSession ? (
          <CountdownCard
            target={`${raceSession.date}T${raceSession.time}`}
            title={nextRace.raceName}
            subtitle={`${nextRace.locality}, ${nextRace.country}`}
            round={nextRace.round}
            sessions={nextRace.sessions}
          />
        ) : (
          <GlassCard className="px-4 py-6 text-center flex flex-col justify-center min-h-[200px]" variant="floating">
            <p className="text-[15px] font-medium text-on-surface">Calendar Unavailable</p>
            <p className="mt-1 text-[13px] text-on-surface-variant">
              No upcoming races found on the {season} schedule.
            </p>
          </GlassCard>
        )}
      </div>

      <div className="col-span-6 md:col-span-2">
        <NextSessionCard session={nextSession} round={nextRace?.round} />
      </div>

      <div className="col-span-6 md:col-span-3">
        <ScrollReveal delay={200}>
          <StandingsPreview
            title={`${season} Top Drivers`}
            entries={drivers.slice(0, 5)}
            viewAllHref="/standings"
          />
        </ScrollReveal>
      </div>

      <div className="col-span-6 md:col-span-3">
        <ScrollReveal delay={300}>
          <StandingsPreview
            title={`${season} Top Constructors`}
            entries={constructors.slice(0, 5)}
            viewAllHref="/standings?tab=constructors"
          />
        </ScrollReveal>
      </div>

    </div>
  );
}