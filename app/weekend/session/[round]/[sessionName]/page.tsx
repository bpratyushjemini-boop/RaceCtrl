import React from "react";
import { notFound } from "next/navigation";
import { getResolvedSeason, getRaceResultsForRound, getRaceSchedule } from "@/lib/api/f1";
import { getFastF1SessionData, mapSessionLabelToFastF1Code } from "@/lib/api/fastf1-client";
import SessionAnalysisClient from "@/components/session/SessionAnalysisClient";

export const revalidate = 300; // Cache pages for 5 minutes

interface PageProps {
  params: Promise<{
    round: string;
    sessionName: string;
  }>;
}

export default async function SessionAnalysisPage({ params }: PageProps) {
  const { round, sessionName } = await params;

  const roundNum = parseInt(round, 10);
  if (isNaN(roundNum) || roundNum < 1 || roundNum > 30) {
    return notFound();
  }

  const decodedSessionName = decodeURIComponent(sessionName);
  const currentSeason = parseInt(getResolvedSeason(), 10) || 2026;

  // 1. Fetch race schedule to resolve scheduled session time
  const schedule = await getRaceSchedule();
  const weekend = schedule.find((r) => r.round === roundNum);
  const session = weekend?.sessions.find(
    (s) =>
      s.label.toLowerCase() === decodedSessionName.toLowerCase() ||
      mapSessionLabelToFastF1Code(s.label) === mapSessionLabelToFastF1Code(decodedSessionName)
  );

  // 2. Fetch FastF1 session data
  const fastF1Data = await getFastF1SessionData(currentSeason, roundNum, decodedSessionName);
  const hasFastF1 = fastF1Data && fastF1Data.success;

  // 3. Fetch fallback Ergast results if it's a Race or Sprint and FastF1 failed
  const isRaceOrSprint = decodedSessionName.toLowerCase().includes("race") || decodedSessionName.toLowerCase().includes("sprint");
  let fallbackData = null;
  if (!hasFastF1 && isRaceOrSprint) {
    fallbackData = await getRaceResultsForRound(roundNum);
  }

  // Pass session context to the client dashboard
  return (
    <SessionAnalysisClient
      round={roundNum}
      sessionName={decodedSessionName}
      fastF1Data={fastF1Data}
      fallbackData={fallbackData}
      sessionDate={session?.date || null}
      sessionTime={session?.time || null}
    />
  );
}
