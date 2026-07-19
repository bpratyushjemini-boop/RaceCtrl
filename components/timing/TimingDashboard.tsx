"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FlagBanner } from "@/components/timing/FlagBanner";
import { TimingRow } from "@/components/timing/TimingRow";
import { FreshnessIndicator } from "@/components/system/FreshnessIndicator";
import { RaceReplayEngine } from "@/components/timing/RaceReplayEngine";
import { PitPredictor } from "@/components/timing/PitPredictor";
import { TrackTracker } from "@/components/timing/TrackTracker";
import { TelemetryDashboard } from "@/components/timing/TelemetryDashboard";
import type { LastRaceData } from "@/lib/types";

interface TimingDashboardProps {
  lastRace: LastRaceData | null;
  isWeekendActive: boolean;
  resolvedSeason: string;
}

type TimingTab = "classification" | "replayer" | "strategy" | "radar" | "telemetry";

export function TimingDashboard({ lastRace, isWeekendActive, resolvedSeason }: TimingDashboardProps) {
  const [activeTab, setActiveTab] = useState<TimingTab>("classification");

  const formatRaceDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="flex flex-col gap-5 w-full pb-12">
      {/* Session Header Card */}
      <GlassCard variant="floating" className="rounded-none md:rounded-xl px-4 py-5 flex flex-col gap-4 border border-outline/25">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-primary uppercase font-mono">
                {lastRace
                  ? `${resolvedSeason} Season · Round ${lastRace.round} · ${isWeekendActive ? "Active" : "Latest Classification"}`
                  : "Live Timing"}
              </span>
            </div>
            <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight text-on-surface leading-tight uppercase">
              {lastRace?.raceName ?? "No session data"}
            </h1>
            {lastRace && (
              <p className="text-[12.5px] text-on-surface-variant mt-1.5 font-medium">
                {formatRaceDate(lastRace.date)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 select-none">
            <FreshnessIndicator />
            {isWeekendActive ? (
              <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-primary/15 border border-primary/30">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest text-primary uppercase font-mono">
                  Active
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-surface-2/80 border border-outline/25">
                <span className="h-1.5 w-1.5 rounded-full bg-on-surface-variant" />
                <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                  Results
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Winner Highlight (if available) */}
        {lastRace && lastRace.results.length > 0 && (
          <div className="flex items-center gap-5 border-t border-outline/15 pt-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                Winner
              </span>
              <span className="text-[15px] font-black text-on-surface">
                {lastRace.results[0].driverName} ({lastRace.results[0].driverCode})
              </span>
            </div>
            <div className="h-8 w-px bg-outline/15" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                Team
              </span>
              <span className="text-[15px] font-black text-on-surface truncate max-w-[140px]">
                {lastRace.results[0].team}
              </span>
            </div>
            <div className="h-8 w-px bg-outline/15" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                Time Gap
              </span>
              <span className="telemetry-numeric text-[14px] font-bold text-on-surface">
                {lastRace.results[0].gap}
              </span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Tabs Selector Bar */}
      <div className="flex flex-wrap bg-surface-2/50 border border-outline/25 rounded-full p-1 self-start gap-1 select-none">
        <button
          onClick={() => setActiveTab("classification")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "classification"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Timing Tower
        </button>
        <button
          onClick={() => setActiveTab("replayer")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "replayer"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Race Replay
        </button>
        <button
          onClick={() => setActiveTab("strategy")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "strategy"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Tyre Strategy
        </button>
        <button
          onClick={() => setActiveTab("radar")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "radar"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Live Tracker
        </button>
        <button
          onClick={() => setActiveTab("telemetry")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "telemetry"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Telemetry
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "classification" && (
        <div className="flex flex-col gap-3">
          {isWeekendActive ? (
            <FlagBanner variant="info" message="Weekend active · Classification reports latest completed sessions" />
          ) : (
            <FlagBanner variant="neutral" message="Official classification source · Live timing is not available from the current provider" />
          )}

          {lastRace && lastRace.results.length > 0 ? (
            <div className="flex flex-col">
              {/* Column headers */}
              <div className="flex items-center h-9 px-4 gap-3 bg-surface/60 border-b border-outline/15 select-none">
                <span className="w-7 shrink-0 text-[10px] font-black tracking-widest text-on-surface-variant uppercase text-center font-mono">
                  Pos
                </span>
                <div className="w-[3px] shrink-0" />
                <span className="flex-1 text-[10px] font-black tracking-widest text-on-surface-variant uppercase font-mono">
                  Driver
                </span>
                <span className="shrink-0 text-[10px] font-black tracking-widest text-on-surface-variant uppercase font-mono">
                  Gap / Status
                </span>
              </div>

              {/* Rows */}
              <GlassCard variant="structural" className="rounded-none md:rounded-xl overflow-hidden border border-outline/15">
                <ul className="list-none p-0 m-0">
                  {lastRace.results.map((result) => (
                    <TimingRow key={result.position} result={result} />
                  ))}
                </ul>
              </GlassCard>

              {/* Fastest Lap Legend */}
              {lastRace.results.some((r) => r.fastestLapRank === 1) && (
                <div className="px-4 md:px-0 pt-3 flex items-center gap-2 select-none">
                  <span className="text-[10px] font-black text-fastest px-2 py-0.5 rounded-full bg-fastest/15 border border-fastest/25 tracking-widest uppercase font-mono">
                    FL
                  </span>
                  <span className="text-[11.5px] text-on-surface-variant font-medium">
                    Fastest Lap of the Race
                  </span>
                </div>
              )}
            </div>
          ) : (
            <GlassCard variant="structural" className="rounded-xl px-6 py-12 text-center border border-outline/15">
              <div className="flex flex-col items-center gap-3">
                <svg className="h-10 w-10 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v4H3V3zm0 4h4v4H3V7zm4 0h4v4H7V7zm4 0h4v4h-4V7zm4 0h4v4h-4V7zM3 11h4v4H3v-4zm4 0h4v4H7v-4zm4 0h4v4h-4v-4zm4 0h4v4h-4v-4z" />
                </svg>
                <p className="text-[15px] font-black text-on-surface uppercase">No race results logged</p>
                <p className="text-[13px] text-on-surface-variant max-w-[240px] font-medium leading-relaxed">
                  Results will display here once the upcoming track sessions complete.
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {activeTab === "replayer" && <RaceReplayEngine />}

      {activeTab === "strategy" && <PitPredictor />}

      {activeTab === "radar" && <TrackTracker />}

      {activeTab === "telemetry" && <TelemetryDashboard />}
    </div>
  );
}
