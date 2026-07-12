import { getDriverStandings, getConstructorStandings } from "@/lib/api/f1";
import { UnifiedStandings } from "@/components/standings/UnifiedStandings";

export const revalidate = 300;

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [resolvedParams, drivers, constructors] = await Promise.all([
    searchParams,
    getDriverStandings(),
    getConstructorStandings(),
  ]);

  const initialTab = resolvedParams.tab === "constructors" ? "constructors" : "drivers";

  return (
    <UnifiedStandings
      drivers={drivers}
      constructors={constructors}
      initialTab={initialTab}
    />
  );
}
