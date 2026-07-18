/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseProvider } from "../base";
import { getOfflineMockForPath } from "../../api/offline-mocks";

const BASE_URL = "https://api.jolpi.ca/ergast/f1";
let resolvedSeason = "2026";

export function getResolvedJolpicaSeason(): string {
  return resolvedSeason;
}

function updateResolvedSeason(data: any) {
  if (!data || typeof data !== "object") return;
  const mr = data.MRData;
  if (!mr) return;
  let season = mr.season;
  if (!season && mr.StandingsTable) {
    season = mr.StandingsTable.season || mr.StandingsTable.StandingsLists?.[0]?.season;
  }
  if (!season && mr.RaceTable) {
    season = mr.RaceTable.season || mr.RaceTable.Races?.[0]?.season;
  }
  if (season) {
    resolvedSeason = String(season);
  }
}

export class JolpicaProvider implements BaseProvider {
  name = "jolpica";

  async fetch(path: string, revalidate = 300): Promise<any> {
    const url = `${BASE_URL}/${path}`;

    if (typeof path !== "string" || path.includes("..") || path.includes(":") || !/^[a-zA-Z0-9_\-\/\.\?&=]+$/.test(path)) {
      console.warn(`[JolpicaProvider] Blocked invalid/unsafe path: ${path}`);
      const mock = getOfflineMockForPath(path);
      updateResolvedSeason(mock);
      return mock;
    }

    try {
      const res = await fetch(url, {
        next: { revalidate },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.warn(`[JolpicaProvider] Status error ${res.status} for ${path}. Loading mock.`);
        const mock = getOfflineMockForPath(path);
        updateResolvedSeason(mock);
        return mock;
      }

      const data = await res.json();
      updateResolvedSeason(data);
      return data;
    } catch (err) {
      console.warn(`[JolpicaProvider] Fetch failed for ${path}:`, err);
      const mock = getOfflineMockForPath(path);
      updateResolvedSeason(mock);
      return mock;
    }
  }

  normalize(key: string, data: any): any {
    return data;
  }

  validate(key: string, data: any): boolean {
    return !!(data && data.MRData);
  }
}
