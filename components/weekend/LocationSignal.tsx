"use client";

import { useEffect, useState } from "react";

interface LocationSignalProps {
  lat?: number;
  long?: number;
  circuitName: string;
}

export function LocationSignal({ lat, long, circuitName }: LocationSignalProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    requestAnimationFrame(() => {
      setReduceMotion(mediaQuery.matches);
    });
    const listener = (e: MediaQueryListEvent) => {
      requestAnimationFrame(() => {
        setReduceMotion(e.matches);
      });
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Default coordinates if missing
  const latitude = lat ?? 0;
  const longitude = long ?? 0;

  // Map lat/long fractional parts to a coordinates grid (x/y between 20% and 80%)
  const x = 50 + (Math.abs(longitude) % 1) * 30 * (longitude >= 0 ? 1 : -1);
  const y = 50 - (Math.abs(latitude) % 1) * 30 * (latitude >= 0 ? 1 : -1);

  // Bound coordinates to safe visualization zone [20, 80]
  const markerX = Math.max(20, Math.min(80, x));
  const markerY = Math.max(20, Math.min(80, y));

  return (
    <div className="relative w-full aspect-square max-h-[160px] md:max-h-[220px] rounded-lg bg-black/60 border border-outline/30 flex items-center justify-center overflow-hidden select-none">
      {/* Background Grid */}
      <svg
        className="w-full h-full text-outline/25"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Grid Lines */}
        <line x1="10" y1="10" x2="90" y2="10" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
        <line x1="10" y1="30" x2="90" y2="30" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
        <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
        <line x1="10" y1="70" x2="90" y2="70" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
        <line x1="10" y1="90" x2="90" y2="90" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />

        <line x1="10" y1="10" x2="10" y2="90" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
        <line x1="30" y1="10" x2="30" y2="90" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
        <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
        <line x1="70" y1="10" x2="70" y2="90" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />
        <line x1="90" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 2" />

        {/* Diagnostic Radar Circles */}
        <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 4" />

        {/* Crosshair Axes */}
        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.4" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.4" />

        {/* Scanning Radar Sweep Line */}
        {!reduceMotion && (
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="5"
            stroke="var(--color-primary)"
            strokeWidth="0.5"
            strokeOpacity="0.4"
            className="origin-center animate-[spin_6s_linear_infinite]"
          />
        )}

        {/* Target Reticle */}
        <g>
          {/* Outer Ring */}
          <circle
            cx={markerX}
            cy={markerY}
            r="4.5"
            stroke="var(--color-primary)"
            strokeWidth="0.75"
            strokeDasharray="1 1"
          />
          {/* Pulsing Core */}
          <circle
            cx={markerX}
            cy={markerY}
            r="1.8"
            fill="var(--color-primary)"
            className={reduceMotion ? "" : "animate-pulse"}
          />
        </g>
      </svg>

      {/* Coordinate & Type Overlays */}
      <div className="absolute top-2.5 left-3 flex flex-col pointer-events-none">
        <span className="text-[9px] font-bold tracking-widest text-primary uppercase">
          Location Signal
        </span>
        <span className="text-[10px] text-on-surface-variant font-medium truncate max-w-[120px] md:max-w-[160px] mt-0.5 leading-none">
          {circuitName}
        </span>
      </div>

      <div className="absolute bottom-2.5 right-3 text-right flex flex-col pointer-events-none font-tabular">
        <span className="text-[9px] font-bold text-on-surface-variant leading-none">
          LAT: {latitude.toFixed(4)}
        </span>
        <span className="text-[9px] font-bold text-on-surface-variant leading-none mt-0.5">
          LON: {longitude.toFixed(4)}
        </span>
      </div>

      {/* Subtle Corner Telemetry Marks */}
      <div className="absolute top-2.5 right-3 text-[8px] text-outline/70 font-mono pointer-events-none font-tabular">
        SYS.OK // RC4
      </div>
      <div className="absolute bottom-2.5 left-3 text-[8px] text-outline/70 font-mono pointer-events-none font-tabular">
        TEL // GPS_PRECISE
      </div>
    </div>
  );
}
