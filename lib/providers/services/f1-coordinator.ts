/* eslint-disable @typescript-eslint/no-explicit-any */
import { JolpicaProvider } from "../jolpica/jolpica-provider";
import { FastF1Provider } from "../fastf1/fastf1-provider";
import { LiveF1Provider } from "../livef1/livef1-provider";
import { OpenF1Provider } from "../openf1/openf1-provider";
import { RaceCtrlLiveSession } from "../types";
import { CacheManager } from "../cache/cache-manager";
import { mapSessionLabelToFastF1Code } from "../../api/fastf1-client";

const jolpica = new JolpicaProvider();
const fastf1 = new FastF1Provider();
const livef1 = new LiveF1Provider();
const openf1 = new OpenF1Provider();

export const F1Coordinator = {
  /**
   * Routes general F1 schedule, standings, and historical results to Jolpica
   */
  async fetchJolpica(path: string, revalidate?: number): Promise<any> {
    return jolpica.fetch(path, revalidate);
  },

  /**
   * Routes telemetry, sector details, and tire stint histories.
   * Priority: FastF1 -> OpenF1
   */
  async getFastF1Data(year: number, round: number, sessionLabel: string): Promise<any> {
    try {
      console.log(`[F1Coordinator] Attempting FastF1 for telemetry: ${year} Round ${round} ${sessionLabel}`);
      const data = await fastf1.fetch("session", year, round, sessionLabel);
      if (data && fastf1.validate("session", data)) {
        return data;
      }
    } catch (err) {
      console.warn("[F1Coordinator] FastF1 fetch failed, trying OpenF1:", err);
    }

    try {
      console.log(`[F1Coordinator] Attempting OpenF1 for telemetry: ${year} Round ${round} ${sessionLabel}`);
      const data = await openf1.fetch("session", year, round, sessionLabel);
      if (data && openf1.validate("session", data)) {
        return data;
      }
    } catch (err) {
      console.warn("[F1Coordinator] OpenF1 telemetry fetch failed:", err);
    }

    return null;
  },

  /**
   * Routes live clocks, track safety flags, and sector classification timings.
   * Priority: LiveF1 -> OpenF1 -> Cache
   */
  async getLiveSessionTiming(year: number, round: number, sessionLabel: string): Promise<RaceCtrlLiveSession | null> {
    try {
      console.log(`[F1Coordinator] Attempting LiveF1 for timing: ${year} Round ${round} ${sessionLabel}`);
      const data = await livef1.fetch("live", year, round, sessionLabel);
      if (data && livef1.validate("live", data)) {
        return data;
      }
    } catch (err) {
      console.warn("[F1Coordinator] LiveF1 timing fetch failed, trying OpenF1:", err);
    }

    try {
      console.log(`[F1Coordinator] Attempting OpenF1 for timing: ${year} Round ${round} ${sessionLabel}`);
      const data = await openf1.fetch("live", year, round, sessionLabel);
      if (data && openf1.validate("live", data)) {
        return data;
      }
    } catch (err) {
      console.warn("[F1Coordinator] OpenF1 timing fetch failed, looking in cache:", err);
    }

    // Cache fallback
    const sessionCode = mapSessionLabelToFastF1Code(sessionLabel);
    const cacheKey = `livef1_session_${year}_${round}_${sessionCode}`;
    const openf1CacheKey = `openf1_live_session_${year}_${round}_${sessionCode}`;

    const cachedLiveF1 = CacheManager.get<RaceCtrlLiveSession>(cacheKey, 7 * 24 * 3600 * 1000); // 7 days TTL
    if (cachedLiveF1) {
      return cachedLiveF1;
    }

    const cachedOpenF1 = CacheManager.get<RaceCtrlLiveSession>(openf1CacheKey, 7 * 24 * 3600 * 1000);
    if (cachedOpenF1) {
      return cachedOpenF1;
    }

    return null;
  }
};
