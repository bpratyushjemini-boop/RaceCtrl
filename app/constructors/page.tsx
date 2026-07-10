import { getConstructorStandings } from "@/lib/api/f1";
import { StandingsTable } from "@/components/standings/StandingsTable";

export const revalidate = 300;

export default async function ConstructorsPage() {
  const constructors = await getConstructorStandings();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-semibold tracking-tight text-text">
        Constructor Standings
      </h1>
      <StandingsTable
        entries={constructors}
        emptyLabel="No constructor standings yet"
        emptyHint="Results will appear here once a session is recorded."
      />
    </div>
  );
}