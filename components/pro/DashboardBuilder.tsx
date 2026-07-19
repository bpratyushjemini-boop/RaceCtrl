"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageSection } from "@/components/layout/PageSection";

interface DashboardWidget {
  id: string;
  name: string;
  category: string;
  active: boolean;
  size: "sm" | "md" | "lg";
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "live_timing", name: "Live Timing Tower", category: "Timing", active: true, size: "lg" },
  { id: "championship_progress", name: "Championship Points Progress", category: "Analytics", active: true, size: "md" },
  { id: "ai_summary", name: "AI Briefing Summary", category: "Intelligence", active: true, size: "md" },
  { id: "weather", name: "Weather Radar Forecast", category: "Atmospheric", active: false, size: "sm" },
  { id: "timeline", name: "Decades Historical Timeline", category: "Archive", active: false, size: "md" }
];

export function DashboardBuilder() {
  const [profileName, setProfileName] = useState("Journalist Desk");
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Load layout on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("racectrl_pro_layout");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setTimeout(() => {
            if (parsed.widgets) setWidgets(parsed.widgets);
            if (parsed.profileName) setProfileName(parsed.profileName);
          }, 0);
        } catch (e) {
          console.warn("Failed to load saved layout", e);
        }
      }
    }
  }, []);

  const saveLayout = () => {
    setSaveStatus("saving");
    if (typeof window !== "undefined") {
      localStorage.setItem("racectrl_pro_layout", JSON.stringify({ profileName, widgets }));
    }
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800);
  };

  const toggleWidget = (id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const resizeWidget = (id: string, newSize: "sm" | "md" | "lg") => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, size: newSize } : w))
    );
  };

  const moveWidget = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= widgets.length) return;

    setWidgets((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[nextIndex];
      copy[nextIndex] = temp;
      return copy;
    });
  };

  const duplicateWidget = (id: string) => {
    const target = widgets.find((w) => w.id === id);
    if (!target) return;

    const copy: DashboardWidget = {
      ...target,
      id: `${target.id}_copy_${Date.now()}`,
      name: `${target.name} (Copy)`
    };

    setWidgets((prev) => [...prev, copy]);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Configuration Header Card */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
              Workspace Configurator
            </span>
            <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
              Dashboard Layout Builder
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="bg-surface-2 hover:bg-surface-3 text-on-surface text-[12.5px] font-bold py-1.5 px-3 rounded-lg border border-outline/35 focus:outline-none"
              placeholder="Workspace profile name..."
            />
            <button
              onClick={saveLayout}
              className="h-9 px-4 bg-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-primary-variant cursor-pointer transition-all"
            >
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Layout Saved!" : "Save Layout"}
            </button>
          </div>
        </div>

        {/* Customization controls list */}
        <div className="flex flex-col gap-2 border-t border-outline/10 pt-3 select-none">
          <span className="text-[9px] font-black text-on-surface-variant/60 uppercase font-mono">Active Dashboard Panels</span>
          <div className="flex flex-col gap-2.5">
            {widgets.map((w, idx) => (
              <div
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-2/40 border border-outline/10 text-[12.5px]"
              >
                {/* Checkbox and Category info */}
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={w.active}
                    onChange={() => toggleWidget(w.id)}
                    className="h-4 w-4 rounded border-outline/35 accent-primary cursor-pointer"
                  />
                  <div className="truncate">
                    <span className="font-bold text-on-surface truncate block">{w.name}</span>
                    <span className="text-[9px] font-mono font-bold text-on-surface-variant uppercase">
                      Category: {w.category}
                    </span>
                  </div>
                </div>

                {/* Resizing & position controls */}
                <div className="flex items-center gap-2">
                  {/* Size buttons */}
                  <div className="flex bg-surface-2/80 rounded-lg p-0.5 border border-outline/25">
                    {(["sm", "md", "lg"] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => resizeWidget(w.id, sz)}
                        className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                          w.size === sz ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  {/* Duplicate */}
                  <button
                    onClick={() => duplicateWidget(w.id)}
                    className="h-6.5 px-2.5 rounded bg-surface-2 hover:bg-surface-3 border border-outline/30 text-[9.5px] font-black uppercase text-on-surface-variant cursor-pointer"
                  >
                    Duplicate
                  </button>

                  {/* Ordering arrows */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveWidget(idx, "up")}
                      disabled={idx === 0}
                      className="h-6.5 w-6.5 rounded bg-surface-2 border border-outline/30 text-on-surface flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveWidget(idx, "down")}
                      disabled={idx === widgets.length - 1}
                      className="h-6.5 w-6.5 rounded bg-surface-2 border border-outline/30 text-on-surface flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Grid Dashboard representation */}
      <PageSection title={`${profileName} Preview`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {widgets
            .filter((w) => w.active)
            .map((w) => {
              // Size mappings
              let sizeClass = "md:col-span-1";
              if (w.size === "lg") sizeClass = "md:col-span-2";

              return (
                <GlassCard
                  key={w.id}
                  variant="structural"
                  className={`p-4 border border-outline/25 flex flex-col gap-3 min-h-[110px] justify-between relative overflow-hidden ${sizeClass}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8.5px] font-black text-primary uppercase font-mono tracking-widest leading-none">
                        Panel: {w.category}
                      </span>
                      <h4 className="text-[13.5px] font-black text-on-surface uppercase leading-none mt-1">
                        {w.name}
                      </h4>
                    </div>
                    <span className="text-[8.5px] font-mono text-on-surface-variant font-bold bg-surface-2 px-1.5 py-0.5 rounded uppercase">
                      SIZE: {w.size}
                    </span>
                  </div>
                  <p className="text-[12px] text-on-surface-variant font-medium leading-relaxed mt-1">
                    Widget live feeds, graphs, and telemetry slots sync values here in real-time.
                  </p>
                </GlassCard>
              );
            })}
        </div>
      </PageSection>
    </div>
  );
}
