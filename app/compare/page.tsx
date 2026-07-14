import { getDriverStandings, getLastRaceResults } from "@/lib/api/f1";
import { CompareDriversClient } from "@/components/drivers/CompareDriversClient";

export const revalidate = 300;

export default async function ComparePage() {
  const [drivers, lastRaceData] = await Promise.all([
    getDriverStandings(),
    getLastRaceResults(),
  ]);

  return (
    <CompareDriversClient
      drivers={drivers}
      lastRaceData={lastRaceData}
    />
  );
}
