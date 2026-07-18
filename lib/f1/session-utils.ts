/**
 * Session utility functions — shared across providers.
 * Extracted from the former fastf1-client.ts to eliminate Python dependency.
 */

/** Map frontend session labels to standard session codes. */
export function mapSessionLabelToCode(label: string): string {
  const norm = label.toLowerCase().replace(/\s+/g, "");
  if (norm.includes("practice1") || norm.includes("fp1")) return "FP1";
  if (norm.includes("practice2") || norm.includes("fp2")) return "FP2";
  if (norm.includes("practice3") || norm.includes("fp3")) return "FP3";
  if (norm.includes("sprintqualifying") || norm.includes("sq") || norm.includes("sprintshootout")) return "SQ";
  if (norm.includes("sprint") && !norm.includes("qualifying")) return "S";
  if (norm.includes("qualifying") || norm === "q") return "Q";
  if (norm.includes("race") || norm === "r") return "R";
  return "R";
}

/** Session data types used by providers (formerly FastF1 types). */

export interface SessionInfo {
  year: number;
  round: number;
  sessionCode: string;
  sessionName: string;
  sessionType: string;
  circuitName: string;
  date: string;
}

export interface ClassificationEntry {
  position: number;
  positionText: string;
  driverNumber: string;
  driverCode: string;
  driverName: string;
  team: string;
  gap: string;
  status: string;
  fastestLapTime: string;
  sector1?: string;
  sector2?: string;
  sector3?: string;
  compound?: string;
  points: number;
}

export interface TyreStint {
  stintNumber: number;
  compound: string;
  lapCount: number;
  startLap: number;
  endLap: number;
}

export interface TelemetryTrace {
  driverCode: string;
  lapTime: string;
  distance: number[];
  speed: number[];
  throttle: number[];
  brake: boolean[];
  gear: number[];
}

export interface SessionData {
  success: boolean;
  errorType?: "not_published" | "not_supported" | null;
  error?: string;
  info?: SessionInfo;
  classification?: ClassificationEntry[];
  stints?: Record<string, TyreStint[]>;
  telemetry?: TelemetryTrace | null;
}
