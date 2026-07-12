import type { Session, RaceSchedule } from "@/lib/types";

export type WeekendState = "UPCOMING" | "PRACTICE" | "SPRINT" | "QUALIFYING" | "RACE DAY" | "COMPLETE";

export interface WeekendStateInfo {
  state: WeekendState;
  nextSession: Session | null;
  currentSession: Session | null;
  completedSessions: Session[];
  futureSessions: Session[];
  statusLabel: string;
}

export function getSessionTimestamp(s: Session): number {
  return new Date(`${s.date}T${s.time}`).getTime();
}

export function getSessionDuration(label: string): number {
  const lower = label.toLowerCase();
  if (lower.includes("race")) {
    return 3 * 60 * 60 * 1000; // 3 hours
  }
  return 1 * 60 * 60 * 1000; // 1 hour
}

/**
 * Returns detailed weekend state and timeline progression.
 */
export function getWeekendState(race: RaceSchedule, now: number = Date.now()): WeekendStateInfo {
  const sessions = [...race.sessions].sort((a, b) => getSessionTimestamp(a) - getSessionTimestamp(b));
  
  if (sessions.length === 0) {
    return {
      state: "COMPLETE",
      nextSession: null,
      currentSession: null,
      completedSessions: [],
      futureSessions: [],
      statusLabel: "WEEKEND COMPLETE",
    };
  }

  const firstSessionTime = getSessionTimestamp(sessions[0]);
  const raceSession = sessions.find((s) => s.label === "Race") || sessions[sessions.length - 1];
  const lastSessionEndTime = getSessionTimestamp(raceSession) + getSessionDuration(raceSession.label);

  const completedSessions: Session[] = [];
  const futureSessions: Session[] = [];
  let currentSession: Session | null = null;
  let nextSession: Session | null = null;

  for (const s of sessions) {
    const startTime = getSessionTimestamp(s);
    const endTime = startTime + getSessionDuration(s.label);

    if (now >= endTime) {
      completedSessions.push(s);
    } else if (now >= startTime && now < endTime) {
      currentSession = s;
    } else {
      futureSessions.push(s);
    }
  }

  if (futureSessions.length > 0) {
    nextSession = futureSessions[0];
  }

  let state: WeekendState = "UPCOMING";
  let statusLabel = "WEEKEND UPCOMING";

  if (now > lastSessionEndTime) {
    state = "COMPLETE";
    statusLabel = "WEEKEND COMPLETE";
  } else if (now >= firstSessionTime) {
    // Weekend is active
    const activeSession = currentSession || nextSession;
    if (activeSession) {
      const label = activeSession.label.toLowerCase();
      if (label.includes("practice")) {
        state = "PRACTICE";
        statusLabel = currentSession ? "PRACTICE WINDOW ACTIVE" : "PRACTICE DAY";
      } else if (label.includes("qualifying") && label.includes("sprint")) {
        state = "SPRINT";
        statusLabel = currentSession ? "SPRINT QUALIFYING ACTIVE" : "SPRINT DAY";
      } else if (label.includes("shootout")) {
        state = "SPRINT";
        statusLabel = currentSession ? "SPRINT SHOOTOUT ACTIVE" : "SPRINT DAY";
      } else if (label.includes("sprint")) {
        state = "SPRINT";
        statusLabel = currentSession ? "SPRINT ACTIVE" : "SPRINT DAY";
      } else if (label.includes("qualifying")) {
        state = "QUALIFYING";
        statusLabel = currentSession ? "QUALIFYING ACTIVE" : "QUALIFYING DAY";
      } else if (label.includes("race")) {
        state = "RACE DAY";
        statusLabel = currentSession ? "RACE ACTIVE" : "RACE DAY";
      } else {
        state = "RACE DAY";
        statusLabel = "WEEKEND ACTIVE";
      }
    } else {
      state = "RACE DAY";
      statusLabel = "WEEKEND ACTIVE";
    }
  }

  return {
    state,
    nextSession,
    currentSession,
    completedSessions,
    futureSessions,
    statusLabel,
  };
}
