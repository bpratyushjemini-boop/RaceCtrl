/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseProvider } from "../base";
import { RaceCtrlLiveSession } from "../types";
import { CacheManager } from "../cache/cache-manager";
import { mapSessionLabelToCode } from "../../f1/session-utils";
import { OpenF1Provider } from "../openf1/openf1-provider";

/**
 * LiveF1 Provider — fetches live timing data via OpenF1 HTTP API.
 * No Python runtime dependency.
 */
export class LiveF1Provider implements BaseProvider {
  name = "livef1";
  private openf1 = new OpenF1Provider();

  async fetch(key: string, ...args: any[]): Promise<any> {
    if (typeof window !== "undefined") return null;

    const [year, round, sessionLabel] = args;
    if (typeof year !== "number" || typeof round !== "number" || typeof sessionLabel !== "string") {
      console.warn("[LiveF1Provider] Invalid timing query params:", args);
      return null;
    }

    const sessionCode = mapSessionLabelToCode(sessionLabel);
    const cacheKey = `livef1_session_${year}_${round}_${sessionCode}`;

    // Read short-lived cache (5 seconds)
    const cached = CacheManager.get<RaceCtrlLiveSession>(cacheKey, 5000);
    if (cached) {
      return cached;
    }

    // Use OpenF1 HTTP API directly (no Python subprocess)
    try {
      const data = await this.openf1.fetch("live", year, round, sessionLabel);
      if (data && data.success) {
        data.lastUpdated = Date.now();
        CacheManager.set(cacheKey, data);
        return data;
      }
    } catch (err) {
      console.warn("[LiveF1Provider] OpenF1 HTTP fetch failed:", err);
    }

    return null;
  }

  normalize(key: string, data: any): any {
    return data;
  }

  validate(key: string, data: any): boolean {
    return !!(data && data.success && data.classification);
  }
}
