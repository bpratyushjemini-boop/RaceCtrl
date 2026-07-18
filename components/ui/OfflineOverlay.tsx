"use client";

import React, { useState, useEffect } from "react";
import { useDisplaySettings } from "@/lib/settings-context";
import { GlassCard } from "@/components/ui/GlassCard";

export function OfflineOverlay() {
  const { isOnline } = useDisplaySettings();
  const [checking, setChecking] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hint, setHint] = useState("");
  const [cachedAgeText, setCachedAgeText] = useState("Cached just now");

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

  useEffect(() => {
    if (!visible) return;

    const updateAge = () => {
      const lastSync = localStorage.getItem("racectrl_last_sync_time");
      if (!lastSync) {
        setCachedAgeText("Cached age unknown");
        return;
      }
      const syncTime = Number(lastSync);
      if (isNaN(syncTime)) {
        setCachedAgeText("Cached age unknown");
        return;
      }
      const diffSec = Math.floor((Date.now() - syncTime) / 1000);
      if (diffSec < 60) {
        setCachedAgeText("Cached just now");
      } else {
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) {
          setCachedAgeText(`Cached ${diffMin} min ago`);
        } else {
          const diffHr = Math.floor(diffMin / 60);
          setCachedAgeText(`Cached ${diffHr} hr${diffHr > 1 ? "s" : ""} ago`);
        }
      }
    };

    updateAge();
    const interval = setInterval(updateAge, 30000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleRetry = () => {
    setChecking(true);
    setHint("");

    setTimeout(() => {
      setChecking(false);
      if (typeof window !== "undefined" && navigator.onLine) {
        window.location.reload();
      } else {
        setHint("Connection check failed. Device is still offline.");
      }
    }, 1000);
  };

  if (!visible) return null;

  return (
    <div className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[45] w-[calc(100%-32px)] max-w-md animate-in slide-in-from-top duration-300">
      <GlassCard className="p-4 border border-warning/20 bg-warning/5 backdrop-blur-md flex flex-col gap-2.5 shadow-lg" variant="floating">
        <div className="flex gap-2.5 items-start">
          <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 border border-primary/25 text-primary shrink-0">
            <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-primary border border-surface-2 animate-pulse" />
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-on-surface uppercase tracking-wider">Offline</span>
              <span className="text-[10px] text-on-surface-variant font-mono font-bold tracking-tight">
                {cachedAgeText}
              </span>
            </div>
            <p className="text-[12px] text-on-surface-variant leading-normal mt-1">
              RaceCtrl is offline. Timings and standings are shown from local cache. Reconnect to sync live telemetry.
            </p>
          </div>
        </div>

        {hint && (
          <p className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded px-2 py-1 text-center animate-in slide-in-from-top-1">
            {hint}
          </p>
        )}

        <div className="flex gap-2 justify-end mt-1 border-t border-outline/10 pt-2.5">
          <button
            type="button"
            onClick={handleRetry}
            disabled={checking}
            className="px-4 py-1.5 bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] disabled:opacity-40 text-white text-[11px] font-bold tracking-wider uppercase rounded-full transition-all cursor-pointer flex items-center gap-1.5 select-none active:scale-[0.98]"
          >
            {checking ? (
              <>
                <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Checking...</span>
              </>
            ) : (
              <span>Retry Sync</span>
            )}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
