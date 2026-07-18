import type {
  LastRaceData,
  RaceResult,
  RaceSchedule,
  Session,
  StandingsEntry,
  DriverProfile,
  DriverProfileRecentResult,
  DriverProfileQualifyingResult,
  ConstructorProfile,
  DriverComparisonReport,
  SessionOutcome,
} from "@/lib/types";
import { formatRaceGap, normalizeResultStatus, normalizeConstructorId } from "@/lib/f1/normalize";
import { getConstructorMetadata } from "@/lib/f1/constructor-metadata";
import { F1Coordinator } from "@/lib/providers/services/f1-coordinator";

type ErgastDriverStanding = {
  position: string;
  points: string;
  wins?: string;
  Driver: { driverId: string; givenName: string; familyName: string };
  Constructors: { constructorId: string; name: string }[];
};

type ErgastConstructorStanding = {
  position: string;
  points: string;
  wins?: string;
  Constructor: { constructorId: string; name: string };
};

type ErgastStandingsResponse<T> = {
  MRData: {
    StandingsTable: {
      StandingsLists: {
        DriverStandings?: T[];
        ConstructorStandings?: T[];
      }[];
    };
  };
};

type ErgastSession = { date: string; time?: string };

type ErgastRace = {
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
      lat?: string;
      long?: string;
    };
  };
  FirstPractice?: ErgastSession;
  SecondPractice?: ErgastSession;
  ThirdPractice?: ErgastSession;
  SprintQualifying?: ErgastSession;
  Sprint?: ErgastSession;
  Qualifying?: ErgastSession;
};

type ErgastScheduleResponse = {
  MRData: { RaceTable: { Races: ErgastRace[] } };
};

const resolvedSeason = "2026";

export function getResolvedSeason(): string {
  return resolvedSeason;
}

function isSafeId(id: unknown): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id);
}

async function fetchF1<T>(path: string, revalidate: number): Promise<T> {
  return F1Coordinator.fetchJolpica(path, revalidate) as Promise<T>;
}

export async function getDriverStandings(): Promise<StandingsEntry[]> {
  const data = await fetchF1<ErgastStandingsResponse<ErgastDriverStanding>>(
    "current/driverStandings.json",
    300
  );
  const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

  return list
    .filter((entry): entry is ErgastDriverStanding => {
      return !!(
        entry &&
        typeof entry.position === "string" &&
        typeof entry.points === "string" &&
        entry.Driver &&
        isSafeId(entry.Driver.driverId) &&
        typeof entry.Driver.givenName === "string" &&
        typeof entry.Driver.familyName === "string" &&
        Array.isArray(entry.Constructors)
      );
    })
    .map((entry) => ({
      id: entry.Driver.driverId,
      position: Number(entry.position) || 0,
      name: `${entry.Driver.givenName} ${entry.Driver.familyName}`.trim(),
      subtitle: entry.Constructors[0]?.name ?? "Independent",
      points: Number(entry.points) || 0,
      wins: entry.wins ? (Number(entry.wins) || 0) : 0,
    }));
}

export async function getConstructorStandings(): Promise<StandingsEntry[]> {
  const data = await fetchF1<ErgastStandingsResponse<ErgastConstructorStanding>>(
    "current/constructorStandings.json",
    300
  );
  const list =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  return list
    .filter((entry): entry is ErgastConstructorStanding => {
      return !!(
        entry &&
        typeof entry.position === "string" &&
        typeof entry.points === "string" &&
        entry.Constructor &&
        isSafeId(entry.Constructor.constructorId) &&
        typeof entry.Constructor.name === "string"
      );
    })
    .map((entry) => ({
      id: entry.Constructor.constructorId,
      position: Number(entry.position) || 0,
      name: entry.Constructor.name,
      subtitle: "Constructor",
      points: Number(entry.points) || 0,
    }));
}

function toSessions(race: ErgastRace): Session[] {
  const entries: [string, ErgastSession | undefined][] = [
    ["Practice 1", race.FirstPractice],
    ["Practice 2", race.SecondPractice],
    ["Practice 3", race.ThirdPractice],
    ["Sprint Qualifying", race.SprintQualifying],
    ["Sprint", race.Sprint],
    ["Qualifying", race.Qualifying],
    ["Race", { date: race.date, time: race.time }],
  ];

  return entries
    .filter((entry): entry is [string, ErgastSession] => {
      const s = entry[1];
      return !!(s && typeof s.date === "string" && s.date.trim() !== "");
    })
    .map(([label, s]) => {
      const timeVal = s.time;
      return {
        label,
        date: s.date,
        time: typeof timeVal === "string" ? timeVal : "00:00:00Z",
      };
    });
}

export async function getHistoricalDriverStandings(year: string): Promise<StandingsEntry[]> {
  if (!/^\d{4}$/.test(year)) return [];
  const data = await fetchF1<ErgastStandingsResponse<ErgastDriverStanding>>(
    `${year}/driverStandings.json`,
    86400
  );
  const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

  return list
    .filter((entry): entry is ErgastDriverStanding => {
      return !!(
        entry &&
        typeof entry.position === "string" &&
        typeof entry.points === "string" &&
        entry.Driver &&
        isSafeId(entry.Driver.driverId) &&
        typeof entry.Driver.givenName === "string" &&
        typeof entry.Driver.familyName === "string" &&
        Array.isArray(entry.Constructors)
      );
    })
    .map((entry) => ({
      id: entry.Driver.driverId,
      position: Number(entry.position) || 0,
      name: `${entry.Driver.givenName} ${entry.Driver.familyName}`.trim(),
      subtitle: entry.Constructors[0]?.name ?? "Independent",
      points: Number(entry.points) || 0,
      wins: entry.wins ? (Number(entry.wins) || 0) : 0,
    }));
}

export async function getHistoricalConstructorStandings(year: string): Promise<StandingsEntry[]> {
  if (!/^\d{4}$/.test(year)) return [];
  const data = await fetchF1<ErgastStandingsResponse<ErgastConstructorStanding>>(
    `${year}/constructorStandings.json`,
    86400
  );
  const list =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  return list
    .filter((entry): entry is ErgastConstructorStanding => {
      return !!(
        entry &&
        typeof entry.position === "string" &&
        typeof entry.points === "string" &&
        entry.Constructor &&
        isSafeId(entry.Constructor.constructorId) &&
        typeof entry.Constructor.name === "string"
      );
    })
    .map((entry) => ({
      id: entry.Constructor.constructorId,
      position: Number(entry.position) || 0,
      name: entry.Constructor.name,
      subtitle: "Constructor",
      points: Number(entry.points) || 0,
      wins: entry.wins ? (Number(entry.wins) || 0) : 0,
    }));
}

export async function getHistoricalRaceSchedule(year: string): Promise<RaceSchedule[]> {
  if (!/^\d{4}$/.test(year)) return [];
  const data = await fetchF1<ErgastScheduleResponse>(`${year}.json`, 86400);
  const races = data?.MRData?.RaceTable?.Races ?? [];

  return races
    .filter((race): race is ErgastRace => {
      return !!(
        race &&
        typeof race.round === "string" &&
        typeof race.raceName === "string" &&
        typeof race.date === "string" &&
        race.Circuit &&
        isSafeId(race.Circuit.circuitId) &&
        typeof race.Circuit.circuitName === "string" &&
        race.Circuit.Location &&
        typeof race.Circuit.Location.locality === "string" &&
        typeof race.Circuit.Location.country === "string"
      );
    })
    .map((race) => ({
      round: Number(race.round) || 0,
      raceName: race.raceName,
      circuitId: race.Circuit.circuitId,
      circuitName: race.Circuit.circuitName,
      locality: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
      lat: race.Circuit.Location.lat && !isNaN(Number(race.Circuit.Location.lat)) ? Number(race.Circuit.Location.lat) : undefined,
      long: race.Circuit.Location.long && !isNaN(Number(race.Circuit.Location.long)) ? Number(race.Circuit.Location.long) : undefined,
      sessions: toSessions(race),
    }));
}

export async function getRaceSchedule(): Promise<RaceSchedule[]> {
  const data = await fetchF1<ErgastScheduleResponse>("current.json", 3600);
  const races = data?.MRData?.RaceTable?.Races ?? [];

  return races
    .filter((race): race is ErgastRace => {
      return !!(
        race &&
        typeof race.round === "string" &&
        typeof race.raceName === "string" &&
        typeof race.date === "string" &&
        race.Circuit &&
        isSafeId(race.Circuit.circuitId) &&
        typeof race.Circuit.circuitName === "string" &&
        race.Circuit.Location &&
        typeof race.Circuit.Location.locality === "string" &&
        typeof race.Circuit.Location.country === "string"
      );
    })
    .map((race) => ({
      round: Number(race.round) || 0,
      raceName: race.raceName,
      circuitId: race.Circuit.circuitId,
      circuitName: race.Circuit.circuitName,
      locality: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
      lat: race.Circuit.Location.lat && !isNaN(Number(race.Circuit.Location.lat)) ? Number(race.Circuit.Location.lat) : undefined,
      long: race.Circuit.Location.long && !isNaN(Number(race.Circuit.Location.long)) ? Number(race.Circuit.Location.long) : undefined,
      sessions: toSessions(race),
    }));
}

function sessionTimestamp(session: Session) {
  return new Date(`${session.date}T${session.time}`).getTime();
}

export async function getNextRace(): Promise<RaceSchedule | null> {
  const schedule = await getRaceSchedule();
  const now = Date.now();

  const upcoming = schedule
    .filter((race) => {
      const raceSession = race.sessions.find((s) => s.label === "Race");
      return raceSession && sessionTimestamp(raceSession) >= now;
    })
    .sort((a, b) => {
      const aTime = sessionTimestamp(a.sessions.find((s) => s.label === "Race")!);
      const bTime = sessionTimestamp(b.sessions.find((s) => s.label === "Race")!);
      return aTime - bTime;
    });

  return upcoming[0] ?? null;
}

export function getNextSession(race: RaceSchedule): Session | null {
  const now = Date.now();

  const upcoming = race.sessions
    .filter((s) => sessionTimestamp(s) >= now)
    .sort((a, b) => sessionTimestamp(a) - sessionTimestamp(b));

  return upcoming[0] ?? null;
}

/**
 * Returns the most relevant race weekend:
 *   - The currently active race weekend if we're inside it (between FP1 start and 3h after Race).
 *   - Otherwise the next upcoming race weekend.
 *   - Returns null at season end.
 *
 * "Inside" a weekend is defined as: first session has started AND race session
 * hasn't ended yet (estimated 3 hours after the race start time).
 */
export async function getRelevantWeekend(): Promise<RaceSchedule | null> {
  const schedule = await getRaceSchedule();
  if (schedule.length === 0) return null;
  const now = Date.now();

  // Check if we are inside any currently active race weekend
  const active = schedule.find((race) => {
    const firstSession = race.sessions[0];
    const raceSession = race.sessions.find((s) => s.label === "Race");
    if (!firstSession || !raceSession) return false;

    const weekendStart = sessionTimestamp(firstSession);
    // Assume race lasts up to 3 hours
    const weekendEnd = sessionTimestamp(raceSession) + 3 * 60 * 60 * 1000;
    return now >= weekendStart && now <= weekendEnd;
  });

  if (active) return active;

  // Otherwise return the next upcoming race (first race session in the future)
  const nextRace = await getNextRace();
  if (nextRace) return nextRace;

  // If the season has completed, show the most recently completed race (the last round)
  return schedule[schedule.length - 1] ?? null;
}

// ─── Race Results (for Live Timing fallback) ──────────────────────────────────

type ErgastRaceResult = {
  number: string;
  position: string;
  positionText: string;
  points: string;
  laps: string;
  Driver: { driverId: string; code: string; givenName: string; familyName: string };
  Constructor: { name: string };
  status: string;
  Time?: { time: string };
  FastestLap?: { rank: string; Time: { time: string } };
};

type ErgastRaceResultResponse = {
  MRData: {
    RaceTable: {
      Races: {
        round: string;
        raceName: string;
        date: string;
        Results: ErgastRaceResult[];
      }[];
    };
  };
};

/**
 * Returns F1 race results for a specific round.
 */
export async function getRaceResultsForRound(round: number): Promise<LastRaceData | null> {
  if (typeof round !== "number" || isNaN(round) || round < 1 || round > 30) {
    return null;
  }
  try {
    const data = await fetchF1<ErgastRaceResultResponse>(
      `current/${round}/results.json`,
      300
    );
    const races = data?.MRData?.RaceTable?.Races;
    if (!races || races.length === 0) return null;

    const race = races[0];
    if (!race || !Array.isArray(race.Results)) return null;

    const winnerLaps = race.Results[0] ? (Number(race.Results[0].laps) || undefined) : undefined;

    const results: RaceResult[] = race.Results
      .filter((r) => r && r.Driver && r.Constructor && typeof r.position === "string")
      .map((r, index) => {
        const lapsNum = Number(r.laps) || 0;
        const { statusType, displayStatus } = normalizeResultStatus(r.status || "Finished", r.positionText || r.position, lapsNum, winnerLaps);
        
        let rawGap: string;
        if (index === 0) {
          rawGap = r.Time?.time ?? "—";
        } else if (statusType === "finished" || statusType === "lapped") {
          rawGap = r.Time?.time || displayStatus;
        } else {
          rawGap = displayStatus;
        }

        const gap = formatRaceGap(rawGap, index === 0);
        const given = r.Driver.givenName || "";
        const family = r.Driver.familyName || "Driver";
        const code = r.Driver.code || (given ? `${given[0]}${family.slice(0, 2).toUpperCase()}` : family.slice(0, 3).toUpperCase());

        return {
          driverId: isSafeId(r.Driver.driverId) ? r.Driver.driverId : "unknown",
          position: Number(r.position) || (index + 1),
          positionText: r.positionText || r.position,
          driverCode: code,
          driverName: `${given} ${family}`.trim(),
          team: r.Constructor.name || "Unknown",
          driverNumber: r.number || "—",
          gap,
          status: displayStatus,
          fastestLapTime: r.FastestLap?.Time?.time,
          fastestLapRank: r.FastestLap?.rank && !isNaN(Number(r.FastestLap.rank)) ? Number(r.FastestLap.rank) : undefined,
          points: Number(r.points) || 0,
        };
      });

    return {
      raceName: race.raceName || "Unknown Grand Prix",
      round: Number(race.round) || 0,
      date: race.date || "",
      results,
    };
  } catch (err) {
    console.error(`Failed to fetch race results for round ${round}:`, err);
    return null;
  }
}

/**
 * Returns the most recently completed F1 race results.
 * Used as the data source for the Live Timing screen when no live feed is available.
 */
export async function getLastRaceResults(): Promise<LastRaceData | null> {
  try {
    const data = await fetchF1<ErgastRaceResultResponse>(
      "current/last/results.json",
      300
    );
    const races = data?.MRData?.RaceTable?.Races;
    if (!races || races.length === 0) return null;

    const race = races[0];
    if (!race || !Array.isArray(race.Results)) return null;

    const winnerLaps = race.Results[0] ? (Number(race.Results[0].laps) || undefined) : undefined;

    const results: RaceResult[] = race.Results
      .filter((r) => r && r.Driver && r.Constructor && typeof r.position === "string")
      .map((r, index) => {
        const lapsNum = Number(r.laps) || 0;
        const { statusType, displayStatus } = normalizeResultStatus(r.status || "Finished", r.positionText || r.position, lapsNum, winnerLaps);
        
        let rawGap: string;
        if (index === 0) {
          rawGap = r.Time?.time ?? "—";
        } else if (statusType === "finished" || statusType === "lapped") {
          rawGap = r.Time?.time || displayStatus;
        } else {
          rawGap = displayStatus;
        }

        const gap = formatRaceGap(rawGap, index === 0);
        const given = r.Driver.givenName || "";
        const family = r.Driver.familyName || "Driver";
        const code = r.Driver.code || (given ? `${given[0]}${family.slice(0, 2).toUpperCase()}` : family.slice(0, 3).toUpperCase());

        return {
          driverId: isSafeId(r.Driver.driverId) ? r.Driver.driverId : "unknown",
          position: Number(r.position) || (index + 1),
          positionText: r.positionText || r.position,
          driverCode: code,
          driverName: `${given} ${family}`.trim(),
          team: r.Constructor.name || "Unknown",
          driverNumber: r.number || "—",
          gap,
          status: displayStatus,
          fastestLapTime: r.FastestLap?.Time?.time,
          fastestLapRank: r.FastestLap?.rank && !isNaN(Number(r.FastestLap.rank)) ? Number(r.FastestLap.rank) : undefined,
          points: Number(r.points) || 0,
        };
      });

    return {
      raceName: race.raceName || "Unknown Grand Prix",
      round: Number(race.round) || 0,
      date: race.date || "",
      results,
    };
  } catch (err) {
    console.error("Failed to fetch last race results:", err);
    return null;
  }
}

/**
 * Returns true if the current moment falls inside any active race weekend
 * (between the first session start and 3 hours after race start).
 * Called from server components — Date.now() is legal here (not a React render body).
 */
export async function getIsWeekendActive(): Promise<boolean> {
  try {
    const schedule = await getRaceSchedule();
    const now = Date.now();

    return schedule.some((race) => {
      const firstSession = race.sessions[0];
      const raceSession = race.sessions.find((s) => s.label === "Race");
      if (!firstSession || !raceSession) return false;
      const weekendStart = sessionTimestamp(firstSession);
      const weekendEnd = sessionTimestamp(raceSession) + 3 * 60 * 60 * 1000;
      return now >= weekendStart && now <= weekendEnd;
    });
  } catch {
    return false;
  }
}

// ─── Drivers List (for Favorites Selection) ───────────────────────────────────

export type F1Driver = {
  id: string;
  code: string;
  name: string;
  team: string;
  number: string;
};

type ErgastDriverStandingEntry = {
  position: string;
  points: string;
  wins?: string;
  Driver: {
    driverId: string;
    code?: string;
    permanentNumber?: string;
    givenName: string;
    familyName: string;
    nationality: string;
    dateOfBirth: string;
  };
  Constructors: { name: string }[];
};

/**
 * Returns a list of F1 drivers from the current season's standings.
 * Used to populate the Favorites driver selection list.
 */
export async function getDriversList(): Promise<F1Driver[]> {
  const data = await fetchF1<ErgastStandingsResponse<ErgastDriverStandingEntry>>(
    "current/driverStandings.json",
    3600
  );
  const list = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
  return list
    .filter((entry): entry is ErgastDriverStandingEntry => {
      return !!(entry && entry.Driver && isSafeId(entry.Driver.driverId) && Array.isArray(entry.Constructors));
    })
    .map((entry: ErgastDriverStandingEntry) => {
      const d = entry.Driver;
      const given = d.givenName || "";
      const family = d.familyName || "Driver";
      const code = d.code ?? `${given[0]}${family.slice(0, 2).toUpperCase()}`;
      return {
        id: d.driverId,
        code,
        name: `${given} ${family}`.trim(),
        team: entry.Constructors[0]?.name ?? "Unknown",
        number: d.permanentNumber ?? "—",
      };
    });
}

type ErgastResultsResponse = {
  MRData: {
    RaceTable: {
      Races: {
        round: string;
        raceName: string;
        Results?: {
          position: string;
          positionText: string;
          status: string;
          points: string;
          FastestLap?: {
            rank: string;
            lap: string;
            Time: {
              time: string;
            };
          };
        }[];
      }[];
    };
  };
};

type ErgastQualifyingResponse = {
  MRData: {
    RaceTable: {
      Races: {
        round: string;
        raceName: string;
        QualifyingResults?: {
          position: string;
          Q1?: string;
          Q2?: string;
          Q3?: string;
          Driver: {
            code?: string;
            givenName: string;
            familyName: string;
          };
        }[];
      }[];
    };
  };
};

type ErgastDriverTableResponse = {
  MRData: {
    DriverTable: {
      Drivers: {
        driverId: string;
        permanentNumber?: string;
        code?: string;
        givenName: string;
        familyName: string;
        nationality: string;
        dateOfBirth: string;
      }[];
    };
  };
};

export async function getDriverProfile(driverId: string): Promise<DriverProfile | null> {
  if (!isSafeId(driverId)) {
    console.error(`Unsafe driver ID parameter: ${driverId}`);
    return null;
  }

  try {
    const [standingsData, resultsData, qualifyingData, schedule] = await Promise.all([
      fetchF1<ErgastStandingsResponse<ErgastDriverStandingEntry>>("current/driverStandings.json", 300),
      fetchF1<ErgastResultsResponse>(`current/drivers/${driverId}/results.json`, 300).catch(() => null),
      fetchF1<ErgastQualifyingResponse>(`current/drivers/${driverId}/qualifying.json`, 300).catch(() => null),
      getRaceSchedule().catch(() => []),
    ]);

    const standingsList = standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    const standingEntry = standingsList.find(entry => entry?.Driver?.driverId === driverId);

    let driverMeta: {
      driverId: string;
      permanentNumber?: string;
      code?: string;
      givenName: string;
      familyName: string;
      nationality: string;
      dateOfBirth: string;
    } | null = null;
    let position = 0;
    let points = 0;
    let wins = 0;
    let team = "Unknown";

    if (standingEntry) {
      driverMeta = standingEntry.Driver;
      position = Number(standingEntry.position) || 0;
      points = Number(standingEntry.points) || 0;
      wins = standingEntry.wins ? (Number(standingEntry.wins) || 0) : 0;
      team = standingEntry.Constructors?.[0]?.name ?? "Unknown";
    } else {
      // Inactive or reserve driver search
      const driverRes = await fetchF1<ErgastDriverTableResponse>(`drivers/${driverId}.json`, 3600).catch(() => null);
      if (!driverRes || !driverRes.MRData?.DriverTable?.Drivers?.[0]) {
        return null;
      }
      driverMeta = driverRes.MRData.DriverTable.Drivers[0];
    }

    if (!driverMeta) return null;

    let podiums = 0;
    let fastestLaps = 0;
    let dnfs = 0;
    let poles = 0;

    const recentResults: DriverProfileRecentResult[] = [];
    if (resultsData?.MRData?.RaceTable?.Races) {
      const races = resultsData.MRData.RaceTable.Races;
      
      // Calculate season-wide stats from the entire results set
      for (const race of races) {
        const result = race.Results?.[0];
        if (result) {
          const pos = Number(result.position);
          if (pos >= 1 && pos <= 3) {
            podiums++;
          }
          if (result.FastestLap?.rank === "1") {
            fastestLaps++;
          }
          const statusLower = (result.status || "").toLowerCase();
          if (statusLower !== "finished" && !statusLower.includes("lap") && !statusLower.startsWith("+")) {
            dnfs++;
          }
        }
      }

      // Slice the last 5 races for the recent results timeline
      const recentRaces = races.slice(-5).reverse();
      for (const race of recentRaces) {
        const result = race.Results?.[0];
        if (result && typeof result.position === "string") {
          recentResults.push({
            round: Number(race.round) || 0,
            raceName: race.raceName || "Unknown Grand Prix",
            position: Number(result.position),
            positionText: result.positionText || result.position,
            status: result.status || "Finished",
            points: Number(result.points) || 0,
          });
        }
      }
    }

    const qualifyingResults: DriverProfileQualifyingResult[] = [];
    if (qualifyingData?.MRData?.RaceTable?.Races) {
      const races = qualifyingData.MRData.RaceTable.Races;

      // Calculate season-wide pole positions
      for (const race of races) {
        const result = race.QualifyingResults?.[0];
        if (result && Number(result.position) === 1) {
          poles++;
        }
      }

      // Slice the last 5 races for the recent qualifying timeline
      const recentQualy = races.slice(-5).reverse();
      for (const race of recentQualy) {
        const result = race.QualifyingResults?.[0];
        if (result && typeof result.position === "string") {
          qualifyingResults.push({
            round: Number(race.round) || 0,
            raceName: race.raceName || "Unknown Grand Prix",
            position: Number(result.position),
            q1: result.Q1 || undefined,
            q2: result.Q2 || undefined,
            q3: result.Q3 || undefined,
          });
        }
      }
    }

    // Resolve teammate from standings list
    let teammate: { id: string; name: string; code: string } | null = null;
    const canonicalTeamId = normalizeConstructorId(team);
    if (standingsList) {
      const otherDriver = standingsList.find(
        (entry) =>
          entry?.Driver?.driverId !== driverId &&
          normalizeConstructorId(entry?.Constructors?.[0]?.name || "") === canonicalTeamId
      );
      if (otherDriver) {
        const given = otherDriver.Driver.givenName || "";
        const family = otherDriver.Driver.familyName || "";
        const code = otherDriver.Driver.code || (given ? `${given[0]}${family.slice(0, 2).toUpperCase()}` : family.slice(0, 3).toUpperCase());
        teammate = {
          id: otherDriver.Driver.driverId,
          name: `${given} ${family}`.trim(),
          code,
        };
      }
    }

    // Resolve upcoming race info
    let upcomingRace = null;
    const now = Date.now();
    const futureRaces = schedule
      .filter((race) => {
        const raceSession = race.sessions.find((s) => s.label === "Race");
        return raceSession && new Date(`${raceSession.date}T${raceSession.time}`).getTime() >= now;
      })
      .sort((a, b) => {
        const aRace = a.sessions.find((s) => s.label === "Race")!;
        const bRace = b.sessions.find((s) => s.label === "Race")!;
        const aTime = new Date(`${aRace.date}T${aRace.time}`).getTime();
        const bTime = new Date(`${bRace.date}T${bRace.time}`).getTime();
        return aTime - bTime;
      });

    const nextGP = futureRaces[0];
    if (nextGP) {
      const raceSession = nextGP.sessions.find((s) => s.label === "Race")!;
      upcomingRace = {
        round: nextGP.round,
        raceName: nextGP.raceName,
        date: raceSession.date,
        time: raceSession.time,
        circuitName: nextGP.circuitName,
      };
    }

    const given = driverMeta.givenName || "";
    const family = driverMeta.familyName || "Driver";
    const code = driverMeta.code ?? `${given[0]}${family.slice(0, 2).toUpperCase()}`;

    return {
      id: driverMeta.driverId,
      number: driverMeta.permanentNumber ?? "—",
      code,
      givenName: given,
      familyName: family,
      nationality: driverMeta.nationality || "Unknown",
      dateOfBirth: driverMeta.dateOfBirth || "Unknown",
      team,
      position,
      points,
      wins,
      recentResults,
      qualifyingResults,
      podiums,
      poles,
      fastestLaps,
      dnfs,
      teammate,
      upcomingRace,
    };
  } catch (err) {
    console.error(`Error fetching driver profile for ${driverId}:`, err);
    return null;
  }
}

interface ErgastCircuitResponse {
  MRData: {
    CircuitTable: {
      Circuits: Array<{
        circuitId: string;
        circuitName: string;
        Location: {
          locality: string;
          country: string;
          lat?: string;
          long?: string;
        };
      }>;
    };
  };
}

export interface CircuitInfo {
  circuitId: string;
  circuitName: string;
  locality: string;
  country: string;
  lat?: number;
  long?: number;
}

export async function getCircuitInfo(circuitId: string): Promise<CircuitInfo | null> {
  if (!isSafeId(circuitId)) {
    console.error(`Unsafe circuit ID parameter: ${circuitId}`);
    return null;
  }

  try {
    const data = await fetchF1<ErgastCircuitResponse>(`circuits/${circuitId}.json`, 86400);
    const circuit = data?.MRData?.CircuitTable?.Circuits?.[0];
    if (!circuit) return null;
    return {
      circuitId: circuit.circuitId,
      circuitName: circuit.circuitName || "Unknown Circuit",
      locality: circuit.Location?.locality || "Unknown Locality",
      country: circuit.Location?.country || "Unknown Country",
      lat: circuit.Location?.lat && !isNaN(Number(circuit.Location.lat)) ? Number(circuit.Location.lat) : undefined,
      long: circuit.Location?.long && !isNaN(Number(circuit.Location.long)) ? Number(circuit.Location.long) : undefined,
    };
  } catch {
    return null;
  }
}

interface ErgastRaceResultsResponse {
  MRData: {
    RaceTable: {
      Races: Array<{
        season: string;
        round: string;
        Results: Array<{
          Driver: {
            givenName: string;
            familyName: string;
          };
          Constructor: {
            name: string;
          };
        }>;
      }>;
    };
  };
}

export async function getRecentWinners(circuitId: string): Promise<Array<{ year: number; winner: string; constructor: string }>> {
  if (!isSafeId(circuitId)) {
    console.error(`Unsafe circuit ID parameter: ${circuitId}`);
    return [];
  }

  try {
    const data = await fetchF1<ErgastRaceResultsResponse>(`circuits/${circuitId}/results/1.json?limit=100`, 86400);
    const races = data?.MRData?.RaceTable?.Races || [];
    const sorted = [...races].sort((a, b) => (b.season || "").localeCompare(a.season || "") || (b.round || "").localeCompare(a.round || ""));
    return sorted
      .slice(0, 5)
      .filter((race) => race && Array.isArray(race.Results) && race.Results[0] && race.Results[0].Driver && race.Results[0].Constructor)
      .map((race) => {
        const result = race.Results[0];
        const given = result.Driver.givenName || "";
        const family = result.Driver.familyName || "Driver";
        return {
          year: Number(race.season) || 0,
          winner: `${given} ${family}`.trim(),
          constructor: result.Constructor.name || "Unknown Team",
        };
      });
  } catch (err) {
    console.error("Error fetching recent winners:", err);
    return [];
  }
}


interface ErgastSprintResponse {
  MRData: {
    RaceTable: {
      Races: Array<{
        SprintResults?: Array<{
          position: string;
          Driver: {
            code?: string;
            givenName: string;
            familyName: string;
          };
        }>;
      }>;
    };
  };
}

interface ErgastRaceResponse {
  MRData: {
    RaceTable: {
      Races: Array<{
        Results?: Array<{
          position: string;
          Driver: {
            code?: string;
            givenName: string;
            familyName: string;
          };
        }>;
      }>;
    };
  };
}

export async function getWeekendOutcomes(round: number): Promise<SessionOutcome[]> {
  const outcomes: SessionOutcome[] = [];

  if (typeof round !== "number" || isNaN(round) || round < 1 || round > 30) {
    console.error(`Invalid round parameter: ${round}`);
    return [];
  }

  try {
    const [qualifyingRes, sprintRes, raceRes] = await Promise.all([
      fetchF1<ErgastQualifyingResponse>(`current/${round}/qualifying.json`, 300).catch(() => null),
      fetchF1<ErgastSprintResponse>(`current/${round}/sprint.json`, 300).catch(() => null),
      fetchF1<ErgastRaceResponse>(`current/${round}/results.json`, 300).catch(() => null),
    ]);

    if (qualifyingRes) {
      const races = qualifyingRes.MRData?.RaceTable?.Races || [];
      const qualyResults = races[0]?.QualifyingResults || [];
      if (qualyResults.length > 0) {
        outcomes.push({
          sessionLabel: "Qualifying",
          results: qualyResults
            .slice(0, 3)
            .filter(r => r && r.Driver && typeof r.position === "string")
            .map((r) => {
              const given = r.Driver.givenName || "";
              const family = r.Driver.familyName || "Driver";
              return {
                position: Number(r.position) || 0,
                driverCode: r.Driver.code || family.slice(0, 3).toUpperCase(),
                driverName: `${given} ${family}`.trim(),
              };
            }),
        });
      }
    }

    if (sprintRes) {
      const races = sprintRes.MRData?.RaceTable?.Races || [];
      const sprintResults = races[0]?.SprintResults || [];
      if (sprintResults.length > 0) {
        outcomes.push({
          sessionLabel: "Sprint",
          results: sprintResults
            .slice(0, 3)
            .filter(r => r && r.Driver && typeof r.position === "string")
            .map((r) => {
              const given = r.Driver.givenName || "";
              const family = r.Driver.familyName || "Driver";
              return {
                position: Number(r.position) || 0,
                driverCode: r.Driver.code || family.slice(0, 3).toUpperCase(),
                driverName: `${given} ${family}`.trim(),
              };
            }),
        });
      }
    }

    if (raceRes) {
      const races = raceRes.MRData?.RaceTable?.Races || [];
      const raceResults = races[0]?.Results || [];
      if (raceResults.length > 0) {
        outcomes.push({
          sessionLabel: "Race",
          results: raceResults
            .slice(0, 3)
            .filter(r => r && r.Driver && typeof r.position === "string")
            .map((r) => {
              const given = r.Driver.givenName || "";
              const family = r.Driver.familyName || "Driver";
              return {
                position: Number(r.position) || 0,
                driverCode: r.Driver.code || family.slice(0, 3).toUpperCase(),
                driverName: `${given} ${family}`.trim(),
              };
            }),
        });
      }
    }

    // Read FastF1 cached files if they exist to extract outcomes/fastest drivers for Practice and other sessions
    if (typeof window === "undefined") {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const { mapSessionLabelToFastF1Code } = await import("./fastf1-client");
        
        const sessionLabels = ["Practice 1", "Practice 2", "Practice 3", "Sprint Qualifying", "Sprint", "Qualifying", "Race"];
        const year = Number(resolvedSeason) || 2024;
        const cacheDir = path.join(process.cwd(), "data", "fastf1_cache");

        for (const label of sessionLabels) {
          const existsIdx = outcomes.findIndex((o) => o.sessionLabel.toLowerCase() === label.toLowerCase());
          const code = mapSessionLabelToFastF1Code(label);
          const cacheFile = path.join(cacheDir, `session_${year}_${round}_${code}.json`);
          
          if (fs.existsSync(cacheFile)) {
            try {
              const fileData = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
              if (fileData && fileData.success && fileData.classification && fileData.classification.length > 0) {
                const rawList = fileData.classification.slice(0, 3) as Array<{
                  position: string | number;
                  driverCode: string;
                  driverName: string;
                }>;
                
                const top3 = rawList.map((c) => ({
                  position: Number(c.position) || 1,
                  driverCode: c.driverCode,
                  driverName: c.driverName,
                }));

                if (existsIdx >= 0) {
                  // Keep full Ergast details but prefer FastF1 details if they are richer
                  outcomes[existsIdx].results = top3;
                } else {
                  outcomes.push({
                    sessionLabel: label,
                    results: top3,
                  });
                }
              }
            } catch (e) {
              console.warn(`Failed to read FastF1 session cache for ${label} outcomes mapping:`, e);
            }
          }
        }
      } catch (err) {
        console.error("Error reading FastF1 cache for weekend outcomes:", err);
      }
    }
  } catch (err) {
    console.error("Error fetching weekend outcomes:", err);
  }

  return outcomes;
}

export async function getConstructorProfile(constructorId: string): Promise<ConstructorProfile | null> {
  if (!isSafeId(constructorId)) {
    console.error(`Unsafe constructor ID: ${constructorId}`);
    return null;
  }

  try {
    const [cStandingsData, dStandingsData, resultsData, qualifyingData] = await Promise.all([
      fetchF1<ErgastStandingsResponse<ErgastConstructorStanding>>("current/constructorStandings.json", 300),
      fetchF1<ErgastStandingsResponse<ErgastDriverStanding>>("current/driverStandings.json", 300),
      fetchF1<ErgastResultsResponse>(`current/constructors/${constructorId}/results.json`, 300).catch(() => null),
      fetchF1<ErgastQualifyingResponse>(`current/constructors/${constructorId}/qualifying.json`, 300).catch(() => null),
    ]);

    const cList = cStandingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
    const normalizedTarget = normalizeConstructorId(constructorId);
    const cEntry = cList.find((c) => normalizeConstructorId(c.Constructor.constructorId) === normalizedTarget);

    if (!cEntry) return null;

    const name = cEntry.Constructor.name;
    const position = Number(cEntry.position) || 0;
    const points = Number(cEntry.points) || 0;
    const wins = Number(cEntry.wins) || 0;

    // Find drivers associated with this constructor
    const dList = dStandingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
    const drivers = dList
      .filter((d) => normalizeConstructorId(d.Constructors?.[0]?.constructorId || "") === normalizedTarget)
      .map((d) => ({
        id: d.Driver.driverId,
        name: `${d.Driver.givenName} ${d.Driver.familyName}`.trim(),
        position: Number(d.position) || 0,
        points: Number(d.points) || 0,
      }));

    // Calculate current season wins, podiums, poles
    let podiums = 0;
    let poles = 0;
    const recentResults: { round: number; raceName: string; points: number }[] = [];

    if (resultsData?.MRData?.RaceTable?.Races) {
      const races = resultsData.MRData.RaceTable.Races;
      for (const race of races) {
        let racePts = 0;
        let gotPodium = false;
        if (race.Results) {
          for (const res of race.Results) {
            racePts += Number(res.points) || 0;
            const pos = Number(res.position);
            if (pos >= 1 && pos <= 3) {
              gotPodium = true;
            }
          }
        }
        if (gotPodium) podiums++;
        recentResults.push({
          round: Number(race.round) || 0,
          raceName: race.raceName || "Unknown Grand Prix",
          points: racePts,
        });
      }
    }

    if (qualifyingData?.MRData?.RaceTable?.Races) {
      const races = qualifyingData.MRData.RaceTable.Races;
      for (const race of races) {
        if (race.QualifyingResults) {
          for (const qr of race.QualifyingResults) {
            if (Number(qr.position) === 1) {
              poles++;
            }
          }
        }
      }
    }

    const staticMeta = getConstructorMetadata(normalizedTarget) || {};

    return {
      id: normalizedTarget,
      name,
      position,
      points,
      wins,
      recentResults: recentResults.slice(-5).reverse(),
      drivers,
      podiums,
      poles,
      ...staticMeta,
    };
  } catch (err) {
    console.error(`Error fetching constructor profile for ${constructorId}:`, err);
    return null;
  }
}

export async function getDriverComparisonData(driverAId: string, driverBId: string): Promise<DriverComparisonReport | null> {
  if (!isSafeId(driverAId) || !isSafeId(driverBId)) {
    console.error(`Unsafe driver ID params: ${driverAId}, ${driverBId}`);
    return null;
  }

  try {
    const [standingsData, resultsA, resultsB, qualifyingA, qualifyingB] = await Promise.all([
      fetchF1<ErgastStandingsResponse<ErgastDriverStanding>>("current/driverStandings.json", 300),
      fetchF1<ErgastResultsResponse>(`current/drivers/${driverAId}/results.json`, 300).catch(() => null),
      fetchF1<ErgastResultsResponse>(`current/drivers/${driverBId}/results.json`, 300).catch(() => null),
      fetchF1<ErgastQualifyingResponse>(`current/drivers/${driverAId}/qualifying.json`, 300).catch(() => null),
      fetchF1<ErgastQualifyingResponse>(`current/drivers/${driverBId}/qualifying.json`, 300).catch(() => null),
    ]);

    const standingsList = standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    const standingA = standingsList.find((entry) => entry?.Driver?.driverId === driverAId);
    const standingB = standingsList.find((entry) => entry?.Driver?.driverId === driverBId);

    const pointsA = standingA ? Number(standingA.points) || 0 : 0;
    const pointsB = standingB ? Number(standingB.points) || 0 : 0;
    const pointsGap = Math.abs(pointsA - pointsB);

    // Compute H2H Qualifying
    let qAheadA = 0;
    let qAheadB = 0;
    let qTotal = 0;

    const qRacesA = qualifyingA?.MRData?.RaceTable?.Races || [];
    const qRacesB = qualifyingB?.MRData?.RaceTable?.Races || [];

    const qPosA: Record<number, number> = {};
    const qPosB: Record<number, number> = {};

    for (const r of qRacesA) {
      const pos = Number(r.QualifyingResults?.[0]?.position);
      if (!isNaN(pos)) qPosA[Number(r.round)] = pos;
    }
    for (const r of qRacesB) {
      const pos = Number(r.QualifyingResults?.[0]?.position);
      if (!isNaN(pos)) qPosB[Number(r.round)] = pos;
    }

    const allQRounds = Array.from(new Set([...Object.keys(qPosA), ...Object.keys(qPosB)].map(Number)));
    for (const round of allQRounds) {
      const pA = qPosA[round];
      const pB = qPosB[round];
      if (pA !== undefined && pB !== undefined) {
        if (pA < pB) qAheadA++;
        else if (pB < pA) qAheadB++;
        qTotal++;
      }
    }

    // Compute H2H Races
    let rAheadA = 0;
    let rAheadB = 0;
    let rTotal = 0;

    const rRacesA = resultsA?.MRData?.RaceTable?.Races || [];
    const rRacesB = resultsB?.MRData?.RaceTable?.Races || [];

    const rPosA: Record<number, { pos: number; text: string; status: string; points: number }> = {};
    const rPosB: Record<number, { pos: number; text: string; status: string; points: number }> = {};

    let sumFinishA = 0;
    let countFinishA = 0;
    let sumFinishB = 0;
    let countFinishB = 0;

    for (const r of rRacesA) {
      const res = r.Results?.[0];
      if (res) {
        const round = Number(r.round);
        const pos = Number(res.position);
        rPosA[round] = {
          pos,
          text: res.positionText,
          status: res.status,
          points: Number(res.points) || 0,
        };
        if (res.positionText.match(/^\d+$/)) {
          sumFinishA += pos;
          countFinishA++;
        }
      }
    }

    for (const r of rRacesB) {
      const res = r.Results?.[0];
      if (res) {
        const round = Number(r.round);
        const pos = Number(res.position);
        rPosB[round] = {
          pos,
          text: res.positionText,
          status: res.status,
          points: Number(res.points) || 0,
        };
        if (res.positionText.match(/^\d+$/)) {
          sumFinishB += pos;
          countFinishB++;
        }
      }
    }

    const allRRounds = Array.from(new Set([...Object.keys(rPosA), ...Object.keys(rPosB)].map(Number)));
    for (const round of allRRounds) {
      const dataA = rPosA[round];
      const dataB = rPosB[round];
      if (dataA !== undefined && dataB !== undefined) {
        const isNumA = dataA.text.match(/^\d+$/);
        const isNumB = dataB.text.match(/^\d+$/);
        if (isNumA && isNumB) {
          if (dataA.pos < dataB.pos) rAheadA++;
          else if (dataB.pos < dataA.pos) rAheadB++;
          rTotal++;
        } else if (isNumA && !isNumB) {
          rAheadA++;
          rTotal++;
        } else if (!isNumA && isNumB) {
          rAheadB++;
          rTotal++;
        }
      }
    }

    // Cumulative points progression round-by-round
    const progressionA: { round: number; points: number }[] = [];
    const progressionB: { round: number; points: number }[] = [];

    const sortedRRounds = [...allRRounds].sort((a, b) => a - b);
    let runA = 0;
    let runB = 0;
    for (const round of sortedRRounds) {
      if (rPosA[round]) runA += rPosA[round].points;
      if (rPosB[round]) runB += rPosB[round].points;
      progressionA.push({ round, points: runA });
      progressionB.push({ round, points: runB });
    }

    // Recent form (last 5 finishes)
    const recentFormA = sortedRRounds
      .filter(r => rPosA[r])
      .slice(-5)
      .reverse()
      .map(r => ({
        round: r,
        positionText: rPosA[r].text,
        points: rPosA[r].points,
      }));

    const recentFormB = sortedRRounds
      .filter(r => rPosB[r])
      .slice(-5)
      .reverse()
      .map(r => ({
        round: r,
        positionText: rPosB[r].text,
        points: rPosB[r].points,
      }));

    return {
      pointsGap,
      qualifyingRecord: { aAhead: qAheadA, bAhead: qAheadB, total: qTotal },
      raceRecord: { aAhead: rAheadA, bAhead: rAheadB, total: rTotal },
      avgFinishA: countFinishA > 0 ? sumFinishA / countFinishA : 0,
      avgFinishB: countFinishB > 0 ? sumFinishB / countFinishB : 0,
      recentFormA,
      recentFormB,
      progressionA,
      progressionB,
    };
  } catch (err) {
    console.error(`Error generating comparison report for ${driverAId} and ${driverBId}:`, err);
    return null;
  }
}

export async function getLiveSessionTiming(round: number, sessionLabel: string) {
  const { getResolvedJolpicaSeason } = await import("@/lib/providers/jolpica/jolpica-provider");
  const year = Number(getResolvedJolpicaSeason()) || new Date().getFullYear();
  return F1Coordinator.getLiveSessionTiming(year, round, sessionLabel);
}



