import Link from "next/link";
import type { StandingsEntry } from "@/lib/types";
import { getTeamColor } from "@/lib/team-colors";
import { resolveDriverMedia, resolveConstructorMedia } from "@/lib/media/resolver";

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

        {/* Compact visual avatar */}
        {isDriver ? (
          (() => {
            const media = resolveDriverMedia(entry.id || "", entry.name);
            const teamColor = getTeamColor(entry.subtitle || "");
            const flagColors = media.flagColors || ["#2C2C2E", "#3A3A3C", "#2C2C2E"];
            const flagGradient = `linear-gradient(135deg, ${flagColors.join(", ")})`;
            return (
              <div 
                className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center relative overflow-hidden border border-outline/35 shadow-sm"
                style={{ background: flagGradient }}
              >
                <div className="absolute inset-0 bg-bg/45" />
                <span className="text-[9px] font-black text-white relative z-10 font-mono tracking-tighter">
                  {media.code}
                </span>
                <div 
                  className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-bg z-20"
                  style={{ backgroundColor: teamColor }}
                />
              </div>
            );
          })()
        ) : (
          (() => {
            const media = resolveConstructorMedia(entry.id || "");
            return (
              <div 
                className="h-8 w-8 rounded-md shrink-0 flex items-center justify-center relative overflow-hidden border border-outline/35 shadow-sm"
                style={{ backgroundColor: media.accent }}
              >
                <div className="absolute inset-0 bg-bg/40" />
                <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: media.secondary }} />
                <span className="text-[9px] font-black text-white relative z-10 font-mono tracking-tighter">
                  {entry.name.slice(0, 3).toUpperCase()}
                </span>
              </div>
            );
          })()
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
