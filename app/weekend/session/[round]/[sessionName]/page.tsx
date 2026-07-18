import React from "react";
import { notFound } from "next/navigation";
import { getResolvedSeason, getRaceResultsForRound } from "@/lib/api/f1";
import { getFastF1SessionData } from "@/lib/api/fastf1-client";
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

  // 1. Fetch FastF1 session data
  const fastF1Data = await getFastF1SessionData(currentSeason, roundNum, decodedSessionName);

  // 2. Fetch fallback Ergast results if it's a Race or Sprint and FastF1 failed
  const isRaceOrSprint = decodedSessionName.toLowerCase().includes("race") || decodedSessionName.toLowerCase().includes("sprint");
  let fallbackData = null;
  if (!fastF1Data && isRaceOrSprint) {
    fallbackData = await getRaceResultsForRound(roundNum);
  }

  // If there is no data at all (e.g. invalid round or upcoming/unplayed session), we display the fallback state inside client dashboard
  return (
    <SessionAnalysisClient
      round={roundNum}
      sessionName={decodedSessionName}
      fastF1Data={fastF1Data}
      fallbackData={fallbackData}
    />
  );
}
