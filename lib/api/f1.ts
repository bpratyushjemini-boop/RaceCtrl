import type {
  LastRaceData,
  RaceResult,
  RaceSchedule,
  Session,
  StandingsEntry,
  DriverProfile,
  DriverProfileRecentResult,
  DriverProfileQualifyingResult,
} from "@/lib/types";
import { getOfflineMockForPath } from "./offline-mocks";
import { formatRaceGap, normalizeResultStatus } from "@/lib/f1/normalize";

const BASE_URL = "https://api.jolpi.ca/ergast/f1";

type ErgastDriverStanding = {
  position: string;
  points: string;
  wins?: string;
  Driver: { driverId: string; givenName: string; familyName: string };
  Constructors: { name: string }[];
};

type ErgastConstructorStanding = {
  position: string;
  points: string;
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

let resolvedSeason = "2026";

export function getResolvedSeason(): string {
  return resolvedSeason;
}

function updateResolvedSeason(data: unknown) {
  if (!data || typeof data !== "object") return;
  const payload = data as {
    MRData?: {
      season?: string | number;
      StandingsTable?: {
        season?: string | number;
        StandingsLists?: Array<{ season?: string | number }>;
      };
      RaceTable?: {
        season?: string | number;
        Races?: Array<{ season?: string | number }>;
      };
    };
  };

  const mr = payload.MRData;
  if (!mr) return;

  let season = mr.season;
  if (!season && mr.StandingsTable) {
    season = mr.StandingsTable.season || mr.StandingsTable.StandingsLists?.[0]?.season;
  }
  if (!season && mr.RaceTable) {
    season = mr.RaceTable.season || mr.RaceTable.Races?.[0]?.season;
  }
  if (season) {
    resolvedSeason = String(season);
  }
}

function isSafeId(id: unknown): id is string {
  return typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id);
}

async function fetchF1<T>(path: string, revalidate: number): Promise<T> {
  console.log(`${BASE_URL}/${path}`);

  // Defensive validation of path param to prevent arbitrary URL injection/traversal
  if (typeof path !== "string" || path.includes("..") || path.includes(":") || !/^[a-zA-Z0-9_\-\/\.\?&=]+$/.test(path)) {
    console.error(`Insecure or invalid path parameter blocked: ${path}`);
    const mockData = getOfflineMockForPath(path);
    updateResolvedSeason(mockData);
    return mockData as T;
  }

  try {
    const res = await fetch(`${BASE_URL}/${path}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`F1 API status error: ${res.status}. Falling back to local offline mock.`);
      const mockData = getOfflineMockForPath(path);
      updateResolvedSeason(mockData);
      return mockData as T;
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Response content type was not application/json. Got: ${contentType}`);
    }

    const data = await res.json();
    updateResolvedSeason(data);
    return data as T;
  } catch (err) {
    console.error(`F1 API fetch failed for ${path}:`, err);
    const mockData = getOfflineMockForPath(path);
    updateResolvedSeason(mockData);
    return mockData as T;
  }
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
    const [standingsData, resultsData, qualifyingData] = await Promise.all([
      fetchF1<ErgastStandingsResponse<ErgastDriverStandingEntry>>("current/driverStandings.json", 300),
      fetchF1<ErgastResultsResponse>(`current/drivers/${driverId}/results.json`, 300).catch(() => null),
      fetchF1<ErgastQualifyingResponse>(`current/drivers/${driverId}/qualifying.json`, 300).catch(() => null),
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

    const recentResults: DriverProfileRecentResult[] = [];
    if (resultsData?.MRData?.RaceTable?.Races) {
      const races = resultsData.MRData.RaceTable.Races;
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

export interface SessionOutcome {
  sessionLabel: string;
  results: Array<{ position: number; driverCode: string; driverName: string }>;
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
  } catch (err) {
    console.error("Error fetching weekend outcomes:", err);
  }

  return outcomes;
}


