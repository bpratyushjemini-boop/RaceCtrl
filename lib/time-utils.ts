import type { TimeFormat, TimezoneMode } from "./settings-context";

/**
 * Formats a session time based on user preferences.
 * If timezone is "circuit", formats in the circuit's IANA timezone (or UTC fallback).
 * If format is "12h", uses 12-hour AM/PM formatting.
 */
export function formatSessionTime(
  dateStr: string,
  timeStr: string,
  format: TimeFormat,
  timezoneMode: TimezoneMode,
  ianaTimezone?: string
): string {
  const isoString = `${dateStr}T${timeStr}`;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    // Basic fallback if invalid
    return timeStr.slice(0, 5);
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  };

  if (timezoneMode === "circuit") {
    options.timeZone = ianaTimezone || "UTC";
  }

  return date.toLocaleTimeString(undefined, options);
}

/**
 * Formats a session date based on user timezone preferences.
 * Adjusts day/weekday if the timezone offset shifts the date.
 */
export function formatSessionDate(
  dateStr: string,
  timeStr: string,
  timezoneMode: TimezoneMode,
  ianaTimezone?: string
): string {
  const isoString = `${dateStr}T${timeStr}`;
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };

  if (timezoneMode === "circuit") {
    options.timeZone = ianaTimezone || "UTC";
  }

  return date.toLocaleDateString(undefined, options);
}

/**
 * Formats a timestamp into a human-readable "time ago" string (e.g. "5m ago").
 */
export function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "recently";

  const diffMs = Date.now() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
