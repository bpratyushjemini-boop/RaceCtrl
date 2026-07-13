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

// ─── CENTRALIZED WEEKEND CONTEXT ENGINE ─────────────────────────────────────────

export type ResolvedWeekendState = "betweenRaces" | "upcoming" | "weekendActive" | "raceDay" | "postRace" | "seasonUnavailable";

export interface WeekendContext {
  season: string;
  currentRace: RaceSchedule | null;
  nextRace: RaceSchedule | null;
  previousRace: RaceSchedule | null;
  weekendState: ResolvedWeekendState;
  nextSession: Session | null;
  previousSession: Session | null;
  activeSession: Session | null;
  sessions: Session[];
  timeUntilNextSession: number | null; // ms
  dataState: "live" | "stale" | "final" | "scheduled";
}

export function resolveWeekendContext(
  schedule: RaceSchedule[],
  season: string = "2026",
  now: number = Date.now()
): WeekendContext {
  if (!schedule || schedule.length === 0) {
    return {
      season,
      currentRace: null,
      nextRace: null,
      previousRace: null,
      weekendState: "seasonUnavailable",
      nextSession: null,
      previousSession: null,
      activeSession: null,
      sessions: [],
      timeUntilNextSession: null,
      dataState: "scheduled",
    };
  }

  // Helper to parse dates
  const parseSessionTime = (s: Session) => new Date(`${s.date}T${s.time}`).getTime();

  // Find chronological ends for each race
  const raceTimelines = schedule.map((race) => {
    const sortedSessions = [...race.sessions].sort((a, b) => parseSessionTime(a) - parseSessionTime(b));
    const start = sortedSessions.length > 0 ? parseSessionTime(sortedSessions[0]) : 0;
    
    // Race session
    const raceSession = sortedSessions.find((s) => s.label === "Race") || sortedSessions[sortedSessions.length - 1];
    const duration = raceSession ? (raceSession.label === "Race" ? 3 * 3600000 : 3600000) : 3600000;
    const end = raceSession ? parseSessionTime(raceSession) + duration : 0;
    
    return { race, start, end, sessions: sortedSessions };
  });

  // Find current, previous, and next races
  const currentRaceInfo = raceTimelines.find((rt) => now >= rt.start && now <= rt.end);
  const nextRaceInfo = raceTimelines.find((rt) => rt.start > now);
  const previousRaceInfo = [...raceTimelines].reverse().find((rt) => rt.end < now);

  const currentRace = currentRaceInfo ? currentRaceInfo.race : null;
  const nextRace = nextRaceInfo ? nextRaceInfo.race : null;
  const previousRace = previousRaceInfo ? previousRaceInfo.race : null;

  // Resolve session status relative to the context
  const targetRaceInfo = currentRaceInfo || nextRaceInfo || previousRaceInfo;
  const sessions = targetRaceInfo ? targetRaceInfo.sessions : [];

  let nextSession: Session | null = null;
  let previousSession: Session | null = null;
  let activeSession: Session | null = null;

  for (const s of sessions) {
    const start = parseSessionTime(s);
    const duration = s.label === "Race" ? 3 * 3600000 : 3600000;
    const end = start + duration;

    if (now >= start && now <= end) {
      activeSession = s;
    } else if (start > now) {
      if (!nextSession) nextSession = s;
    } else if (end < now) {
      previousSession = s;
    }
  }

  // Determine weekendState
  let weekendState: ResolvedWeekendState = "betweenRaces";
  let dataState: "live" | "stale" | "final" | "scheduled" = "scheduled";

  if (currentRaceInfo) {
    // We are inside a active race weekend!
    const activeRaceSession = sessions.find((s) => s.label === "Race");
    const raceDayStart = activeRaceSession ? new Date(activeRaceSession.date).setHours(0,0,0,0) : 0;
    
    if (activeSession) {
      dataState = "live";
    }

    if (now >= raceDayStart && activeRaceSession && now <= parseSessionTime(activeRaceSession) + 3 * 3600000) {
      weekendState = "raceDay";
    } else {
      weekendState = "weekendActive";
    }
  } else {
    // Not active race weekend.
    // If next race starts in less than 3 days, it's upcoming race week
    if (nextRaceInfo && (nextRaceInfo.start - now) < 3 * 24 * 3600000) {
      weekendState = "upcoming";
    } else if (previousRaceInfo && (now - previousRaceInfo.end) < 2 * 24 * 3600000) {
      // Within 48 hours post-race, show postRace classification
      weekendState = "postRace";
      dataState = "final";
    } else {
      weekendState = "betweenRaces";
    }
  }

  const timeUntilNextSession = nextSession ? parseSessionTime(nextSession) - now : null;

  return {
    season,
    currentRace,
    nextRace,
    previousRace,
    weekendState,
    nextSession,
    previousSession,
    activeSession,
    sessions,
    timeUntilNextSession,
    dataState,
  };
}
