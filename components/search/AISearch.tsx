"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface SearchSuggestion {
  text: string;
  category: string;
}

const SUGGESTIONS: SearchSuggestion[] = [
  { text: "Show Verstappen's best Silverstone races.", category: "Driver History" },
  { text: "Compare Hamilton and Alonso.", category: "Head-to-Head" },
  { text: "Show Ferrari's last championship.", category: "Constructor History" }
];

interface RaceResultItem {
  year: number;
  raceName: string;
  result: string;
  detail: string;
}

interface CompareItem {
  metric: string;
  driverAVal: string;
  driverBVal: string;
}

export function AISearch() {
  const [query, setQuery] = useState("");
  const [activeResults, setActiveResults] = useState<{
    type: "races" | "comparison" | "constructors" | null;
    title: string;
    races?: RaceResultItem[];
    comparison?: CompareItem[];
  }>({ type: null, title: "" });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery(query);
  };

  const processQuery = (searchText: string) => {
    const cleanText = searchText.toLowerCase();
    if (cleanText.includes("verstappen") || cleanText.includes("silverstone")) {
      setActiveResults({
        type: "races",
        title: "Max Verstappen - Best Silverstone Results",
        races: [
          { year: 2023, raceName: "British Grand Prix", result: "Pole & P1 Finish", detail: "Led 51 of 52 laps, claiming fastest lap and holding off Norris." },
          { year: 2020, raceName: "70th Anniversary GP", result: "Started P4, Finished P1", detail: "Strategic masterclass managing tyre blistering in high track heat." }
        ]
      });
    } else if (cleanText.includes("hamilton") || cleanText.includes("alonso") || cleanText.includes("compare")) {
      setActiveResults({
        type: "comparison",
        title: "Career Head-to-Head Comparison",
        comparison: [
          { metric: "World Titles", driverAVal: "7 (Hamilton)", driverBVal: "2 (Alonso)" },
          { metric: "Grand Prix Wins", driverAVal: "105", driverBVal: "32" },
          { metric: "Pole Positions", driverAVal: "104", driverBVal: "22" },
          { metric: "Podiums", driverAVal: "201", driverBVal: "106" }
        ]
      });
    } else if (cleanText.includes("ferrari") || cleanText.includes("championship")) {
      setActiveResults({
        type: "races",
        title: "Scuderia Ferrari - Last Championships",
        races: [
          { year: 2008, raceName: "Constructors' World Title", result: "172 Points Scored", detail: "Secured by Felipe Massa and Kimi Räikkönen winning 8 races combined." },
          { year: 2007, raceName: "Drivers' World Title (Räikkönen)", result: "110 Points (P1)", detail: "Kimi Räikkönen clinched the championship by 1 point over Hamilton." }
        ]
      });
    } else {
      // Default fallback
      setActiveResults({
        type: "races",
        title: `Search results for "${searchText}"`,
        races: [
          { year: 2026, raceName: "F1 Season Archive", result: "No direct matching archive records found.", detail: "Try selecting one of the suggested search queries below." }
        ]
      });
    }
  };

  return (
    <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15 w-full">
      <div>
        <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
          AI Assist Search
        </span>
        <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
          Natural Language Query
        </h3>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything (e.g. Compare Hamilton and Alonso...)"
          className="flex-1 bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2.5 px-4 rounded-xl border border-outline/30 focus:outline-none focus:border-primary/80 transition-all placeholder:text-on-surface-variant/40"
        />
        <button
          type="submit"
          className="h-10 px-4 bg-primary text-white text-[12px] font-bold uppercase tracking-wider rounded-xl cursor-pointer hover:bg-primary-variant transition-all shrink-0"
        >
          Query
        </button>
      </form>

      {/* Query Suggestions Pills */}
      <div className="flex flex-col gap-1.5 select-none">
        <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase font-mono">Suggested Searches:</span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(s.text);
                processQuery(s.text);
              }}
              className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 px-3 py-1.5 rounded-full cursor-pointer transition-all"
            >
              {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      {activeResults.type && (
        <div className="flex flex-col gap-3.5 mt-2 border-t border-outline/10 pt-4.5">
          <span className="text-[10px] font-black text-on-surface-variant uppercase font-mono tracking-wider">
            {activeResults.title}
          </span>

          {activeResults.type === "races" && activeResults.races && (
            <div className="flex flex-col gap-3">
              {activeResults.races.map((r, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-surface-2/30 border border-outline/10 flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[10.5px] font-mono font-bold">
                    <span className="text-primary uppercase">{r.raceName} ({r.year})</span>
                    <span className="text-on-surface">{r.result}</span>
                  </div>
                  <p className="text-[12.5px] text-on-surface-variant leading-relaxed font-medium mt-1">
                    {r.detail}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeResults.type === "comparison" && activeResults.comparison && (
            <div className="flex flex-col border border-outline/15 rounded-xl overflow-hidden text-[12px] font-mono font-bold">
              {/* Table header */}
              <div className="flex justify-between h-9 px-4 items-center bg-surface-2/60 border-b border-outline/15 text-[10px] text-on-surface-variant uppercase">
                <span>Metric</span>
                <span>Values</span>
              </div>
              {/* Table rows */}
              {activeResults.comparison.map((item, idx) => (
                <div key={idx} className="flex justify-between h-10 px-4 items-center border-b border-outline/10 last:border-0 hover:bg-surface-2/30">
                  <span className="text-on-surface-variant">{item.metric}</span>
                  <div className="flex gap-4">
                    <span className="text-primary">{item.driverAVal}</span>
                    <span className="text-on-surface-variant/40">vs</span>
                    <span className="text-secondary">{item.driverBVal}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
