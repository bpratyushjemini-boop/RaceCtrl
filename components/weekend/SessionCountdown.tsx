"use client";

import { useCountdown } from "@/lib/hooks/useCountdown";

interface SessionCountdownProps {
  targetIso: string;
}

export function SessionCountdown({ targetIso }: SessionCountdownProps) {
  const remaining = useCountdown(targetIso);

  if (!remaining) {
    return (
      <span className="text-[13px] text-on-surface-variant font-tabular">—</span>
    );
  }

  const { days, hours, minutes, seconds } = remaining;

  // If more than 24h, show D h m
  if (days > 0) {
    return (
      <span className="text-[13px] font-semibold text-primary font-tabular">
        {days}d {String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m
      </span>
    );
  }

  // Under 24h: show h:mm:ss
  return (
    <span className="text-[13px] font-semibold text-primary font-tabular">
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
