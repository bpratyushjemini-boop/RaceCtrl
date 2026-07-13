import {
  getConstructorStandings,
  getDriverStandings,
  getRaceSchedule,
  getLastRaceResults,
  getResolvedSeason,
} from "@/lib/api/f1";
import { HomeRaceControl } from "@/components/dashboard/HomeRaceControl";

export const revalidate = 300;

export default async function Page() {
  const [schedule, drivers, constructors, lastRaceData] = await Promise.all([
    getRaceSchedule(),
    getDriverStandings(),
    getConstructorStandings(),
    getLastRaceResults(),
  ]);

  const season = getResolvedSeason();

  return (
    <HomeRaceControl
      schedule={schedule}
      drivers={drivers}
      constructors={constructors}
      lastRaceData={lastRaceData}
      season={season}
    />
  );
}