import { PageContainer } from "@/components/layout/PageContainer";
import { TimingDashboard } from "@/components/timing/TimingDashboard";
import {
  getIsWeekendActive,
  getLastRaceResults,
  getResolvedSeason,
} from "@/lib/api/f1";

export const revalidate = 300;

export default async function TimingPage() {
  const [lastRace, isWeekendActive] = await Promise.all([
    getLastRaceResults(),
    getIsWeekendActive(),
  ]);

  const resolvedSeason = getResolvedSeason();

  return (
    <PageContainer gap="sm">
      <TimingDashboard
        lastRace={lastRace}
        isWeekendActive={isWeekendActive}
        resolvedSeason={resolvedSeason}
      />
      {/* Spacer to clear mobile navigation */}
      <div className="h-16 md:hidden" />
    </PageContainer>
  );
}
