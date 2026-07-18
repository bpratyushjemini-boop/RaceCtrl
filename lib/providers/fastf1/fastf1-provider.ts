/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseProvider } from "../base";
import { getFastF1SessionData } from "../../api/fastf1-client";

export class FastF1Provider implements BaseProvider {
  name = "fastf1";

  async fetch(key: string, ...args: any[]): Promise<any> {
    const [year, round, sessionLabel] = args;
    if (typeof year !== "number" || typeof round !== "number" || typeof sessionLabel !== "string") {
      console.warn("[FastF1Provider] Invalid arguments passed:", args);
      return null;
    }
    return getFastF1SessionData(year, round, sessionLabel);
  }

  normalize(key: string, data: any): any {
    return data;
  }

  validate(key: string, data: any): boolean {
    return !!(data && data.success);
  }
}
