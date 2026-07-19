"use client";

import React, { useState, useMemo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface PaceMetricPoint {
  lap: number;
  deltaA: number; // delta in seconds to benchmark lap
  deltaB: number;
}

const LAP_DELTAS: PaceMetricPoint[] = [
  { lap: 1, deltaA: 1.2, deltaB: 1.4 },
  { lap: 5, deltaA: 0.8, deltaB: 0.9 },
  { lap: 10, deltaA: 0.4, deltaB: 0.6 },
  { lap: 15, deltaA: 0.2, deltaB: 0.3 },
  { lap: 20, deltaA: 0.1, deltaB: 0.1 },
  { lap: 25, deltaA: -0.1, deltaB: 0.0 }, // Pitted fresh tyres
  { lap: 30, deltaA: -0.4, deltaB: -0.3 },
  { lap: 35, deltaA: -0.6, deltaB: -0.5 }
];

export function AnalyticsStudio() {
  const [filterTyre, setFilterTyre] = useState<"ALL" | "SOFT" | "MEDIUM">("ALL");

  // Generate SVG path coordinates
  const paths = useMemo(() => {
    const minVal = -1.0;
    const maxVal = 2.0;
    const valueRange = maxVal - minVal;

    const pathA = LAP_DELTAS.map((pt) => {
      const x = (pt.lap / 35) * 100;
      const y = 90 - ((pt.deltaA - minVal) / valueRange) * 80;
      return `${pt.lap === 1 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    const pathB = LAP_DELTAS.map((pt) => {
      const x = (pt.lap / 35) * 100;
      const y = 90 - ((pt.deltaB - minVal) / valueRange) * 80;
      return `${pt.lap === 1 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    return { pathA, pathB };
  }, []);

  const triggerExport = (format: "csv" | "xlsx" | "pdf") => {
    if (format === "csv") {
      const csvContent = "data:text/csv;charset=utf-8,Lap,VER_Delta,NOR_Delta\n" +
        LAP_DELTAS.map((l) => `${l.lap},${l.deltaA},${l.deltaB}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "racectrl_pace_telemetry.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Report Builder: Generating ${format.toUpperCase()} report logs...`);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest font-mono">
              Professional Workspace
            </span>
            <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
              Advanced Analytics Studio
            </h3>
          </div>

          {/* Filtering */}
          <div className="flex bg-surface-2/60 border border-outline/25 rounded-full p-0.5 gap-0.5 shrink-0 self-start sm:self-auto">
            {["ALL", "SOFT", "MEDIUM"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTyre(t as "ALL" | "SOFT" | "MEDIUM")}
                className={`px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase transition-all cursor-pointer ${
                  filterTyre === t ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* SVG delta trace chart */}
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[10.5px] font-bold text-on-surface-variant uppercase font-mono tracking-wide">
            Pacing Lap Delta to Benchmark (sec)
          </span>
          <div className="h-40 w-full relative border-b border-l border-outline/25">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Mid reference line */}
              <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-outline)" strokeWidth="0.4" strokeDasharray="1,2" />

              {/* Path A (VER) */}
              <path
                d={paths.pathA}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Path B (NOR) */}
              <path
                d={paths.pathB}
                fill="none"
                stroke="#f59e0b" // orange
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute top-2 left-2 text-[8px] font-mono font-bold text-on-surface-variant">+2.0s DEFICIT</div>
            <div className="absolute bottom-2 left-2 text-[8px] font-mono font-bold text-on-surface-variant">-1.0s LEADING</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 justify-center items-center text-[10.5px] font-mono font-bold select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-full bg-primary" />
            <span className="text-on-surface">VER Pacing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <span className="text-on-surface">NOR Pacing</span>
          </div>
        </div>
      </GlassCard>

      {/* Report Exporter Card */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4.5 border border-outline/15">
        <div>
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest font-mono">
            Document Compilation
          </span>
          <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
            Report Builder Exporter
          </h3>
        </div>

        {/* Action downloads triggers */}
        <div className="grid grid-cols-3 gap-3 select-none">
          <button
            onClick={() => triggerExport("csv")}
            className="h-14 rounded-xl bg-surface-2 hover:bg-surface-3 border border-outline/30 text-on-surface flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span className="text-[18px]">📥</span>
            <span className="text-[10px] font-black uppercase font-mono tracking-wider">Export CSV</span>
          </button>

          <button
            onClick={() => triggerExport("xlsx")}
            className="h-14 rounded-xl bg-surface-2 hover:bg-surface-3 border border-outline/30 text-on-surface flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span className="text-[18px]">📊</span>
            <span className="text-[10px] font-black uppercase font-mono tracking-wider">Export Excel</span>
          </button>

          <button
            onClick={() => triggerExport("pdf")}
            className="h-14 rounded-xl bg-surface-2 hover:bg-surface-3 border border-outline/30 text-on-surface flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
          >
            <span className="text-[18px]">📄</span>
            <span className="text-[10px] font-black uppercase font-mono tracking-wider">Export PDF</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
