"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";
import { GlassCard } from "@/components/ui/GlassCard";

interface TermItem {
  term: string;
  definition: string;
  category: "Technical" | "Strategy" | "Regulations";
}

const GLOSSARY: TermItem[] = [
  { term: "Apex", definition: "The innermost point of the driving line through a corner. Hitting the apex allows the driver to carry maximum speed.", category: "Technical" },
  { term: "Balance of Performance (BoP)", definition: "Regulations in GT and WEC series to adjust vehicle weights and engine restrictors, ensuring parity between different manufacturer designs.", category: "Regulations" },
  { term: "Push-to-Pass", definition: "A system in IndyCar that allows a driver to temporarily increase engine power (by ~60hp) via a steering wheel button, aiding overtakes.", category: "Strategy" },
  { term: "Attack Mode", definition: "A Formula E requirement where drivers arm their car to receive an extra 50kW power boost by driving through a designated off-line zone.", category: "Strategy" },
  { term: "Double Stacking", definition: "Pitting both team drivers on the same lap. The second driver waits briefly while the team services the first car, demanding split-second timing.", category: "Strategy" },
  { term: "Active Aerodynamics", definition: "F1 2026 wings that adjust angle dynamically. Z-mode reduces drag on straights; X-mode increases downforce in corners.", category: "Technical" }
];

interface HistoricCar {
  name: string;
  year: number;
  team: string;
  details: string;
}

const LEGENDARY_CARS: HistoricCar[] = [
  { name: "McLaren MP4/4", year: 1988, team: "McLaren Honda", details: "Won 15 of 16 races in the 1988 F1 season under Ayrton Senna and Alain Prost. Legendary low-drag carbon chassis." },
  { name: "Porsche 919 Hybrid", year: 2015, team: "Porsche Team", details: "Secured multiple Le Mans victories. Features a 2.0L V4 turbo and a highly advanced front-axle hybrid recovery unit." }
];

export default function EncyclopediaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"terms" | "cars" | "timeline">("terms");

  const filteredGlossary = useMemo(() => {
    return GLOSSARY.filter((g) =>
      g.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <PageContainer gap="md" className="pb-12 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="flex items-center">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Header block */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          Motorsport Encyclopedia
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none uppercase">
          Knowledge Base
        </h1>
        <p className="text-[13px] text-on-surface-variant mt-1.5">
          Explore racing terminology, regulations evolution, and legendary vehicle history sheets.
        </p>
      </div>

      {/* Tab controls */}
      <div className="flex bg-surface-2/40 border border-outline/15 rounded-full p-0.5 gap-0.5 select-none self-start mt-2">
        <button
          onClick={() => setActiveTab("terms")}
          className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "terms" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Terminology
        </button>
        <button
          onClick={() => setActiveTab("cars")}
          className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "cars" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Legendary Cars
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "timeline" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Rules Timeline
        </button>
      </div>

      {/* Interactive contents */}
      {activeTab === "terms" && (
        <div className="flex flex-col gap-5 mt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terminology..."
            className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[12.5px] font-bold py-2 px-4 rounded-xl border border-outline/30 focus:outline-none focus:border-primary/80 transition-all placeholder:text-on-surface-variant/40"
          />

          <PageSection title="Glossary Cards">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredGlossary.map((item, idx) => (
                <GlassCard key={idx} variant="structural" className="p-4.5 border border-outline/15 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[15px] font-black text-on-surface uppercase">{item.term}</h4>
                    <span className="text-[8.5px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-on-surface-variant leading-relaxed font-medium mt-0.5">
                    {item.definition}
                  </p>
                </GlassCard>
              ))}
            </div>
          </PageSection>
        </div>
      )}

      {activeTab === "cars" && (
        <PageSection title="Legendary Cars Index" className="mt-2">
          <div className="flex flex-col gap-4">
            {LEGENDARY_CARS.map((car, idx) => (
              <GlassCard key={idx} variant="structural" className="p-5 border border-outline/15 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded font-mono">
                    {car.year}
                  </span>
                  <h4 className="text-[16px] font-black text-on-surface uppercase leading-none">{car.name}</h4>
                  <span className="h-1.5 w-1.5 rounded-full bg-outline/40" />
                  <span className="text-[11px] text-on-surface-variant font-mono font-bold uppercase">{car.team}</span>
                </div>
                <p className="text-[13px] text-on-surface-variant leading-relaxed font-medium mt-1">
                  {car.details}
                </p>
              </GlassCard>
            ))}
          </div>
        </PageSection>
      )}

      {activeTab === "timeline" && (
        <PageSection title="Rules Evolution Timeline" className="mt-2">
          <div className="flex flex-col gap-5 relative pl-4 border-l-2 border-outline/25 ml-2 font-mono text-[12px] font-bold text-on-surface-variant">
            <div className="flex flex-col gap-1 relative">
              <span className="h-2.5 w-2.5 rounded-full bg-primary absolute -left-[20.5px] top-1" />
              <span className="text-primary text-[10.5px]">2026 · THE ACTIVE AERO RESET</span>
              <p className="text-[12px] font-sans font-medium text-on-surface-variant leading-relaxed">
                Active chassis aero surfaces (X/Z modes) and 100% sustainable fuels introduced to standard grids.
              </p>
            </div>
            <div className="flex flex-col gap-1 relative">
              <span className="h-2.5 w-2.5 rounded-full bg-outline absolute -left-[20.5px] top-1" />
              <span className="text-on-surface-variant text-[10.5px]">2014 · THE HYBRID ERA</span>
              <p className="text-[12px] font-sans font-medium text-on-surface-variant leading-relaxed">
                F1 transitions to 1.6L V6 turbocharged hybrid power units integrating MGU-K and MGU-H energy loops.
              </p>
            </div>
            <div className="flex flex-col gap-1 relative">
              <span className="h-2.5 w-2.5 rounded-full bg-outline absolute -left-[20.5px] top-1" />
              <span className="text-on-surface-variant text-[10.5px]">1989 · TURBOCHARGER BAN</span>
              <p className="text-[12px] font-sans font-medium text-on-surface-variant leading-relaxed">
                Boosted turbochargers are completely banned in Formula 1, returning cars to naturally aspirated engines.
              </p>
            </div>
          </div>
        </PageSection>
      )}
    </PageContainer>
  );
}
