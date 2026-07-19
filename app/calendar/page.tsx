"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";
import { GlassCard } from "@/components/ui/GlassCard";
import { getAllCalendarRounds, CHAMPIONSHIPS } from "@/lib/api/motorsport";

export default function GlobalCalendarPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const allRounds = useMemo(() => getAllCalendarRounds(), []);

  // Filter chronologically
  const filteredRounds = useMemo(() => {
    return allRounds.filter((r) => {
      // Category filter matching
      const meta = CHAMPIONSHIPS.find((c) => c.id === r.seriesId);
      const category = meta ? meta.category.toUpperCase() : "";
      
      const matchesCategory = activeCategory === "ALL" || category === activeCategory.toUpperCase();
      const matchesSearch =
        r.raceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [allRounds, activeCategory, searchQuery]);

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

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
            Global Schedule
          </span>
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none uppercase">
            Motorsport Calendar
          </h1>
          <p className="text-[13px] text-on-surface-variant mt-1.5">
            Unified chronological schedule database across F1, Formula E, WEC, MotoGP, and IndyCar.
          </p>
        </div>

        {/* Calendar Export button */}
        <button
          onClick={() => alert("Simulating Calendar Export: ICS file generated successfully.")}
          className="h-10 px-4 bg-surface-2 hover:bg-surface-3 text-on-surface text-[12px] font-bold uppercase tracking-wider rounded-xl border border-outline/20 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shrink-0 select-none"
        >
          <span>📅</span>
          <span>Export to Calendar</span>
        </button>
      </div>

      {/* Filter and Search actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mt-2">
        {/* Category Pills */}
        <div className="md:col-span-2 flex flex-wrap bg-surface-2/40 border border-outline/15 rounded-full p-0.5 gap-0.5 select-none self-start">
          {["ALL", "OPEN WHEEL", "ENDURANCE", "MOTORCYCLE"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer ${
                activeCategory === cat ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Country Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter country or GP name..."
          className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[12.5px] font-bold py-2 px-4 rounded-xl border border-outline/30 focus:outline-none focus:border-primary/80 transition-all placeholder:text-on-surface-variant/40"
        />
      </div>

      {/* Calendar List */}
      <PageSection title="Schedule Agenda">
        <div className="flex flex-col gap-3">
          {filteredRounds.length === 0 ? (
            <GlassCard variant="structural" className="p-8 text-center text-[13px] text-on-surface-variant">
              No matching scheduled sessions found.
            </GlassCard>
          ) : (
            filteredRounds.map((r, idx) => {
              // Color highlight matching series
              const seriesColorMap: Record<string, string> = {
                f1: "var(--color-primary)",
                fe: "#10b981", // green
                indycar: "#f59e0b", // orange
                wec: "#3b82f6", // blue
                motogp: "#ec4899" // pink
              };
              const sColor = seriesColorMap[r.seriesId] || "var(--color-on-surface-variant)";

              return (
                <GlassCard key={`${r.seriesId}-${r.round}-${idx}`} variant="structural" className="p-4.5 border border-outline/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-surface-2 border border-outline/15 text-center shrink-0">
                      <span className="text-[10px] font-mono font-bold text-on-surface-variant/50 leading-none">
                        {new Date(r.date).toLocaleString("en-US", { month: "short" }).toUpperCase()}
                      </span>
                      <span className="text-[16px] font-bold text-on-surface leading-none mt-1 telemetry-numeric">
                        {new Date(r.date).getDate()}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link
                          href={`/championships/${r.seriesId}`}
                          className="text-[9px] font-bold font-mono uppercase tracking-wider hover:opacity-85"
                          style={{ color: sColor }}
                        >
                          {r.seriesName}
                        </Link>
                        <span className="h-1 w-1 rounded-full bg-outline/40" />
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase font-mono">
                          Round {r.round}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-outline/40" />
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {r.location}, {r.country}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-black text-on-surface uppercase truncate">
                        {r.raceName}
                      </h4>
                      <p className="text-[12px] text-on-surface-variant/80 font-medium truncate mt-0.5">
                        Circuit: {r.circuitName}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-on-surface bg-surface-2 border border-outline/25 px-3 py-1 rounded-full shrink-0 align-self-start sm:align-self-auto">
                    {new Date(r.date).toLocaleDateString("en-US", { weekday: "long" })}
                  </span>
                </GlassCard>
              );
            })
          )}
        </div>
      </PageSection>
    </PageContainer>
  );
}
