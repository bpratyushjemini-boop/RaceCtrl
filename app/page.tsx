import { CountdownCard } from "@/components/dashboard/CountdownCard";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { StandingsPreview } from "@/components/dashboard/StandingsPreview";
import {
  getConstructorStandings,
  getDriverStandings,
  getNextRace,
  getNextSession,
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

  return (
    <div className="flex flex-col gap-6">
      {nextRace && raceSession ? (
        <CountdownCard
          target={`${raceSession.date}T${raceSession.time}`}
          title={nextRace.raceName}
          subtitle={`${nextRace.locality}, ${nextRace.country}`}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface px-4 py-6 text-center">
          <p className="text-[15px] font-medium text-text">Season complete</p>
          <p className="mt-1 text-[13px] text-text-dim">
            No upcoming races on the calendar.
          </p>
        </div>
      )}

      <NextSessionCard session={nextSession} />

      <StandingsPreview
        title="Driver Standings"
        entries={drivers.slice(0, 3)}
        viewAllHref="/standings"
      />

      <StandingsPreview
        title="Constructor Standings"
        entries={constructors.slice(0, 3)}
        viewAllHref="/constructors"
      />
    </div>
  );
}