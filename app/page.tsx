import {
  getConstructorStandings,
  getDriverStandings,
  getRaceSchedule,
  getLastRaceResults,
  getResolvedSeason,
  getF1News,
} from "@/lib/api/f1";
import { getWeather } from "@/lib/providers/weather/weather-provider";
import { HomeRaceControl } from "@/components/dashboard/HomeRaceControl";

export const revalidate = 300;

export default async function Page() {
  const [schedule, drivers, constructors, lastRaceData, news] = await Promise.all([
    getRaceSchedule(),
    getDriverStandings(),
    getConstructorStandings(),
    getLastRaceResults(),
    getF1News(),
  ]);

  // Find next GP on schedule to load forecast for the circuit
  const nextRace = schedule.find((race) => {
    const raceSession = race.sessions.find((s) => s.label === "Race");
    return raceSession && new Date(`${raceSession.date}T${raceSession.time}`).getTime() >= Date.now();
  }) || schedule[0];

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