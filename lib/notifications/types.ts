export type NotificationCapability =
  | "unsupported"
  | "permission-default"
  | "permission-granted"
  | "permission-denied"
  | "standalone-required"
  | "ready";

export interface NotificationPreferences {
  raceReminders: boolean;
  sessionReminders: boolean;
  results: boolean;
  breakingF1Updates: boolean;

  // V2 Categories
  weekendReminders: boolean;
  liveEvents: boolean;
  favDriverEvents: boolean;
  favTeamEvents: boolean;
  championshipChanges: boolean;
  newsUpdates: boolean;
  weatherAlerts: boolean;

  // Advanced preferences
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  timezoneMode: "local" | "circuit";
}

export interface ReminderConfig {
  leadTimeMinutes: number; // 15, 30, 60
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export interface ResultsNotificationEvent {
  raceName: string;
  round: number;
  targetUrl: "/timing";
  timestamp: string;
}

export interface BreakingUpdatesEvent {
  title: string;
  content: string;
  targetUrl: string;
  timestamp: string;
}

export interface NotificationHistoryEntry {
  id: string;
  category: "weekendReminders" | "liveEvents" | "favDriverEvents" | "favTeamEvents" | "championshipChanges" | "newsUpdates" | "weatherAlerts";
  title: string;
  body: string;
  timestamp: string; // ISO date string
  read: boolean;
  url: string; // deep link url
}
