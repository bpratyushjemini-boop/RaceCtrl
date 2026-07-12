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
