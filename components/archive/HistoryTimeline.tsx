"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";

interface HistoryTimelineProps {
  currentYear: string;
  currentTab: string;
}

interface EraDetails {
  label: string;
  range: [number, number];
  regulations: string;
  iconCar: string;
  backgroundGradient: string;
}

const ERAS: EraDetails[] = [
  {
    label: "Ground Effect & Active Aero",
    range: [2020, 2026],
    regulations: "Reintroduction of Venturi tunnels for ground effect aerodynamics, sustainable fuels split, and high-efficiency hybrid systems.",
    iconCar: "Red Bull RB20 / Ferrari SF-24",
    backgroundGradient: "from-red-500/10 to-transparent"
  },
  {
    label: "Turbo Hybrid Domination",
    range: [2014, 2019],
    regulations: "Transition to 1.6-litre V6 turbocharged hybrid power units with dual energy recovery systems (MGU-K and MGU-H).",
    iconCar: "Mercedes F1 W07 Hybrid",
    backgroundGradient: "from-cyan-500/10 to-transparent"
  },
  {
    label: "V8 Screaming Engines",
    range: [2006, 2013],
    regulations: "Mandatory shift to 2.4-litre V8 engines. Introduction of kinetic energy recovery (KERS) and drag reduction wings (DRS).",
    iconCar: "Red Bull RB9 / Renault R26",
    backgroundGradient: "from-blue-500/10 to-transparent"
  },
  {
    label: "High-Revving V10 Peak",
    range: [1995, 2005],
    regulations: "Golden age of 3.0-litre V10 naturally aspirated screamers reaching over 19,000 RPM. Launch of grooved tire patterns.",
    iconCar: "Ferrari F2004 / McLaren MP4-20",
    backgroundGradient: "from-orange-500/10 to-transparent"
  },
  {
    label: "High-Boost Turbo Storm",
    range: [1980, 1994],
    regulations: "1.5-litre turbocharged engines exceeding 1,200 horsepower in qualifying. Ban on active suspension and driver aids.",
    iconCar: "McLaren MP4/4 / Williams FW14B",
    backgroundGradient: "from-yellow-500/10 to-transparent"
  },
  {
    label: "Ground Effect Evolution",
    range: [1970, 1979],
    regulations: "Colin Chapman pioneers sidepod Venturi wings. Rise of the Cosworth DFV V8 dominance and giant airbox towers.",
    iconCar: "Lotus 79 / Tyrrell P34",
    backgroundGradient: "from-green-500/10 to-transparent"
  },
  {
    label: "Cigar-Tube Monocoques",
    range: [1960, 1969],
    regulations: "Transition to mid-engined layouts and monocoque aluminum chassis. Introduction of rudimentary aerodynamic wings.",
    iconCar: "Lotus 25 / Matra MS80",
    backgroundGradient: "from-purple-500/10 to-transparent"
  },
  {
    label: "Front-Engine Giants",
    range: [1950, 1959],
    regulations: "Front-engine supercharged roadsters running heavy alcohol-mix fuels. Drum brakes and safety helmets made mandatory.",
    iconCar: "Alfa Romeo Alfetta 159 / Maserati 250F",
    backgroundGradient: "from-grey-500/10 to-transparent"
  }
];

export function HistoryTimeline({ currentYear, currentTab }: HistoryTimelineProps) {
  const router = useRouter();
  const selectedYear = Number(currentYear) || 2026;

  // Find active era based on selected year
  const activeEra = useMemo(() => {
    return ERAS.find(era => selectedYear >= era.range[0] && selectedYear <= era.range[1]) || ERAS[0];
  }, [selectedYear]);

  const yearsInEra = useMemo(() => {
    const arr = [];
    for (let y = activeEra.range[1]; y >= activeEra.range[0]; y--) {
      arr.push(y);
    }
    return arr;
  }, [activeEra]);

  const selectYear = (yr: number) => {
    router.push(`/archive?year=${yr}&tab=${currentTab}`);
  };

  return (
    <GlassCard
      variant="structural"
      className={`p-5 flex flex-col gap-4 border border-outline/15 bg-gradient-to-br ${activeEra.backgroundGradient} transition-all duration-300`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
          F1 Historical Era
        </span>
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-black text-on-surface uppercase tracking-tight">
            {activeEra.label} ({activeEra.range[0]}-{activeEra.range[1]})
          </h2>
          <span className="text-[10px] font-mono text-on-surface-variant font-bold">
            TIMELINE EXPLORER
          </span>
        </div>
      </div>

      {/* Eras quick selection selector bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-outline/10 no-scrollbar">
        {ERAS.map((era) => {
          const isSelected = activeEra.label === era.label;
          return (
            <button
              key={era.label}
              onClick={() => selectYear(era.range[1])}
              className={`px-3 py-1 rounded-full text-[10px] font-black whitespace-nowrap uppercase tracking-wider transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-surface-2/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-2"
              }`}
            >
              {era.range[0]}s
            </button>
          );
        })}
      </div>

      {/* Year Scrubber nodes */}
      <div className="flex justify-between items-center gap-2 overflow-x-auto py-2 no-scrollbar">
        {yearsInEra.map((yr) => {
          const isSelected = selectedYear === yr;
          return (
            <button
              key={yr}
              onClick={() => selectYear(yr)}
              className={`h-9 w-12 rounded-xl flex items-center justify-center font-mono text-[12px] font-black shrink-0 transition-all border cursor-pointer ${
                isSelected
                  ? "bg-white text-black border-white shadow-md scale-105"
                  : "bg-surface-2/40 border-outline/15 text-on-surface-variant hover:text-on-surface hover:border-outline"
              }`}
            >
              {yr}
            </button>
          );
        })}
      </div>

      {/* Technical Specifications Overlay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-outline/10 text-[12px] leading-relaxed">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
            Technical Regulations
          </span>
          <p className="text-on-surface-variant font-medium">
            {activeEra.regulations}
          </p>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
            Iconic Car & Aero Design
          </span>
          <span className="text-primary font-bold uppercase mt-0.5">
            {activeEra.iconCar}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
