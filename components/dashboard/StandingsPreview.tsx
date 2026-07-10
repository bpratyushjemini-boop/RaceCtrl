import Link from "next/link";
import type { StandingsEntry } from "@/lib/types";
import { StandingsRow } from "@/components/standings/StandingsRow";

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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[15px] font-semibold text-text">{title}</h2>
        <Link href={viewAllHref} className="text-[13px] font-medium text-blue">
          View all
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-4 py-6 text-center">
          <p className="text-[13px] text-text-dim">No standings yet</p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
          {entries.map((entry) => (
            <StandingsRow key={entry.position} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}