import type { StandingsEntry } from "@/lib/types";
import { StandingsRow } from "@/components/standings/StandingsRow";

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
      <div className="rounded-2xl border border-border bg-surface px-4 py-10 text-center">
        <p className="text-[15px] font-medium text-text">{emptyLabel}</p>
        <p className="mt-1 text-[13px] text-text-dim">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
      {entries.map((entry) => (
        <StandingsRow key={entry.position} entry={entry} />
      ))}
    </ul>
  );
}