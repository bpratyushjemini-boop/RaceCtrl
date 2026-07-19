"use client";

import React, { useMemo, useState } from "react";
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
import type { WeatherForecast } from "@/lib/providers/weather/weather-provider";
import type { NewsArticle } from "@/lib/providers/news/news-provider";

interface HomeRaceControlProps {
  schedule: RaceSchedule[];
  drivers: StandingsEntry[];
  constructors: StandingsEntry[];
  lastRaceData: LastRaceData | null;
  news: NewsArticle[];
  weather: WeatherForecast | null;
  season: string;
}

export function HomeRaceControl({
  schedule,
  drivers,
  constructors,
  lastRaceData,
  news,
  weather,
  season,
}: HomeRaceControlProps) {
  const [nowMs] = useState(() => Date.now());
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
  const weekendCtx = useMemo(() => resolveWeekendContext(schedule, season), [schedule, season]);

  // Active featured race details
  const featuredRace = weekendCtx.currentRace || weekendCtx.nextRace || weekendCtx.previousRace;
  const raceSession = featuredRace?.sessions.find((s) => s.label === "Race") ?? null;

  // Recent notifications
  const recentNotifications = useMemo(() => {
    return notificationsHistory.slice(0, 3);
  }, [notificationsHistory]);

  // AI insights
  const insights = useMemo(() => {
    return getInsights(drivers, constructors, lastRaceData, schedule, favorites);
  }, [drivers, constructors, lastRaceData, schedule, favorites]);

  const activeInsights = useMemo(() => {
    return insights.filter((ins) => ins.type !== "nextSession" && ins.type !== "raceDay").slice(0, 2);
  }, [insights]);

  const raceStory = useMemo(() => getRaceStory(lastRaceData, favorites), [lastRaceData, favorites]);

  // Driver of the Day state (local vote simulation)
  const [votedDriverId, setVotedDriverId] = useState<string | null>(null);
  const [dotdVotes, setDotdVotes] = useState<Record<string, number>>({
    norris: 42,
    hamilton: 35,
    max_verstappen: 28,
    leclerc: 18,
  });

  const handleVote = (driverId: string) => {
    if (votedDriverId) return;
    setVotedDriverId(driverId);
    setDotdVotes((prev) => ({
      ...prev,
      [driverId]: (prev[driverId] || 0) + 1,
    }));
  };

  const dotdTotal = useMemo(() => {
    return Object.values(dotdVotes).reduce((sum, v) => sum + v, 0);
  }, [dotdVotes]);

  // Leaderboard data
  const driverLeader = drivers[0];
  const driverSecond = drivers[1];
  const titleGap = driverLeader && driverSecond ? driverLeader.points - driverSecond.points : null;
  const topThreeResults = lastRaceData?.results.slice(0, 3) || [];

  // News highlight articles
  const headlineArticle = news[0];
  const secondaryNews = news.slice(1, 4);

  return (
    <PageContainer>
      <div className="grid grid-cols-6 gap-4 md:gap-6 items-start w-full pb-12">
        
        {/* ── 1. NEWS HEADLINE HERO ── */}
        {headlineArticle && (
          <div className="col-span-6">
            <GlassCard
              variant="floating"
              className="relative overflow-hidden p-6 md:p-8 min-h-[220px] flex flex-col justify-between gap-4 border border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent group"
            >
              <div className="absolute right-0 top-0 w-64 h-64 opacity-10 bg-primary blur-3xl rounded-full select-none pointer-events-none" />
              
              <div className="flex flex-col gap-2 z-10 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest font-mono">
                    {headlineArticle.category}
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    {new Date(headlineArticle.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <h2 className="text-[20px] md:text-[24px] font-black text-on-surface uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                  <a href={headlineArticle.url} target="_blank" rel="noopener noreferrer">
                    {headlineArticle.title}
                  </a>
                </h2>
                <p className="text-[13px] text-on-surface-variant leading-relaxed font-medium">
                  {headlineArticle.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-outline/10 z-10">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                  F1 Today
                </span>
                <a
                  href={headlineArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-black text-primary hover:opacity-80 transition-opacity uppercase tracking-wider flex items-center gap-1"
                >
                  Read Full Article →
                </a>
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── 2. RACE HERO (Countdown & Identity) ── */}
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

        {/* ── 3. NEXT SESSION & WEATHER CARD ── */}
        <div className="col-span-6 md:col-span-2 flex flex-col gap-4">
          <NextSessionCard
            session={weekendCtx.nextSession}
            round={featuredRace?.round}
          />

          {/* Weather Widget */}
          {weather && (
            <GlassCard variant="structural" className="p-4 flex flex-col gap-3.5 border border-outline/15 justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                    Circuit Weather
                  </span>
                  <h4 className="text-[16px] font-bold text-on-surface mt-0.5 truncate">
                    {featuredRace?.locality || "Grand Prix"}
                  </h4>
                </div>
                <span className="text-[28px]" role="img" aria-label="weather-icon">
                  {weather.current.icon}
                </span>
              </div>

              <div className="flex items-baseline gap-1 bg-surface-2/30 p-2.5 rounded-xl border border-outline/10">
                <span className="text-[28px] font-black telemetry-numeric text-on-surface leading-none">
                  {Math.round(weather.current.temperature)}°C
                </span>
                <span className="text-[12px] text-on-surface-variant font-medium ml-1">
                  Feels like {Math.round(weather.current.feelsLike)}°C
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-on-surface-variant">
                <div className="flex flex-col">
                  <span>Precipitation</span>
                  <span className="text-on-surface font-bold mt-0.5">{weather.current.precipitation} mm</span>
                </div>
                <div className="flex flex-col">
                  <span>Wind Speed</span>
                  <span className="text-on-surface font-bold mt-0.5">{Math.round(weather.current.windSpeed)} km/h</span>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* ── 4. WEEKEND PROGRESS TIMELINE ── */}
        {featuredRace && (
          <div className="col-span-6">
            <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                  Weekend Session Progression
                </span>
              </div>

              <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-outline/25 -translate-y-1/2 hidden sm:block z-0" />
                
                {featuredRace.sessions.map((s, idx) => {
                  const sTime = new Date(`${s.date}T${s.time}`).getTime();
                  const isPast = sTime < nowMs;
                  const isNext = weekendCtx.nextSession?.label === s.label;

                  return (
                    <div
                      key={s.label}
                      className="relative z-10 flex flex-row sm:flex-col items-center gap-3 sm:gap-2 flex-1 w-full"
                    >
                      {/* Timeline node marker */}
                      <span
                        className={`h-5 w-5 rounded-full flex items-center justify-center border font-mono text-[9px] font-black shrink-0 ${
                          isPast
                            ? "bg-outline border-outline text-on-surface-variant"
                            : isNext
                            ? "bg-primary border-primary text-white animate-pulse"
                            : "bg-surface-3 border-outline text-on-surface-variant"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      
                      <div className="text-left sm:text-center min-w-0">
                        <p className={`text-[12px] font-bold truncate ${isNext ? "text-primary" : "text-on-surface"}`}>
                          {s.label}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                          {new Date(`${s.date}T${s.time}`).toLocaleDateString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── 5. CHAMPIONSHIP BATTLE & PULSE ── */}
        <div className="col-span-6 md:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Championship Pulse
            </span>
          </div>

          <GlassCard className="p-4 flex flex-col gap-4 justify-between" variant="floating">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                Title Battle (Top 2)
              </span>
              <div className="flex justify-between items-end mt-2">
                {driverLeader && (
                  <div className="flex flex-col">
                    <span className="text-[15px] font-black text-on-surface leading-tight">
                      {driverLeader.name}
                    </span>
                    <span className="text-[12px] font-bold text-primary telemetry-numeric mt-0.5">
                      {driverLeader.points} PTS
                    </span>
                  </div>
                )}
                {titleGap !== null && (
                  <span className="text-[10px] font-black text-primary font-mono bg-primary/10 border border-primary/20 rounded px-2 py-0.5 leading-none mb-1">
                    +{titleGap} PTS Lead
                  </span>
                )}
                {driverSecond && (
                  <div className="flex flex-col items-end">
                    <span className="text-[15px] font-black text-on-surface leading-tight text-right">
                      {driverSecond.name}
                    </span>
                    <span className="text-[12px] font-bold text-on-surface-variant telemetry-numeric mt-0.5">
                      {driverSecond.points} PTS
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Custom SVG points comparison chart */}
            <div className="h-12 w-full mt-2 relative select-none">
              <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                {/* Horizontal reference baseline */}
                <line x1="0" y1="12" x2="100" y2="12" stroke="var(--color-outline)" strokeWidth="0.5" strokeDasharray="1,1" />
                
                {/* Leader bar */}
                <path
                  d="M 5,12 L 45,12"
                  stroke={driverLeader ? getTeamColor(driverLeader.subtitle) : "var(--color-primary)"}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                
                {/* Gap segment */}
                <path
                  d="M 45,12 L 55,12"
                  stroke="var(--color-outline)"
                  strokeWidth="1"
                  strokeDasharray="1,1"
                />

                {/* Second bar */}
                <path
                  d="M 55,12 L 95,12"
                  stroke={driverSecond ? getTeamColor(driverSecond.subtitle) : "var(--color-on-surface-variant)"}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="pt-3.5 border-t border-outline/10 flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
              <span>Leader: {driverLeader?.subtitle}</span>
              <span>Challenger: {driverSecond?.subtitle}</span>
            </div>
          </GlassCard>
        </div>

        {/* ── 6. DRIVER OF THE DAY VOTE ── */}
        <div className="col-span-6 md:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Driver of the Day
            </span>
          </div>

          <GlassCard className="p-4 flex flex-col gap-3 justify-between" variant="floating">
            <div>
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                Cast Your Vote
              </span>
              <p className="text-[12px] text-on-surface-variant mt-0.5 leading-relaxed">
                Who performed best during this weekend&apos;s sessions?
              </p>
            </div>

            <div className="flex flex-col gap-2.5 mt-1.5">
              {Object.keys(dotdVotes).map((driverId) => {
                const driverMeta = resolveDriverMedia(driverId);
                const votesCount = dotdVotes[driverId];
                const pct = dotdTotal > 0 ? Math.round((votesCount / dotdTotal) * 100) : 0;
                const activeTeamColor = getTeamColor(driverMeta.team);

                return (
                  <div key={driverId} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="font-bold text-on-surface">{driverMeta.code}</span>
                      <span className="text-on-surface-variant font-mono font-bold">{pct}%</span>
                    </div>
                    
                    <button
                      onClick={() => handleVote(driverId)}
                      disabled={votedDriverId !== null}
                      className="w-full h-7 rounded-lg overflow-hidden bg-surface-2 border border-outline/10 text-left relative transition-all active:scale-[0.99] disabled:active:scale-100 cursor-pointer"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: activeTeamColor,
                        }}
                      />
                      <span className="relative z-10 pl-3 text-[10px] uppercase font-bold text-on-surface-variant">
                        {votedDriverId === driverId ? "Voted ✓" : "Tap to Vote"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* ── 7. TRENDING STORIES (BREAKING NEWS TICKER) ── */}
        {secondaryNews.length > 0 && (
          <div className="col-span-6 flex flex-col gap-4">
            <div className="flex items-center gap-1.5 px-1">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                Trending Stories
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {secondaryNews.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <GlassCard
                    variant="structural"
                    className="p-4 flex flex-col gap-3 border border-outline/15 hover:border-primary/25 h-full transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-surface-2 border border-outline/25 text-on-surface-variant uppercase tracking-wider font-mono">
                        {article.category}
                      </span>
                      <span className="text-[9px] text-on-surface-variant/70 font-medium">
                        {new Date(article.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h3 className="text-[13px] font-bold text-on-surface uppercase tracking-tight leading-tight group-hover:text-primary transition-colors flex-1">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant/80 line-clamp-2 mt-0.5">
                      {article.summary}
                    </p>
                  </GlassCard>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── 8. MY GRID WATCH (PERSONALIZATION) ── */}
        <div className="col-span-6 md:col-span-4 flex flex-col gap-4">
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

        {/* ── 9. RECENT ALERTS FEED ── */}
        <div className="col-span-6 md:col-span-2 flex flex-col gap-4">
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

        {/* ── 10. FOR YOU / AI SUMMARY ── */}
        {activeInsights.length > 0 && (
          <div className="col-span-6 flex flex-col gap-4">
            <div className="flex items-center gap-1.5 px-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                AI Summary & Insights {!isOnline && "· Cached"}
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

        {/* ── 11. LATEST STORY & CLASSIFICATION ── */}
        <div className="col-span-6 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Latest Story {!isOnline && "· Cached"}
            </span>
          </div>

          <GlassCard className="p-5 flex flex-col gap-5 border border-outline/15 relative overflow-hidden" variant="floating">
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
