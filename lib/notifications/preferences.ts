import { NotificationPreferences, ReminderConfig } from "./types";

const NOTIFICATIONS_KEY = "racectrl_notifications";
const LEAD_TIME_KEY = "racectrl_reminder_lead_time";
const SESSION_REMINDERS_KEY = "racectrl_session_reminders";

export const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  raceReminders: true,
  sessionReminders: true,
  results: true,
  breakingF1Updates: false,

  // V2 Categories
  weekendReminders: true,
  liveEvents: true,
  favDriverEvents: true,
  favTeamEvents: true,
  championshipChanges: true,
  newsUpdates: true,
  weatherAlerts: true,

  // Quiet Hours & Settings
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  timezoneMode: "local",
};

export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  leadTimeMinutes: 15,
};

export function loadNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          raceReminders: typeof parsed.raceReminders === "boolean" ? parsed.raceReminders : DEFAULT_NOTIFICATIONS.raceReminders,
          sessionReminders: typeof parsed.sessionReminders === "boolean" ? parsed.sessionReminders : DEFAULT_NOTIFICATIONS.sessionReminders,
          results: typeof parsed.results === "boolean" ? parsed.results : DEFAULT_NOTIFICATIONS.results,
          breakingF1Updates: typeof parsed.breakingF1Updates === "boolean" ? parsed.breakingF1Updates : DEFAULT_NOTIFICATIONS.breakingF1Updates,

          weekendReminders: typeof parsed.weekendReminders === "boolean" ? parsed.weekendReminders : DEFAULT_NOTIFICATIONS.weekendReminders,
          liveEvents: typeof parsed.liveEvents === "boolean" ? parsed.liveEvents : DEFAULT_NOTIFICATIONS.liveEvents,
          favDriverEvents: typeof parsed.favDriverEvents === "boolean" ? parsed.favDriverEvents : DEFAULT_NOTIFICATIONS.favDriverEvents,
          favTeamEvents: typeof parsed.favTeamEvents === "boolean" ? parsed.favTeamEvents : DEFAULT_NOTIFICATIONS.favTeamEvents,
          championshipChanges: typeof parsed.championshipChanges === "boolean" ? parsed.championshipChanges : DEFAULT_NOTIFICATIONS.championshipChanges,
          newsUpdates: typeof parsed.newsUpdates === "boolean" ? parsed.newsUpdates : DEFAULT_NOTIFICATIONS.newsUpdates,
          weatherAlerts: typeof parsed.weatherAlerts === "boolean" ? parsed.weatherAlerts : DEFAULT_NOTIFICATIONS.weatherAlerts,

          quietHoursEnabled: typeof parsed.quietHoursEnabled === "boolean" ? parsed.quietHoursEnabled : DEFAULT_NOTIFICATIONS.quietHoursEnabled,
          quietHoursStart: typeof parsed.quietHoursStart === "string" ? parsed.quietHoursStart : DEFAULT_NOTIFICATIONS.quietHoursStart,
          quietHoursEnd: typeof parsed.quietHoursEnd === "string" ? parsed.quietHoursEnd : DEFAULT_NOTIFICATIONS.quietHoursEnd,
          timezoneMode: typeof parsed.timezoneMode === "string" && ["local", "circuit"].includes(parsed.timezoneMode) ? parsed.timezoneMode : DEFAULT_NOTIFICATIONS.timezoneMode,
        };
      }
    }
  } catch (err) {
    console.error("Failed to load notification preferences:", err);
  }
  return DEFAULT_NOTIFICATIONS;
}

export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error("Failed to save notification preferences:", err);
  }
}

export function loadReminderConfig(): ReminderConfig {
  if (typeof window === "undefined") return DEFAULT_REMINDER_CONFIG;
  try {
    const stored = localStorage.getItem(LEAD_TIME_KEY);
    if (stored) {
      const minutes = parseInt(stored, 10);
      if ([15, 30, 60].includes(minutes)) {
        return { leadTimeMinutes: minutes };
      }
    }
  } catch (err) {
    console.error("Failed to load reminder config:", err);
  }
  return DEFAULT_REMINDER_CONFIG;
}

export function saveReminderConfig(config: ReminderConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEAD_TIME_KEY, String(config.leadTimeMinutes));
  } catch (err) {
    console.error("Failed to save reminder config:", err);
  }
}

export function normalizeSessionCategory(label: string): "Practice" | "Qualifying" | "Sprint" | "Race" {
  const lower = label.toLowerCase();
  if (lower.includes("practice")) {
    return "Practice";
  }
  if (lower.includes("qualifying") && lower.includes("sprint")) {
    return "Sprint";
  }
  if (lower.includes("shootout")) {
    return "Sprint";
  }
  if (lower.includes("sprint")) {
    return "Sprint";
  }
  if (lower.includes("qualifying")) {
    return "Qualifying";
  }
  return "Race";
}

export function loadSessionReminders(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(SESSION_REMINDERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const validated: Record<string, boolean> = {};
        for (const [key, val] of Object.entries(parsed)) {
          if (typeof key === "string" && typeof val === "boolean" && /^[a-zA-Z0-9_ -]+$/.test(key)) {
            validated[key] = val;
          }
        }
        return validated;
      }
    }
  } catch {}
  return {};
}

export function saveSessionReminders(reminders: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_REMINDERS_KEY, JSON.stringify(reminders));
  } catch {}
}

export function isSessionReminderEnabled(
  round: number,
  sessionLabel: string,
  globalPrefs: NotificationPreferences
): boolean {
  const isRace = sessionLabel === "Race";
  const isGlobalEnabled = isRace ? globalPrefs.raceReminders : globalPrefs.sessionReminders;
  
  if (!isGlobalEnabled) return false;

  const key = `${round}-${sessionLabel}`;
  const sessionMap = loadSessionReminders();
  // Default to true if not explicitly toggled off
  return sessionMap[key] !== false;
}

export function toggleSessionReminder(round: number, sessionLabel: string): boolean {
  const key = `${round}-${sessionLabel}`;
  const sessionMap = loadSessionReminders();
  const currentVal = sessionMap[key] !== false;
  const newVal = !currentVal;
  sessionMap[key] = newVal;
  saveSessionReminders(sessionMap);
  return newVal;
}
