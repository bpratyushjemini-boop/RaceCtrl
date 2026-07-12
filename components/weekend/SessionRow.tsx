import type { Session } from "@/lib/types";
import { useDisplaySettings } from "@/lib/settings-context";
import { formatSessionDate, formatSessionTime } from "@/lib/time-utils";

export type SessionState = "completed" | "up-next" | "upcoming";

interface SessionRowProps {
  session: Session;
  state: SessionState;
  isLast: boolean;
}

const STATE_CONFIG = {
  completed: {
    badge: "DONE",
    badgeClass: "text-on-surface-variant bg-surface-2",
    rowClass: "opacity-50",
    labelClass: "text-on-surface-variant",
    timeClass: "text-on-surface-variant font-tabular",
    dotClass: "bg-outline",
    lineClass: "bg-outline/40",
  },
  "up-next": {
    badge: "UP NEXT",
    badgeClass: "text-primary bg-primary/10 border border-primary/30",
    rowClass: "",
    labelClass: "text-on-surface font-semibold",
    timeClass: "text-primary font-tabular font-semibold",
    dotClass: "bg-primary animate-pulse",
    lineClass: "bg-outline/40",
  },
  upcoming: {
    badge: "UPCOMING",
    badgeClass: "text-on-surface-variant bg-surface-2",
    rowClass: "",
    labelClass: "text-on-surface",
    timeClass: "text-on-surface font-tabular",
    dotClass: "bg-outline",
    lineClass: "bg-outline/40",
  },
} as const;

export function SessionRow({ session, state, isLast }: SessionRowProps) {
  const { timeFormat, timezone } = useDisplaySettings();
  const config = STATE_CONFIG[state];

  const formattedDay = formatSessionDate(session.date, session.time, timezone);
  const formattedTime = formatSessionTime(session.date, session.time, timeFormat, timezone);

  return (
    <li className={`flex gap-3 ${config.rowClass}`}>
      {/* Timeline track */}
      <div className="flex flex-col items-center pt-1 shrink-0" aria-hidden="true">
        <span
          className={`h-2 w-2 rounded-full shrink-0 mt-0.5 ${config.dotClass}`}
        />
        {!isLast && (
          <span className={`w-px flex-1 mt-1 min-h-[28px] ${config.lineClass}`} />
        )}
      </div>

      {/* Session content */}
      <div className="flex flex-1 items-start justify-between gap-4 pb-5">
        <div className="min-w-0">
          {/* State badge */}
          <span
            className={`inline-block text-[10px] font-bold tracking-widest uppercase rounded-full px-2 py-0.5 mb-1 ${config.badgeClass}`}
            aria-label={`Session status: ${config.badge}`}
          >
            {config.badge}
          </span>
          {/* Session name */}
          <p className={`text-[15px] leading-tight ${config.labelClass}`}>
            {session.label}
          </p>
          {/* Day */}
          <p className="text-[12px] text-on-surface-variant mt-0.5">
            {formattedDay}
          </p>
        </div>

        {/* Local time */}
        <div className="text-right shrink-0 pt-5">
          <p
            className={`text-[17px] leading-none ${config.timeClass}`}
            aria-label={`Session start time: ${formattedTime}`}
          >
            {formattedTime}
          </p>
        </div>
      </div>
    </li>
  );
}

