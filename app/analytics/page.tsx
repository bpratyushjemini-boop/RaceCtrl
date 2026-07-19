import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { AnalyticsEngine } from "@/components/analytics/AnalyticsEngine";
import { StrategySimulator } from "@/components/analytics/StrategySimulator";

export const metadata = {
  title: "RaceCtrl Analytics Center",
  description: "Advanced Formula 1 driver statistics, consistency index ratings, and win probability progression maps.",
};

export default function AnalyticsPage() {
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
          Precision Metrics
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none uppercase">
          Analytics Center
        </h1>
        <p className="text-[13px] text-on-surface-variant mt-1.5">
          Evaluate qualifying pace deltas, street track consistency ratings, and what-if strategy projections.
        </p>
      </div>

      {/* Analytics Engine Interactive Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mt-2">
        <AnalyticsEngine />
        <StrategySimulator />
      </div>
    </PageContainer>
  );
}
