import type { Session } from "@/lib/types";

// ─── CANONICAL F1 TYPES ────────────────────────────────────────────────────────

export interface NormalizedDriver {
  id: string;
  code: string;
  number: string;
  givenName: string;
  familyName: string;
  fullName: string;
  nationality: string;
  constructorId?: string;
  constructorName?: string;
}

export interface NormalizedConstructor {
  id: string;
  name: string;
  nationality?: string;
}

export interface NormalizedCircuit {
  id: string;
  name: string;
  locality: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export type SessionState = "upcoming" | "starting" | "live" | "completed" | "unknown";

export interface NormalizedSession {
  type: "practice1" | "practice2" | "practice3" | "sprintQualifying" | "sprint" | "qualifying" | "race";
  startTimestamp: number; // UTC instant
  displayLabel: string;
  state: SessionState;
  date: string;
  time: string;
}

export interface NormalizedRace {
  season: string;
  round: number;
  raceName: string;
  circuit: NormalizedCircuit;
  date: string;
  time?: string;
  raceStartTimestamp: number;
  sessions: NormalizedSession[];
  state: "upcoming" | "active" | "complete" | "unknown";
}

export type ResultStatusType = "finished" | "lapped" | "dnf" | "dns" | "dsq" | "notClassified" | "unknown";

export interface NormalizedResult {
  position: number;
  positionText: string;
  driver: NormalizedDriver;
  constructor: NormalizedConstructor;
  laps: number;
  rawStatus: string;
  normalizedStatus: ResultStatusType;
  time?: string;
  gap?: string;
  points: number;
  fastestLap?: {
    rank: number;
    time?: string;
  };
}

export type SourceDataState = "LIVE" | "FINAL" | "SCHEDULED" | "STALE" | "UNAVAILABLE" | "UNKNOWN";

export interface DataProvenance {
  provider: string;
  fetchedAt: number; // timestamp
  season: string;
  state: SourceDataState;
}

export interface ProvenancePayload<T> {
  data: T;
  provenance: DataProvenance;
}

// ─── CONSTRUCTOR CANONICALIZATION ───────────────────────────────────────────────────

/**
 * Maps varying constructor IDs and names back to their canonical form.
 */
export function normalizeConstructorId(rawId: string, name?: string): string {
  const cleanId = (rawId || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanName = (name || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  if (cleanId.includes("mclaren") || cleanName.includes("mclaren")) return "mclaren";
  if (cleanId.includes("ferrari") || cleanName.includes("ferrari")) return "ferrari";
  if (cleanId.includes("redbull") || cleanId.includes("red_bull") || cleanName.includes("redbull") || cleanName.includes("red  bull")) return "red_bull";
  if (cleanId.includes("mercedes") || cleanName.includes("mercedes")) return "mercedes";
  if (cleanId.includes("aston") || cleanName.includes("aston")) return "aston_martin";
  if (cleanId.includes("alpine") || cleanName.includes("alpine")) return "alpine";
  if (cleanId.includes("haas") || cleanName.includes("haas")) return "haas";
  if (cleanId.includes("sauber") || cleanId.includes("kick") || cleanName.includes("sauber") || cleanName.includes("kick")) return "sauber";
  if (cleanId.includes("williams") || cleanName.includes("williams")) return "williams";
  if (cleanId.includes("rb") || cleanId.includes("racingbulls") || cleanId.includes("alphatauri") || cleanId.includes("tororosso") || cleanName.includes("rb f1") || cleanName.includes("racing bulls") || cleanName.includes("alphatauri") || cleanName.includes("toro rosso")) return "rb";

  return rawId || "unknown";
}

// ─── RESULT STATUS NORMALIZATION ────────────────────────────────────────────────────

/**
 * Normalizes complex raw race status strings into exact semantic classification categories.
 * Preserves classified lapped finishes instead of conflating them with DNFs.
 */
export function normalizeResultStatus(
  status: string,
  positionText: string,
  laps: number,
  winnerLaps?: number
): { statusType: ResultStatusType; displayStatus: string } {
  const cleanStatus = (status || "").trim();
  const lowerStatus = cleanStatus.toLowerCase();

  // 1. Did Not Start
  if (lowerStatus === "did not start" || lowerStatus === "dns" || lowerStatus === "withdrew") {
    return { statusType: "dns", displayStatus: "DNS" };
  }

  // 2. Disqualified
  if (lowerStatus === "disqualified" || lowerStatus === "dsq") {
    return { statusType: "dsq", displayStatus: "DSQ" };
  }

  // 3. Not Classified
  if (lowerStatus === "not classified" || lowerStatus === "nc" || positionText === "N") {
    return { statusType: "notClassified", displayStatus: "NC" };
  }

  // 4. Lapped or Finished classifications
  if (lowerStatus === "finished" || positionText.match(/^\d+$/)) {
    if (lowerStatus.includes("lap") || lowerStatus.startsWith("+")) {
      const match = lowerStatus.match(/\+(\d+)\s*laps?/);
      const lapsBehind = match ? match[1] : null;
      const display = lapsBehind ? `+${lapsBehind} LAP${Number(lapsBehind) > 1 ? "S" : ""}` : cleanStatus;
      return { statusType: "lapped", displayStatus: display };
    }
    
    // Check if driver is lapped compared to the winner's lap count
    if (winnerLaps && laps > 0 && laps < winnerLaps) {
      const diff = winnerLaps - laps;
      return { statusType: "lapped", displayStatus: `+${diff} LAP${diff > 1 ? "S" : ""}` };
    }

    return { statusType: "finished", displayStatus: cleanStatus };
  }

  // 5. Retired / DNF
  const dnfKeywords = ["accident", "collision", "engine", "gearbox", "hydraulics", "electrical", "retired", "puncture", "spinned", "suspension", "brakes", "clutch", "exhaust", "overheating", "power unit", "out of fuel"];
  if (dnfKeywords.some((k) => lowerStatus.includes(k)) || positionText === "R") {
    return { statusType: "dnf", displayStatus: "DNF" };
  }

  return { statusType: "unknown", displayStatus: cleanStatus };
}

// ─── GAP FORMATTER ─────────────────────────────────────────────────────────────

/**
 * Sanitizes and canonicalizes gap strings. Prevents double-plus prefixes (e.g., ++0.427 -> +0.427).
 * Leaves winner's absolute times untouched.
 */
export function formatRaceGap(gap: string, isWinner: boolean = false): string {
  if (!gap) return "";
  const trimmed = gap.trim();

  if (isWinner) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();
  
  // Handled classified status gaps (like laps) or retired/DNF status
  if (lower.includes("lap") || lower.includes("retired") || lower.includes("dnf") || lower.includes("dns") || lower.includes("dsq") || lower.includes("nc") || lower.includes("finished")) {
    return trimmed;
  }

  // Clean double-plus or spaced-plus prefixes
  let cleanGap = trimmed.replace(/\s+/g, "");
  while (cleanGap.startsWith("+")) {
    cleanGap = cleanGap.slice(1);
  }

  // If numeric or timestamp, prepend a single '+'
  if (cleanGap) {
    return `+${cleanGap}`;
  }

  return trimmed;
}

// ─── SESSION STATE RULES ─────────────────────────────────────────────────────────

/**
 * Resolves session status and progression truth.
 */
export function getNormalizedSessionState(
  session: Session,
  now: number,
  durationMs: number,
  hasResults: boolean
): SessionState {
  const startTime = new Date(`${session.date}T${session.time}`).getTime();
  const endTime = startTime + durationMs;

  if (hasResults) {
    return "completed";
  }

  if (now < startTime) {
    return "upcoming";
  }

  if (now >= startTime && now < endTime) {
    return "live";
  }

  // If time has passed but no results confirm completion
  if (now >= endTime) {
    return "completed"; // Conservative fallback
  }

  return "unknown";
}
