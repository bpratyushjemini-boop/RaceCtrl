"use client";

import { useState, useEffect } from "react";
import { LiquidGlassSurface } from "@/components/ui/LiquidGlassSurface";
import { useDisplaySettings } from "@/lib/settings-context";

export function SystemSurface() {
  const {
    isOnline,
    canInstall,
    showIOSInstallGuidance,
    triggerPwaInstall,
    dismissPwaInstall,
    dismissIOSInstall,
  } = useDisplaySettings();

  const [prevOnline, setPrevOnline] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);
  const [onlineAlertState, setOnlineAlertState] = useState<"offline" | "online">("online");

  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout | undefined;

    requestAnimationFrame(() => {
      if (!active) return;
      if (!isOnline) {
        setOnlineAlertState("offline");
        setShowOnlineStatus(true);
      } else if (isOnline && !prevOnline) {
        setOnlineAlertState("online");
        setShowOnlineStatus(true);
        timer = setTimeout(() => {
          if (active) setShowOnlineStatus(false);
        }, 3000);
      }
      setPrevOnline(isOnline);
    });

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [isOnline, prevOnline]);

  const hasSystemBanner = showOnlineStatus || canInstall || showIOSInstallGuidance;

  if (!hasSystemBanner) return null;

  return (
    <div 
      className="fixed bottom-[88px] left-4 right-4 z-40 flex flex-col gap-2 max-w-sm md:left-auto md:right-4 select-none motion-reduce:transition-none transition-all duration-300"
      style={{
        transform: "translateY(0)",
      }}
    >
      {/* ── Network State Banner ── */}
      {showOnlineStatus && (
        <LiquidGlassSurface
          variant="momentary"
          className="p-3.5 flex items-center gap-3 border shadow-lg animate-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none"
          style={{
            borderColor: onlineAlertState === "online" ? "rgba(48, 209, 88, 0.3)" : "rgba(255, 69, 58, 0.3)",
          }}
        >
          {onlineAlertState === "online" ? (
            <>
              {/* Online pulse dot (podium green) */}
              <span className="h-2 w-2 rounded-full bg-[#30D158] shrink-0 animate-pulse" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-widest text-[#30D158] uppercase">
                  Back Online
                </p>
                <p className="text-[12px] text-on-surface mt-0.5 leading-tight font-medium">
                  RaceCtrl connection restored.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Offline indicator (accent red) */}
              <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-widest text-primary uppercase">
                  No Signal
                </p>
                <p className="text-[12px] text-on-surface mt-0.5 leading-tight font-medium">
                  RaceCtrl needs a connection to refresh race data.
                </p>
              </div>
            </>
          )}
        </LiquidGlassSurface>
      )}

      {/* ── Install PWA Prompt Banner ── */}
      {canInstall && (
        <LiquidGlassSurface
          variant="momentary"
          className="p-4 flex flex-col gap-3.5 border border-outline/35 shadow-xl animate-in slide-in-from-bottom-4 duration-300 motion-reduce:animate-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                Install RaceCtrl
              </span>
              <p className="text-[13px] font-bold text-on-surface mt-1 leading-tight">
                Keep race weekends one tap away.
              </p>
            </div>
            {/* Dismiss Cross Icon */}
            <button
              type="button"
              onClick={dismissPwaInstall}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover-glass transition-colors cursor-pointer"
              aria-label="Dismiss app install prompt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerPwaInstall}
              className="flex-1 h-9 bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] text-white text-[12px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer"
            >
              Install
            </button>
            <button
              type="button"
              onClick={dismissPwaInstall}
              className="px-4 h-9 border border-outline/45 hover:border-outline/60 text-on-surface text-[12px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </LiquidGlassSurface>
      )}

      {/* ── iOS Install Guidance Banner ── */}
      {showIOSInstallGuidance && (
        <LiquidGlassSurface
          variant="momentary"
          className="p-4 flex flex-col gap-3 border border-outline/35 shadow-xl animate-in slide-in-from-bottom-4 duration-300 motion-reduce:animate-none"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                Add RaceCtrl to Home Screen
              </span>
              <p className="text-[13px] text-on-surface mt-1.5 leading-tight font-medium">
                Tap the <span className="font-bold text-primary">Share</span> icon in Safari and select <span className="font-bold text-primary">Add to Home Screen</span>.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissIOSInstall}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover-glass transition-colors cursor-pointer"
              aria-label="Dismiss iOS install guidance"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </LiquidGlassSurface>
      )}
    </div>
  );
}
