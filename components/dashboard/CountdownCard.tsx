"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { GlassCard } from "@/components/ui/GlassCard";
import { useCountdown } from "@/lib/hooks/useCountdown";
import type { Session } from "@/lib/types";
import { resolveCircuitMedia, getRaceIdentity } from "@/lib/media/resolver";

// Helper to format date range of the weekend
function formatWeekendRange(sessions?: Session[]) {
  if (!sessions || sessions.length === 0) return "";
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const start = new Date(sorted[0].date);
  const end = new Date(sorted[sorted.length - 1].date);
  
  const startMonth = start.toLocaleString("en-US", { month: "short" });
  const endMonth = end.toLocaleString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${String(startDay).padStart(2, "0")} - ${String(endDay).padStart(2, "0")} ${endMonth} ${year}`;
  } else {
    return `${String(startDay).padStart(2, "0")} ${startMonth} - ${String(endDay).padStart(2, "0")} ${endMonth} ${year}`;
  }
}

export function CountdownCard({
  target,
  title,
  subtitle,
  round,
  sessions,
}: {
  target: string;
  title: string;
  subtitle: string;
  round?: number;
  sessions?: Session[];
}) {
  const remaining = useCountdown(target);
  const cardRef = useRef<HTMLDivElement>(null);

  // Dynamic parallax offset via throttled scroll listener setting direct CSS custom property
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      if (cardRef.current) {
        cardRef.current.style.setProperty("--scroll-top", "0");
      }
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (cardRef.current) {
            cardRef.current.style.setProperty("--scroll-top", window.scrollY.toString());
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const d = remaining ? String(remaining.days).padStart(2, "0") : "00";
  const h = remaining ? String(remaining.hours).padStart(2, "0") : "00";
  const m = remaining ? String(remaining.minutes).padStart(2, "0") : "00";
  const s = remaining ? String(remaining.seconds).padStart(2, "0") : "00";

  const dateRange = formatWeekendRange(sessions);

  const segments: { val: string; label: string; accent?: boolean }[] = [
    { val: d, label: "Days" },
    { val: h, label: "Hrs" },
    { val: m, label: "Mins" },
    { val: s, label: "Secs", accent: true },
  ];

  const gpBaseName = title.replace(/grand prix/i, "").trim();

  const circuitMedia = resolveCircuitMedia(title);
  const identity = getRaceIdentity(circuitMedia.id);
  const accentColor = identity.visualAccent;

  // Premium mesh gradient background style using circuit identity
  const backgroundStyle = {
    background: identity.fallbackGradient,
  };

  return (
    <GlassCard
      ref={cardRef}
      className="p-5 md:p-6 flex flex-col justify-between gap-4 min-h-[240px] relative overflow-hidden group"
      variant="floating"
      style={backgroundStyle}
    >
      {/* Dynamic Circuit Background Hero Image (if registered) */}
      {circuitMedia.heroImage && (
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <Image
            src={circuitMedia.heroImage}
            alt={title}
            fill
            className="object-cover transition-opacity duration-300 opacity-20 dark:opacity-30"
            style={{ objectPosition: circuitMedia.focalPosition || "center" }}
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-transparent z-0" />
        </div>
      )}

      {/* Dynamic Location Watermark for Missing Assets */}
      {!circuitMedia.heroImage && (
        <div className="absolute -left-6 bottom-1/4 text-[64px] md:text-[80px] font-black uppercase tracking-tighter select-none pointer-events-none text-on-surface/[0.02] dark:text-on-surface/[0.03] font-mono leading-none rotate-[-4deg] z-0">
          {identity.locationLabel}
        </div>
      )}

      {/* Precision Dot-Grid Background Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(var(--sys-text) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Decorative Parallax SVG track geometry in background with gradient masking */}
      <div 
        className="absolute right-2 md:right-8 top-1/2 w-36 h-36 md:w-44 md:h-44 pointer-events-none select-none z-0 opacity-[0.05] dark:opacity-[0.16] transition-all duration-300 text-on-surface"
        style={{
          transform: `translate3d(0, calc(-50% + var(--scroll-top, 0) * 0.08px), 0)`,
          color: accentColor,
          maskImage: "linear-gradient(to left, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 90%)",
        }}
      >
        <svg
          viewBox={circuitMedia.viewBox}
          className="w-full h-full fill-none stroke-current"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={circuitMedia.svgPath} />
        </svg>
      </div>

      {/* WHERE and WHAT Header Layout */}
      <div className="min-w-0 z-10 relative flex flex-col gap-1">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="text-[11px] font-bold tracking-widest uppercase font-mono"
            style={{ color: accentColor }}
          >
            {round ? `Round ${round}` : "Upcoming Round"}
          </span>
        </div>
        
        <h2 className="text-[28px] md:text-[34px] font-black tracking-tight text-on-surface uppercase leading-none break-words">
          {gpBaseName}
          <span className="block text-[14px] md:text-[16px] font-bold tracking-widest uppercase mt-0.5" style={{ color: accentColor }}>
            Grand Prix
          </span>
        </h2>

        <div className="mt-2 flex flex-col gap-0.5 text-[12px] text-on-surface-variant font-medium">
          <span className="text-on-surface font-bold tracking-tight">
            {circuitMedia.name}
          </span>
          <span className="text-[11px] opacity-80">
            {subtitle.replace(",", " ·")}
          </span>
          {dateRange && (
            <span className="mt-1.5 text-[10px] font-bold text-on-surface bg-surface-2/80 border border-outline/35 rounded-full px-2.5 py-0.5 self-start font-tabular shadow-sm">
              {dateRange}
            </span>
          )}
        </div>
      </div>

      {/* WHEN - Countdown Display */}
      <div className="flex flex-col gap-2 z-10 relative">
        <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
          Race Starts In
        </span>
        
        <div className="flex items-center gap-2 shrink-0">
          {segments.map(({ val, label, accent }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              {/* Digit card - rounded bg */}
              <div
                className="flex items-center justify-center rounded bg-surface-2/65 border border-outline/35 w-[52px] h-[56px] md:w-[60px] md:h-[64px] shadow-inner"
              >
                <span
                  className="text-[24px] md:text-[28px] font-bold leading-none text-center font-tabular"
                  style={{
                    color: accent ? accentColor : "var(--color-on-surface)",
                  }}
                >
                  {val}
                </span>
              </div>
              {/* Label below digit */}
              <span
                className="text-[9px] font-bold tracking-widest uppercase"
                style={{
                  color: accent ? accentColor : "var(--color-on-surface-variant)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}