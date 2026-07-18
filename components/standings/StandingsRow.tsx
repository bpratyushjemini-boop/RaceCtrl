import Link from "next/link";
import type { StandingsEntry } from "@/lib/types";
import { DriverAvatar } from "@/components/ui/DriverAvatar";
import { ConstructorMark } from "@/components/ui/ConstructorMark";
import { getTeamColor } from "@/lib/team-colors";
import { normalizeConstructorId } from "@/lib/f1/normalize";

const PODIUM_STYLES: Record<number, string> = {
  1: "bg-primary/15 text-primary border border-primary/20",
  2: "bg-surface-2 text-on-surface border border-outline/20",
  3: "bg-surface-2 text-on-surface-variant",
};

export function StandingsRow({
  entry,
  isCompareMode = false,
  selectedCompareIds = [],
  onToggleCompareSelect,
}: {
  entry: StandingsEntry;
  isCompareMode?: boolean;
  selectedCompareIds?: string[];
  onToggleCompareSelect?: (id: string) => void;
}) {
  const badgeStyle = PODIUM_STYLES[entry.position] ?? "bg-surface-2/50 text-on-surface-variant";
  const isDriver = entry.subtitle !== "Constructor";
  const isSelected = isCompareMode && entry.id && selectedCompareIds.includes(entry.id);
  const teamColor = getTeamColor(isDriver ? entry.subtitle : entry.name);

  const content = (
    <>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Selection Indicator for Compare Mode */}
        {isCompareMode && isDriver && (
          <span
            className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 mr-0.5 transition-all duration-150 ${
              isSelected
                ? "bg-primary border-primary text-white"
                : "border-outline/40"
            }`}
          >
            {isSelected && (
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        )}

        {/* Position badge - 28x28px circle */}
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${badgeStyle}`}
        >
          {entry.position}
        </span>

        {/* Driver Photo + Constructor Logo next to it */}
        {isDriver ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <DriverAvatar
              driverId={entry.id || ""}
              driverName={entry.name}
              team={entry.subtitle}
              size="sm"
              showTeamDot={false}
            />
            <ConstructorMark
              constructorId={normalizeConstructorId("", entry.subtitle)}
              name={entry.subtitle}
              size="compact"
            />
          </div>
        ) : (
          <ConstructorMark
            constructorId={entry.id || ""}
            name={entry.name}
            size="compact"
          />
        )}

        {/* Name and subtitle/team */}
        <div className="min-w-0 ml-1">
          <p className="truncate text-[15px] font-bold text-on-surface leading-tight">
            {entry.name}
          </p>
          <p className="truncate text-[11px] text-on-surface-variant mt-0.5 leading-none">
            {entry.subtitle}
          </p>
        </div>
      </div>

      {/* Points with telemetry-numeric styling */}
      <span className="telemetry-numeric text-on-surface font-black text-right shrink-0 min-w-[40px]">
        {entry.points}
      </span>
    </>
  );

  if (isDriver && entry.id) {
    if (isCompareMode) {
      return (
        <li
          className={`border-b border-outline/35 last:border-b-0 hover-glass transition-all duration-150 ${
            isSelected ? "bg-primary/5 border-l-4 border-l-primary" : ""
          }`}
          style={!isSelected ? { borderLeft: `3px solid ${teamColor}` } : undefined}
        >
          <button
            type="button"
            onClick={() => onToggleCompareSelect?.(entry.id!)}
            className={`flex items-center justify-between h-[58px] gap-3 w-full text-left cursor-pointer ${
              isSelected ? "pl-2 pr-3" : "pl-3 pr-3"
            }`}
            aria-label={`Select ${entry.name} for comparison`}
          >
            {content}
          </button>
        </li>
      );
    }

    return (
      <li 
        className="border-b border-outline/35 last:border-b-0 hover-glass transition-colors font-medium"
        style={{ borderLeft: `3px solid ${teamColor}` }}
      >
        <Link 
          href={`/drivers/${entry.id}`} 
          className="flex items-center justify-between h-[58px] gap-3 pl-3 pr-3 w-full"
          aria-label={`View profile for driver ${entry.name}`}
        >
          {content}
        </Link>
      </li>
    );
  }

  // Constructor Link
  if (!isDriver && entry.id) {
    return (
      <li 
        className="border-b border-outline/35 last:border-b-0 hover-glass transition-colors"
        style={{ borderLeft: `3px solid ${teamColor}` }}
      >
        <Link
          href={`/constructors/${entry.id}`}
          className="flex items-center justify-between h-[58px] gap-3 pl-3 pr-3 w-full"
          aria-label={`View profile for constructor ${entry.name}`}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li 
      className="flex items-center justify-between h-[58px] gap-3 border-b border-outline/35 pl-3 pr-3 last:border-b-0"
      style={{ borderLeft: `3px solid ${teamColor}` }}
    >
      {content}
    </li>
  );
}
