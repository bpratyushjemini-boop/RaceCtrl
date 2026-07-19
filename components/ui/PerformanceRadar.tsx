"use client";

import React, { useMemo } from "react";

interface RadarMetric {
  label: string;
  value: number; // 0 to 100
}

interface PerformanceRadarProps {
  metrics: RadarMetric[];
  color: string;
}

export function PerformanceRadar({ metrics, color }: PerformanceRadarProps) {
  // Configs
  const size = 200;
  const center = size / 2;
  const radius = size * 0.38;

  // Compute hexagon vertices coordinates based on angle divisions (60 deg each for 6 vertices)
  const vertices = useMemo(() => {
    return metrics.map((m, idx) => {
      const angle = (idx * 2 * Math.PI) / metrics.length - Math.PI / 2; // Start from top
      const valueFraction = Math.max(10, Math.min(100, m.value)) / 100;
      
      const outerX = center + radius * Math.cos(angle);
      const outerY = center + radius * Math.sin(angle);

      const valX = center + radius * valueFraction * Math.cos(angle);
      const valY = center + radius * valueFraction * Math.sin(angle);

      // Label offset placement
      const labelX = center + (radius + 20) * Math.cos(angle);
      const labelY = center + (radius + 10) * Math.sin(angle);

      return {
        label: m.label,
        value: m.value,
        outerX,
        outerY,
        valX,
        valY,
        labelX,
        labelY,
        angle
      };
    });
  }, [metrics, radius, center]);

  const valuePolygonPath = useMemo(() => {
    return vertices.map((v) => `${v.valX},${v.valY}`).join(" ");
  }, [vertices]);

  return (
    <div className="flex flex-col items-center justify-center p-2 w-full max-w-[280px] mx-auto select-none">
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${size} ${size}`}>
        {/* Draw concentric helper rings */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((fraction, index) => {
          const points = vertices
            .map((v) => {
              const x = center + radius * fraction * Math.cos(v.angle);
              const y = center + radius * fraction * Math.sin(v.angle);
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <polygon
              key={index}
              points={points}
              fill="none"
              stroke="var(--color-outline)"
              strokeWidth="0.4"
              strokeDasharray="1,2"
              className="opacity-40"
            />
          );
        })}

        {/* Draw diagonal guidelines from center */}
        {vertices.map((v, idx) => (
          <line
            key={idx}
            x1={center}
            y1={center}
            x2={v.outerX}
            y2={v.outerY}
            stroke="var(--color-outline)"
            strokeWidth="0.5"
            className="opacity-30"
          />
        ))}

        {/* Draw filled values area polygon */}
        <polygon
          points={valuePolygonPath}
          fill={`${color}22`}
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Vertices text labels */}
        {vertices.map((v, idx) => {
          // Align text anchors appropriately based on horizontal positions
          let textAnchor: "start" | "middle" | "end" = "middle";
          if (v.labelX < center - 5) textAnchor = "end";
          if (v.labelX > center + 5) textAnchor = "start";

          return (
            <g key={idx}>
              <text
                x={v.labelX}
                y={v.labelY}
                fontSize="6"
                fontWeight="900"
                fill="var(--color-on-surface-variant)"
                textAnchor={textAnchor}
                className="font-mono uppercase tracking-wider"
              >
                {v.label}
              </text>
              <text
                x={v.labelX}
                y={v.labelY + 5.5}
                fontSize="5"
                fontWeight="900"
                fill="var(--color-primary)"
                textAnchor={textAnchor}
                className="font-mono font-bold"
              >
                {v.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
