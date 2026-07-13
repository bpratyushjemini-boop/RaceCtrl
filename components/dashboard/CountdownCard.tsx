"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useCountdown } from "@/lib/hooks/useCountdown";
import type { Session } from "@/lib/types";

// Helper to determine circuit accent color from design.md
const getCircuitAccentColor = (title: string, subtitle: string): string => {
  const name = title.toLowerCase();
  const sub = subtitle.toLowerCase();
  if (name.includes("australian") || name.includes("albert park") || sub.includes("australia")) return "#FF8C42"; // Australia
  if (name.includes("monaco") || name.includes("monte carlo") || sub.includes("monaco")) return "#D4AF37"; // Monaco
  if (name.includes("british") || name.includes("silverstone") || sub.includes("united kingdom") || sub.includes("uk")) return "#0B5C36"; // UK
  if (name.includes("belgian") || name.includes("spa") || sub.includes("belgium")) return "#2E4B3D"; // Belgium
  if (name.includes("italian") || name.includes("monza") || sub.includes("italy")) return "#C8102E"; // Italy
  if (name.includes("singapore") || name.includes("marina bay")) return "#00C2D1"; // Singapore
  if (name.includes("vegas")) return "#B026FF"; // Las Vegas
  if (name.includes("abu dhabi") || name.includes("yas marina") || sub.includes("uae") || sub.includes("emirates")) return "#E8973D"; // Abu Dhabi
  return "#FF453A"; // default Race Red
};

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
  const accentColor = getCircuitAccentColor(title, subtitle);

  const d = remaining ? String(remaining.days).padStart(2, "0") : "00";
  const h = remaining ? String(remaining.hours).padStart(2, "0") : "00";
  const m = remaining ? String(remaining.minutes).padStart(2, "0") : "00";
  const s = remaining ? String(remaining.seconds).padStart(2, "0") : "00";

  const dateRange = formatWeekendRange(sessions);
  const displaySubtitle = dateRange ? `${subtitle} • ${dateRange}` : subtitle;

  const segments: { val: string; label: string; accent?: boolean }[] = [
    { val: d, label: "Days" },
    { val: h, label: "Hrs" },
    { val: m, label: "Mins" },
    { val: s, label: "Secs", accent: true },
  ];

  // Dynamic mesh gradient background style using circuit accent color
  const backgroundStyle = {
    background: `linear-gradient(135deg, ${accentColor}1C 0%, var(--glass-content-bg) 50%, var(--color-bg) 100%)`,
  };

  return (
    <GlassCard
      className="p-6 md:p-8 flex flex-col justify-between gap-8 min-h-[300px]"
      variant="floating"
      style={backgroundStyle}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 mb-2.5">
          <span
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: accentColor }}
          >
            {round ? `Round ${round}` : "Upcoming Round"}
          </span>
        </div>
        <h2 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-tight break-words">
          {title}
        </h2>
        <p className="text-[13px] font-medium text-on-surface-variant mt-2 flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {displaySubtitle}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
          Race Starts In
        </span>
        
        <div className="flex items-center gap-3.5 shrink-0">
          {segments.map(({ val, label, accent }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              {/* Digit card - rounded-sm (12px), surface-variant (2C2C2E) bg */}
              <div
                className="flex items-center justify-center rounded-sm bg-surface-2/65 border border-outline/35 w-[64px] h-[72px] md:w-[72px] md:h-[80px]"
              >
                <span
                  className="text-[34px] md:text-[40px] font-bold leading-none text-center font-tabular"
                  style={{
                    color: accent ? accentColor : "var(--color-on-surface)",
                  }}
                >
                  {val}
                </span>
              </div>
              {/* Label below digit */}
              <span
                className="text-[11px] font-bold tracking-widest uppercase"
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