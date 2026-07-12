import type { TimeFormat, TimezoneMode } from "./settings-context";

/**
 * Formats a session time based on user preferences.
 * If timezone is "circuit", formats in UTC (the F1 API timezone).
 * If format is "12h", uses 12-hour AM/PM formatting.
 */
export function formatSessionTime(
  dateStr: string,
  timeStr: string,
  format: TimeFormat,
  timezoneMode: TimezoneMode
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
    options.timeZone = "UTC";
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
  timezoneMode: TimezoneMode
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
    options.timeZone = "UTC";
  }

  return date.toLocaleDateString(undefined, options);
}
