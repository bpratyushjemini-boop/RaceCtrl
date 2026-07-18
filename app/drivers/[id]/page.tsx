import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getDriverProfile, getDriverStandings, getResolvedSeason } from "@/lib/api/f1";
import { getTeamColor } from "@/lib/team-colors";
import { GlassCard } from "@/components/ui/GlassCard";
import { DriverActions } from "@/components/drivers/DriverActions";
import { DriverAvatar } from "@/components/ui/DriverAvatar";
import { resolveDriverMedia } from "@/lib/media/resolver";
import { getDriverChampionshipContext } from "@/lib/f1/insights";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DriverProfilePage({ params }: PageProps) {
  const { id } = await params;
  const [driver, standings] = await Promise.all([
    getDriverProfile(id),
    getDriverStandings(),
  ]);

  if (!driver) {
    notFound();
  }

  const teamColor = getTeamColor(driver.team);
  const media = resolveDriverMedia(driver.id, `${driver.givenName} ${driver.familyName}`);
  const hasPortrait = !!media.portrait;
  const championshipContext = getDriverChampionshipContext(
    { id: driver.id, position: driver.position, name: `${driver.givenName} ${driver.familyName}`, subtitle: driver.team, points: driver.points, wins: driver.wins },
    standings
  );

  return (
    <PageContainer className="pb-12">
      {/* ── Breadcrumbs and Global Actions ── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/standings"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Standings
        </Link>
        <DriverActions
          driverId={driver.id}
          driverName={`${driver.givenName} ${driver.familyName}`}
          driverCode={driver.code}
        />
      </div>

      {/* ── Upgraded Premium Media-Rich Hero Card ── */}
      <GlassCard
        variant="floating"
        className="relative overflow-hidden p-6 md:p-8 border border-outline/30 flex flex-col justify-between gap-6"
        style={{
          background: `linear-gradient(135deg, ${teamColor}0F 0%, var(--glass-content-bg) 70%, var(--color-bg) 100%)`,
        }}
      >
        {/* Subtle Team Color Corner Slash / Accent Gradient Backdrop */}
        <div
          className="absolute right-0 top-0 w-44 h-44 opacity-15 blur-3xl rounded-full"
          style={{ backgroundColor: teamColor }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-[4px]"
          style={{ backgroundColor: teamColor }}
        />

        {/* Integrated Background Portrait (when registered) */}
        {hasPortrait && (
          <div 
            className="absolute bottom-0 right-0 top-0 w-[45%] md:w-[35%] pointer-events-none select-none z-0"
            style={{
              maskImage: "linear-gradient(to left, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0) 100%)",
            }}
          >
            <Image
              src={media.portrait!}
              alt={`${driver.givenName} ${driver.familyName}`}
              fill
              className="object-cover object-bottom transition-opacity duration-300"
              style={{ objectPosition: media.focalPosition || "center bottom" }}
              sizes="(max-width: 768px) 45vw, 35vw"
              priority
            />
          </div>
        )}

        {/* Giant background outlined code and number */}
        <div className="absolute right-4 bottom-2 telemetry-numeric text-[130px] font-black select-none pointer-events-none text-on-surface/[0.03] font-mono leading-none tracking-tighter">
          {driver.number}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="flex flex-col gap-2 flex-1">
            <span
              className="text-[11px] font-bold tracking-widest uppercase font-mono px-2.5 py-1 rounded-md bg-surface-2 border border-outline/20 self-start"
              style={{ color: teamColor }}
            >
              {driver.team}
            </span>
            
            <h1 className="text-[28px] md:text-[36px] font-bold tracking-tight text-on-surface leading-tight mt-1">
              {driver.givenName} <span className="text-primary">{driver.familyName}</span>
            </h1>
            
            <div className="flex items-center gap-2.5 text-[13px] text-on-surface-variant font-medium mt-0.5">
              <span>{driver.nationality}</span>
              <span className="h-1 w-1 rounded-full bg-outline/40" />
              <span>Born {new Date(driver.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
          </div>

          {/* Large Premium Avatar Fallback on Right (Only if no background portrait is rendered) */}
          {!hasPortrait && (
            <div className="flex items-center gap-4 shrink-0 md:self-center">
              <DriverAvatar
                driverId={driver.id}
                driverName={`${driver.givenName} ${driver.familyName}`}
                team={driver.team}
                size="hero"
                showTeamDot={true}
              />
            </div>
          )}
        </div>

        {/* Quick Standing Info */}
        <div className="border-t border-outline/15 pt-4 mt-2 flex items-center gap-6 text-[13px] font-bold tracking-wider uppercase text-on-surface z-10">
          <div>
            Position <span className="telemetry-numeric text-primary ml-1 text-[15px]">P{driver.position}</span>
          </div>
          <div className="h-4 w-[1px] bg-outline/25" />
          <div>
            Points <span className="telemetry-numeric text-on-surface ml-1 text-[15px]">{driver.points}</span>
          </div>
          {driver.wins > 0 && (
            <>
              <div className="h-4 w-[1px] bg-outline/25" />
              <div>
                Wins <span className="telemetry-numeric text-on-surface ml-1 text-[15px]">{driver.wins}</span>
              </div>
            </>
          )}
        </div>
      </GlassCard>

      {/* ── Main Dashboard Composition ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ── Championship Snapshot Stats Grid ── */}
        <PageSection title="Championship Snapshot">
          <div className="grid grid-cols-2 gap-3">
            <GlassCard className="p-4 flex flex-col gap-1">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Standings Rank
              </span>
              <span className="telemetry-numeric text-[22px] font-bold text-on-surface">
                P{driver.position || "—"}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Total Points
              </span>
              <span className="telemetry-numeric text-[22px] font-bold text-on-surface">
                {driver.points}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Grand Prix Wins
              </span>
              <span className="telemetry-numeric text-[22px] font-bold text-on-surface">
                {driver.wins}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Podiums
              </span>
              <span className="telemetry-numeric text-[22px] font-bold text-on-surface">
                {driver.podiums ?? 0}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Pole Positions
              </span>
              <span className="telemetry-numeric text-[22px] font-bold text-on-surface">
                {driver.poles ?? 0}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Fastest Laps
              </span>
              <span className="telemetry-numeric text-[22px] font-bold text-on-surface">
                {driver.fastestLaps ?? 0}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Season DNFs
              </span>
              <span className="telemetry-numeric text-[22px] font-bold text-primary">
                {driver.dnfs ?? 0}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Constructor
              </span>
              <span className="text-[13px] font-bold text-on-surface truncate mt-1">
                {driver.team}
              </span>
            </GlassCard>
          </div>
          
          <GlassCard className="p-4 flex flex-col gap-1 border border-primary/20" variant="floating">
            <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
              Championship Context
            </span>
            <span className="text-[14px] font-bold text-on-surface mt-1 uppercase font-mono">
              {championshipContext}
            </span>
          </GlassCard>
        </PageSection>

        {/* ── Recent Form Section ── */}
        <PageSection title="Recent Form">
          <GlassCard variant="structural" className="p-1 flex flex-col">
            {driver.recentResults.length === 0 ? (
              <p className="text-[12px] text-on-surface-variant p-4 text-center">
                No recent race results available.
              </p>
            ) : (
              driver.recentResults.map((res, index) => {
                const isPodium = res.position >= 1 && res.position <= 3;
                const isWinner = res.position === 1;
                const isNonFinish = res.status.toLowerCase().includes("retired") || 
                                    res.status.toLowerCase().includes("accident") || 
                                    res.status.toLowerCase().includes("collision") || 
                                    res.status.toLowerCase().includes("mechanical") ||
                                    !res.positionText.match(/^\d+$/);
                
                let badgeStyle = "bg-surface-2 text-on-surface border border-outline/25";
                if (isWinner) badgeStyle = "bg-primary/10 text-primary border border-primary/30";
                else if (isPodium) badgeStyle = "bg-surface-2 text-on-surface border border-outline/35";
                else if (isNonFinish) badgeStyle = "bg-surface-2/30 text-on-surface-variant/40 border border-outline/10";

                const displayPos = isNonFinish ? "DNF" : `P${res.position}`;

                return (
                  <div
                    key={`${res.round}-${index}`}
                    className={`flex items-center h-[52px] gap-3 border-b border-outline/10 last:border-0 px-4 ${isNonFinish ? "opacity-60" : ""}`}
                  >
                    <span className="telemetry-numeric text-[11px] text-on-surface-variant/50 w-6 shrink-0">
                      R{res.round}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-on-surface truncate">
                        {res.raceName}
                      </p>
                    </div>
                    {/* Position Badge */}
                    <span className={`telemetry-numeric flex h-7 px-2 min-w-8 items-center justify-center rounded-md text-[11px] font-bold ${badgeStyle}`}>
                      {displayPos}
                    </span>
                    {/* Points badge */}
                    <span className="telemetry-numeric text-[12px] font-bold text-on-surface-variant w-10 text-right">
                      +{res.points}
                    </span>
                  </div>
                );
              })
            )}
          </GlassCard>
        </PageSection>

      </div>

      {/* ── Teammate & Next GP Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {/* Teammate Card */}
        {driver.teammate && (
          <PageSection title="Teammate">
            <Link href={`/drivers/${driver.teammate.id}`} className="block hover:opacity-95 transition-opacity">
              <GlassCard variant="structural" className="p-4 flex items-center justify-between border border-outline/15 hover:border-primary/25 transition-all duration-200">
                <div className="flex items-center gap-3.5">
                  <DriverAvatar
                    driverId={driver.teammate.id}
                    driverName={driver.teammate.name}
                    team={driver.team}
                    size="md"
                    showTeamDot={true}
                  />
                  <div>
                    <p className="text-[14px] font-bold text-on-surface">{driver.teammate.name}</p>
                    <p className="text-[10px] text-on-surface-variant font-mono font-bold tracking-wider uppercase mt-0.5">
                      {driver.teammate.code} · Click to View Profile
                    </p>
                  </div>
                </div>
                <svg className="h-4 w-4 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </GlassCard>
            </Link>
          </PageSection>
        )}

        {/* Upcoming GP Card */}
        {driver.upcomingRace && (
          <PageSection title="Upcoming Race">
            <Link href={`/weekend/${driver.upcomingRace.round}`} className="block hover:opacity-95 transition-opacity">
              <GlassCard variant="structural" className="p-4 flex items-center justify-between border border-outline/15 hover:border-primary/25 transition-all duration-200">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold text-on-surface truncate">
                    {driver.upcomingRace.raceName}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-mono font-bold tracking-wider uppercase mt-0.5 truncate">
                    Round {driver.upcomingRace.round} · {driver.upcomingRace.circuitName}
                  </p>
                </div>
                <svg className="h-4 w-4 text-on-surface-variant shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </GlassCard>
            </Link>
          </PageSection>
        )}
      </div>

      {/* ── Qualifying Snapshot Section ── */}
      {driver.qualifyingResults.length > 0 && (
        <PageSection title="Qualifying Performance" className="mt-2">
          <GlassCard variant="structural" className="p-1 flex flex-col">
            {driver.qualifyingResults.map((qualy, index) => {
              const isPole = qualy.position === 1;
              return (
                <div
                  key={`${qualy.round}-${index}`}
                  className="flex items-center h-[52px] gap-4 border-b border-outline/10 last:border-0 px-4"
                >
                  <span className="telemetry-numeric text-[11px] text-on-surface-variant/50 w-6 shrink-0">
                    R{qualy.round}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-on-surface truncate">
                      {qualy.raceName}
                    </p>
                  </div>
                  {/* Times grid */}
                  <div className="hidden sm:flex items-center gap-4 text-[12px] font-mono text-on-surface-variant">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-on-surface-variant/50 uppercase tracking-widest">Q1</span>
                      <span className="telemetry-numeric">{qualy.q1 || "—"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-on-surface-variant/50 uppercase tracking-widest">Q2</span>
                      <span className="telemetry-numeric">{qualy.q2 || "—"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-on-surface-variant/50 uppercase tracking-widest">Q3</span>
                      <span className="telemetry-numeric">{qualy.q3 || "—"}</span>
                    </div>
                  </div>
                  {/* Position Badge */}
                  <span className={`telemetry-numeric flex h-7 px-2 min-w-8 items-center justify-center rounded-md text-[11px] font-bold ${
                    isPole
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-surface-2 text-on-surface border border-outline/25"
                  }`}>
                    P{qualy.position}
                  </span>
                </div>
              );
            })}
          </GlassCard>
        </PageSection>
      )}

      {/* ── Driver Biography & Timeline ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <PageSection title="Biography" className="md:col-span-2">
          <GlassCard variant="structural" className="p-5 flex flex-col gap-3">
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              {driver.givenName} {driver.familyName} is a professional Formula 1 driver competing for {driver.team} in the {getResolvedSeason()} season. Born in {driver.nationality}, they have built a distinguished racing pedigree to earn their seat on the active championship grid.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline/10 text-[12px] font-tabular">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Nationality</span>
                <span className="text-[14px] font-bold text-on-surface mt-0.5">{driver.nationality}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Date of Birth</span>
                <span className="text-[14px] font-bold text-on-surface mt-0.5">{new Date(driver.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            </div>
          </GlassCard>
        </PageSection>

        <PageSection title="Career Milestones">
          <GlassCard variant="structural" className="p-5 flex flex-col gap-4 text-[12px]">
            <div className="flex justify-between py-1.5 border-b border-outline/10 first:pt-0">
              <span className="text-on-surface-variant">Wins:</span>
              <span className="font-bold text-on-surface">{driver.wins}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-outline/10">
              <span className="text-on-surface-variant">Podiums:</span>
              <span className="font-bold text-on-surface">{driver.podiums ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-outline/10">
              <span className="text-on-surface-variant">Poles:</span>
              <span className="font-bold text-on-surface">{driver.poles ?? 0}</span>
            </div>
            <div className="flex justify-between py-1.5 last:border-0 last:pb-0">
              <span className="text-on-surface-variant">Fastest Laps:</span>
              <span className="font-bold text-on-surface">{driver.fastestLaps ?? 0}</span>
            </div>
          </GlassCard>
        </PageSection>
      </div>

      {/* ── Season Progression Chart ── */}
      <PageSection title="Season Position Progression" className="mt-2">
        <GlassCard variant="structural" className="p-5 flex flex-col gap-4">
          <div className="h-44 w-full flex items-end justify-between gap-1 pt-6 pb-2 px-2 relative border-b border-l border-outline/25">
            {/* Draw light bars/nodes for round positions */}
            {driver.recentResults.length === 0 ? (
              <p className="text-[12px] text-on-surface-variant mx-auto pb-10">Progression details populate as rounds finish.</p>
            ) : (
              driver.recentResults.map((r, i) => {
                const heightPct = Math.max(10, Math.min(100, (20 - r.position) * 5)); // Higher P1 bar, lower P20 bar
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity font-mono">P{r.position}</span>
                    <div 
                      className="w-full max-w-[20px] rounded-t bg-primary/20 hover:bg-primary/50 transition-colors cursor-pointer"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] font-bold text-on-surface-variant font-mono">R{r.round}</span>
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>
      </PageSection>
    </PageContainer>
  );
}
