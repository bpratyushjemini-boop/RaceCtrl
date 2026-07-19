import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";
import { IntelligenceFeed } from "@/components/ai/IntelligenceFeed";
import { PredictionGame } from "@/components/predictions/PredictionGame";
import { SocialHub } from "@/components/social/SocialHub";
import { AchievementsEngine } from "@/components/social/AchievementsEngine";
import { AIRaceEngineer } from "@/components/ai/AIRaceEngineer";
import { AIWeekendAssistant } from "@/components/ai/AIWeekendAssistant";
import { AISearch } from "@/components/search/AISearch";

export const metadata = {
  title: "RaceCtrl Fan Hub",
  description: "Join the Formula 1 community: place race weekend predictions, claim achievement badges, and read verified briefings.",
};

export default function CommunityPage() {
  return (
    <PageContainer gap="md" className="pb-12 max-w-6xl mx-auto">
      {/* Back button */}
      <div className="flex items-center">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Header block */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          F1 Paddock Hub
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none uppercase">
          Paddock Hub
        </h1>
        <p className="text-[13px] text-on-surface-variant mt-1.5">
          Submit race predictions, challenge friends on the leaderboard, view badge milestones, and read verified telemetry briefs.
        </p>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (AI Assistant, Search, & Feed) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AIRaceEngineer />
            <AIWeekendAssistant />
          </div>

          <PageSection title="AI Natural Query Search">
            <AISearch />
          </PageSection>

          <PageSection title="RaceCtrl Intelligence briefings">
            <IntelligenceFeed />
          </PageSection>

          <PageSection title="My Trophy Case">
            <AchievementsEngine />
          </PageSection>
        </div>

        {/* Right Column (Predictions & Social) */}
        <div className="flex flex-col gap-6">
          <PageSection title="Fantasy Predictions">
            <PredictionGame />
          </PageSection>

          <PageSection title="Paddock Connections">
            <SocialHub />
          </PageSection>
        </div>
      </div>
    </PageContainer>
  );
}
