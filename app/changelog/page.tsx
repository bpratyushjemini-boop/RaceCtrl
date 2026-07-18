import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageContainer } from "@/components/layout/PageContainer";

export default function ChangelogPage() {
  const updates = [
    {
      version: "v2.0.0",
      codename: "Pole Position",
      date: "July 2026",
      badge: "Major Update",
      badgeColor: "bg-primary/10 border-primary/25 text-primary",
      features: [
        {
          title: "Deep FastF1 Integration",
          description: "High-fidelity telemetry telemetry traces, stint analysis, and tyre compound mappings populated directly from Python FastF1 libraries.",
        },
        {
          title: "Driver Battle Tracker",
          description: "Overhauled head-to-head comparison tracker with qualifying duel ratios, points accumulation progression, and historical finish metrics.",
        },
        {
          title: "Grand Prix Race Hubs",
          description: "Dedicated dashboard routes for all 24 calendar rounds. Integrates Pirelli tyre ranges, weather summaries, circuit specs, and timezone conversion cards.",
        },
        {
          title: "Universal Command Search",
          description: "Command search box now fully indexable with all 2024 calendar races. Jump to any weekend or session instantly with keyboard shortcut navigation.",
        },
      ],
    },
    {
      version: "v1.5.0",
      codename: "Liquid Glass",
      date: "May 2026",
      badge: "Feature Release",
      badgeColor: "bg-surface-2 text-on-surface border-outline/25",
      features: [
        {
          title: "Liquid Glass UI Core",
          description: "Re-engineered design tokens, harmony HSL palettes, and blurred backdrop glassmorphism to look premium and state-of-the-art.",
        },
        {
          title: "Push Notifications",
          description: "Real-time session alerts and custom push notifications before practice sessions, qualifying, and race events begin.",
        },
      ],
    },
    {
      version: "v1.0.0",
      codename: "Formation Lap",
      date: "April 2026",
      badge: "Initial Release",
      badgeColor: "bg-surface-2/40 text-on-surface-variant/70 border-outline/10",
      features: [
        {
          title: "Championship Database",
          description: "Live connection to Ergast F1 standings with complete seasonal driver lists and constructors standings.",
        },
        {
          title: "Race Calendars",
          description: "Complete F1 calendar with automatic local timezone conversion for sessions.",
        },
      ],
    },
  ];

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className="flex items-center">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Settings
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          Changelog
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
          What&apos;s New
        </h1>
      </div>

      {/* Changelog Timeline */}
      <div className="flex flex-col gap-8 relative border-l border-outline/15 pl-4 ml-2 mt-4">
        {updates.map((update, idx) => (
          <ScrollReveal key={update.version} delay={idx * 100}>
            <div className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-bg z-10" />

              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[18px] font-bold text-on-surface font-mono">
                    {update.version}
                  </span>
                  <span className="text-[12px] text-on-surface-variant font-medium uppercase tracking-wider">
                    &mdash; &ldquo;{update.codename}&rdquo;
                  </span>
                  <span className="text-[11px] text-on-surface-variant font-mono ml-auto">
                    {update.date}
                  </span>
                  <span className={`text-[9px] font-bold tracking-widest uppercase border rounded-full px-2.5 py-0.5 ml-2 ${update.badgeColor}`}>
                    {update.badge}
                  </span>
                </div>

                <GlassCard variant="structural" className="p-5 flex flex-col gap-4">
                  {update.features.map((feat) => (
                    <div key={feat.title} className="flex flex-col gap-1">
                      <h3 className="text-[14px] font-bold text-on-surface flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        {feat.title}
                      </h3>
                      <p className="text-[12.5px] text-on-surface-variant leading-relaxed pl-3 border-l border-outline/10">
                        {feat.description}
                      </p>
                    </div>
                  ))}
                </GlassCard>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </PageContainer>
  );
}
