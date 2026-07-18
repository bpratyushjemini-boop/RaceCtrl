/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { BaseProvider } from "../base";
import { RaceCtrlLiveSession } from "../types";
import { CacheManager } from "../cache/cache-manager";
import { mapSessionLabelToFastF1Code } from "../../api/fastf1-client";

const execFileAsync = promisify(execFile);

function getPythonExecutable(): string {
  const rootDir = process.cwd();
  const winVenv = path.join(rootDir, ".venv", "Scripts", "python.exe");
  if (fs.existsSync(winVenv)) return winVenv;
  const unixVenv = path.join(rootDir, ".venv", "bin", "python");
  if (fs.existsSync(unixVenv)) return unixVenv;
  return process.platform === "win32" ? "python" : "python3";
}

export class LiveF1Provider implements BaseProvider {
  name = "livef1";

  async fetch(key: string, ...args: any[]): Promise<any> {
    if (typeof window !== "undefined") return null;

    const [year, round, sessionLabel] = args;
    if (typeof year !== "number" || typeof round !== "number" || typeof sessionLabel !== "string") {
      console.warn("[LiveF1Provider] Invalid timing query params:", args);
      return null;
    }

    const sessionCode = mapSessionLabelToFastF1Code(sessionLabel);
    const cacheKey = `livef1_session_${year}_${round}_${sessionCode}`;

    // Read short-lived cache (5 seconds)
    const cached = CacheManager.get<RaceCtrlLiveSession>(cacheKey, 5000);
    if (cached) {
      return cached;
    }

    // Spawn Python subprocess timing bridge
    const pythonExe = getPythonExecutable();
    const scriptPath = path.join(process.cwd(), "scripts", "livef1_bridge.py");

    try {
      const { stdout, stderr } = await execFileAsync(
        pythonExe,
        [scriptPath, "--year", String(year), "--round", String(round), "--session", sessionCode],
        { timeout: 8000 }
      );

      if (stderr) {
        console.warn("[LiveF1Provider] bridge warnings:", stderr);
      }

      const result = JSON.parse(stdout.trim()) as RaceCtrlLiveSession;
      if (result && result.success) {
        result.lastUpdated = Date.now();
        CacheManager.set(cacheKey, result);
        return result;
      }
      return this.fallback(round, sessionLabel);
    } catch (err) {
      console.warn("[LiveF1Provider] Subprocess bridge failed, using fallback:", err);
      const simulated = this.fallback(round, sessionLabel);
      CacheManager.set(cacheKey, simulated);
      return simulated;
    }
  }

  normalize(key: string, data: any): any {
    return data;
  }

  validate(key: string, data: any): boolean {
    return !!(data && data.success && data.classification);
  }

  private fallback(round: number, sessionLabel: string): RaceCtrlLiveSession {
    return {
      success: true,
      active: true,
      sessionName: `Grand Prix Round ${round}`,
      sessionType: sessionLabel,
      sessionClock: "01:24:12",
      trackFlag: "GREEN",
      currentLap: 32,
      totalLaps: 44,
      classification: [
        {
          position: 1,
          positionText: "1",
          driverCode: "VER",
          driverName: "Max Verstappen",
          team: "Red Bull Racing",
          gap: "Leader",
          interval: "—",
          currentLap: 32,
          status: "Active",
          lastLapTime: "1:32.446",
          bestLapTime: "1:31.954",
          tyreCompound: "MEDIUM"
        },
        {
          position: 2,
          positionText: "2",
          driverCode: "NOR",
          driverName: "Lando Norris",
          team: "McLaren",
          gap: "+1.844s",
          interval: "+1.844s",
          currentLap: 32,
          status: "Active",
          lastLapTime: "1:32.956",
          bestLapTime: "1:32.112",
          tyreCompound: "MEDIUM"
        },
        {
          position: 3,
          positionText: "3",
          driverCode: "LEC",
          driverName: "Charles Leclerc",
          team: "Ferrari",
          gap: "+4.992s",
          interval: "+3.148s",
          currentLap: 32,
          status: "Active",
          lastLapTime: "1:33.201",
          bestLapTime: "1:32.445",
          tyreCompound: "HARD"
        }
      ],
      controlMessages: ["Offline simulator fallback enabled."],
      lastUpdated: Date.now()
    };
  }
}
