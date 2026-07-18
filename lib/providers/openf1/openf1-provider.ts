/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseProvider } from "../base";
import { RaceCtrlLiveSession, RaceCtrlLiveDriverClassification } from "../types";
import { CacheManager } from "../cache/cache-manager";
import { mapSessionLabelToCode } from "../../f1/session-utils";
import { getRaceSchedule } from "../../api/f1";
import type { SessionData, TelemetryTrace, ClassificationEntry, TyreStint } from "../../f1/session-utils";

const BASE_URL = "https://api.openf1.org/v1";

function formatTimeDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
  }
  return secs.toFixed(3);
}

function formatGap(seconds: any): string {
  if (seconds === null || seconds === undefined) return "—";
  if (typeof seconds === "string") return seconds;
  if (seconds === 0) return "Leader";
  return `+${Number(seconds).toFixed(3)}s`;
}

export class OpenF1Provider implements BaseProvider {
  name = "openf1";

  async fetch(key: string, ...args: any[]): Promise<any> {
    if (typeof window !== "undefined") return null;

    const [year, round, sessionLabel] = args;
    if (typeof year !== "number" || typeof round !== "number" || typeof sessionLabel !== "string") {
      console.warn("[OpenF1Provider] Invalid timing/session parameters:", args);
      return null;
    }

    const sessionCode = mapSessionLabelToCode(sessionLabel);
    const cacheKey = `openf1_${key}_session_${year}_${round}_${sessionCode}`;

    // Stricter TTL mapping
    const ttl = key === "live" ? 5000 : 300000; // 5s for live timing, 5m for telemetry/session data
    const cached = CacheManager.get<any>(cacheKey, ttl);
    if (cached) {
      return cached;
    }

    try {
      let result = null;
      if (key === "live") {
        result = await this.fetchLiveTiming(year, round, sessionLabel);
      } else if (key === "session") {
        result = await this.fetchSessionData(year, round, sessionLabel);
      }

      if (result) {
        CacheManager.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.warn(`[OpenF1Provider] Fetch failed for key ${key}:`, err);
    }
    return null;
  }

  normalize(key: string, data: any): any {
    return data;
  }

  validate(key: string, data: any): boolean {
    return !!(data && data.success);
  }

  private async getSessionKey(year: number, round: number, sessionLabel: string): Promise<{ sessionKey: number; circuitName: string; meetingName: string } | null> {
    const cacheKey = `openf1_session_key_${year}_${round}_${sessionLabel}`;
    const cached = CacheManager.get<{ sessionKey: number; circuitName: string; meetingName: string }>(cacheKey, 24 * 3600 * 1000); // cache session key for 24h
    if (cached) return cached;

    // 1. Fetch Jolpica schedule
    const schedule = await getRaceSchedule();
    const weekend = schedule.find((r) => r.round === round);
    if (!weekend) return null;

    // 2. Fetch OpenF1 sessions for this year
    const sessionsUrl = `${BASE_URL}/sessions?year=${year}`;
    const res = await fetch(sessionsUrl);
    if (!res.ok) return null;

    const sessions = await res.json();
    if (!Array.isArray(sessions) || sessions.length === 0) return null;

    // 3. Find matching session
    const targetCode = mapSessionLabelToCode(sessionLabel);
    const targetCountry = weekend.country.toLowerCase().replace(/[^a-z0-9]/g, "");

    const matches = sessions.filter((s: any) => {
      const sCountry = (s.country_name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const sCircuit = (s.circuit_short_name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const sCode = mapSessionLabelToCode(s.session_name || s.session_type || "");
      
      const countryMatch = sCountry.includes(targetCountry) || targetCountry.includes(sCountry) ||
                           sCircuit.includes(targetCountry) || targetCountry.includes(sCircuit);
      return countryMatch && sCode === targetCode;
    });

    if (matches.length === 0) return null;

    // Find the one closest in date to scheduled date
    const targetDateStr = weekend.sessions.find(
      (s) => mapSessionLabelToCode(s.label) === targetCode
    )?.date || weekend.sessions[weekend.sessions.length - 1]?.date;
    
    let bestMatch = matches[0];
    if (targetDateStr && matches.length > 1) {
      const targetTime = new Date(targetDateStr).getTime();
      let minDiff = Infinity;
      for (const m of matches) {
        const mTime = new Date(m.date_start).getTime();
        const diff = Math.abs(mTime - targetTime);
        if (diff < minDiff) {
          minDiff = diff;
          bestMatch = m;
        }
      }
    }

    const result = {
      sessionKey: Number(bestMatch.session_key),
      circuitName: bestMatch.circuit_short_name || weekend.circuitName,
      meetingName: bestMatch.meeting_name || weekend.raceName
    };
    
    CacheManager.set(cacheKey, result);
    return result;
  }

  private async fetchLiveTiming(year: number, round: number, sessionLabel: string): Promise<RaceCtrlLiveSession | null> {
    const sessionInfo = await this.getSessionKey(year, round, sessionLabel);
    if (!sessionInfo) return null;

    const { sessionKey } = sessionInfo;

    // Fetch concurrently
    const [driversRes, positionsRes, intervalsRes, lapsRes, stintsRes, weatherRes, raceControlRes] = await Promise.all([
      fetch(`${BASE_URL}/drivers?session_key=${sessionKey}`),
      fetch(`${BASE_URL}/position?session_key=${sessionKey}`),
      fetch(`${BASE_URL}/intervals?session_key=${sessionKey}`),
      fetch(`${BASE_URL}/laps?session_key=${sessionKey}`),
      fetch(`${BASE_URL}/stints?session_key=${sessionKey}`),
      fetch(`${BASE_URL}/weather?session_key=${sessionKey}`),
      fetch(`${BASE_URL}/race_control?session_key=${sessionKey}`)
    ]);

    const drivers = driversRes.ok ? await driversRes.json() : [];
    const positions = positionsRes.ok ? await positionsRes.json() : [];
    const intervals = intervalsRes.ok ? await intervalsRes.json() : [];
    const laps = lapsRes.ok ? await lapsRes.json() : [];
    const stints = stintsRes.ok ? await stintsRes.json() : [];
    const weather = weatherRes.ok ? await weatherRes.json() : [];
    const raceControl = raceControlRes.ok ? await raceControlRes.json() : [];

    if (!Array.isArray(drivers) || drivers.length === 0) return null;

    // Process drivers mapping
    const driverMap = new Map<number, any>();
    for (const d of drivers) {
      driverMap.set(Number(d.driver_number), d);
    }

    // Process latest position
    const latestPosMap = new Map<number, number>();
    if (Array.isArray(positions)) {
      const sortedPos = [...positions].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      for (const p of sortedPos) {
        latestPosMap.set(Number(p.driver_number), Number(p.position));
      }
    }

    // Process latest intervals
    const latestIntervalMap = new Map<number, any>();
    if (Array.isArray(intervals)) {
      const sortedInt = [...intervals].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      for (const i of sortedInt) {
        latestIntervalMap.set(Number(i.driver_number), i);
      }
    }

    // Process laps
    const driverLapsMap = new Map<number, any[]>();
    if (Array.isArray(laps)) {
      for (const l of laps) {
        const dNum = Number(l.driver_number);
        if (!driverLapsMap.has(dNum)) {
          driverLapsMap.set(dNum, []);
        }
        driverLapsMap.get(dNum)!.push(l);
      }
    }

    // Process stints
    const latestStintMap = new Map<number, any>();
    if (Array.isArray(stints)) {
      const sortedStints = [...stints].sort((a: any, b: any) => Number(a.stint_number) - Number(b.stint_number));
      for (const s of sortedStints) {
        latestStintMap.set(Number(s.driver_number), s);
      }
    }

    // Map flag
    let trackFlag: RaceCtrlLiveSession["trackFlag"] = "GREEN";
    const controlMessages: string[] = [];
    if (Array.isArray(raceControl)) {
      const sortedRc = [...raceControl].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      for (const rc of sortedRc) {
        if (rc.message) {
          controlMessages.push(rc.message);
        }
        if (rc.flag) {
          const f = String(rc.flag).toUpperCase();
          if (f === "RED") trackFlag = "RED";
          else if (f === "YELLOW") trackFlag = "YELLOW";
          else if (f === "GREEN" || f === "CLEAR") trackFlag = "GREEN";
          else if (f.includes("SAFETY") && f.includes("CAR")) trackFlag = "SAFETY_CAR";
          else if (f.includes("VSC") || f.includes("VIRTUAL")) trackFlag = "VSC";
        }
      }
    }

    // Compute active lap
    let currentLap = 0;
    const classification: RaceCtrlLiveDriverClassification[] = [];

    for (const [dNum, dInfo] of driverMap.entries()) {
      const pos = latestPosMap.get(dNum) || 99;
      const intInfo = latestIntervalMap.get(dNum);
      const dLaps = driverLapsMap.get(dNum) || [];
      const stintInfo = latestStintMap.get(dNum);

      let maxLap = 0;
      let lastLapTime = "—";
      let bestLapTime = "—";
      let bestLapSec = Infinity;

      for (const l of dLaps) {
        const lNum = Number(l.lap_number) || 0;
        if (lNum > maxLap) maxLap = lNum;
        
        const dur = Number(l.lap_duration);
        if (dur > 0) {
          lastLapTime = formatTimeDuration(dur);
          if (dur < bestLapSec) {
            bestLapSec = dur;
            bestLapTime = formatTimeDuration(dur);
          }
        }
      }

      if (maxLap > currentLap) {
        currentLap = maxLap;
      }

      const compound = stintInfo?.compound ? String(stintInfo.compound).toUpperCase() : "—";
      const gapVal = intInfo?.gap_to_leader !== undefined ? intInfo.gap_to_leader : null;
      const intVal = intInfo?.interval !== undefined ? intInfo.interval : null;

      classification.push({
        position: pos,
        positionText: String(pos),
        driverCode: dInfo.name_acronym || dInfo.last_name?.slice(0, 3).toUpperCase() || String(dNum),
        driverName: dInfo.full_name || dInfo.broadcast_name || dInfo.first_name + " " + dInfo.last_name,
        team: dInfo.team_name || "—",
        gap: formatGap(gapVal),
        interval: formatGap(intVal),
        currentLap: maxLap,
        status: maxLap === 0 ? "Out" : "Active",
        lastLapTime,
        bestLapTime,
        tyreCompound: compound,
      });
    }

    // Sort classification by position
    classification.sort((a, b) => a.position - b.position);

    // Weather latest
    let weatherMsg = "";
    if (Array.isArray(weather) && weather.length > 0) {
      const sortedW = [...weather].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const latestW = sortedW[sortedW.length - 1];
      weatherMsg = `Air Temp: ${latestW.air_temperature}°C | Track: ${latestW.track_temperature}°C | Rain: ${latestW.rainfall ? "Yes" : "No"}`;
      if (weatherMsg) {
        controlMessages.push(weatherMsg);
      }
    }

    return {
      success: true,
      active: true,
      sessionName: sessionInfo.meetingName,
      sessionType: sessionLabel,
      sessionClock: "01:00:00",
      trackFlag,
      currentLap,
      totalLaps: 50,
      classification,
      controlMessages: controlMessages.slice(-5),
      lastUpdated: Date.now(),
    };
  }

  private async fetchSessionData(year: number, round: number, sessionLabel: string): Promise<SessionData | null> {
    const sessionInfo = await this.getSessionKey(year, round, sessionLabel);
    if (!sessionInfo) return null;

    const { sessionKey } = sessionInfo;

    // Fetch drivers, laps, stints
    const [driversRes, lapsRes, stintsRes] = await Promise.all([
      fetch(`${BASE_URL}/drivers?session_key=${sessionKey}`),
      fetch(`${BASE_URL}/laps?session_key=${sessionKey}`),
      fetch(`${BASE_URL}/stints?session_key=${sessionKey}`)
    ]);

    const drivers = driversRes.ok ? await driversRes.json() : [];
    const laps = lapsRes.ok ? await lapsRes.json() : [];
    const stints = stintsRes.ok ? await stintsRes.json() : [];

    if (!Array.isArray(drivers) || drivers.length === 0) return null;

    const driverMap = new Map<number, any>();
    for (const d of drivers) {
      driverMap.set(Number(d.driver_number), d);
    }

    // Build classification & stints per driver
    const stintsMap: Record<string, TyreStint[]> = {};
    const classification: ClassificationEntry[] = [];
    const driverLapsMap = new Map<number, any[]>();
    
    if (Array.isArray(laps)) {
      for (const l of laps) {
        const dNum = Number(l.driver_number);
        if (!driverLapsMap.has(dNum)) {
          driverLapsMap.set(dNum, []);
        }
        driverLapsMap.get(dNum)!.push(l);
      }
    }

    if (Array.isArray(stints)) {
      for (const s of stints) {
        const dNum = Number(s.driver_number);
        const dInfo = driverMap.get(dNum);
        if (!dInfo) continue;
        const code = dInfo.name_acronym || String(dNum);
        if (!stintsMap[code]) {
          stintsMap[code] = [];
        }
        stintsMap[code].push({
          stintNumber: Number(s.stint_number) || 1,
          compound: s.compound ? String(s.compound).toUpperCase() : "—",
          lapCount: (Number(s.lap_end) - Number(s.lap_start) + 1) || 0,
          startLap: Number(s.lap_start) || 1,
          endLap: Number(s.lap_end) || 1,
        });
      }
    }

    let fastestLap: any = null;
    let fastestLapSec = Infinity;
    let fastestDriverNumber = 0;

    for (const [dNum, dLaps] of driverLapsMap.entries()) {
      const dInfo = driverMap.get(dNum);
      if (!dInfo) continue;
      const code = dInfo.name_acronym || String(dNum);

      let bestLapTimeStr = "—";
      let bestLapSec = Infinity;
      const pos = 99;

      for (const l of dLaps) {
        const dur = Number(l.lap_duration);
        if (dur > 0 && dur < bestLapSec) {
          bestLapSec = dur;
          bestLapTimeStr = formatTimeDuration(dur);
        }
        if (dur > 0 && dur < fastestLapSec) {
          fastestLapSec = dur;
          fastestLap = l;
          fastestDriverNumber = dNum;
        }
      }

      classification.push({
        position: pos,
        positionText: "—",
        driverNumber: String(dNum),
        driverCode: code,
        driverName: dInfo.full_name || dInfo.broadcast_name || dInfo.first_name + " " + dInfo.last_name,
        team: dInfo.team_name || "—",
        gap: "—",
        status: "Finished",
        fastestLapTime: bestLapTimeStr,
        points: 0,
      });
    }

    let telemetry: TelemetryTrace | null = null;
    if (fastestLap && fastestDriverNumber > 0) {
      const dInfo = driverMap.get(fastestDriverNumber);
      const code = dInfo?.name_acronym || String(fastestDriverNumber);
      
      const dateStart = fastestLap.date_start;
      const dateEnd = fastestLap.date_end;
      
      if (dateStart && dateEnd) {
        const carDataUrl = `${BASE_URL}/car_data?session_key=${sessionKey}&driver_number=${fastestDriverNumber}&date>=${dateStart}&date<=${dateEnd}`;
        const telRes = await fetch(carDataUrl);
        if (telRes.ok) {
          const samples = await telRes.json();
          if (Array.isArray(samples) && samples.length > 0) {
            const sortedSamples = [...samples].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            let cumDistance = 0;
            const distance: number[] = [];
            const speed: number[] = [];
            const throttle: number[] = [];
            const brake: boolean[] = [];
            const gear: number[] = [];
            
            for (let i = 0; i < sortedSamples.length; i++) {
              const sample = sortedSamples[i];
              const sVal = Number(sample.speed) || 0;
              const tVal = Number(sample.throttle) || 0;
              const bVal = (Number(sample.brake) || 0) > 0;
              const gVal = Number(sample.n_gear) || 0;
              
              if (i > 0) {
                const dt = (new Date(sample.date).getTime() - new Date(sortedSamples[i-1].date).getTime()) / 1000;
                if (dt > 0 && dt < 5) {
                  cumDistance += (sVal / 3.6) * dt;
                }
              }
              
              distance.push(cumDistance);
              speed.push(sVal);
              throttle.push(tVal);
              brake.push(bVal);
              gear.push(gVal);
            }
            
            const dsDistance: number[] = [];
            const dsSpeed: number[] = [];
            const dsThrottle: number[] = [];
            const dsBrake: boolean[] = [];
            const dsGear: number[] = [];
            
            if (distance.length > 0) {
              for (let idx = 0; idx < 100; idx++) {
                const floatIndex = (idx / 99) * (distance.length - 1);
                const low = Math.floor(floatIndex);
                const high = Math.min(low + 1, distance.length - 1);
                const weight = floatIndex - low;
                
                dsDistance.push(distance[low] + weight * (distance[high] - distance[low]));
                dsSpeed.push(Math.round(speed[low] + weight * (speed[high] - speed[low])));
                dsThrottle.push(Math.round(throttle[low] + weight * (throttle[high] - throttle[low])));
                dsBrake.push(weight > 0.5 ? brake[high] : brake[low]);
                dsGear.push(weight > 0.5 ? gear[high] : gear[low]);
              }
            }
            
            telemetry = {
              driverCode: code,
              lapTime: formatTimeDuration(fastestLap.lap_duration),
              distance: dsDistance,
              speed: dsSpeed,
              throttle: dsThrottle,
              brake: dsBrake,
              gear: dsGear
            };
          }
        }
      }
    }

    return {
      success: true,
      info: {
        year,
        round,
        sessionCode: mapSessionLabelToCode(sessionLabel),
        sessionName: sessionInfo.meetingName,
        sessionType: sessionLabel,
        circuitName: sessionInfo.circuitName,
        date: new Date().toISOString()
      },
      classification,
      stints: stintsMap,
      telemetry
    };
  }
}
