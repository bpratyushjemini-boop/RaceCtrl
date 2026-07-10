import type { RaceSchedule, Session, StandingsEntry } from "@/lib/types";

const BASE_URL = "https://api.jolpi.ca/ergast/f1";

type ErgastDriverStanding = {
  position: string;
  points: string;
  Driver: { givenName: string; familyName: string };
  Constructors: { name: string }[];
};

type ErgastConstructorStanding = {
  position: string;
  points: string;
  Constructor: { name: string };
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
    circuitName: string;
    Location: { locality: string; country: string };
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

async function fetchF1<T>(path: string, revalidate: number) {
  console.log(`${BASE_URL}/${path}`);

  const res = await fetch(`${BASE_URL}/${path}`, { next: { revalidate } });

  if (!res.ok) {
    throw new Error(`F1 API request failed: ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function getDriverStandings(): Promise<StandingsEntry[]> {
  const data = await fetchF1<ErgastStandingsResponse<ErgastDriverStanding>>(
    "current/driverStandings.json",
    300
  );
  const list = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];

  return list.map((entry) => ({
    position: Number(entry.position),
    name: `${entry.Driver.givenName} ${entry.Driver.familyName}`,
    subtitle: entry.Constructors[0]?.name ?? "",
    points: Number(entry.points),
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
    circuitName: race.Circuit.circuitName,
    locality: race.Circuit.Location.locality,
    country: race.Circuit.Location.country,
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