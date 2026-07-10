import type { Driver } from "@/lib/types";
import { StandingsTable } from "@/components/standings/StandingsTable";

const drivers: Driver[] = [];

export default function StandingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-semibold tracking-tight text-text">
        Driver Standings
      </h1>
      <StandingsTable entries={drivers} />
    </div>
  );
}