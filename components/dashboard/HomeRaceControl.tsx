"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { CountdownCard } from "./CountdownCard";
import { NextSessionCard } from "./NextSessionCard";
import { DriverAvatar } from "@/components/ui/DriverAvatar";
import { resolveWeekendContext } from "@/lib/f1/weekend-state";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { resolveDriverMedia } from "@/lib/media/resolver";
import { getTeamColor } from "@/lib/team-colors";
import type { RaceSchedule, StandingsEntry, LastRaceData } from "@/lib/types";
import { getInsights, getRaceStory, type F1Insight } from "@/lib/f1/insights";
import { useDisplaySettings } from "@/lib/settings-context";
import { useNotificationCenter } from "@/lib/hooks/useNotificationCenter";

interface HomeRaceControlProps {
  schedule: RaceSchedule[];
  drivers: StandingsEntry[];
  constructors: StandingsEntry[];
  lastRaceData: LastRaceData | null;
  season: string;
}

export function HomeRaceControl({
  schedule,
  drivers,
  constructors,
  lastRaceData,
  season,
}: HomeRaceControlProps) {
  const favoriteSourceDrivers = useMemo(() => {
    return drivers
      .filter((d) => !!d.id)
      .map((d) => {
        const media = resolveDriverMedia(d.id!);
        return {
          id: d.id!,
          name: d.name,
          code: media.code || d.id!.slice(0, 3).toUpperCase(),
          team: d.subtitle,
          number: media.number,
          position: d.position,
          points: d.points,
        };
      });
  }, [drivers]);

  const { favorites, resolvedFavorites, favoriteTeams } = useFavorites(favoriteSourceDrivers);
  const { history: notificationsHistory } = useNotificationCenter();
  const { isOnline } = useDisplaySettings();
  const weekendCtx = resolveWeekendContext(schedule, season);

  const recentNotifications = useMemo(() => {
    return notificationsHistory.slice(0, 3);
  }, [notificationsHistory]);

  // Compute insights & latest race story
  const insights = getInsights(drivers, constructors, lastRaceData, schedule, favorites);
  // Filter out any "nextSession" or "raceDay" insights if they are already highlighted in CountdownCard/NextSessionCard to avoid duplicate UI clutter
  const activeInsights = insights
    .filter((ins) => ins.type !== "nextSession" && ins.type !== "raceDay")
    .slice(0, 3);

  const raceStory = getRaceStory(lastRaceData, favorites);

  // Determine which race is featured on the hero
  const featuredRace = weekendCtx.currentRace || weekendCtx.nextRace || weekendCtx.previousRace;
  const raceSession = featuredRace?.sessions.find((s) => s.label === "Race") ?? null;

  // Drivers & Constructors Leader data
  const driverLeader = drivers[0];
  const constructorLeader = constructors[0];
  
  // Calculate gap between P1 and P2 in drivers standings
  const titleGap = drivers.length >= 2 ? drivers[0].points - drivers[1].points : null;

  // Get Top 3 results from last completed race
  const topThreeResults = lastRaceData?.results.slice(0, 3) || [];

  return (
    <PageContainer>
      <div className="grid grid-cols-6 gap-4 md:gap-6 items-start w-full">
      {/* ── A. RACE HERO (Countdown & Identity) ── */}
      <div className="col-span-6 md:col-span-4">
        {featuredRace && raceSession ? (
          <CountdownCard
            target={`${raceSession.date}T${raceSession.time}`}
            title={featuredRace.raceName}
            subtitle={`${featuredRace.locality}, ${featuredRace.country}`}
            round={featuredRace.round}
            sessions={featuredRace.sessions}
          />
        ) : (
          <GlassCard className="px-4 py-6 text-center flex flex-col justify-center min-h-[320px]" variant="floating">
            <p className="text-[15px] font-medium text-on-surface">Calendar Unavailable</p>
            <p className="mt-1 text-[13px] text-on-surface-variant">
              No upcoming races found on the {season} schedule.
            </p>
          </GlassCard>
        )}
      </div>

      {/* ── B. NEXT ACTION (Next session & quick reminder) ── */}
      <div className="col-span-6 md:col-span-2">
        <NextSessionCard
          session={weekendCtx.nextSession}
          round={featuredRace?.round}
        />
      </div>

      {/* ── PERSONALIZED FOR YOU INSIGHTS ── */}
      {activeInsights.length > 0 && (
        <div className="col-span-6 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              For You {!isOnline && "· Last Known Data"}
            </span>
          </div>
          <GlassCard className="p-1 flex flex-col" variant="floating">
            {activeInsights.map((insight) => {
              const link = getInsightLink(insight);
              return (
                <Link
                  key={insight.id}
                  href={link}
                  className="flex items-center justify-between h-[52px] px-4 gap-3 border-b border-outline/10 last:border-b-0 hover-glass transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="text-[9px] font-extrabold px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary uppercase font-mono tracking-wide shrink-0">
                      {getInsightCategoryLabel(insight.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-on-surface truncate">
                        {insight.title}
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 truncate uppercase font-mono">
                        {insight.summary}
                      </p>
                    </div>
                  </div>
                  <svg className="h-4 w-4 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </GlassCard>
        </div>
      )}

      {/* ── C. MY DRIVERS (Personalization Section) ── */}
      <div className="col-span-6 md:col-span-3 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
            My Drivers {!isOnline && "· Last Known Data"}
          </span>
        </div>

        {resolvedFavorites.length === 0 ? (
          <GlassCard className="p-6 text-center flex flex-col items-center justify-center min-h-[160px]" variant="floating">
            <h3 className="text-[13px] font-extrabold text-on-surface uppercase tracking-wider">
              Build Your Grid
            </h3>
            <p className="text-[12px] text-on-surface-variant mt-1.5 max-w-[240px]">
              Choose drivers to follow across RaceCtrl.
            </p>
            <Link
              href="/favorites"
              className="mt-4 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] rounded-full transition-colors cursor-pointer select-none"
            >
              Choose Drivers
            </Link>
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-2.5">
            {resolvedFavorites.slice(0, 3).map((driver) => {
              const teamColor = driver.isUnavailable ? "#8E8E93" : getTeamColor(driver.team);
              return (
                <Link
                  key={driver.id}
                  href={`/drivers/${driver.id}`}
                  className="block hover:opacity-95 transition-opacity"
                >
                  <GlassCard
                    variant="structural"
                    className="p-3.5 flex items-center justify-between border border-outline/15 hover:border-primary/20 transition-all duration-200"
                    style={{ borderLeft: `3px solid ${teamColor}` }}
                  >
                    <div className="flex items-center gap-3">
                      <DriverAvatar
                        driverId={driver.id}
                        driverName={driver.name}
                        team={driver.team}
                        size="sm"
                        showTeamDot={false}
                      />
                      <div>
                        <p className="text-[13px] font-bold text-on-surface flex items-center gap-1.5">
                          {driver.code}
                          <span className="text-[10px] font-semibold text-on-surface-variant">
                            #{driver.number}
                          </span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                          {driver.isUnavailable ? "Reserve Seat" : driver.team}
                        </p>
                      </div>
                    </div>

                    {!driver.isUnavailable && driver.position !== undefined && (
                      <div className="text-right font-mono">
                        <p className="text-[12px] font-bold text-on-surface">P{driver.position}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{driver.points} PTS</p>
                      </div>
                    )}
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── D. CHAMPIONSHIP PULSE ── */}
      <div className="col-span-6 md:col-span-3 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
            Championship Pulse {!isOnline && "· Last Known Data"}
          </span>
        </div>

        <GlassCard className="p-4 flex flex-col gap-4 min-h-[160px] justify-between" variant="floating">
          <div className="grid grid-cols-2 gap-4">
            {/* Drivers Leader */}
            {driverLeader && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Drivers Leader
                </span>
                <span className="text-[15px] font-bold text-on-surface mt-1 truncate">
                  {driverLeader.name}
                </span>
                <span className="text-[12px] font-bold text-primary telemetry-numeric mt-0.5">
                  {driverLeader.points} PTS
                </span>
              </div>
            )}

            {/* Constructors Leader */}
            {constructorLeader && (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Constructors Leader
                </span>
                <span className="text-[15px] font-bold text-on-surface mt-1 truncate">
                  {constructorLeader.name}
                </span>
                <span className="text-[12px] font-bold text-primary telemetry-numeric mt-0.5">
                  {constructorLeader.points} PTS
                </span>
              </div>
            )}
          </div>

          {/* Championship Gap */}
          {titleGap !== null && (
            <div className="pt-3 border-t border-outline/15 flex items-center justify-between">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Title Gap
              </span>
              <span className="text-[12px] font-black text-primary font-mono bg-primary/10 border border-primary/25 rounded px-2 py-0.5 leading-none">
                {titleGap} PTS
              </span>
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── PERSONALIZED FAVORITES & NOTIFICATIONS ROW ── */}
      {/* My Grid Watch (Drivers and Teams) */}
      <div className="col-span-6 md:col-span-4 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
            My Grid Watch
          </span>
        </div>

        <GlassCard className="p-5 flex flex-col gap-4 border border-outline/15 min-h-[190px] justify-between" variant="structural">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Drivers Watch */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Favorite Drivers
              </span>
              {resolvedFavorites.length === 0 ? (
                <p className="text-[12px] text-on-surface-variant">No drivers favorited yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {resolvedFavorites.slice(0, 2).map((d) => {
                    const dColor = getTeamColor(d.team);
                    return (
                      <Link
                        key={d.id}
                        href={`/drivers/${d.id}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-2/40 hover:bg-surface-2/70 border border-outline/10 transition-colors"
                        style={{ borderLeft: `3px solid ${dColor}` }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <DriverAvatar driverId={d.id} driverName={d.name} team={d.team} size="xs" showTeamDot={true} />
                          <span className="text-[13px] font-bold text-on-surface truncate pl-1">{d.code}</span>
                        </div>
                        <span className="text-[12px] font-bold text-primary telemetry-numeric">P{d.position || "—"}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Teams Watch */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Favorite Teams
              </span>
              {favoriteTeams.length === 0 ? (
                <p className="text-[12px] text-on-surface-variant">No teams favorited yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {favoriteTeams.slice(0, 2).map((tId) => {
                    const cColor = getTeamColor(tId);
                    const teamName = tId.charAt(0).toUpperCase() + tId.slice(1).replace("_", " ");
                    const cStanding = constructors.find(c => c.id === tId || c.name.toLowerCase().includes(tId.replace("_", " ")));
                    return (
                      <Link
                        key={tId}
                        href={`/constructors/${tId}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-2/40 hover:bg-surface-2/70 border border-outline/10 transition-colors"
                        style={{ borderLeft: `3px solid ${cColor}` }}
                      >
                        <span className="text-[13px] font-bold text-on-surface truncate pr-2 pl-1">{teamName}</span>
                        <span className="text-[12px] font-bold text-primary telemetry-numeric">{cStanding ? `P${cStanding.position}` : "—"}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Continue */}
          {featuredRace && (
            <div className="pt-3 border-t border-outline/10 flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant font-medium">
                Active GP: {featuredRace.raceName}
              </span>
              <Link
                href={`/weekend/${featuredRace.round}`}
                className="text-[11px] font-black text-primary hover:text-[#D6382F] uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                Go To Race Hub →
              </Link>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Recent Alerts Feed */}
      <div className="col-span-6 md:col-span-2 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
            Recent Alerts
          </span>
        </div>

        <GlassCard className="p-5 flex flex-col gap-3 border border-outline/15 min-h-[190px] justify-between" variant="structural">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
              <svg className="h-6 w-6 text-on-surface-variant/40 mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-[11px] text-on-surface-variant font-medium">No recent alerts recorded.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentNotifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.url}
                  className="flex flex-col p-1.5 rounded bg-surface-2/20 hover:bg-surface-2/40 border border-outline/5 transition-all text-left"
                >
                  <span className="text-[11px] font-bold text-on-surface truncate uppercase">{notif.title}</span>
                  <span className="text-[10px] text-on-surface-variant truncate mt-0.5 leading-none">{notif.body}</span>
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* ── E. LATEST STORY & CLASSIFICATION ── */}
      <div className="col-span-6 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
            Latest Story {!isOnline && "· Last Known Data"}
          </span>
        </div>

        <GlassCard className="p-5 flex flex-col gap-5 border border-outline/15 relative overflow-hidden" variant="floating">
          {/* Factual Race Story Headline */}
          {raceStory && (
            <div className="flex flex-col gap-1 pb-4 border-b border-outline/10">
              <h3 className="text-[18px] md:text-[20px] font-black text-on-surface leading-tight tracking-tight uppercase">
                {raceStory.headline}
              </h3>
              <p className="text-[13px] font-bold text-on-surface-variant">
                {raceStory.classification}
              </p>
              {raceStory.context && (
                <p className="text-[11px] text-primary font-bold uppercase font-mono tracking-wider mt-1">
                  {raceStory.context}
                </p>
              )}
            </div>
          )}

          {/* Classification grid */}
          {topThreeResults.length > 0 ? (
            <div className="flex flex-col divide-y divide-outline/10">
              <div className="grid grid-cols-12 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase pb-2 px-1">
                <span className="col-span-2">POS</span>
                <span className="col-span-5">DRIVER</span>
                <span className="col-span-5 text-right">GAP / STATUS</span>
              </div>

              {topThreeResults.map((result) => {
                const teamColor = getTeamColor(result.team);
                return (
                  <div
                    key={result.driverId}
                    className="grid grid-cols-12 items-center text-[13px] py-2.5 px-1 font-medium text-on-surface"
                  >
                    <span className="col-span-2 font-mono font-black text-on-surface-variant">
                      P{result.position}
                    </span>
                    <div className="col-span-5 flex items-center gap-2.5">
                      <span className="h-2.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: teamColor }} />
                      <span className="font-bold">{result.driverCode}</span>
                      <span className="text-[11px] text-on-surface-variant hidden sm:inline truncate">
                        {result.driverName}
                      </span>
                    </div>
                    <span className="col-span-5 text-right font-mono font-bold text-on-surface-variant">
                      {result.gap}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] text-on-surface-variant py-4 text-center">
              No classification data available.
            </p>
          )}

          <div className="flex justify-end pt-2 border-t border-outline/10">
            <Link
              href="/timing"
              className="text-[11px] font-bold text-primary hover:text-[#D6382F] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
            >
              View Results
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
         </GlassCard>
      </div>
      </div>
    </PageContainer>
  );
}

// ── INSIGHT HELPERS ──
function getInsightLink(insight: F1Insight): string {
  switch (insight.type) {
    case "nextSession":
    case "raceDay":
      return "/weekend";
    case "resultAvailable":
    case "latestWinner":
    case "podiumResult":
      return "/timing";
    case "favoritePosition":
      return `/drivers/${insight.entityIds[0]}`;
    case "closeBattle":
      if (insight.entityIds.length >= 2) {
        return `/compare?a=${insight.entityIds[0]}&b=${insight.entityIds[1]}`;
      }
      return "/standings";
    default:
      return "/standings";
  }
}

function getInsightCategoryLabel(type: string): string {
  switch (type) {
    case "nextSession":
      return "Next Up";
    case "raceDay":
      return "Race Day";
    case "resultAvailable":
      return "Result";
    case "latestWinner":
      return "Winner";
    case "favoritePosition":
      return "Driver Stats";
    case "closeBattle":
      return "Battle";
    default:
      return "Pulse";
  }
}
