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

async function fetchF1<T>(path: string, revalidate: number): Promise<T> {
  console.log(`${BASE_URL}/${path}`);

  try {
    const res = await fetch(`${BASE_URL}/${path}`, { next: { revalidate } });

    if (!res.ok) {
      console.warn(`F1 API status error: ${res.status}. Falling back to local offline mock.`);
      const mockData = getOfflineMockForPath(path);
      updateResolvedSeason(mockData);
      return mockData as T;
    }

    const data = await res.json();
    updateResolvedSeason(data);
    return data as T;
  } catch (err) {
    console.warn(`F1 API fetch failed: ${err instanceof Error ? err.message : err}. Falling back to local offline mock.`);
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
  const list = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];

  return list.map((entry) => ({
    id: entry.Driver.driverId,
    position: Number(entry.position),
    name: `${entry.Driver.givenName} ${entry.Driver.familyName}`,
    subtitle: entry.Constructors[0]?.name ?? "",
    points: Number(entry.points),
    wins: entry.wins ? Number(entry.wins) : 0,
  }));
}

export async function getConstructorStandings(): Promise<StandingsEntry[]> {
  const data = await fetchF1<ErgastStandingsResponse<ErgastConstructorStanding>>(
    "current/constructorStandings.json",
    300
  );
  const list =
    data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];

  return list.map((entry) => ({
    id: entry.Constructor.constructorId,
    position: Number(entry.position),
    name: entry.Constructor.name,
    subtitle: "Constructor",
    points: Number(entry.points),
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
    .filter(([, s]) => s?.date)
    .map(([label, s]) => ({
      label,
      date: s!.date,
      time: s!.time ?? "00:00:00Z",
    }));
}

export async function getRaceSchedule(): Promise<RaceSchedule[]> {
  const data = await fetchF1<ErgastScheduleResponse>("current.json", 3600);

  return data.MRData.RaceTable.Races.map((race) => ({
    round: Number(race.round),
    raceName: race.raceName,
    circuitId: race.Circuit.circuitId,
    circuitName: race.Circuit.circuitName,
    locality: race.Circuit.Location.locality,
    country: race.Circuit.Location.country,
    lat: race.Circuit.Location.lat ? Number(race.Circuit.Location.lat) : undefined,
    long: race.Circuit.Location.long ? Number(race.Circuit.Location.long) : undefined,
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
 * Returns the most recently completed F1 race results.
 * Used as the data source for the Live Timing screen when no live feed is available.
 * Returns null if the API is unreachable or no results exist yet.
 */
export async function getLastRaceResults(): Promise<LastRaceData | null> {
  try {
    const data = await fetchF1<ErgastRaceResultResponse>(
      "current/last/results.json",
      300
    );
    const races = data.MRData.RaceTable.Races;
    if (!races || races.length === 0) return null;

    const race = races[0];

    const winnerLaps = race.Results[0] ? Number(race.Results[0].laps) : undefined;

    const results: RaceResult[] = race.Results.map((r, index) => {
      const { statusType, displayStatus } = normalizeResultStatus(r.status, r.positionText, Number(r.laps), winnerLaps);
      
      let rawGap: string;
      if (index === 0) {
        rawGap = r.Time?.time ?? "—";
      } else if (statusType === "finished" || statusType === "lapped") {
        rawGap = r.Time?.time || displayStatus;
      } else {
        rawGap = displayStatus;
      }

      const gap = formatRaceGap(rawGap, index === 0);

      return {
        driverId: r.Driver.driverId,
        position: Number(r.position),
        positionText: r.positionText,
        driverCode: r.Driver.code ?? `${r.Driver.givenName[0]}${r.Driver.familyName.slice(0, 2).toUpperCase()}`,
        driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
        team: r.Constructor.name,
        driverNumber: r.number,
        gap,
        status: displayStatus,
        fastestLapTime: r.FastestLap?.Time.time,
        fastestLapRank: r.FastestLap?.rank ? Number(r.FastestLap.rank) : undefined,
        points: Number(r.points),
      };
    });

    return {
      raceName: race.raceName,
      round: Number(race.round),
      date: race.date,
      results,
    };
  } catch {
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
  const list = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
  return list.map((entry: ErgastDriverStandingEntry) => {
    const d = entry.Driver;
    const code = d.code ?? `${d.givenName[0]}${d.familyName.slice(0, 2).toUpperCase()}`;
    return {
      id: d.driverId,
      code,
      name: `${d.givenName} ${d.familyName}`,
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
  try {
    const [standingsData, resultsData, qualifyingData] = await Promise.all([
      fetchF1<ErgastStandingsResponse<ErgastDriverStandingEntry>>("current/driverStandings.json", 300),
      fetchF1<ErgastResultsResponse>(`current/drivers/${driverId}/results.json`, 300).catch(() => null),
      fetchF1<ErgastQualifyingResponse>(`current/drivers/${driverId}/qualifying.json`, 300).catch(() => null),
    ]);

    const standingsList = standingsData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
    const standingEntry = standingsList.find(entry => entry.Driver.driverId === driverId);

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
      position = Number(standingEntry.position);
      points = Number(standingEntry.points);
      wins = standingEntry.wins ? Number(standingEntry.wins) : 0;
      team = standingEntry.Constructors[0]?.name ?? "Unknown";
    } else {
      // Inactive or reserve driver search
      const driverRes = await fetchF1<ErgastDriverTableResponse>(`drivers/${driverId}.json`, 3600).catch(() => null);
      if (!driverRes || !driverRes.MRData.DriverTable.Drivers[0]) {
        return null;
      }
      driverMeta = driverRes.MRData.DriverTable.Drivers[0];
    }

    const recentResults: DriverProfileRecentResult[] = [];
    if (resultsData?.MRData?.RaceTable?.Races) {
      const races = resultsData.MRData.RaceTable.Races;
      const recentRaces = races.slice(-5).reverse();
      for (const race of recentRaces) {
        const result = race.Results?.[0];
        if (result) {
          recentResults.push({
            round: Number(race.round),
            raceName: race.raceName,
            position: Number(result.position),
            positionText: result.positionText,
            status: result.status,
            points: Number(result.points),
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
        if (result) {
          qualifyingResults.push({
            round: Number(race.round),
            raceName: race.raceName,
            position: Number(result.position),
            q1: result.Q1 || undefined,
            q2: result.Q2 || undefined,
            q3: result.Q3 || undefined,
          });
        }
      }
    }

    const code = driverMeta.code ?? `${driverMeta.givenName[0]}${driverMeta.familyName.slice(0, 2).toUpperCase()}`;

    return {
      id: driverMeta.driverId,
      number: driverMeta.permanentNumber ?? "—",
      code,
      givenName: driverMeta.givenName,
      familyName: driverMeta.familyName,
      nationality: driverMeta.nationality,
      dateOfBirth: driverMeta.dateOfBirth,
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
  try {
    const data = await fetchF1<ErgastCircuitResponse>(`circuits/${circuitId}.json`, 86400);
    const circuit = data.MRData.CircuitTable.Circuits[0];
    if (!circuit) return null;
    return {
      circuitId: circuit.circuitId,
      circuitName: circuit.circuitName,
      locality: circuit.Location.locality,
      country: circuit.Location.country,
      lat: circuit.Location.lat ? Number(circuit.Location.lat) : undefined,
      long: circuit.Location.long ? Number(circuit.Location.long) : undefined,
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
  try {
    const data = await fetchF1<ErgastRaceResultsResponse>(`circuits/${circuitId}/results/1.json?limit=100`, 86400);
    const races = data.MRData.RaceTable.Races || [];
    const sorted = [...races].sort((a, b) => b.season.localeCompare(a.season) || b.round.localeCompare(a.round));
    return sorted.slice(0, 5).map((race) => {
      const result = race.Results[0];
      return {
        year: Number(race.season),
        winner: `${result.Driver.givenName} ${result.Driver.familyName}`,
        constructor: result.Constructor.name,
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

  try {
    const [qualifyingRes, sprintRes, raceRes] = await Promise.all([
      fetchF1<ErgastQualifyingResponse>(`current/${round}/qualifying.json`, 300).catch(() => null),
      fetchF1<ErgastSprintResponse>(`current/${round}/sprint.json`, 300).catch(() => null),
      fetchF1<ErgastRaceResponse>(`current/${round}/results.json`, 300).catch(() => null),
    ]);

    if (qualifyingRes) {
      const races = qualifyingRes.MRData.RaceTable.Races || [];
      const qualyResults = races[0]?.QualifyingResults || [];
      if (qualyResults.length > 0) {
        outcomes.push({
          sessionLabel: "Qualifying",
          results: qualyResults.slice(0, 3).map((r) => ({
            position: Number(r.position),
            driverCode: r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase(),
            driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
          })),
        });
      }
    }

    if (sprintRes) {
      const races = sprintRes.MRData.RaceTable.Races || [];
      const sprintResults = races[0]?.SprintResults || [];
      if (sprintResults.length > 0) {
        outcomes.push({
          sessionLabel: "Sprint",
          results: sprintResults.slice(0, 3).map((r) => ({
            position: Number(r.position),
            driverCode: r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase(),
            driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
          })),
        });
      }
    }

    if (raceRes) {
      const races = raceRes.MRData.RaceTable.Races || [];
      const raceResults = races[0]?.Results || [];
      if (raceResults.length > 0) {
        outcomes.push({
          sessionLabel: "Race",
          results: raceResults.slice(0, 3).map((r) => ({
            position: Number(r.position),
            driverCode: r.Driver.code || r.Driver.familyName.slice(0, 3).toUpperCase(),
            driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
          })),
        });
      }
    }
  } catch (err) {
    console.error("Error fetching weekend outcomes:", err);
  }

  return outcomes;
}


