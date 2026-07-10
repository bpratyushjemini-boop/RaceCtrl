import type { StandingsEntry } from "@/lib/types";

const PODIUM_STYLES: Record<number, string> = {
  1: "bg-accent/15 text-accent",
  2: "bg-surface-2 text-text",
  3: "bg-surface-2 text-text-dim",
};

export function StandingsRow({ entry }: { entry: StandingsEntry }) {
  const badgeStyle = PODIUM_STYLES[entry.position] ?? "bg-surface-2 text-text-dim";

  return (
    <li className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${badgeStyle}`}
      >
        {entry.position}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-text">
          {entry.name}
        </p>
        <p className="truncate text-[13px] text-text-dim">{entry.subtitle}</p>
      </div>

      <span className="text-[15px] font-semibold tabular-nums text-text">
        {entry.points}
      </span>
    </li>
  );
}