"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardBuilder } from "@/components/pro/DashboardBuilder";
import { AnalyticsStudio } from "@/components/pro/AnalyticsStudio";
import { DevCenter } from "@/components/pro/DevCenter";
import { AutomationEngine } from "@/components/pro/AutomationEngine";
import { PresentationMode } from "@/components/pro/PresentationMode";

type ProTab = "builder" | "analytics" | "dev" | "automation";

export default function ProDashboardPage() {
  const [activeTab, setActiveTab] = useState<ProTab>("builder");
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Esc keyboard listener to exit Presentation Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPresentationOpen) {
        setIsPresentationOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationOpen]);

  return (
    <PageContainer gap="md" className="pb-12 max-w-6xl mx-auto">
      {/* Presentation Mode overlay */}
      <PresentationMode isOpen={isPresentationOpen} onClose={() => setIsPresentationOpen(false)} />

      {/* Top action header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <button
          onClick={() => setIsPresentationOpen(true)}
          className="h-9 px-4 bg-primary text-white text-[11.5px] font-black uppercase tracking-wider rounded-full hover:bg-primary-variant transition-all cursor-pointer flex items-center gap-2 select-none"
        >
          <span>🖥️</span>
          <span>Presentation Mode</span>
        </button>
      </div>

      {/* Hub title */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          Enthusiast & Analyst System
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none uppercase">
          RaceCtrl Pro Operating System
        </h1>
        <p className="text-[13.5px] text-on-surface-variant mt-1.5">
          Design custom layouts, query real-time pacing telemetry, automate reports compilation, and generate API credentials.
        </p>
      </div>

      {/* Tabs Selector Bar */}
      <div className="flex flex-wrap bg-surface-2/50 border border-outline/25 rounded-full p-1 self-start gap-1 select-none mt-2">
        <button
          onClick={() => setActiveTab("builder")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "builder" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Dashboard Builder
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "analytics" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Analytics Studio
        </button>
        <button
          onClick={() => setActiveTab("dev")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "dev" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Developer Center
        </button>
        <button
          onClick={() => setActiveTab("automation")}
          className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === "automation" ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Automation Engine
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-2">
        {activeTab === "builder" && <DashboardBuilder />}
        {activeTab === "analytics" && <AnalyticsStudio />}
        {activeTab === "dev" && <DevCenter />}
        {activeTab === "automation" && <AutomationEngine />}
      </div>
    </PageContainer>
  );
}
