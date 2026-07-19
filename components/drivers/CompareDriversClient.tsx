"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { DriverAvatar } from "@/components/ui/DriverAvatar";
import { getTeamColor } from "@/lib/team-colors";
import { resolveDriverMedia } from "@/lib/media/resolver";
import type { StandingsEntry, LastRaceData, DriverComparisonReport } from "@/lib/types";
import { PageContainer } from "@/components/layout/PageContainer";
import { CrossCompare } from "@/components/compare/CrossCompare";

interface CompareDriversClientProps {
  drivers: StandingsEntry[];
  constructors?: StandingsEntry[];
  lastRaceData: LastRaceData | null;
  comparisonReport: DriverComparisonReport | null;
  initialA?: string;
  initialB?: string;
}

const CONSTRUCTOR_SPECS: Record<string, { principal: string; base: string; engine: string; titles: number }> = {
  mclaren: { principal: "Andrea Stella", base: "Woking, UK", engine: "Mercedes", titles: 8 },
  ferrari: { principal: "Frédéric Vasseur", base: "Maranello, Italy", engine: "Ferrari", titles: 16 },
  red_bull: { principal: "Christian Horner", base: "Milton Keynes, UK", engine: "Honda RBPT", titles: 6 },
  mercedes: { principal: "Toto Wolff", base: "Brackley, UK", engine: "Mercedes", titles: 8 },
  aston_martin: { principal: "Mike Krack", base: "Silverstone, UK", engine: "Mercedes", titles: 0 },
  alpine: { principal: "Oliver Oakes", base: "Enstone, UK", engine: "Renault", titles: 2 },
  haas: { principal: "Ayao Komatsu", base: "Kannapolis, USA", engine: "Ferrari", titles: 0 },
  sauber: { principal: "Mattia Binotto", base: "Hinwil, Switzerland", engine: "Ferrari", titles: 0 },
  williams: { principal: "James Vowles", base: "Grove, UK", engine: "Mercedes", titles: 9 },
  rb: { principal: "Laurent Mekies", base: "Faenza, Italy", engine: "Honda RBPT", titles: 0 },
};

export function CompareDriversClient({
  drivers,
  constructors = [],
  lastRaceData,
  comparisonReport,
  initialA = "",
  initialB = "",
}: CompareDriversClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode selection: drivers vs teams
  const [compareMode, setCompareMode] = useState<"drivers" | "teams">("drivers");

  // Constructor selection states
  const [constAId, setConstAId] = useState("");
  const [constBId, setConstBId] = useState("");

  // Parse and validate IDs from query params directly
  const aParam = initialA || searchParams.get("a") || "";
  const bParam = initialB || searchParams.get("b") || "";

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
    let shareText = "";
    if (compareMode === "drivers" && driverA && driverB) {
      const mediaA = resolveDriverMedia(driverA.id || "");
      const mediaB = resolveDriverMedia(driverB.id || "");
      shareText = `RaceCtrl Compare\n${mediaA.code} — P${driverA.position}, ${driverA.points} PTS\n${mediaB.code} — P${driverB.position}, ${driverB.points} PTS`;
    } else if (compareMode === "teams" && constAId && constBId) {
      const cA = constructors.find((c) => c.id === constAId);
      const cB = constructors.find((c) => c.id === constBId);
      if (cA && cB) {
        shareText = `RaceCtrl Compare\n${cA.name} — P${cA.position}, ${cA.points} PTS\n${cB.name} — P${cB.position}, ${cB.points} PTS`;
      }
    }

    if (!shareText) return;

    if (typeof navigator !== "undefined" && navigator.share) {
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

  // Point visualization calculations (Drivers)
  const pointsA = driverA?.points ?? 0;
  const pointsB = driverB?.points ?? 0;
  const totalPoints = pointsA + pointsB;
  const pointsGap = Math.abs(pointsA - pointsB);
  const pctA = totalPoints > 0 ? (pointsA / totalPoints) * 100 : 50;
  const pctB = totalPoints > 0 ? (pointsB / totalPoints) * 100 : 50;

  const colorA = driverA ? getTeamColor(driverA.subtitle) : "#FF453A";
  const colorB = driverB ? getTeamColor(driverB.subtitle) : "#FF453A";

  // Constructor comparison variables
  const teamA = constructors.find((c) => c.id === constAId);
  const teamB = constructors.find((c) => c.id === constBId);

  const tPointsA = teamA?.points ?? 0;
  const tPointsB = teamB?.points ?? 0;
  const tTotalPoints = tPointsA + tPointsB;
  const tPointsGap = Math.abs(tPointsA - tPointsB);
  const tPctA = tTotalPoints > 0 ? (tPointsA / tTotalPoints) * 100 : 50;
  const tPctB = tTotalPoints > 0 ? (tPointsB / tTotalPoints) * 100 : 50;

  const tColorA = constAId ? getTeamColor(constAId) : "#FF453A";
  const tColorB = constBId ? getTeamColor(constBId) : "#FF453A";

  const specA = constAId ? CONSTRUCTOR_SPECS[constAId] : null;
  const specB = constBId ? CONSTRUCTOR_SPECS[constBId] : null;

  return (
    <PageContainer>
      {/* Toast Notification for Clipboard Copy */}
      {copied && (
        <div className="fixed bottom-[88px] right-4 left-4 md:left-auto md:w-80 bg-[#30D158]/10 border border-[#30D158]/35 text-[#30D158] p-3.5 rounded-xl shadow-lg z-50 text-[12px] font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300 select-none">
          <span className="h-2 w-2 rounded-full bg-[#30D158] shrink-0 animate-pulse" />
          Comparison copied to clipboard!
        </div>
      )}

      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
            Head to Head
          </span>
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
            {compareMode === "drivers" ? "Driver Battle" : "Constructor Battle"}
          </h1>
        </div>

        {((compareMode === "drivers" && driverA && driverB) || (compareMode === "teams" && teamA && teamB)) && (
          <button
            onClick={handleShare}
            className="h-9 px-4 flex items-center gap-1.5 rounded-full border border-outline/40 text-on-surface-variant hover:text-on-surface hover-glass text-[11px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer active:scale-[0.97] self-start md:self-auto"
            aria-label="Share comparison stats"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l5.06-2.53m0 7.576l-5.06-2.53m2.77 1.378a3 3 0 11-6 0 3 3 0 016 0zm6-8a3 3 0 11-6 0 3 3 0 016 0zm0 8a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Share Battle</span>
          </button>
        )}
      </div>

      {/* Mode Selector Tab */}
      <div className="flex bg-surface-2/40 border border-outline/35 rounded-full p-1 self-start gap-1 select-none">
        <button
          onClick={() => setCompareMode("drivers")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
            compareMode === "drivers"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Drivers
        </button>
        <button
          onClick={() => setCompareMode("teams")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
            compareMode === "teams"
              ? "bg-primary text-white shadow-sm"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Teams
        </button>
      </div>

      {compareMode === "drivers" ? (
        <>
          {/* Selectors Grid */}
          <div className="grid grid-cols-11 items-center gap-2">
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

            <div className="col-span-1 text-center text-[11px] font-bold text-on-surface-variant tracking-wider font-mono">
              VS
            </div>

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

                  {/* POINTS GAP VISUALIZATION */}
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
                      <span>POINTS DISTRIBUTION (GAP: {pointsGap} PTS)</span>
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

                {/* ROW 5: QUALIFYING H2H */}
                {comparisonReport && (
                  <div className="grid grid-cols-3 items-center text-center pt-4">
                    <span
                      className={`telemetry-numeric text-[18px] font-bold ${
                        comparisonReport.qualifyingRecord.aAhead > comparisonReport.qualifyingRecord.bAhead ? "text-primary font-black" : "text-on-surface"
                      }`}
                    >
                      {comparisonReport.qualifyingRecord.aAhead}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                      Qualifying H2H
                    </span>
                    <span
                      className={`telemetry-numeric text-[18px] font-bold ${
                        comparisonReport.qualifyingRecord.bAhead > comparisonReport.qualifyingRecord.aAhead ? "text-primary font-black" : "text-on-surface"
                      }`}
                    >
                      {comparisonReport.qualifyingRecord.bAhead}
                    </span>
                  </div>
                )}

                {/* ROW 6: RACE FINISH H2H */}
                {comparisonReport && (
                  <div className="grid grid-cols-3 items-center text-center pt-4">
                    <span
                      className={`telemetry-numeric text-[18px] font-bold ${
                        comparisonReport.raceRecord.aAhead > comparisonReport.raceRecord.bAhead ? "text-primary font-black" : "text-on-surface"
                      }`}
                    >
                      {comparisonReport.raceRecord.aAhead}
                    </span>
                    <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
                      Race Finish H2H
                    </span>
                    <span
                      className={`telemetry-numeric text-[18px] font-bold ${
                        comparisonReport.raceRecord.bAhead > comparisonReport.raceRecord.aAhead ? "text-primary font-black" : "text-on-surface"
                      }`}
                    >
                      {comparisonReport.raceRecord.bAhead}
                    </span>
                  </div>
                )}

                {/* ROW 7: LATEST RACE FINISH */}
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
                Select Teammates or Rivals
              </h3>
              <p className="text-[12px] text-on-surface-variant mt-2 max-w-[280px]">
                Choose two drivers from the dropdowns above to trigger their head-to-head qualifying, race records, average finishes, and form.
              </p>
            </GlassCard>
          )}
        </>
      ) : (
        <>
          {/* Constructors Selection Grid */}
          <div className="grid grid-cols-11 items-center gap-2">
            <div className="col-span-5">
              <select
                value={constAId}
                onChange={(e) => setConstAId(e.target.value)}
                className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2.5 px-4 rounded-full border border-outline/30 focus:outline-none focus:border-primary/80 transition-colors cursor-pointer appearance-none text-center"
                aria-label="Select Team A"
              >
                <option value="">Select Team A</option>
                {constructors
                  .filter((c) => c.id !== constBId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-span-1 text-center text-[11px] font-bold text-on-surface-variant tracking-wider font-mono">
              VS
            </div>

            <div className="col-span-5">
              <select
                value={constBId}
                onChange={(e) => setConstBId(e.target.value)}
                className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2.5 px-4 rounded-full border border-outline/30 focus:outline-none focus:border-primary/80 transition-colors cursor-pointer appearance-none text-center"
                aria-label="Select Team B"
              >
                <option value="">Select Team B</option>
                {constructors
                  .filter((c) => c.id !== constAId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Constructors Head-to-Head Cards */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard
              variant="structural"
              className="p-4 flex flex-col items-center text-center gap-3 relative border border-outline/15 min-h-[140px] justify-center"
              style={{ borderLeft: `4px solid ${tColorA}` }}
            >
              {teamA ? (
                <div>
                  <p className="text-[20px] font-black text-on-surface leading-tight uppercase">{teamA.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
                    Ranked P{teamA.position}
                  </p>
                </div>
              ) : (
                <span className="text-[12px] text-on-surface-variant">Choose Team A</span>
              )}
            </GlassCard>

            <GlassCard
              variant="structural"
              className="p-4 flex flex-col items-center text-center gap-3 relative border border-outline/15 min-h-[140px] justify-center"
              style={{ borderRight: `4px solid ${tColorB}` }}
            >
              {teamB ? (
                <div>
                  <p className="text-[20px] font-black text-on-surface leading-tight uppercase">{teamB.name}</p>
                  <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
                    Ranked P{teamB.position}
                  </p>
                </div>
              ) : (
                <span className="text-[12px] text-on-surface-variant">Choose Team B</span>
              )}
            </GlassCard>
          </div>

          {/* Team Comparison Details */}
          {teamA && teamB ? (
            <GlassCard className="p-4 flex flex-col gap-4 border border-outline/25" variant="floating">
              <div className="flex flex-col gap-5 divide-y divide-outline/10">
                {/* Points */}
                <div className="grid grid-cols-3 items-center text-center pt-2">
                  <span className="telemetry-numeric text-[18px] font-bold text-on-surface">{tPointsA} PTS</span>
                  <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">Total Points</span>
                  <span className="telemetry-numeric text-[18px] font-bold text-on-surface">{tPointsB} PTS</span>

                  <div className="col-span-3 flex flex-col gap-2 mt-4 px-2">
                    <div className="w-full bg-outline/10 h-2.5 rounded-full overflow-hidden flex relative">
                      <div
                        style={{
                          width: animate ? `${tPctA}%` : "0%",
                          backgroundColor: tColorA,
                          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                        className="h-full rounded-l-full"
                      />
                      <div
                        style={{
                          width: animate ? `${tPctB}%` : "0%",
                          backgroundColor: tColorB,
                          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                        className="h-full rounded-r-full"
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono font-bold text-on-surface-variant">
                      <span>{tPctA.toFixed(0)}%</span>
                      <span>POINTS DISTRIBUTION (GAP: {tPointsGap} PTS)</span>
                      <span>{tPctB.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Standing Rank */}
                <div className="grid grid-cols-3 items-center text-center pt-4">
                  <span className="telemetry-numeric text-[18px] font-black text-on-surface">P{teamA.position}</span>
                  <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">Constructor Rank</span>
                  <span className="telemetry-numeric text-[18px] font-black text-on-surface">P{teamB.position}</span>
                </div>

                {/* Wins */}
                <div className="grid grid-cols-3 items-center text-center pt-4">
                  <span className="telemetry-numeric text-[18px] font-bold text-on-surface">{teamA.wins ?? 0}</span>
                  <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">Season Wins</span>
                  <span className="telemetry-numeric text-[18px] font-bold text-on-surface">{teamB.wins ?? 0}</span>
                </div>

                {/* Championships Titles */}
                <div className="grid grid-cols-3 items-center text-center pt-4">
                  <span className="telemetry-numeric text-[18px] font-bold text-on-surface">{specA?.titles ?? 0} Titles</span>
                  <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">Championship Titles</span>
                  <span className="telemetry-numeric text-[18px] font-bold text-on-surface">{specB?.titles ?? 0} Titles</span>
                </div>

                {/* Engine Partner */}
                <div className="grid grid-cols-3 items-center text-center pt-4">
                  <span className="text-[13px] font-bold text-on-surface">{specA?.engine || "—"}</span>
                  <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">Power Unit</span>
                  <span className="text-[13px] font-bold text-on-surface">{specB?.engine || "—"}</span>
                </div>

                {/* Principal */}
                <div className="grid grid-cols-3 items-center text-center pt-4">
                  <span className="text-[13px] font-bold text-on-surface">{specA?.principal || "—"}</span>
                  <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">Team Principal</span>
                  <span className="text-[13px] font-bold text-on-surface">{specB?.principal || "—"}</span>
                </div>

                {/* Factory Base */}
                <div className="grid grid-cols-3 items-center text-center pt-4">
                  <span className="text-[13px] font-bold text-on-surface">{specA?.base || "—"}</span>
                  <span className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">Factory Base</span>
                  <span className="text-[13px] font-bold text-on-surface">{specB?.base || "—"}</span>
                </div>
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
                Select Team Rivals
              </h3>
              <p className="text-[12px] text-on-surface-variant mt-2 max-w-[280px]">
                Choose two constructors from the dropdowns above to compare standings position, total points, engine power, principal, and historical titles.
              </p>
            </GlassCard>
          )}
        </>
      )}

      {/* ── Cross-Series Comparison Section ── */}
      <CrossCompare />

      {/* Back Button */}
      <Link
        href="/standings"
        className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity mt-6"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Standings
      </Link>
    </PageContainer>
  );
}
