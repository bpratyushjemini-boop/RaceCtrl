import Link from "next/link";
import type { StandingsEntry } from "@/lib/types";
import { DriverAvatar } from "@/components/ui/DriverAvatar";
import { ConstructorMark } from "@/components/ui/ConstructorMark";

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

        {/* Compact visual avatar */}
        {isDriver ? (
          <DriverAvatar
            driverId={entry.id || ""}
            driverName={entry.name}
            team={entry.subtitle}
            size="xs"
            showTeamDot={true}
          />
        ) : (
          <ConstructorMark
            constructorId={entry.id || ""}
            name={entry.name}
            size="compact"
          />
        )}

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
    if (isCompareMode) {
      return (
        <li
          className={`border-b border-outline/35 last:border-b-0 hover-glass transition-all duration-150 ${
            isSelected ? "bg-primary/5 border-l-4 border-l-primary" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => onToggleCompareSelect?.(entry.id!)}
            className={`flex items-center justify-between h-[52px] gap-3 w-full text-left cursor-pointer ${
              isSelected ? "pl-1 pr-2" : "px-2"
            }`}
            aria-label={`Select ${entry.name} for comparison`}
          >
            {content}
          </button>
        </li>
      );
    }

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

  // Constructor Link
  if (!isDriver && entry.id) {
    return (
      <li className="border-b border-outline/35 last:border-b-0 hover-glass transition-colors">
        <Link
          href={`/constructors/${entry.id}`}
          className="flex items-center justify-between h-[52px] gap-3 px-2 w-full"
          aria-label={`View profile for constructor ${entry.name}`}
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
