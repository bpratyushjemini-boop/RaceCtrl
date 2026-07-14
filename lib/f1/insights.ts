import { resolveDriverMedia } from "@/lib/media/resolver";
import type { RaceSchedule, StandingsEntry, LastRaceData } from "@/lib/types";
import { resolveWeekendContext } from "./weekend-state";

export interface F1Insight {
  id: string;
  type:
    | "championshipLead"
    | "closeBattle"
    | "favoritePosition"
    | "favoriteBattle"
    | "constructorLead"
    | "latestWinner"
    | "podiumResult"
    | "nextSession"
    | "raceDay"
    | "resultAvailable";
  priority: number; // Higher numbers mean higher priority
  title: string;
  summary: string;
  entityIds: string[];
  raceId?: string | number;
  sourceState?: unknown;
  generatedAt: number;
}

const CLOSE_BATTLE_THRESHOLD = 15;
const CONSTRUCTOR_BATTLE_THRESHOLD = 25;

/**
 * Derives the championship context string for a driver.
 * Priority:
 * 1. Championship leader
 * 2. Gap to position ahead
 * 3. Gap to position behind if very close (<= 6 pts)
 * 4. Current position and points
 */
export function getDriverChampionshipContext(
  driver: StandingsEntry,
  drivers: StandingsEntry[]
): string {
  const index = drivers.findIndex((d) => d.id === driver.id);
  if (index === -1) {
    return `P${driver.position} · ${driver.points} PTS`;
  }

  if (driver.position === 1) {
    return `CHAMPIONSHIP LEADER · ${driver.points} PTS`;
  }

  const driverAhead = drivers[index - 1];
  if (driverAhead) {
    const gapAhead = driverAhead.points - driver.points;
    return `${gapAhead} PTS TO P${driverAhead.position}`;
  }

  const driverBehind = drivers[index + 1];
  if (driverBehind) {
    const gapBehind = driver.points - driverBehind.points;
    if (gapBehind <= 6) {
      return `${gapBehind} PTS AHEAD OF P${driverBehind.position}`;
    }
  }

  return `P${driver.position} · ${driver.points} PTS`;
}

/**
 * Derives the championship context string for a constructor.
 */
export function getConstructorChampionshipContext(
  constructor: StandingsEntry,
  constructors: StandingsEntry[]
): string {
  const index = constructors.findIndex((c) => c.id === constructor.id);
  if (index === -1) {
    return `P${constructor.position} · ${constructor.points} PTS`;
  }

  if (constructor.position === 1) {
    return `CONSTRUCTORS' LEADER · ${constructor.points} PTS`;
  }

  const ahead = constructors[index - 1];
  if (ahead) {
    const gapAhead = ahead.points - constructor.points;
    return `${gapAhead} PTS TO P${ahead.position}`;
  }

  return `P${constructor.position} · ${constructor.points} PTS`;
}

/**
 * Formats a timestamp into a compact countdown format: e.g. "42M", "4H 12M", "2D 4H"
 */
export function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return "NOW";
  const totalMinutes = Math.floor(diffMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  if (days > 0) {
    const hours = totalHours % 24;
    return `${days}D ${hours}H`;
  }
  if (totalHours > 0) {
    const minutes = totalMinutes % 60;
    return `${totalHours}H ${minutes}M`;
  }
  return `${totalMinutes}M`;
}

/**
 * Formats session time to HH:MM format
 */
export function formatSessionTime(timeStr: string): string {
  try {
    // Expected time format "HH:MM:SSZ"
    const clean = timeStr.replace("Z", "");
    const parts = clean.split(":");
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  } catch {
    return timeStr;
  }
}

export interface WhatsNextResult {
  type: "nextSession" | "raceDay" | "resultAvailable" | "seasonUnavailable";
  title: string;
  subtitle: string;
  timeContext: string;
  link: string;
}

/**
 * Resolves the next meaningful action.
 */
export function resolveWhatsNext(
  schedule: RaceSchedule[],
  lastRaceData: LastRaceData | null,
  now: number = Date.now()
): WhatsNextResult {
  const ctx = resolveWeekendContext(schedule, "2026", now);

  if (!schedule || schedule.length === 0) {
    return {
      type: "seasonUnavailable",
      title: "DATA UNAVAILABLE",
      subtitle: "No F1 schedule active",
      timeContext: "STANDBY FOR UPDATE",
      link: "/standings",
    };
  }

  // 1. If result is recently available (within 48 hours post race, or if it's postRace state)
  if (ctx.weekendState === "postRace" && lastRaceData) {
    return {
      type: "resultAvailable",
      title: "RESULT AVAILABLE",
      subtitle: lastRaceData.raceName,
      timeContext: "VIEW CLASSIFICATION",
      link: "/timing",
    };
  }

  // 2. If it's Race Day and there is a Race session today
  const featuredRace = ctx.currentRace || ctx.nextRace;
  if (featuredRace) {
    const raceSession = featuredRace.sessions.find((s) => s.label === "Race");
    if (raceSession) {
      const raceTime = new Date(`${raceSession.date}T${raceSession.time}`).getTime();
      const isRaceDay = ctx.weekendState === "raceDay";
      
      // If it is race day or race is within 24 hours
      if (isRaceDay || (raceTime > now && raceTime - now <= 24 * 3600000)) {
        return {
          type: "raceDay",
          title: "RACE DAY",
          subtitle: featuredRace.raceName,
          timeContext: `TODAY · ${formatSessionTime(raceSession.time)}`,
          link: "/weekend",
        };
      }
    }
  }

  // 3. Next session upcoming
  if (ctx.nextSession && featuredRace) {
    const sessionTime = new Date(`${ctx.nextSession.date}T${ctx.nextSession.time}`).getTime();
    return {
      type: "nextSession",
      title: "NEXT SESSION",
      subtitle: `${ctx.nextSession.label.toUpperCase()}`,
      timeContext: formatCountdown(sessionTime - now),
      link: "/weekend",
    };
  }

  // Fallback to next race
  if (ctx.nextRace) {
    const nextRaceSession = ctx.nextRace.sessions.find((s) => s.label === "Race");
    if (nextRaceSession) {
      const raceTime = new Date(`${nextRaceSession.date}T${nextRaceSession.time}`).getTime();
      return {
        type: "nextSession",
        title: "NEXT RACE",
        subtitle: ctx.nextRace.raceName,
        timeContext: formatCountdown(raceTime - now),
        link: "/weekend",
      };
    }
  }

  return {
    type: "seasonUnavailable",
    title: "SEASON COMPLETE",
    subtitle: "All races completed",
    timeContext: "VIEW STANDINGS",
    link: "/standings",
  };
}

export interface RaceStory {
  headline: string;
  classification: string;
  context?: string;
}

/**
 * Factual race story generator.
 */
export function getRaceStory(
  lastRaceData: LastRaceData | null,
  favoriteIds: string[]
): RaceStory | null {
  if (!lastRaceData || lastRaceData.results.length === 0) return null;

  const results = lastRaceData.results;
  const winner = results[0];
  const p2 = results[1];
  const p3 = results[2];

  // Headline: "LECLERC WINS THE BRITISH GRAND PRIX" or similar
  const winnerName = winner.driverName.split(" ").pop()?.toUpperCase() ?? "UNKNOWN";
  const raceName = lastRaceData.raceName.toUpperCase();
  const headline = `${winnerName} WINS THE ${raceName}`;

  // Classification: "RUSSELL P2 · HAMILTON P3"
  const p2Name = p2 ? (p2.driverName.split(" ").pop() ?? p2.driverCode) : "—";
  const p3Name = p3 ? (p3.driverName.split(" ").pop() ?? p3.driverCode) : "—";
  const classification = `${p2Name.toUpperCase()} P2 · ${p3Name.toUpperCase()} P3`;

  // Third line: Favorite driver finish or fastest lap or DNFs
  let context = "";
  const favFinishes = results.filter((r) => favoriteIds.includes(r.driverId));
  const fastestLap = results.find((r) => r.fastestLapRank === 1);

  if (favFinishes.length > 0) {
    const topFav = favFinishes[0];
    const favMedia = resolveDriverMedia(topFav.driverId);
    context = `YOUR DRIVER · ${favMedia.code} FINISHED P${topFav.positionText || topFav.position}`;
  } else if (fastestLap) {
    const flMedia = resolveDriverMedia(fastestLap.driverId);
    context = `${flMedia.code} SETS FASTEST LAP`;
  } else {
    const dnfCount = results.filter(
      (r) =>
        r.status.toLowerCase().includes("retired") ||
        r.status.toLowerCase().includes("accident") ||
        r.status.toLowerCase().includes("collision")
    ).length;
    if (dnfCount > 0) {
      context = `${dnfCount} DRIVERS RETIRED (DNF)`;
    }
  }

  return {
    headline,
    classification,
    context,
  };
}

/**
 * Insight Engine orchestrator. Computes a list of deterministic insights.
 */
export function getInsights(
  drivers: StandingsEntry[],
  constructors: StandingsEntry[],
  lastRaceData: LastRaceData | null,
  schedule: RaceSchedule[],
  favoriteIds: string[],
  now: number = Date.now()
): F1Insight[] {
  const insights: F1Insight[] = [];
  const ctx = resolveWeekendContext(schedule, "2026", now);

  // 1. Next Up / What's Next Insight
  const whatsNext = resolveWhatsNext(schedule, lastRaceData, now);
  if (whatsNext.type !== "seasonUnavailable") {
    // Priority based on weekend state
    let priority = 50;
    if (ctx.weekendState === "raceDay") priority = 100;
    else if (ctx.weekendState === "weekendActive" || ctx.weekendState === "upcoming") priority = 90;

    insights.push({
      id: "whats-next",
      type: whatsNext.type === "resultAvailable" ? "resultAvailable" : "nextSession",
      priority,
      title: whatsNext.title,
      summary: `${whatsNext.subtitle} · ${whatsNext.timeContext}`,
      entityIds: [],
      generatedAt: now,
    });
  }

  // 2. Latest Race Story Insight
  const story = getRaceStory(lastRaceData, favoriteIds);
  if (story) {
    let priority = 40;
    if (ctx.weekendState === "postRace") priority = 95;

    insights.push({
      id: "latest-story",
      type: "latestWinner",
      priority,
      title: story.headline,
      summary: `${story.classification}${story.context ? ` · ${story.context}` : ""}`,
      entityIds: lastRaceData ? [lastRaceData.results[0]?.driverId].filter(Boolean) : [],
      generatedAt: now,
    });
  }

  // 3. Favorite Driver Context Insights
  favoriteIds.forEach((favId) => {
    const driver = drivers.find((d) => d.id === favId);
    if (driver) {
      const contextStr = getDriverChampionshipContext(driver, drivers);
      const isLeader = driver.position === 1;

      // Base priority on standing or closeness
      let priority = 70;
      if (isLeader) priority = 75;

      // Adjust priority based on weekend state
      if (ctx.weekendState === "raceDay" || ctx.weekendState === "weekendActive") {
        priority += 10; // Elevate during active weekend
      }

      insights.push({
        id: `fav-driver-${favId}`,
        type: "favoritePosition",
        priority,
        title: driver.name.toUpperCase(),
        summary: contextStr,
        entityIds: [favId],
        generatedAt: now,
      });
    }
  });

  // 4. Championship Battle Detection (Drivers)
  for (let i = 0; i < drivers.length - 1; i++) {
    const d1 = drivers[i];
    const d2 = drivers[i + 1];
    const gap = d1.points - d2.points;

    if (gap <= CLOSE_BATTLE_THRESHOLD) {
      const d1Id = d1.id || "";
      const d2Id = d2.id || "";
      const involvesFav = favoriteIds.includes(d1Id) || favoriteIds.includes(d2Id);
      
      // Priority: involves favorites + position rank
      let priority = involvesFav ? 80 : 60;
      priority -= d1.position; // Prioritize higher standing battles

      const d1Last = d1.name.split(" ").pop() ?? d1.name;
      const d2Last = d2.name.split(" ").pop() ?? d2.name;

      insights.push({
        id: `battle-drivers-${d1Id}-${d2Id}`,
        type: "closeBattle",
        priority,
        title: "CLOSE BATTLE",
        summary: `${d1Last.toUpperCase()} vs ${d2Last.toUpperCase()} · ${gap} PTS APART`,
        entityIds: [d1Id, d2Id],
        generatedAt: now,
      });
    }
  }

  // 5. Championship Battle Detection (Constructors)
  for (let i = 0; i < constructors.length - 1; i++) {
    const c1 = constructors[i];
    const c2 = constructors[i + 1];
    const gap = c1.points - c2.points;

    if (gap <= CONSTRUCTOR_BATTLE_THRESHOLD) {
      const c1Id = c1.id || "";
      const c2Id = c2.id || "";
      const priority = 45 - c1.position;

      insights.push({
        id: `battle-constructors-${c1Id}-${c2Id}`,
        type: "closeBattle",
        priority,
        title: "CONSTRUCTOR BATTLE",
        summary: `${c1.name.toUpperCase()} vs ${c2.name.toUpperCase()} · ${gap} PTS APART`,
        entityIds: [c1Id, c2Id],
        generatedAt: now,
      });
    }
  }

  // Sort by priority descending
  return insights.sort((a, b) => b.priority - a.priority);
}
