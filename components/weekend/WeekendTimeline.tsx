"use client";

import { useState } from "react";
import type { Session, SessionOutcome } from "@/lib/types";
import { SessionRow, type SessionState } from "./SessionRow";
import { getNormalizedSessions } from "@/lib/f1/session-normalization";

interface WeekendTimelineProps {
  sessions: Session[];
  round?: number;
  ianaTimezone?: string;
  outcomes?: SessionOutcome[];
}

export function WeekendTimeline({ sessions, round, ianaTimezone, outcomes }: WeekendTimelineProps) {
  // Capture the current time once on mount via lazy state initializer.
  // This avoids calling Date.now() directly during render (react-hooks/purity rule)
  // and prevents hydration mismatches since the server snapshot is replaced by the
  // client value before first paint.
  const [now] = useState<number>(() => Date.now());

  if (sessions.length === 0) {
    return (
      <p className="text-[14px] text-on-surface-variant py-4">
        No sessions available for this weekend.
      </p>
    );
  }

  const normalized = getNormalizedSessions(round || 0, sessions, now);
  const firstUpcomingIdx = normalized.findIndex((s) => s.status === "upcoming");

  function getRowState(index: number): SessionState {
    const s = normalized[index];
    const rawSession = sessions[index] as Session & { status?: string };
    if (rawSession?.status === "cancelled") return "cancelled";
    if (rawSession?.status === "delayed") return "delayed";
    if (s.status === "completed") return "completed";
    if (s.status === "in-progress") return "in-progress";
    if (index === firstUpcomingIdx) return "up-next";
    return "upcoming";
  }

  return (
    <ol aria-label="Race weekend session timeline" className="list-none p-0 m-0">
      {sessions.map((session, i) => {
        const matchingOutcome = outcomes?.find(
          (o) => o.sessionLabel.toLowerCase() === session.label.toLowerCase()
        ) || null;

        return (
          <SessionRow
            key={`${session.label}-${session.date}`}
            session={session}
            state={getRowState(i)}
            isLast={i === sessions.length - 1}
            round={round}
            now={now}
            ianaTimezone={ianaTimezone}
            outcome={matchingOutcome}
          />
        );
      })}
    </ol>
  );
}
