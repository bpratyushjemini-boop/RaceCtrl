"use client";

import { useState } from "react";
import type { Session } from "@/lib/types";
import { SessionRow, type SessionState } from "./SessionRow";

interface WeekendTimelineProps {
  sessions: Session[];
}

export function WeekendTimeline({ sessions }: WeekendTimelineProps) {
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

  const firstFutureIndex = sessions.findIndex(
    (s) => new Date(`${s.date}T${s.time}`).getTime() >= now
  );
  // All sessions in the past: treat as all completed
  const upNextIndex = firstFutureIndex === -1 ? sessions.length : firstFutureIndex;

  function getState(index: number): SessionState {
    if (index < upNextIndex) return "completed";
    if (index === upNextIndex) return "up-next";
    return "upcoming";
  }

  return (
    <ol aria-label="Race weekend session timeline" className="list-none p-0 m-0">
      {sessions.map((session, i) => (
        <SessionRow
          key={`${session.label}-${session.date}`}
          session={session}
          state={getState(i)}
          isLast={i === sessions.length - 1}
        />
      ))}
    </ol>
  );
}
