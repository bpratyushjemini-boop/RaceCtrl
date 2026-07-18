export type StandingsEntry = {
  id?: string;
  position: number;
  name: string;
  subtitle: string;
  points: number;
  wins?: number;
};

export type Driver = StandingsEntry;
export type Constructor = StandingsEntry;

export type Session = {
  label: string;
  date: string;
  time: string;
};

export type RaceSchedule = {
  round: number;
  raceName: string;
  circuitId: string;
  circuitName: string;
  locality: string;
  country: string;
  lat?: number;
  long?: number;
  sessions: Session[];
};

/** A single driver's result row in a completed race session. */
export type RaceResult = {
  driverId: string;
  position: number;
  /** Positional text: '1'–'20', 'R' (retired), 'D' (disqualified), 'N' (not classified). */
  positionText: string;
  driverCode: string;
  driverName: string;
  team: string;
  driverNumber: string;
  /** Gap to leader. Leader has absolute race time; others have '+X.XXX' or status like '+1 Lap'. */
  gap: string;
  status: string;
  fastestLapTime?: string;
  /** 1 = driver with the overall fastest lap of the race. */
  fastestLapRank?: number;
  points: number;
};

/** Metadata + results for the most recently completed race. */
export type LastRaceData = {
  raceName: string;
  round: number;
  date: string;
  results: RaceResult[];
};

export type DriverProfileRecentResult = {
  round: number;
  raceName: string;
  position: number;
  positionText: string;
  status: string;
  points: number;
};

export type DriverProfileQualifyingResult = {
  round: number;
  raceName: string;
  position: number;
  q1?: string;
  q2?: string;
  q3?: string;
};

export type DriverProfile = {
  id: string;
  number: string;
  code: string;
  givenName: string;
  familyName: string;
  nationality: string;
  dateOfBirth: string;
  team: string;
  position: number;
  points: number;
  wins: number;
  recentResults: DriverProfileRecentResult[];
  qualifyingResults: DriverProfileQualifyingResult[];
  podiums?: number;
  poles?: number;
  fastestLaps?: number;
  dnfs?: number;
  teammate?: { id: string; name: string; code: string } | null;
  upcomingRace?: {
    round: number;
    raceName: string;
    date: string;
    time: string;
    circuitName: string;
  } | null;
};

export type ConstructorProfile = {
  id: string;
  name: string;
  position: number;
  points: number;
  wins: number;
  recentResults: {
    round: number;
    raceName: string;
    points: number;
  }[];
  drivers: {
    id: string;
    name: string;
    position: number;
    points: number;
  }[];
  principal?: string;
  carName?: string;
  base?: string;
  firstEntry?: number;
  championships?: number;
  podiums: number;
  poles: number;
};

export type DriverComparisonReport = {
  pointsGap: number;
  qualifyingRecord: {
    aAhead: number;
    bAhead: number;
    total: number;
  };
  raceRecord: {
    aAhead: number;
    bAhead: number;
    total: number;
  };
  avgFinishA: number;
  avgFinishB: number;
  recentFormA: { round: number; positionText: string; points: number }[];
  recentFormB: { round: number; positionText: string; points: number }[];
  progressionA: { round: number; points: number }[];
  progressionB: { round: number; points: number }[];
};

export interface SessionOutcome {
  sessionLabel: string;
  results: Array<{ position: number; driverCode: string; driverName: string }>;
}

