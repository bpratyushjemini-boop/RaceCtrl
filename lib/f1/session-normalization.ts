import type { Session } from "@/lib/types";
import { normalizeSessionCategory } from "../notifications/preferences";

export interface NormalizedSession {
  key: string;
  label: string;
  date: string;
  time: string;
  category: "Practice" | "Qualifying" | "Sprint" | "Race";
  timestamp: number;
  durationMs: number;
  status: "completed" | "in-progress" | "upcoming";
}

export function getSessionDuration(label: string): number {
  const lower = label.toLowerCase();
  if (lower.includes("race")) {
    return 3 * 60 * 60 * 1000; // 3 hours for race
  }
  return 1 * 60 * 60 * 1000; // 1 hour for others
}

/**
 * Returns a list of normalized sessions with computed statuses and categories.
 */
export function getNormalizedSessions(
  round: number,
  sessions: Session[],
  now: number = Date.now()
): NormalizedSession[] {
  return sessions.map((s) => {
    const timestamp = new Date(`${s.date}T${s.time}`).getTime();
    const durationMs = getSessionDuration(s.label);
    const category = normalizeSessionCategory(s.label);
    
    // Normalize casing and spaces
    let displayLabel = s.label;
    if (s.label.toLowerCase().replace(/\s+/g, "") === "sprintqualifying") {
      displayLabel = "Sprint Qualifying";
    } else if (s.label.toLowerCase().replace(/\s+/g, "") === "sprintshootout") {
      displayLabel = "Sprint Shootout";
    }

    let status: "completed" | "in-progress" | "upcoming" = "upcoming";
    if (now >= timestamp + durationMs) {
      status = "completed";
    } else if (now >= timestamp) {
      status = "in-progress";
    }

    return {
      key: `${round}-${s.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      label: displayLabel,
      date: s.date,
      time: s.time,
      category,
      timestamp,
      durationMs,
      status,
    };
  });
}
