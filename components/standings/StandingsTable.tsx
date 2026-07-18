import type { StandingsEntry } from "@/lib/types";
import { StandingsRow } from "@/components/standings/StandingsRow";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

export function StandingsTable({
  entries,
  emptyLabel = "No standings yet",
  emptyHint = "Results will appear here once a session is recorded.",
  isCompareMode = false,
  selectedCompareIds = [],
  onToggleCompareSelect,
}: {
  entries: StandingsEntry[];
  emptyLabel?: string;
  emptyHint?: string;
  isCompareMode?: boolean;
  selectedCompareIds?: string[];
  onToggleCompareSelect?: (id: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <GlassCard className="px-4 py-10 text-center flex flex-col items-center justify-center gap-4" variant="structural">
        <div>
          <p className="text-[15px] font-medium text-on-surface">{emptyLabel}</p>
          <p className="mt-1 text-[13px] text-on-surface-variant">{emptyHint}</p>
        </div>
        <Link 
          href="/" 
          className="px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-white bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] rounded-full transition-all select-none cursor-pointer"
        >
          Go Back Home
        </Link>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden" variant="structural">
      <ul>
        {entries.map((entry) => (
          <StandingsRow
            key={entry.position}
            entry={entry}
            isCompareMode={isCompareMode}
            selectedCompareIds={selectedCompareIds}
            onToggleCompareSelect={onToggleCompareSelect}
          />
        ))}
      </ul>
    </GlassCard>
  );
}