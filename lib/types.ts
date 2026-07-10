export type StandingsEntry = {
  position: number;
  name: string;
  subtitle: string;
  points: number;
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
  circuitName: string;
  locality: string;
  country: string;
  sessions: Session[];
};