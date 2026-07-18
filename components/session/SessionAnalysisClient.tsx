"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { DriverAvatar } from "@/components/ui/DriverAvatar";
import { getTeamColor } from "@/lib/team-colors";
import type { FastF1SessionData } from "@/lib/api/fastf1-client";
import type { LastRaceData, RaceResult } from "@/lib/types";
import { RaceStory } from "./RaceStory";
import { RaceReplay } from "./RaceReplay";

interface SessionAnalysisClientProps {
  round: number;
  sessionName: string;
  fastF1Data: FastF1SessionData | null;
  fallbackData: LastRaceData | null; // jolpica results if race
  sessionDate?: string | null;
  sessionTime?: string | null;
}

interface DisplayClassificationEntry {
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

const COMPOUND_COLORS: Record<string, string> = {
  SOFT: "#E10600",
  MEDIUM: "#FFD200",
  HARD: "#F0F0F0",
  INTERMEDIATE: "#39B54A",
  WET: "#00A3E0",
  HYPERSOFT: "#FF87BC",
  ULTRASOFT: "#B346B3",
  SUPERSOFT: "#FF3333",
  MEDIUM_OLD: "#E2C300",
  HARD_OLD: "#CCCCCC",
  TEST: "#888888",
  UNKNOWN: "#888888",
};

export default function SessionAnalysisClient({
  round,
  sessionName,
  fastF1Data,
  fallbackData,
  sessionDate,
  sessionTime,
}: SessionAnalysisClientProps) {
  const [activeTab, setActiveTab] = useState<"classification" | "stints" | "telemetry" | "replay">("classification");

  // Telemetry scrub state
  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement | null>(null);

  const isRaceOrSprint = sessionName.toLowerCase().includes("race") || sessionName.toLowerCase().includes("sprint");

  // Determine classification source
  const hasFastF1 = !!(fastF1Data && fastF1Data.success);

  // Determine session timing state relative to scheduled time
  const [now] = useState<number>(() => Date.now());
  const sessionTimestamp = sessionDate && sessionTime
    ? new Date(`${sessionDate}T${sessionTime}`).getTime()
    : null;

  const isRace = sessionName.toLowerCase().includes("race");
  const sessionDuration = isRace ? 3 * 3600000 : 3600000;

  let statusReason = "FastF1 analysis is unavailable.";
  let statusTitle = "FastF1 Engine Unavailable";

  if (sessionTimestamp) {
    if (now < sessionTimestamp) {
      statusTitle = "Session Scheduled";
      statusReason = "FastF1 analysis is available after the session finishes.";
    } else if (now >= sessionTimestamp && now < sessionTimestamp + sessionDuration) {
      statusTitle = "Session Live";
      statusReason = "Session data has not been published yet. FastF1 analysis is available after the session finishes.";
    } else {
      if (fastF1Data && fastF1Data.errorType === "config_error") {
        statusTitle = "FastF1 Engine Offline";
        statusReason = "FastF1 analytics engine requires a local Python environment and is not available in the cloud deployment.";
      } else if (fastF1Data && fastF1Data.errorType === "not_supported") {
        statusTitle = "Telemetry Unavailable";
        statusReason = "Telemetry unavailable for this session.";
      } else {
        statusTitle = "Data Not Available";
        statusReason = "FastF1 analysis is not available for this session. Data has not been published by the provider yet.";
      }
    }
  } else {
    if (fastF1Data && fastF1Data.errorType === "config_error") {
      statusTitle = "FastF1 Engine Offline";
      statusReason = "FastF1 analytics engine requires a local Python environment and is not available in the cloud deployment.";
    }
  }

  const classificationList: DisplayClassificationEntry[] = hasFastF1
    ? (fastF1Data!.classification as DisplayClassificationEntry[])
    : fallbackData
    ? fallbackData.results.map((r: RaceResult) => ({
        position: r.position,
        positionText: r.positionText,
        driverNumber: r.driverNumber,
        driverCode: r.driverCode,
        driverName: r.driverName,
        team: r.team,
        gap: r.gap,
        status: r.status,
        fastestLapTime: r.fastestLapTime || "—",
        points: r.points || 0.0,
      }))
    : [];

  const telemetry = fastF1Data?.telemetry || null;

  // Handle telemetry mouse movement (scrubbing)
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!telemetry || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Convert coordinate X to percentage index (0 - 99)
    let index = Math.round((x / width) * 99);
    if (index < 0) index = 0;
    if (index > 99) index = 99;
    setScrubIndex(index);
  };

  const handleMouseLeave = () => {
    setScrubIndex(null);
  };

  // SVG dimensions for telemetry trace
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingBottom = 20;
  const chartHeight = svgHeight - paddingBottom;

  let speedPath = "";
  let throttlePath = "";

  if (telemetry && telemetry.distance.length > 0) {
    const maxDist = telemetry.distance[telemetry.distance.length - 1] || 1;
    const maxSpeed = Math.max(...telemetry.speed, 300) || 300;

    const speedPoints = telemetry.distance.map((d, i) => {
      const x = (d / maxDist) * svgWidth;
      const y = chartHeight - (telemetry.speed[i] / maxSpeed) * (chartHeight - 40); // clamp min/max height
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    speedPath = `M ${speedPoints.join(" L ")}`;

    const throttlePoints = telemetry.distance.map((d, i) => {
      const x = (d / maxDist) * svgWidth;
      // throttle is 0 to 100
      const y = chartHeight - (telemetry.throttle[i] / 100) * 80; // height up to 80px
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    throttlePath = `M ${throttlePoints[0]} L ${throttlePoints.join(" L ")} L ${svgWidth},${chartHeight} L 0,${chartHeight} Z`;
  }

  // Get color for tire compounds
  const getCompoundColor = (compound: string) => {
    const clean = compound.toUpperCase().replace(/\s+/g, "");
    for (const key of Object.keys(COMPOUND_COLORS)) {
      if (clean.includes(key)) return COMPOUND_COLORS[key];
    }
    return COMPOUND_COLORS.UNKNOWN;
  };

  return (
    <PageContainer gap="sm">
      
      {/* ─── A. Header / Hero ─── */}
      <GlassCard className="p-6 relative overflow-hidden" variant="structural">
        <div className="flex flex-col gap-1.5 z-10 relative">
          <div className="flex items-center gap-2">
            <Link
              href="/weekend"
              className="text-[11px] font-bold tracking-widest text-primary hover:text-primary/80 transition-colors uppercase flex items-center gap-1"
            >
              <svg className="h-3.5 w-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Race Weekend
            </Link>
            <span className="text-[11px] text-on-surface-variant font-medium">·</span>
            <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant font-tabular">
              Round {round}
            </span>
          </div>
 
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface uppercase leading-none mt-1">
            {sessionName}
            <span className="block text-sm md:text-base font-bold tracking-wider text-on-surface-variant mt-2 normal-case font-normal">
              {hasFastF1 ? (
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  FastF1 Analytics Engine Enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-on-surface-variant">
                  <span className="h-2 w-2 rounded-full bg-outline" />
                  Jolpica Ergast Fallback Service
                </span>
              )}
            </span>
          </h1>
        </div>
      </GlassCard>
 
      {/* ─── B. Navigation Tabs ─── */}
      <div className="flex bg-surface-2/40 border border-outline/35 rounded-full p-1 self-start gap-1">
        <button
          onClick={() => setActiveTab("classification")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "classification"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Classification
        </button>
        {(hasFastF1 || isRaceOrSprint) && (
          <button
            onClick={() => setActiveTab("stints")}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "stints"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {hasFastF1 ? "Tyre Stints" : "Race Story"}
          </button>
        )}
        {hasFastF1 && telemetry && (
          <button
            onClick={() => setActiveTab("telemetry")}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "telemetry"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Fastest Lap Telemetry
          </button>
        )}
        {isRaceOrSprint && (
          <button
            onClick={() => setActiveTab("replay")}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "replay"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Race Replay
          </button>
        )}
      </div>
 
      {/* ─── C. Warnings / Fallbacks ─── */}
      {!hasFastF1 && (
        <GlassCard className="px-4 py-3 border border-warning/20 bg-warning/5" variant="floating">
          <div className="flex gap-2.5 items-start">
            <svg className="h-5 w-5 text-warning shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col gap-0.5">
              <p className="text-[12px] font-bold text-warning uppercase tracking-wider">{statusTitle}</p>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">
                {statusReason}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ─── D. Tab Content: Classification ─── */}
      {activeTab === "classification" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center h-9 px-4 gap-3 bg-surface/60 border-b border-outline/30">
            <span className="w-7 shrink-0 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-center">
              Pos
            </span>
            <div className="w-[3px] shrink-0" />
            <span className="flex-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              Driver
            </span>
            <span className="w-20 md:w-28 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-right">
              {isRaceOrSprint ? "Gap/Status" : "Best Lap"}
            </span>
            <span className="w-16 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-right">
              {isRaceOrSprint ? "Pts" : "FL Tyres"}
            </span>
          </div>

          <GlassCard className="overflow-hidden" variant="structural">
            <ul className="list-none p-0 m-0">
              {classificationList.length > 0 ? (
                classificationList.map((driver: DisplayClassificationEntry) => {
                  const teamColor = getTeamColor(driver.team);
                  const isFinished = driver.status?.toLowerCase() === "finished" || driver.gap?.startsWith("+") || driver.gap?.includes("Lap");
                  const isDNF = isRaceOrSprint && !isFinished && driver.status?.toLowerCase() !== "active";
                  const isFastestLap = hasFastF1 
                    ? (telemetry?.driverCode === driver.driverCode)
                    : (fallbackData?.results?.find((r: RaceResult) => r.driverCode === driver.driverCode)?.fastestLapRank === 1);

                  return (
                    <li
                      key={driver.driverCode}
                      className={`border-b border-outline/30 last:border-b-0 hover-glass transition-colors ${
                        isDNF ? "opacity-50" : ""
                      }`}
                    >
                      <Link
                        href={`/drivers/${driver.driverCode.toLowerCase()}`}
                        className="flex items-center h-[52px] gap-3 px-4 w-full"
                      >
                        {/* Position */}
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                            driver.position === 1
                              ? "bg-primary/25 text-primary border border-primary/40"
                              : "bg-surface-2 text-on-surface border border-outline/25"
                          }`}
                        >
                          {driver.positionText}
                        </span>

                        {/* Avatar */}
                        <DriverAvatar
                          driverId={driver.driverCode.toLowerCase()}
                          driverName={driver.driverName}
                          team={driver.team}
                          size="xs"
                          showTeamDot={false}
                        />

                        {/* Team Accent Color Strip */}
                        <div
                          className="h-7 w-[3px] shrink-0 rounded-full"
                          style={{ backgroundColor: teamColor }}
                        />

                        {/* Identity */}
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-bold text-on-surface leading-tight tracking-tight flex items-center gap-1.5">
                            {driver.driverCode}
                            {isFastestLap && (
                              <span className="text-[9px] font-bold text-fastest px-1.5 py-0.5 rounded-full bg-fastest/15 border border-fastest/25 leading-none tracking-widest uppercase">
                                FL
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5 leading-none truncate">
                            {driver.team}
                          </p>
                        </div>

                        {/* Gap/Time */}
                        <div className="w-20 md:w-28 shrink-0 text-right font-tabular">
                          <span className="telemetry-numeric text-[13px] text-on-surface">
                            {isRaceOrSprint ? driver.gap : driver.fastestLapTime}
                          </span>
                          {!isRaceOrSprint && (
                            <p className="text-[10px] text-on-surface-variant mt-0.5 leading-none font-mono">
                              S1: {driver.sector1 || "—"}
                            </p>
                          )}
                        </div>

                        {/* Points / Sector data */}
                        <div className="w-16 shrink-0 text-right flex flex-col items-end">
                          {isRaceOrSprint ? (
                            <span className="telemetry-numeric text-[13px] font-bold text-on-surface">
                              {driver.points > 0 ? `+${driver.points}` : "—"}
                            </span>
                          ) : (
                            <>
                              <span
                                className="inline-block h-3.5 w-3.5 rounded-full border border-black/30 shadow-sm"
                                style={{ backgroundColor: getCompoundColor(driver.compound || "UNKNOWN") }}
                                title={driver.compound}
                              />
                              <span className="text-[9px] text-on-surface-variant font-mono mt-0.5 leading-none font-tabular">
                                {driver.compound || "—"}
                              </span>
                            </>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-8 text-center text-on-surface-variant text-[13px]">
                  No classification data available for this session.
                </li>
              )}
            </ul>
          </GlassCard>
        </div>
      )}

      {/* ─── E. Tab Content: Stints ─── */}
      {activeTab === "stints" && (
        <RaceStory
          round={round}
          sessionName={sessionName}
          fastF1Data={fastF1Data}
          classificationList={classificationList}
        />
      )}

      {/* ─── Tab Content: Race Replay ─── */}
      {activeTab === "replay" && isRaceOrSprint && (
        <RaceReplay
          classificationList={classificationList}
          sessionName={sessionName}
          round={round}
        />
      )}

      {/* ─── F. Tab Content: Telemetry ─── */}
      {activeTab === "telemetry" && telemetry && (
        <GlassCard className="p-5 flex flex-col gap-6" variant="structural">
          <div>
            <h2 className="text-[14px] font-bold text-on-surface">Overall Fastest Lap Telemetry Trace</h2>
            <p className="text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
              Scrub across the lap to analyze telemetry speed, gear, throttle, and brake inputs.
              Set by driver <span className="font-bold text-primary">{telemetry.driverCode}</span> ({telemetry.lapTime}).
            </p>
          </div>

          {/* Interactive scrubbing readouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface-2/40 border border-outline/35 rounded-md">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Distance</span>
              <span className="text-[16px] font-bold text-on-surface telemetry-numeric mt-1">
                {scrubIndex !== null
                  ? `${telemetry.distance[scrubIndex].toFixed(0)} m`
                  : "Scrub chart..."}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Speed</span>
              <span className="text-[16px] font-bold text-on-surface telemetry-numeric mt-1">
                {scrubIndex !== null
                  ? `${telemetry.speed[scrubIndex].toFixed(0)} km/h`
                  : "—"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Throttle</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[16px] font-bold text-[#30D158] telemetry-numeric">
                  {scrubIndex !== null
                    ? `${telemetry.throttle[scrubIndex].toFixed(0)}%`
                    : "—"}
                </span>
                {scrubIndex !== null && (
                  <div className="w-12 h-2.5 bg-surface-2 rounded-full overflow-hidden border border-outline/35 shrink-0">
                    <div className="h-full bg-[#30D158]" style={{ width: `${telemetry.throttle[scrubIndex]}%` }} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Brake & Gear</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[12px] font-bold px-2 py-0.5 rounded-full uppercase leading-none border shrink-0 ${
                  scrubIndex !== null
                    ? telemetry.brake[scrubIndex]
                      ? "bg-[#E10600]/15 text-[#E10600] border-[#E10600]/25"
                      : "bg-surface-2 text-on-surface-variant border-outline/35"
                    : "bg-surface-2 text-on-surface-variant border-outline/35"
                }`}>
                  {scrubIndex !== null ? (telemetry.brake[scrubIndex] ? "Brake" : "Off") : "—"}
                </span>
                <span className="text-[16px] font-black text-primary telemetry-numeric leading-none">
                  {scrubIndex !== null ? `G${telemetry.gear[scrubIndex]}` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* SVG Telemetry Chart */}
          <div className="relative border border-outline/35 bg-surface-2/15 rounded-md p-2 overflow-hidden select-none">
            <svg
              ref={chartRef}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Background gridlines */}
              <line x1="0" y1="40" x2={svgWidth} y2="40" stroke="var(--sys-outline)" strokeWidth="0.5" strokeDasharray="3,3" className="opacity-35" />
              <line x1="0" y1="100" x2={svgWidth} y2="100" stroke="var(--sys-outline)" strokeWidth="0.5" strokeDasharray="3,3" className="opacity-35" />
              <line x1="0" y1="160" x2={svgWidth} y2="160" stroke="var(--sys-outline)" strokeWidth="0.5" strokeDasharray="3,3" className="opacity-35" />
              <line x1="0" y1={chartHeight} x2={svgWidth} y2={chartHeight} stroke="var(--sys-outline)" strokeWidth="1" className="opacity-55" />

              {/* Y Axis speed labels */}
              <text x="5" y="35" className="text-[9px] fill-on-surface-variant font-mono font-tabular opacity-75">300 km/h</text>
              <text x="5" y="95" className="text-[9px] fill-on-surface-variant font-mono font-tabular opacity-75">200 km/h</text>
              <text x="5" y="155" className="text-[9px] fill-on-surface-variant font-mono font-tabular opacity-75">100 km/h</text>

              {/* Filled Throttle area (light green shadow) */}
              {throttlePath && (
                <path d={throttlePath} fill="#30D158" className="opacity-[0.08]" />
              )}

              {/* Throttle line */}
              {throttlePath && (
                <path d={throttlePath.replace(/ Z$/, "")} fill="none" stroke="#30D158" strokeWidth="1" className="opacity-45" />
              )}

              {/* Speed trace path */}
              {speedPath && (
                <path
                  d={speedPath}
                  fill="none"
                  stroke="var(--sys-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive scrub elements */}
              {scrubIndex !== null && (
                <>
                  {/* Vertical line */}
                  <line
                    x1={(telemetry.distance[scrubIndex] / (telemetry.distance[telemetry.distance.length - 1] || 1)) * svgWidth}
                    y1="0"
                    x2={(telemetry.distance[scrubIndex] / (telemetry.distance[telemetry.distance.length - 1] || 1)) * svgWidth}
                    y2={chartHeight}
                    stroke="var(--sys-primary)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />

                  {/* Throttle bubble indicator */}
                  <circle
                    cx={(telemetry.distance[scrubIndex] / (telemetry.distance[telemetry.distance.length - 1] || 1)) * svgWidth}
                    cy={chartHeight - (telemetry.throttle[scrubIndex] / 100) * 80}
                    r="3.5"
                    fill="#30D158"
                    stroke="#000"
                    strokeWidth="1"
                  />

                  {/* Speed bubble indicator */}
                  <circle
                    cx={(telemetry.distance[scrubIndex] / (telemetry.distance[telemetry.distance.length - 1] || 1)) * svgWidth}
                    cy={chartHeight - (telemetry.speed[scrubIndex] / (Math.max(...telemetry.speed, 300) || 300)) * (chartHeight - 40)}
                    r="4.5"
                    fill="var(--sys-primary)"
                    stroke="#FFF"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </svg>
          </div>
        </GlassCard>
      )}

      {/* Spacer to clear mobile navigation */}
      <div className="h-16 md:hidden" />
    </PageContainer>
  );
}
