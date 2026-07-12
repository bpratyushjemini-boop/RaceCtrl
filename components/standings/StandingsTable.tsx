import type { StandingsEntry } from "@/lib/types";
import { StandingsRow } from "@/components/standings/StandingsRow";
import { GlassCard } from "@/components/ui/GlassCard";

export function StandingsTable({
  entries,
  emptyLabel = "No standings yet",
  emptyHint = "Results will appear here once a session is recorded.",
}: {
  entries: StandingsEntry[];
  emptyLabel?: string;
  emptyHint?: string;
}) {
  if (entries.length === 0) {
    return (
      <GlassCard className="px-4 py-10 text-center" variant="structural">
        <p className="text-[15px] font-medium text-on-surface">{emptyLabel}</p>
        <p className="mt-1 text-[13px] text-on-surface-variant">{emptyHint}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden" variant="structural">
      <ul>
        {entries.map((entry) => (
          <StandingsRow key={entry.position} entry={entry} />
        ))}
      </ul>
    </GlassCard>
  );
}