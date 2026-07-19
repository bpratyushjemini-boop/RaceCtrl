import {
  getConstructorStandings,
  getDriverStandings,
  getRaceSchedule,
  getLastRaceResults,
  getResolvedSeason,
  getF1News,
} from "@/lib/api/f1";
import type { RaceSchedule } from "@/lib/types";
import { getWeather } from "@/lib/providers/weather/weather-provider";
import { HomeRaceControl } from "@/components/dashboard/HomeRaceControl";

export const revalidate = 300;

function getNextRaceOnSchedule(schedule: RaceSchedule[]) {
  const nowMs = Date.now();
  return schedule.find((race) => {
    const raceSession = race.sessions.find((s) => s.label === "Race");
    return raceSession && new Date(`${raceSession.date}T${raceSession.time}`).getTime() >= nowMs;
  }) || schedule[0];
}

export default async function Page() {
  const [schedule, drivers, constructors, lastRaceData, news] = await Promise.all([
    getRaceSchedule(),
    getDriverStandings(),
    getConstructorStandings(),
    getLastRaceResults(),
    getF1News(),
  ]);

  const nextRace = getNextRaceOnSchedule(schedule);

  const weather = nextRace && nextRace.lat !== undefined && nextRace.long !== undefined
    ? await getWeather(nextRace.lat, nextRace.long)
    : null;

  const season = getResolvedSeason();

  return (
    <HomeRaceControl
      schedule={schedule}
      drivers={drivers}
      constructors={constructors}
      lastRaceData={lastRaceData}
      news={news}
      weather={weather}
      season={season}
    />
  );
}