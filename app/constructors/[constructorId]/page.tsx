import Link from "next/link";
import { notFound } from "next/navigation";
import { getConstructorProfile } from "@/lib/api/f1";
import { getTeamColor } from "@/lib/team-colors";
import { ConstructorMark } from "@/components/ui/ConstructorMark";
import { DriverAvatar } from "@/components/ui/DriverAvatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";
import { ConstructorActions } from "@/components/constructors/ConstructorActions";

interface PageProps {
  params: Promise<{ constructorId: string }>;
}

export default async function ConstructorProfilePage({ params }: PageProps) {
  const { constructorId } = await params;
  
  const constructor = await getConstructorProfile(constructorId);

  if (!constructor) {
    notFound();
  }

  const teamColor = getTeamColor(constructor.name);

  return (
    <PageContainer className="pb-12">
      {/* ── Breadcrumbs ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/standings?tab=constructors"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Standings
        </Link>
        <ConstructorActions
          constructorId={constructor.id}
          constructorName={constructor.name}
        />
      </div>

      {/* ── Upgraded Constructor Hero Card ── */}
      <GlassCard
        variant="floating"
        className="relative overflow-hidden p-6 md:p-8 border border-outline/30 flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          background: `linear-gradient(135deg, ${teamColor}0F 0%, var(--glass-content-bg) 70%, var(--color-bg) 100%)`,
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-[4px]"
          style={{ backgroundColor: teamColor }}
        />

        <div className="flex items-center gap-5 z-10">
          <ConstructorMark constructorId={constructor.id} size="hero" name={constructor.name} />
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-tight uppercase">
              {constructor.name}
            </h1>
            <p className="text-[13px] text-on-surface-variant font-medium mt-1 uppercase tracking-wider">
              {constructor.base || "Formula 1 Constructor"}
            </p>
            {constructor.carName && (
              <p className="text-[11px] text-primary font-bold mt-1.5 uppercase tracking-wider font-mono">
                Chassis: {constructor.carName} · Team Principal: {constructor.principal}
              </p>
            )}
          </div>
        </div>

        {/* Championship Standing Metrics */}
        <div className="border-t md:border-t-0 md:border-l border-outline/15 pt-4 md:pt-0 md:pl-6 flex items-center gap-6 text-[13px] font-bold tracking-wider uppercase text-on-surface z-10 shrink-0">
          <div>
            Rank <span className="telemetry-numeric text-primary ml-1 text-[15px]">P{constructor.position}</span>
          </div>
          <div className="h-4 w-[1px] bg-outline/25" />
          <div>
            Points <span className="telemetry-numeric text-on-surface ml-1 text-[15px]">{constructor.points}</span>
          </div>
        </div>
      </GlassCard>

      {/* ── Grid Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Team Specifications & Championships */}
        <div className="flex flex-col gap-5">
          {/* specifications card */}
          <PageSection title="Team Statistics">
            <GlassCard variant="structural" className="p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3.5 text-[12px] font-tabular">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Position</span>
                  <span className="text-[16px] font-bold text-on-surface mt-0.5">P{constructor.position}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Points</span>
                  <span className="text-[16px] font-bold text-on-surface mt-0.5">{constructor.points}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Wins</span>
                  <span className="text-[16px] font-bold text-on-surface mt-0.5">{constructor.wins}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Podiums</span>
                  <span className="text-[16px] font-bold text-on-surface mt-0.5">{constructor.podiums}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Poles</span>
                  <span className="text-[16px] font-bold text-on-surface mt-0.5">{constructor.poles}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Championships</span>
                  <span className="text-[16px] font-bold text-primary mt-0.5">{constructor.championships || "0"} World Titles</span>
                </div>
              </div>
            </GlassCard>
          </PageSection>

          {/* Quick Specifications details */}
          <PageSection title="Factory Specifications">
            <GlassCard variant="structural" className="p-4 flex flex-col gap-2.5 text-[12px]">
              <div className="flex justify-between py-1.5 border-b border-outline/10 first:pt-0">
                <span className="text-on-surface-variant">Team Principal:</span>
                <span className="font-bold text-on-surface">{constructor.principal || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline/10">
                <span className="text-on-surface-variant">Car/Chassis:</span>
                <span className="font-bold text-on-surface">{constructor.carName || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-outline/10">
                <span className="text-on-surface-variant">Base Location:</span>
                <span className="font-bold text-on-surface text-right">{constructor.base || "—"}</span>
              </div>
              <div className="flex justify-between py-1.5 last:border-0 last:pb-0">
                <span className="text-on-surface-variant">First Entry Year:</span>
                <span className="font-bold text-on-surface">{constructor.firstEntry || "—"}</span>
              </div>
            </GlassCard>
          </PageSection>
        </div>

        {/* Right Column: Active Drivers and Form */}
        <div className="flex flex-col gap-5">
          {/* Active Drivers */}
          <PageSection title="Active Drivers">
            <div className="flex flex-col gap-3">
              {constructor.drivers.map((driver) => (
                <Link
                  key={driver.id}
                  href={`/drivers/${driver.id}`}
                  className="block hover:opacity-95 transition-opacity"
                >
                  <GlassCard
                    variant="structural"
                    className="p-4 flex items-center justify-between border border-outline/15 hover:border-primary/25 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3.5">
                      <DriverAvatar
                        driverId={driver.id}
                        driverName={driver.name}
                        team={constructor.name}
                        size="md"
                        showTeamDot={true}
                      />
                      <div>
                        <p className="text-[14px] font-bold text-on-surface">{driver.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono font-bold tracking-wider uppercase mt-0.5">
                          P{driver.position} · {driver.points} PTS
                        </p>
                      </div>
                    </div>
                    <svg className="h-4 w-4 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </PageSection>

          {/* Recent Form */}
          {constructor.recentResults.length > 0 && (
            <PageSection title="Recent Form">
              <GlassCard variant="structural" className="p-1 flex flex-col">
                {constructor.recentResults.map((res) => (
                  <div
                    key={res.round}
                    className="flex items-center h-[52px] gap-4 border-b border-outline/10 last:border-0 px-4"
                  >
                    <span className="telemetry-numeric text-[11px] text-on-surface-variant/50 w-6 shrink-0 font-mono">
                      R{res.round}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-on-surface truncate">
                        {res.raceName}
                      </p>
                    </div>
                    <span className="telemetry-numeric text-[13px] font-bold text-primary w-16 text-right font-mono">
                      +{res.points} PTS
                    </span>
                  </div>
                ))}
              </GlassCard>
            </PageSection>
          )}
        </div>

      </div>

      {/* ── Team History & Technical Specs ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <PageSection title="History & Heritage" className="md:col-span-2">
          <GlassCard variant="structural" className="p-5 flex flex-col gap-3">
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              {constructor.name} is a historic Formula 1 team. Operating out of their primary base in {constructor.base || "Europe"}, the organization has designed and raced iconic chassis configurations, securing a lasting legacy in motor racing history.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline/10 text-[12px] font-tabular">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Engine Partner</span>
                <span className="text-[14px] font-bold text-on-surface mt-0.5">{constructor.name.includes("Ferrari") || constructor.name.includes("Haas") ? "Ferrari" : constructor.name.includes("Mercedes") || constructor.name.includes("McLaren") || constructor.name.includes("Williams") || constructor.name.includes("Aston") ? "Mercedes" : constructor.name.includes("Red Bull") || constructor.name.includes("RB") ? "Honda RBPT" : "Renault"} Power</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">First Entry</span>
                <span className="text-[14px] font-bold text-on-surface mt-0.5">{constructor.firstEntry || "N/A"}</span>
              </div>
            </div>
          </GlassCard>
        </PageSection>

        <PageSection title="Historical Timeline">
          <GlassCard variant="structural" className="p-5 flex flex-col gap-4 text-[12px]">
            <div className="flex flex-col gap-1 border-l-2 border-primary pl-3 py-1">
              <span className="font-bold text-on-surface font-mono">Modern Era</span>
              <span className="text-on-surface-variant text-[11px]">Consolidating structure and scoring regular constructor points.</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-outline pl-3 py-1">
              <span className="font-bold text-on-surface font-mono">Debut Year</span>
              <span className="text-on-surface-variant text-[11px]">First competitive entry in {constructor.firstEntry || "Formula 1"}.</span>
            </div>
          </GlassCard>
        </PageSection>
      </div>
    </PageContainer>
  );
}
