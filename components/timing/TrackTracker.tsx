"use client";

import React, { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface TrackDriver {
  code: string;
  color: string;
  gapOffset: number; // Offset fraction along path [0, 1]
}

const TRACK_DRIVERS: TrackDriver[] = [
  { code: "VER", color: "#367125", gapOffset: 0 },
  { code: "NOR", color: "#FF8700", gapOffset: 0.03 },
  { code: "LEC", color: "#E80020", gapOffset: 0.08 },
  { code: "PIA", color: "#00E1D9", gapOffset: 0.12 },
  { code: "RUS", color: "#00A6FF", gapOffset: 0.17 }
];

export function TrackTracker() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [progress, setProgress] = useState(0);

  // Silverstone-esque track path outline (coordinates normalized in a 100x100 viewBox)
  const trackPathD = "M 20 80 C 10 60, 15 30, 40 25 C 60 20, 80 15, 85 35 C 90 55, 70 65, 55 60 C 45 55, 50 85, 30 85 Z";

  useEffect(() => {
    let animationFrameId: number;
    
    const updatePositions = () => {
      setProgress((prev) => {
        const next = prev + 0.0012; // Controls tracking speed
        return next > 1 ? 0 : next;
      });
      animationFrameId = requestAnimationFrame(updatePositions);
    };

    animationFrameId = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;

    try {
      const totalLength = pathEl.getTotalLength();
      const nextPositions: Record<string, { x: number; y: number }> = {};

      TRACK_DRIVERS.forEach((d) => {
        // Calculate point on path factoring in the gap offset
        let driverProgress = progress - d.gapOffset;
        if (driverProgress < 0) driverProgress += 1;
        
        const currentLength = (driverProgress % 1) * totalLength;
        const point = pathEl.getPointAtLength(currentLength);
        
        nextPositions[d.code] = {
          x: point.x,
          y: point.y
        };
      });

      setPositions(nextPositions);
    } catch (e) {
      // Graceful fallback for SSR or testing environments
      console.warn("Failed to retrieve SVG path point:", e);
    }
  }, [progress]);

  return (
    <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15 min-h-[300px]">
      <div>
        <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
          Position Tracker
        </span>
        <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
          Live Circuit Radar
        </h3>
        <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
          Animated telemetry nodes tracking gaps around the circuit lap sectors.
        </p>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 flex items-center justify-center p-3 relative h-60 select-none">
        <svg className="w-full h-full max-w-[280px]" viewBox="-5 -5 110 110">
          {/* Base Track Path */}
          <path
            ref={pathRef}
            d={trackPathD}
            fill="none"
            stroke="var(--color-outline)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-20"
          />

          {/* Inner details track line */}
          <path
            d={trackPathD}
            fill="none"
            stroke="var(--color-outline-variant)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Start/Finish Gantry Line */}
          <line x1="20" y1="78" x2="20" y2="82" stroke="#FF0000" strokeWidth="1.5" />

          {/* Driver Nodes */}
          {TRACK_DRIVERS.map((d) => {
            const pos = positions[d.code] || { x: 20, y: 80 };
            return (
              <g key={d.code} className="transition-all duration-75">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="4.5"
                  fill={d.color}
                  stroke="var(--color-bg)"
                  strokeWidth="1.2"
                />
                <text
                  x={pos.x}
                  y={pos.y + 1.2}
                  fill="#FFF"
                  fontSize="3"
                  fontWeight="900"
                  textAnchor="middle"
                  className="font-mono select-none"
                >
                  {d.code}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legends */}
      <div className="flex gap-4.5 justify-center items-center text-[10px] font-mono font-bold flex-wrap">
        {TRACK_DRIVERS.map((d) => (
          <div key={d.code} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-on-surface uppercase">{d.code}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
