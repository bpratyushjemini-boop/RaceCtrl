import Link from "next/link";
import type { StandingsEntry } from "@/lib/types";

const PODIUM_STYLES: Record<number, string> = {
  1: "bg-primary/15 text-primary border border-primary/20",
  2: "bg-surface-2 text-on-surface border border-outline/20",
  3: "bg-surface-2 text-on-surface-variant",
};

export function StandingsRow({ entry }: { entry: StandingsEntry }) {
  const badgeStyle = PODIUM_STYLES[entry.position] ?? "bg-surface-2/50 text-on-surface-variant";
  const isDriver = entry.subtitle !== "Constructor";

  const content = (
    <>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Position badge - 28x28px circle */}
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${badgeStyle}`}
        >
          {entry.position}
        </span>

        {/* Name and subtitle/team */}
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-on-surface leading-tight">
            {entry.name}
          </p>
          <p className="truncate text-[12px] text-on-surface-variant mt-0.5 leading-none">
            {entry.subtitle}
          </p>
        </div>
      </div>

      {/* Points with telemetry-numeric styling */}
      <span className="telemetry-numeric text-on-surface font-semibold text-right shrink-0 min-w-[40px]">
        {entry.points}
      </span>
    </>
  );

  if (isDriver && entry.id) {
    return (
      <li className="border-b border-outline/35 last:border-b-0 hover-glass transition-colors">
        <Link 
          href={`/drivers/${entry.id}`} 
          className="flex items-center justify-between h-[52px] gap-3 px-2 w-full"
          aria-label={`View profile for driver ${entry.name}`}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between h-[52px] gap-3 border-b border-outline/35 px-2 last:border-b-0">
      {content}
    </li>
  );
}
