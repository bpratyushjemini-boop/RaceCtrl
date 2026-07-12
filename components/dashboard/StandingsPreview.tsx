import Link from "next/link";
import type { StandingsEntry } from "@/lib/types";
import { StandingsRow } from "@/components/standings/StandingsRow";
import { GlassCard } from "@/components/ui/GlassCard";

export function StandingsPreview({
  title,
  entries,
  viewAllHref,
}: {
  title: string;
  entries: StandingsEntry[];
  viewAllHref: string;
}) {
  return (
    <GlassCard className="p-6 flex flex-col" variant="floating">
      <div className="flex items-center justify-between border-b border-outline/35 pb-3.5 mb-1.5">
        <h3 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {title}
        </h3>
        <Link
          href={viewAllHref}
          className="text-[11px] font-bold tracking-widest text-secondary uppercase hover:underline"
        >
          View All
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-on-surface-variant font-medium">No standings yet</p>
        </div>
      ) : (
        <ul className="list-none p-0 m-0">
          {entries.map((entry) => (
            <StandingsRow key={entry.position} entry={entry} />
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

