import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export interface FastF1Info {
  year: number;
  round: number;
  sessionCode: string;
  sessionName: string;
  sessionType: string;
  circuitName: string;
  date: string;
}

export interface FastF1ClassificationEntry {
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

export interface FastF1Stint {
  stintNumber: number;
  compound: string;
  lapCount: number;
  startLap: number;
  endLap: number;
}

export interface FastF1Telemetry {
  driverCode: string;
  lapTime: string;
  distance: number[];
  speed: number[];
  throttle: number[];
  brake: boolean[];
  gear: number[];
}

export interface FastF1SessionData {
  success: boolean;
  errorType?: "config_error" | "not_published" | "not_supported" | null;
  error?: string;
  info?: FastF1Info;
  classification?: FastF1ClassificationEntry[];
  stints?: Record<string, FastF1Stint[]>;
  telemetry?: FastF1Telemetry | null;
}

// Map frontend session labels to FastF1 codes
export function mapSessionLabelToFastF1Code(label: string): string {
  const norm = label.toLowerCase().replace(/\s+/g, "");
  if (norm.includes("practice1") || norm.includes("fp1")) return "FP1";
  if (norm.includes("practice2") || norm.includes("fp2")) return "FP2";
  if (norm.includes("practice3") || norm.includes("fp3")) return "FP3";
  if (norm.includes("sprintqualifying") || norm.includes("sq") || norm.includes("sprintshootout")) return "SQ";
  if (norm.includes("sprint")) return "S";
  if (norm.includes("qualifying") || norm === "q") return "Q";
  if (norm.includes("race") || norm === "r") return "R";
  return "R";
}

// Resolve python executable path dynamically
function getPythonExecutable(): string {
  const rootDir = process.cwd();
  
  // Try Windows virtual env
  const winVenv = path.join(rootDir, ".venv", "Scripts", "python.exe");
  if (fs.existsSync(winVenv)) {
    return winVenv;
  }
  
  // Try Unix/macOS virtual env
  const unixVenv = path.join(rootDir, ".venv", "bin", "python");
  if (fs.existsSync(unixVenv)) {
    return unixVenv;
  }
  
  // Fallback to global python
  return process.platform === "win32" ? "python" : "python3";
}

/**
 * Loads session data from FastF1.
 * First checks local JSON filesystem cache. If not found, spawns python script to fetch & cache it.
 * Returns structured error info if Python/FastF1 is not configured or errors.
 */
export async function getFastF1SessionData(
  year: number,
  round: number,
  sessionLabel: string
): Promise<FastF1SessionData> {
  const sessionCode = mapSessionLabelToFastF1Code(sessionLabel);
  const cacheDir = path.join(process.cwd(), "data", "fastf1_cache");
  const cacheFile = path.join(cacheDir, `session_${year}_${round}_${sessionCode}.json`);

  // 1. Return cached file if it exists
  if (fs.existsSync(cacheFile)) {
    try {
      const dataStr = fs.readFileSync(cacheFile, "utf-8");
      const parsed = JSON.parse(dataStr) as FastF1SessionData;
      if (parsed.success) {
        return parsed;
      }
    } catch (err) {
      console.warn(`Failed to read/parse FastF1 cache file: ${cacheFile}`, err);
    }
  }

  // 2. Early exit if deployed on Vercel or read-only production target without venv
  const pythonExe = getPythonExecutable();
  const isVercel = !!(process.env.VERCEL || process.env.NOW_BUILDER);
  if (isVercel || (process.env.NODE_ENV === "production" && !fs.existsSync(pythonExe))) {
    return {
      success: false,
      errorType: "config_error",
      error: "FastF1 analytics engine requires a local Python environment and is not available in the cloud deployment."
    };
  }

  // 3. Spawn python bridge script
  const scriptPath = path.join(process.cwd(), "scripts", "fastf1_bridge.py");

  try {
    console.log(`Executing FastF1 bridge: ${pythonExe} ${scriptPath} --year ${year} --round ${round} --session ${sessionCode}`);
    const { stdout, stderr } = await execFileAsync(
      pythonExe,
      [scriptPath, "--year", String(year), "--round", String(round), "--session", sessionCode],
      {
        timeout: 90000, // 90 seconds timeout for raw downloads (heavy)
        maxBuffer: 10 * 1024 * 1024, // 10MB stdout buffer size
      }
    );

    if (stderr) {
      console.warn("FastF1 bridge stderr:", stderr);
    }

    const result = JSON.parse(stdout.trim()) as FastF1SessionData;
    if (result && result.success) {
      return result;
    } else {
      console.warn("FastF1 bridge returned failure:", result?.error);
      return {
        success: false,
        errorType: result?.errorType || "not_published",
        error: result?.error || "FastF1 session details could not be loaded."
      };
    }
  } catch (err) {
    console.error(`FastF1 bridge process execution failed:`, err);
    const errorObject = err as Record<string, unknown> & { code?: string; killed?: boolean; signal?: string };
    let errorType: "config_error" | "not_published" | "not_supported" = "config_error";
    let errorMsg = "FastF1 bridge process execution failed.";

    if (errorObject.code === "ENOENT") {
      errorMsg = "Python interpreter was not found. Please ensure Python is installed and configured.";
    } else if (errorObject.killed && errorObject.signal === "SIGTERM") {
      errorMsg = "FastF1 bridge execution timed out.";
      errorType = "not_published";
    }

    return {
      success: false,
      errorType,
      error: errorMsg
    };
  }
}
