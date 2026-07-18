export interface RaceCtrlDriver {
  id: string;
  code: string;
  name: string;
  number: string;
  team: string;
  nationality?: string;
  dateOfBirth?: string;
}

export interface RaceCtrlConstructor {
  id: string;
  name: string;
  base?: string;
  principal?: string;
  carName?: string;
  championships?: number;
}

export interface RaceCtrlStanding {
  id: string;
  position: number;
  points: number;
  wins: number;
  name: string;
  subtitle: string;
}

export interface RaceCtrlLiveDriverClassification {
  position: number;
  positionText: string;
  driverCode: string;
  driverName: string;
  team: string;
  gap: string;
  interval: string;
  currentLap: number;
  status: string; // 'Active', 'Pit', 'DNF', 'Out'
  lastLapTime: string;
  bestLapTime: string;
  tyreCompound: string;
}

export interface RaceCtrlLiveSession {
  success: boolean;
  active: boolean;
  sessionName: string;
  sessionType: string;
  sessionClock: string;
  trackFlag: "GREEN" | "YELLOW" | "RED" | "SAFETY_CAR" | "VSC" | "DOUBLE_YELLOW" | "WHITE" | "UNKNOWN";
  currentLap: number;
  totalLaps: number;
  classification: RaceCtrlLiveDriverClassification[];
  controlMessages: string[];
  lastUpdated: number; // Timestamp of fetch
}
