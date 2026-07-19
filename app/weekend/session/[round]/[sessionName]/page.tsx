import React from "react";
import { notFound } from "next/navigation";
import { getResolvedSeason, getRaceResultsForRound, getRaceSchedule } from "@/lib/api/f1";
import { mapSessionLabelToCode } from "@/lib/f1/session-utils";
import { F1Coordinator } from "@/lib/providers/services/f1-coordinator";
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
      mapSessionLabelToCode(s.label) === mapSessionLabelToCode(decodedSessionName)
  );

  // 2. Fetch session data from OpenF1 via coordinator
  const sessionData = await F1Coordinator.getSessionData(currentSeason, roundNum, decodedSessionName);
  const hasSessionData = sessionData && sessionData.success;

  // 3. Fetch fallback Ergast results if it's a Race or Sprint and session data failed
  const isRaceOrSprint = decodedSessionName.toLowerCase().includes("race") || decodedSessionName.toLowerCase().includes("sprint");
  let fallbackData = null;
  if (!hasSessionData && isRaceOrSprint) {
    fallbackData = await getRaceResultsForRound(roundNum);
  }

  // Pass session context to the client dashboard
  return (
    <SessionAnalysisClient
      round={roundNum}
      sessionName={decodedSessionName}
      sessionData={sessionData}
      fallbackData={fallbackData}
      sessionDate={session?.date || null}
      sessionTime={session?.time || null}
    />
  );
}
