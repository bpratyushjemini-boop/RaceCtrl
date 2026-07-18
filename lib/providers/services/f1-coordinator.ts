/* eslint-disable @typescript-eslint/no-explicit-any */
import { JolpicaProvider } from "../jolpica/jolpica-provider";
import { FastF1Provider } from "../fastf1/fastf1-provider";
import { LiveF1Provider } from "../livef1/livef1-provider";
import { RaceCtrlLiveSession } from "../types";

const jolpica = new JolpicaProvider();
const fastf1 = new FastF1Provider();
const livef1 = new LiveF1Provider();

export const F1Coordinator = {
  /**
   * Routes general F1 schedule, standings, and historical results to Jolpica
   */
  async fetchJolpica(path: string, revalidate?: number): Promise<any> {
    return jolpica.fetch(path, revalidate);
  },

  /**
   * Routes telemetry, sector details, and tire stint histories to FastF1
   */
  async getFastF1Data(year: number, round: number, sessionLabel: string): Promise<any> {
    return fastf1.fetch("session", year, round, sessionLabel);
  },

  /**
   * Routes live clocks, track safety flags, and sector classification timings to LiveF1
   */
  async getLiveSessionTiming(year: number, round: number, sessionLabel: string): Promise<RaceCtrlLiveSession | null> {
    return livef1.fetch("live", year, round, sessionLabel);
  }
};
