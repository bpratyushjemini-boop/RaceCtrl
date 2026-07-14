"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { DriverAvatar } from "@/components/ui/DriverAvatar";
import { getTeamColor } from "@/lib/team-colors";
import { resolveDriverMedia } from "@/lib/media/resolver";
import type { StandingsEntry, LastRaceData } from "@/lib/types";

interface CompareDriversClientProps {
  drivers: StandingsEntry[];
  lastRaceData: LastRaceData | null;
}

export function CompareDriversClient({
  drivers,
  lastRaceData,
}: CompareDriversClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse and validate IDs from query params directly
  const aParam = searchParams.get("a") || "";
  const bParam = searchParams.get("b") || "";

  const validA = drivers.some((d) => d.id === aParam) ? aParam : "";
  const validB = drivers.some((d) => d.id === bParam) ? bParam : "";

  const driverAId = validA;
  const driverBId = validB;

  const [copied, setCopied] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  const driverA = drivers.find((d) => d.id === driverAId);
  const driverB = drivers.find((d) => d.id === driverBId);

  // Sync state changes with URL query parameters
  const updateQuery = (key: "a" | "b", val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(key, val);
    } else {
      params.delete(key);
    }
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  };

  const handleSelectDriver = (side: "a" | "b", id: string) => {
    updateQuery(side, id);
  };

  // Compare results helpers
  const getLatestFinish = (driverId: string) => {
    if (!lastRaceData) return { display: "—", val: 999 };
    const res = lastRaceData.results.find((r) => r.driverId === driverId);
    if (!res) return { display: "—", val: 999 };

    const isDnf =
      res.status.toLowerCase().includes("retired") ||
      res.status.toLowerCase().includes("accident") ||
      res.status.toLowerCase().includes("collision") ||
      res.status.toLowerCase().includes("mechanical") ||
      !res.positionText.match(/^\d+$/);

    if (isDnf) {
      return { display: "DNF", val: 999 };
    }
    return { display: `P${res.position}`, val: res.position };
  };

  const finishA = driverA ? getLatestFinish(driverA.id || "") : null;
  const finishB = driverB ? getLatestFinish(driverB.id || "") : null;

  // Share functionality
  const handleShare = async () => {
    if (!driverA || !driverB) return;

    const mediaA = resolveDriverMedia(driverA.id || "");
    const mediaB = resolveDriverMedia(driverB.id || "");

    const shareText = `RaceCtrl Compare
${mediaA.code} — P${driverA.position}, ${driverA.points} PTS
${mediaB.code} — P${driverB.position}, ${driverB.points} PTS`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "RaceCtrl Comparison",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.warn("Share failed", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n\nLink: ${window.location.href}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Copy failed", err);
      }
    }
  };

  // Point visualization calculations
  const pointsA = driverA?.points ?? 0;
  const pointsB = driverB?.points ?? 0;
  const totalPoints = pointsA + pointsB;
  const pctA = totalPoints > 0 ? (pointsA / totalPoints) * 100 : 50;
  const pctB = totalPoints > 0 ? (pointsB / totalPoints) * 100 : 50;

  const colorA = driverA ? getTeamColor(driverA.subtitle) : "#FF453A";
  const colorB = driverB ? getTeamColor(driverB.subtitle) : "#FF453A";

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-12">
      {/* Toast Notification for Clipboard Copy */}
      {copied && (
        <div className="fixed bottom-[88px] right-4 left-4 md:left-auto md:w-80 bg-[#30D158]/10 border border-[#30D158]/35 text-[#30D158] p-3.5 rounded-xl shadow-lg z-50 text-[12px] font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300 select-none">
          <span className="h-2 w-2 rounded-full bg-[#30D158] shrink-0 animate-pulse" />
          Comparison copied to clipboard!
        </div>
      )}

      {/* Header Block */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
            Head to Head
          </span>
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
            Compare Drivers
          </h1>
        </div>

        {driverA && driverB && (
          <button
            onClick={handleShare}
            className="h-9 px-4 flex items-center gap-1.5 rounded-full border border-outline/40 text-on-surface-variant hover:text-on-surface hover-glass text-[11px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer active:scale-[0.97]"
            aria-label="Share comparison stats"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l5.06-2.53m0 7.576l-5.06-2.53m2.77 1.378a3 3 0 11-6 0 3 3 0 016 0zm6-8a3 3 0 11-6 0 3 3 0 016 0zm0 8a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Share</span>
          </button>
        )}
      </div>

      {/* Selectors Grid */}
      <div className="grid grid-cols-11 items-center gap-2">
        {/* Selector A */}
        <div className="col-span-5">
          <select
            value={driverAId}
            onChange={(e) => handleSelectDriver("a", e.target.value)}
            className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2.5 px-4 rounded-full border border-outline/30 focus:outline-none focus:border-primary/80 transition-colors cursor-pointer appearance-none text-center"
            aria-label="Select Driver A"
          >
            <option value="">Select Driver A</option>
            {drivers
              .filter((d) => d.id !== driverBId)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        </div>

        {/* VS Separator */}
        <div className="col-span-1 text-center text-[11px] font-bold text-on-surface-variant tracking-wider font-mono">
          VS
        </div>

        {/* Selector B */}
        <div className="col-span-5">
          <select
            value={driverBId}
            onChange={(e) => handleSelectDriver("b", e.target.value)}
            className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2.5 px-4 rounded-full border border-outline/30 focus:outline-none focus:border-primary/80 transition-colors cursor-pointer appearance-none text-center"
            aria-label="Select Driver B"
          >
            <option value="">Select Driver B</option>
            {drivers
              .filter((d) => d.id !== driverAId)
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Driver Head-to-Head Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Driver A Card */}
        <GlassCard
          variant="structural"
          className="p-4 flex flex-col items-center text-center gap-3 relative border border-outline/15 min-h-[140px] justify-center"
          style={{ borderLeft: `4px solid ${colorA}` }}
        >
          {driverA ? (
            <>
              <DriverAvatar
                driverId={driverA.id || ""}
                driverName={driverA.name}
                team={driverA.subtitle}
                size="md"
                showTeamDot={false}
              />
              <div>
                <p className="text-[16px] font-bold text-on-surface">{driverA.name}</p>
                <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
                  {driverA.subtitle}
                </p>
              </div>
            </>
          ) : (
            <span className="text-[12px] text-on-surface-variant">Choose Driver A</span>
          )}
        </GlassCard>

        {/* Driver B Card */}
        <GlassCard
          variant="structural"
          className="p-4 flex flex-col items-center text-center gap-3 relative border border-outline/15 min-h-[140px] justify-center"
          style={{ borderRight: `4px solid ${colorB}` }}
        >
          {driverB ? (
            <>
              <DriverAvatar
                driverId={driverB.id || ""}
                driverName={driverB.name}
                team={driverB.subtitle}
                size="md"
                showTeamDot={false}
              />
              <div>
                <p className="text-[16px] font-bold text-on-surface">{driverB.name}</p>
                <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
                  {driverB.subtitle}
                </p>
              </div>
            </>
          ) : (
            <span className="text-[12px] text-on-surface-variant">Choose Driver B</span>
          )}
        </GlassCard>
      </div>

      {/* Comparison Rows */}
      {driverA && driverB ? (
        <GlassCard className="p-4 flex flex-col gap-4 border border-outline/25" variant="floating">
          <div className="flex flex-col gap-5 divide-y divide-outline/10">
            {/* ROW 1: CONSTRUCTOR */}
            <div className="grid grid-cols-3 items-center text-center pt-2">
              <span className="text-[13px] font-bold text-on-surface truncate">{driverA.subtitle}</span>
              <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                Constructor
              </span>
              <span className="text-[13px] font-bold text-on-surface truncate">{driverB.subtitle}</span>
            </div>

            {/* ROW 2: POSITION */}
            <div className="grid grid-cols-3 items-center text-center pt-4">
              <span
                className={`telemetry-numeric text-[18px] font-bold ${
                  driverA.position < driverB.position ? "text-primary font-black" : "text-on-surface"
                }`}
              >
                P{driverA.position}
                {driverA.position < driverB.position && (
                  <span className="ml-1 text-[9px] font-sans font-bold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded leading-none">
                    LEAD
                  </span>
                )}
              </span>
              <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                Championship Rank
              </span>
              <span
                className={`telemetry-numeric text-[18px] font-bold ${
                  driverB.position < driverA.position ? "text-primary font-black" : "text-on-surface"
                }`}
              >
                P{driverB.position}
                {driverB.position < driverA.position && (
                  <span className="ml-1 text-[9px] font-sans font-bold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded leading-none">
                    LEAD
                  </span>
                )}
              </span>
            </div>

            {/* ROW 3: POINTS */}
            <div className="grid grid-cols-3 items-center text-center pt-4">
              <span
                className={`telemetry-numeric text-[18px] font-bold ${
                  pointsA > pointsB ? "text-primary font-black" : "text-on-surface"
                }`}
              >
                {pointsA} PTS
              </span>
              <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                Championship Points
              </span>
              <span
                className={`telemetry-numeric text-[18px] font-bold ${
                  pointsB > pointsA ? "text-primary font-black" : "text-on-surface"
                }`}
              >
                {pointsB} PTS
              </span>

              {/* POINTS GAP VISUALIZATION (MICRO BAR) */}
              <div className="col-span-3 flex flex-col gap-2 mt-4 px-2">
                <div className="w-full bg-outline/10 h-2.5 rounded-full overflow-hidden flex relative">
                  <div
                    style={{
                      width: animate ? `${pctA}%` : "0%",
                      backgroundColor: colorA,
                      transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    className="h-full rounded-l-full"
                  />
                  <div
                    style={{
                      width: animate ? `${pctB}%` : "0%",
                      backgroundColor: colorB,
                      transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    className="h-full rounded-r-full"
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono font-bold text-on-surface-variant">
                  <span>{pctA.toFixed(0)}%</span>
                  <span>POINTS DISTRIBUTION</span>
                  <span>{pctB.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* ROW 4: WINS */}
            <div className="grid grid-cols-3 items-center text-center pt-4">
              <span
                className={`telemetry-numeric text-[18px] font-bold ${
                  (driverA.wins ?? 0) > (driverB.wins ?? 0) ? "text-primary font-black" : "text-on-surface"
                }`}
              >
                {driverA.wins ?? 0}
              </span>
              <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                Season Wins
              </span>
              <span
                className={`telemetry-numeric text-[18px] font-bold ${
                  (driverB.wins ?? 0) > (driverA.wins ?? 0) ? "text-primary font-black" : "text-on-surface"
                }`}
              >
                {driverB.wins ?? 0}
              </span>
            </div>

            {/* ROW 5: LATEST RACE FINISH */}
            {finishA && finishB && (
              <div className="grid grid-cols-3 items-center text-center pt-4">
                <span
                  className={`telemetry-numeric text-[18px] font-bold ${
                    finishA.val < finishB.val ? "text-primary font-black" : "text-on-surface"
                  }`}
                >
                  {finishA.display}
                </span>
                <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                  Latest Race Finish
                </span>
                <span
                  className={`telemetry-numeric text-[18px] font-bold ${
                    finishB.val < finishA.val ? "text-primary font-black" : "text-on-surface"
                  }`}
                >
                  {finishB.display}
                </span>
              </div>
            )}
          </div>
        </GlassCard>
      ) : (
        <GlassCard
          className="p-8 text-center border border-outline/15 flex flex-col items-center justify-center min-h-[220px]"
          variant="structural"
        >
          <svg className="h-10 w-10 text-on-surface-variant/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="text-[14px] font-extrabold text-on-surface uppercase tracking-wider mt-4">
            Select Drivers
          </h3>
          <p className="text-[12px] text-on-surface-variant mt-2 max-w-[280px]">
            Choose two drivers from the dropdowns above to compare their points, rank, constructor, and form.
          </p>
        </GlassCard>
      )}

      {/* Back Button */}
      <Link
        href="/standings"
        className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity mt-4"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Standings
      </Link>
    </div>
  );
}
