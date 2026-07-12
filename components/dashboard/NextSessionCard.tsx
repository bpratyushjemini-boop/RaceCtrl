"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import type { Session } from "@/lib/types";
import { useDisplaySettings } from "@/lib/settings-context";
import { formatSessionDate, formatSessionTime } from "@/lib/time-utils";

export function NextSessionCard({ session }: { session: Session | null }) {
  const { timeFormat, timezone } = useDisplaySettings();

  if (!session) {
    return (
      <GlassCard className="p-6 text-center flex flex-col justify-center min-h-[200px]" variant="floating">
        <p className="text-[15px] font-medium text-on-surface">No upcoming session</p>
        <p className="mt-1 text-[13px] text-on-surface-variant">
          Check back once the next round is scheduled.
        </p>
      </GlassCard>
    );
  }

  const dateStr = formatSessionDate(session.date, session.time, timezone);
  const timeStr = formatSessionTime(session.date, session.time, timeFormat, timezone);

  return (
    <GlassCard className="p-6 flex flex-col justify-between min-h-[200px] gap-4" variant="floating">
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="text-[11px] font-bold tracking-widest text-secondary uppercase">
            Next Session
          </span>
        </div>
        <p className="text-2xl font-bold text-on-surface tracking-tight leading-tight">
          {session.label}
        </p>
        <p className="text-[13px] font-medium text-on-surface-variant mt-1.5">
          {dateStr} • {timeStr} {timezone === "circuit" ? "Circuit" : "Local"}
        </p>
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full h-11 bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] text-white text-[13px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer select-none"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        Notify Me
      </button>
    </GlassCard>
  );
}


