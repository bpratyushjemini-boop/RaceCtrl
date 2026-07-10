import { getDriverStandings } from "@/lib/api/f1";
import { StandingsTable } from "@/components/standings/StandingsTable";

export const revalidate = 300;

export default async function StandingsPage() {
  const drivers = await getDriverStandings();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-semibold tracking-tight text-text">
        Driver Standings
      </h1>
      <StandingsTable entries={drivers} />
    </div>
  );
}