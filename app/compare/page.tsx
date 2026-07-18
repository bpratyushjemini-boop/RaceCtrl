import { getDriverStandings, getLastRaceResults, getDriverComparisonData } from "@/lib/api/f1";
import { CompareDriversClient } from "@/components/drivers/CompareDriversClient";

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { a = "", b = "" } = await searchParams;

  const [drivers, lastRaceData, comparisonReport] = await Promise.all([
    getDriverStandings(),
    getLastRaceResults(),
    a && b ? getDriverComparisonData(a, b) : Promise.resolve(null),
  ]);

  return (
    <CompareDriversClient
      drivers={drivers}
      lastRaceData={lastRaceData}
      comparisonReport={comparisonReport}
      initialA={a}
      initialB={b}
    />
  );
}
