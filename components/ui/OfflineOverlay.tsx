"use client";

import React, { useState, useEffect } from "react";
import { useDisplaySettings } from "@/lib/settings-context";

export function OfflineOverlay() {
  const { isOnline } = useDisplaySettings();
  const [checking, setChecking] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hint, setHint] = useState("");

  // Delay the fullscreen block slightly to prevent flickering during transient glitches
  useEffect(() => {
    if (!isOnline) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setVisible(false);
        setHint("");
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isOnline]);

  const handleRetry = () => {
    setChecking(true);
    setHint("");

    setTimeout(() => {
      setChecking(false);
      if (typeof window !== "undefined" && navigator.onLine) {
        // Trigger browser reload to fetch fresh standings/weekend schedules
        window.location.reload();
      } else {
        setHint("Device is still offline. Please check your network connection.");
      }
    }, 1000);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-bg/90 backdrop-blur-xl animate-fade-in select-none">
      
      {/* Liquid Glass Overlay Card */}
      <div className="w-full max-w-sm rounded-3xl p-6 md:p-8 border border-outline/30 bg-surface-2/45 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-primary/10 blur-3xl rounded-full" />

        {/* Signal Indicator Dot & Icon */}
        <div className="relative flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 border border-primary/25 text-primary mb-5">
          <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-surface-2 animate-pulse" />
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>

        <h2 className="text-[17px] font-black text-on-surface uppercase tracking-widest">
          Telemetry Signal Lost
        </h2>
        
        <p className="text-[12.5px] text-on-surface-variant leading-relaxed mt-2.5 max-w-[280px]">
          RaceCtrl has disconnected from the grid. Live timings, updates, and analysis are deferred until signal is restored.
        </p>

        {hint && (
          <p className="text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg p-2.5 mt-4 w-full animate-in slide-in-from-top-1">
            {hint}
          </p>
        )}

        <button
          type="button"
          onClick={handleRetry}
          disabled={checking}
          className="w-full h-11 bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-bold tracking-wider uppercase rounded-full transition-all mt-6 cursor-pointer flex items-center justify-center gap-2 select-none active:scale-[0.98]"
        >
          {checking ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Checking Grid...</span>
            </>
          ) : (
            <span>Retry Connection</span>
          )}
        </button>

      </div>
    </div>
  );
}
