import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";
import { GlassCard } from "@/components/ui/GlassCard";
import { getTeamColor } from "@/lib/team-colors";
import {
  getHistoricalDriverStandings,
  getHistoricalConstructorStandings,
  getHistoricalRaceSchedule,
} from "@/lib/api/f1";
import { HistoryTimeline } from "@/components/archive/HistoryTimeline";

interface ArchivePageProps {
  searchParams: Promise<{ year?: string; tab?: string }>;
}

export const revalidate = 86400; // Cache historical pages for 1 day

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const { year = "2025", tab = "drivers" } = await searchParams;

  const [drivers, constructors, schedule] = await Promise.all([
    getHistoricalDriverStandings(year),
    getHistoricalConstructorStandings(year),
    getHistoricalRaceSchedule(year),
  ]);

  const driverChamp = drivers[0] || null;
  const constructorChamp = constructors[0] || null;

  // Historic fact lookup
  const getHistoricFact = (y: string): string => {
    const facts: Record<string, string> = {
      "2026": "The introduction of sustainable power grids, active aerodynamic flaps, and tighter driver weight restrictions.",
      "2023": "Max Verstappen establishes new records for dominance, securing 19 wins in 22 starts.",
      "2021": "One of the most intense title deciders in history saw Verstappen clinch the crown on the final lap in Abu Dhabi.",
      "2016": "Nico Rosberg secures the title over Lewis Hamilton in a tense battle, announcing his retirement shortly after.",
      "2012": "Sebastian Vettel clinches a dramatic third consecutive title in Brazil, overcoming a first-lap crash.",
      "2004": "Michael Schumacher dominates with Ferrari, winning 13 of the 18 races to claim his 7th title.",
      "1998": "Mika Häkkinen wins his first World Championship for McLaren, edging out Michael Schumacher's Ferrari.",
      "1988": "McLaren dominates the season, winning 15 out of 16 races with Ayrton Senna and Alain Prost.",
      "1976": "James Hunt wins the title by one point after Niki Lauda's legendary recovery from a near-fatal Nürburgring crash.",
      "1950": "The inaugural Formula 1 World Championship, won by Giuseppe Farina in an Alfa Romeo.",
    };
    return facts[y] || `Formula 1 season showcasing ${schedule.length} grand prix races across the globe.`;
  };

  return (
    <PageContainer gap="md" className="pb-12">
      {/* Back link */}
      <div className="flex items-center">
        <Link
          href="/standings"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Standings
        </Link>
      </div>

      {/* Header and selector */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          Formula 1 Archive
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
          Season History Explorer
        </h1>
      </div>

      {/* History timeline slider */}
      <HistoryTimeline currentYear={year} currentTab={tab} />

      {/* Summary highlight cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PageSection title="Driver Champion">
          <GlassCard
            variant="structural"
            className="p-5 flex flex-col justify-center min-h-[120px] border border-outline/15 relative overflow-hidden"
            style={{ borderLeft: driverChamp ? `4px solid ${getTeamColor(driverChamp.subtitle)}` : undefined }}
          >
            {driverChamp ? (
              <>
                <span className="text-[22px] font-black text-on-surface uppercase tracking-tight truncate">
                  {driverChamp.name}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
                  {driverChamp.subtitle}
                </span>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-outline/10 text-[12px] font-mono">
                  <span className="text-primary font-bold">{driverChamp.points} PTS</span>
                  <span className="text-on-surface-variant">{driverChamp.wins} WINS</span>
                </div>
              </>
            ) : (
              <span className="text-[12px] text-on-surface-variant">No champion details found.</span>
            )}
          </GlassCard>
        </PageSection>

        <PageSection title="Constructor Champion">
          <GlassCard
            variant="structural"
            className="p-5 flex flex-col justify-center min-h-[120px] border border-outline/15 relative overflow-hidden"
            style={{ borderLeft: constructorChamp ? `4px solid ${getTeamColor(constructorChamp.name)}` : undefined }}
          >
            {constructorChamp ? (
              <>
                <span className="text-[22px] font-black text-on-surface uppercase tracking-tight truncate">
                  {constructorChamp.name}
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
                  Constructor Champion
                </span>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-outline/10 text-[12px] font-mono">
                  <span className="text-primary font-bold">{constructorChamp.points} PTS</span>
                  <span className="text-on-surface-variant">{constructorChamp.wins} WINS</span>
                </div>
              </>
            ) : (
              <span className="text-[12px] text-on-surface-variant">No constructor champion details found.</span>
            )}
          </GlassCard>
        </PageSection>

        <PageSection title="Season Highlight Fact">
          <GlassCard variant="structural" className="p-5 flex flex-col justify-center min-h-[120px] text-[12px] border border-outline/15 leading-relaxed text-on-surface-variant">
            <span className="font-extrabold text-on-surface uppercase block text-[10px] tracking-wider mb-1 text-primary">
              Historic Fact
            </span>
            {getHistoricFact(year)}
          </GlassCard>
        </PageSection>
      </div>

      {/* Main Content Layout with internal tabs */}
      <div className="flex flex-col gap-4">
        {/* Navigation Tabs bar */}
        <div className="flex bg-surface-2/40 border border-outline/35 rounded-full p-1 self-start gap-1 select-none">
          <Link
            href={`/archive?year=${year}&tab=drivers`}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all ${
              tab === "drivers"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Drivers Standings
          </Link>
          <Link
            href={`/archive?year=${year}&tab=constructors`}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all ${
              tab === "constructors"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Constructors
          </Link>
          <Link
            href={`/archive?year=${year}&tab=schedule`}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all ${
              tab === "schedule"
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Race Schedule
          </Link>
        </div>

        {/* Tab contents */}
        <GlassCard className="p-4 border border-outline/25 overflow-hidden" variant="structural">
          {tab === "drivers" && (
            <div className="flex flex-col">
              <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase border-b border-outline/5">
                <span className="col-span-2">POS</span>
                <span className="col-span-6">DRIVER</span>
                <span className="col-span-2 text-right">WINS</span>
                <span className="col-span-2 text-right">POINTS</span>
              </div>
              {drivers.length === 0 ? (
                <p className="text-[12px] text-on-surface-variant text-center py-10">No standings logged for driver championship in {year}.</p>
              ) : (
                drivers.map((d) => {
                  const tColor = getTeamColor(d.subtitle);
                  return (
                    <div
                      key={d.id}
                      className="grid grid-cols-12 items-center py-3 px-3 border-b border-outline/10 last:border-b-0 hover-glass rounded-lg text-[13px] font-medium text-on-surface"
                    >
                      <span className="col-span-2 font-mono font-black text-on-surface-variant">P{d.position}</span>
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                        <span className="h-3 w-1.5 rounded-full shrink-0" style={{ backgroundColor: tColor }} />
                        <span className="font-bold truncate pr-2">{d.name}</span>
                        <span className="text-[11px] text-on-surface-variant hidden sm:inline truncate">{d.subtitle}</span>
                      </div>
                      <span className="col-span-2 text-right font-mono text-on-surface-variant">{d.wins}</span>
                      <span className="col-span-2 text-right font-mono font-bold text-primary">{d.points}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "constructors" && (
            <div className="flex flex-col">
              <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase border-b border-outline/5">
                <span className="col-span-2">POS</span>
                <span className="col-span-6">CONSTRUCTOR</span>
                <span className="col-span-2 text-right">WINS</span>
                <span className="col-span-2 text-right">POINTS</span>
              </div>
              {constructors.length === 0 ? (
                <p className="text-[12px] text-on-surface-variant text-center py-10">No standings logged for constructor championship in {year}.</p>
              ) : (
                constructors.map((c) => {
                  const tColor = getTeamColor(c.name);
                  return (
                    <div
                      key={c.id}
                      className="grid grid-cols-12 items-center py-3 px-3 border-b border-outline/10 last:border-b-0 hover-glass rounded-lg text-[13px] font-medium text-on-surface"
                    >
                      <span className="col-span-2 font-mono font-black text-on-surface-variant">P{c.position}</span>
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                        <span className="h-3 w-1.5 rounded-full shrink-0" style={{ backgroundColor: tColor }} />
                        <span className="font-bold truncate pr-2">{c.name}</span>
                      </div>
                      <span className="col-span-2 text-right font-mono text-on-surface-variant">{c.wins}</span>
                      <span className="col-span-2 text-right font-mono font-bold text-primary">{c.points}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === "schedule" && (
            <div className="flex flex-col">
              <div className="grid grid-cols-12 px-3 py-1.5 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase border-b border-outline/5">
                <span className="col-span-2">ROUND</span>
                <span className="col-span-6">GRAND PRIX</span>
                <span className="col-span-4 text-right">CIRCUIT LOCATION</span>
              </div>
              {schedule.length === 0 ? (
                <p className="text-[12px] text-on-surface-variant text-center py-10">No race events scheduled in {year}.</p>
              ) : (
                schedule.map((r) => {
                  return (
                    <div
                      key={r.round}
                      className="grid grid-cols-12 items-center py-3 px-3 border-b border-outline/10 last:border-b-0 hover-glass rounded-lg text-[13px] font-medium text-on-surface"
                    >
                      <span className="col-span-2 font-mono font-black text-on-surface-variant">R{r.round}</span>
                      <span className="col-span-6 font-bold truncate pr-2">{r.raceName}</span>
                      <span className="col-span-4 text-right text-on-surface-variant truncate font-mono text-[11px]">
                        {r.locality}, {r.country}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </GlassCard>
      </div>
      
      {/* Mobile Safe Bar Spacer */}
      <div className="h-16 md:hidden" />
    </PageContainer>
  );
}
