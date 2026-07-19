import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getChampionshipMeta,
  getChampionshipStandings,
  getChampionshipCalendar
} from "@/lib/api/motorsport";

interface PageProps {
  params: Promise<{ seriesId: string }>;
}

export default async function ChampionshipHubPage({ params }: PageProps) {
  const { seriesId } = await params;
  const meta = getChampionshipMeta(seriesId);

  if (!meta) {
    notFound();
  }

  const standings = getChampionshipStandings(seriesId);
  const calendar = getChampionshipCalendar(seriesId);

  return (
    <PageContainer gap="md" className="pb-12 max-w-5xl mx-auto">
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

      {/* Header section */}
      <GlassCard variant="floating" className="p-6 md:p-8 border border-outline/25 relative overflow-hidden flex flex-col justify-between gap-4">
        <div className="absolute right-0 top-0 w-32 h-32 opacity-10 bg-primary blur-3xl rounded-full" />
        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md uppercase font-mono">
              {meta.category}
            </span>
            <span className="text-[10px] font-bold tracking-widest text-on-surface-variant bg-surface-2 px-2.5 py-1 rounded-md uppercase font-mono">
              Region: {meta.baseRegion}
            </span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-bold tracking-tight text-on-surface leading-tight mt-1 uppercase">
            {meta.name}
          </h1>
          <p className="text-[13.5px] text-on-surface-variant max-w-xl font-medium mt-1 leading-relaxed">
            {meta.history}
          </p>
        </div>
      </GlassCard>

      {/* Overview & Regulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-2">
        <PageSection title="Championship Regulations">
          <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15 text-[13px] leading-relaxed">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Engine & Chassis Specs</span>
              <p className="text-on-surface-variant font-medium">{meta.rules}</p>
            </div>
            <div className="flex flex-col gap-1 border-t border-outline/10 pt-3">
              <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Point Allocation System</span>
              <p className="text-on-surface-variant font-medium">{meta.pointsSystem}</p>
            </div>
          </GlassCard>
        </PageSection>

        <PageSection title="Championship Schedule rounds">
          <div className="flex flex-col gap-3">
            {calendar.map((c) => (
              <GlassCard key={c.round} variant="structural" className="p-4 flex items-center justify-between border border-outline/15">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold text-primary font-mono uppercase tracking-wider">
                      Round {c.round}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-outline/40" />
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {c.location}, {c.country}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-bold text-on-surface truncate">
                    {c.raceName}
                  </h4>
                  <p className="text-[11.5px] text-on-surface-variant/80 font-medium truncate mt-0.5">
                    Circuit: {c.circuitName}
                  </p>
                </div>
                <span className="telemetry-numeric text-[12px] font-bold text-on-surface shrink-0 ml-4 font-mono">
                  {new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </GlassCard>
            ))}
          </div>
        </PageSection>
      </div>

      {/* Standings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mt-2">
        {/* Drivers standings */}
        <PageSection title="Driver Standings (Top 3)">
          <GlassCard variant="structural" className="p-1 flex flex-col border border-outline/15">
            <div className="flex items-center h-9 px-4 gap-3 bg-surface/60 border-b border-outline/15 text-[10px] font-black uppercase text-on-surface-variant font-mono">
              <span className="w-8 shrink-0 text-center">Pos</span>
              <span className="flex-1">Driver</span>
              <span className="w-16 text-right">Points</span>
            </div>
            {standings.drivers.map((d) => (
              <div key={d.position} className="flex items-center h-12 px-4 gap-3 border-b border-outline/10 last:border-0 hover:bg-surface-2/20">
                <span className="w-8 shrink-0 text-center font-mono font-bold text-on-surface-variant/50 text-[12.5px]">
                  P{d.position}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-on-surface truncate">{d.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-mono font-bold">{d.team}</p>
                </div>
                <span className="w-16 text-right font-mono font-bold text-primary text-[13px]">
                  {d.points}
                </span>
              </div>
            ))}
          </GlassCard>
        </PageSection>

        {/* Teams standings */}
        <PageSection title="Team Standings (Top 3)">
          <GlassCard variant="structural" className="p-1 flex flex-col border border-outline/15">
            <div className="flex items-center h-9 px-4 gap-3 bg-surface/60 border-b border-outline/15 text-[10px] font-black uppercase text-on-surface-variant font-mono">
              <span className="w-8 shrink-0 text-center">Pos</span>
              <span className="flex-1">Team</span>
              <span className="w-16 text-right">Points</span>
            </div>
            {standings.teams.map((t) => (
              <div key={t.position} className="flex items-center h-12 px-4 gap-3 border-b border-outline/10 last:border-0 hover:bg-surface-2/20">
                <span className="w-8 shrink-0 text-center font-mono font-bold text-on-surface-variant/50 text-[12.5px]">
                  P{t.position}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold text-on-surface truncate">{t.name}</p>
                </div>
                <span className="w-16 text-right font-mono font-bold text-primary text-[13px]">
                  {t.points}
                </span>
              </div>
            ))}
          </GlassCard>
        </PageSection>
      </div>
    </PageContainer>
  );
}
