import Link from "next/link";
import { notFound } from "next/navigation";
import { getConstructorStandings, getDriverStandings } from "@/lib/api/f1";
import { getTeamColor } from "@/lib/team-colors";
import { normalizeConstructorId } from "@/lib/f1/normalize";
import { ConstructorMark } from "@/components/ui/ConstructorMark";
import { DriverAvatar } from "@/components/ui/DriverAvatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { getConstructorChampionshipContext } from "@/lib/f1/insights";

interface PageProps {
  params: Promise<{ constructorId: string }>;
}

export default async function ConstructorProfilePage({ params }: PageProps) {
  const { constructorId } = await params;

  const [constructors, drivers] = await Promise.all([
    getConstructorStandings(),
    getDriverStandings(),
  ]);

  // Find target constructor
  const normalizedTargetId = normalizeConstructorId(constructorId);
  const constructor = constructors.find(
    (c) => normalizeConstructorId(c.id || "") === normalizedTargetId
  );

  if (!constructor) {
    notFound();
  }

  const teamColor = getTeamColor(constructor.name);

  // Find associated drivers
  const teamDrivers = drivers.filter(
    (d) => normalizeConstructorId(d.subtitle) === normalizedTargetId
  );

  const contextStr = getConstructorChampionshipContext(constructor, constructors);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
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
        <div className="text-[10px] font-mono text-outline font-bold tracking-tight">
          ID: {(constructor.id || "").toUpperCase()}
        </div>
      </div>

      {/* ── Constructor Hero Card ── */}
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
          <ConstructorMark constructorId={constructor.id || ""} size="hero" name={constructor.name} />
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-tight uppercase">
              {constructor.name}
            </h1>
            <p className="text-[13px] text-on-surface-variant font-medium mt-1 uppercase tracking-wider">
              {constructor.subtitle}
            </p>
            <p className="text-[11px] text-primary font-bold mt-1.5 uppercase tracking-wider font-mono">
              {contextStr}
            </p>
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

      {/* ── Active Drivers Section ── */}
      <div className="flex flex-col gap-3.5 mt-2">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <h2 className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
            Active Drivers
          </h2>
        </div>

        {teamDrivers.length === 0 ? (
          <p className="text-[13px] text-on-surface-variant text-center py-6">
            No active drivers catalogued for this team in the current standings.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teamDrivers.map((driver) => (
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
                      driverId={driver.id || ""}
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
        )}
      </div>
    </div>
  );
}
