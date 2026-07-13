import { notFound } from "next/navigation";
import Link from "next/link";
import { getDriverProfile } from "@/lib/api/f1";
import { getTeamColor } from "@/lib/team-colors";
import { GlassCard } from "@/components/ui/GlassCard";
import { DriverActions } from "@/components/drivers/DriverActions";
import { resolveDriverMedia } from "@/lib/media/resolver";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DriverProfilePage({ params }: PageProps) {
  const { id } = await params;
  const driver = await getDriverProfile(id);

  if (!driver) {
    notFound();
  }

  const teamColor = getTeamColor(driver.team);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
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
      {(() => {
        const media = resolveDriverMedia(driver.id, `${driver.givenName} ${driver.familyName}`);
        return (
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

              {/* Large Premium Avatar Fallback on Right */}
              <div className="flex items-center gap-4 shrink-0 md:self-center">
                {media.portrait ? (
                  <div className="h-24 w-24 md:h-28 md:w-28 rounded-full relative overflow-hidden border border-outline/35 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media.portrait}
                      alt={`${driver.givenName} ${driver.familyName}`}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: media.focalPosition || "center 20%" }}
                    />
                    <div 
                      className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-bg z-20 flex items-center justify-center shadow-md"
                      style={{ backgroundColor: teamColor }}
                    >
                      <span className="text-[9px] font-black text-white font-mono">
                        #{media.number}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="h-24 w-24 md:h-28 md:w-28 rounded-full flex items-center justify-center relative overflow-hidden border border-outline/35 shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${media.flagColors.join(", ")})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-bg/35" />
                    <span className="text-[26px] font-black text-white relative z-10 font-mono tracking-tighter">
                      {media.code}
                    </span>
                    <div 
                      className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-2 border-bg z-20 flex items-center justify-center shadow-md"
                      style={{ backgroundColor: teamColor }}
                    >
                      <span className="text-[9px] font-black text-white font-mono">
                        #{media.number}
                      </span>
                    </div>
                  </div>
                )}
              </div>
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
        );
      })()}

      {/* ── Main Dashboard Composition ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ── Championship Snapshot Stats Grid ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <h2 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Championship Snapshot
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <GlassCard className="p-4 flex flex-col gap-1">
              <span className="text-[10px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Standings Rank
              </span>
              <span className="telemetry-numeric text-[24px] font-bold text-on-surface">
                P{driver.position || "—"}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[10px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Total Points
              </span>
              <span className="telemetry-numeric text-[24px] font-bold text-on-surface">
                {driver.points}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[10px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Grand Prix Wins
              </span>
              <span className="telemetry-numeric text-[24px] font-bold text-on-surface">
                {driver.wins}
              </span>
            </GlassCard>
            <GlassCard variant="structural" className="p-4 flex flex-col gap-1 border border-outline/20">
              <span className="text-[10px] font-bold tracking-wider text-on-surface-variant/60 uppercase">
                Constructor
              </span>
              <span className="text-[14px] font-bold text-on-surface truncate mt-1">
                {driver.team}
              </span>
            </GlassCard>
          </div>
        </div>

        {/* ── Recent Form Section ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <h2 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Recent Form
            </h2>
          </div>
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
        </div>

      </div>

      {/* ── Qualifying Snapshot Section ── */}
      {driver.qualifyingResults.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <h2 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
              Qualifying Performance
            </h2>
          </div>
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
        </div>
      )}
    </div>
  );
}
