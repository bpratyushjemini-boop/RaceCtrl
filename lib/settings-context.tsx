"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TimeFormat = "12h" | "24h";
export type TimezoneMode = "local" | "circuit";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface SettingsContextType {
  timeFormat: TimeFormat;
  timezone: TimezoneMode;
  setTimeFormat: (val: TimeFormat) => void;
  setTimezone: (val: TimezoneMode) => void;
  refreshSettings: () => void;
  
  // PWA / Install State
  isOnline: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  showIOSInstallGuidance: boolean;
  triggerPwaInstall: () => Promise<void>;
  dismissPwaInstall: () => void;
  dismissIOSInstall: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [timeFormat, setTimeFormatState] = useState<TimeFormat>("24h");
  const [timezone, setTimezoneState] = useState<TimezoneMode>("local");

  // PWA State
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstallGuidance, setShowIOSInstallGuidance] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  const loadPreferences = () => {
    try {
      const storedFormat = localStorage.getItem("racectrl_time_format");
      if (storedFormat === "12h" || storedFormat === "24h") {
        setTimeFormatState(storedFormat);
      } else {
        setTimeFormatState("24h");
      }
      const storedTimezone = localStorage.getItem("racectrl_timezone");
      if (storedTimezone === "local" || storedTimezone === "circuit") {
        setTimezoneState(storedTimezone);
      } else {
        setTimezoneState("local");
      }
    } catch {}
  };

  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (active) {
        loadPreferences();
      }
    });

    if (typeof window === "undefined") return;

    const checkStandalone = () => {
      return window.matchMedia("(display-mode: standalone)").matches || 
             (("standalone" in window.navigator) && 
              (window.navigator as Navigator & { standalone?: boolean }).standalone) === true;
    };
    
    const standaloneMode = checkStandalone();

    // Initial check inside requestAnimationFrame
    requestAnimationFrame(() => {
      if (!active) return;
      setIsOnline(navigator.onLine);
      setIsStandalone(standaloneMode);
    });

    const ua = navigator.userAgent.toLowerCase();
    const isIOSDevice = /ipad|iphone|ipod/.test(ua);
    const isSafariBrowser = ua.includes("safari") && !ua.includes("crios") && !ua.includes("fxios") && !ua.includes("instagram") && !ua.includes("fb");

    const checkIOSPromptEligibility = () => {
      if (standaloneMode || !isIOSDevice || !isSafariBrowser) return false;
      try {
        const dismissedTime = localStorage.getItem("racectrl_ios_install_dismissed");
        if (!dismissedTime) return true;
        const cooldown = 48 * 60 * 60 * 1000;
        return Date.now() - Number(dismissedTime) > cooldown;
      } catch {
        return true;
      }
    };

    if (checkIOSPromptEligibility()) {
      setTimeout(() => {
        if (active) setShowIOSInstallGuidance(true);
      }, 6000);
    }

    const checkPwaPromptEligibility = () => {
      if (standaloneMode) return false;
      try {
        const dismissedTime = localStorage.getItem("racectrl_install_dismissed");
        if (!dismissedTime) return true;
        const cooldown = 48 * 60 * 60 * 1000;
        return Date.now() - Number(dismissedTime) > cooldown;
      } catch {
        return true;
      }
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      if (active) {
        setDeferredPrompt(promptEvent);
        if (checkPwaPromptEligibility()) {
          setTimeout(() => {
            if (active) setCanInstall(true);
          }, 6000);
        }
      }
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt as EventListener);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("RaceCtrl service worker registration failed:", err);
      });
    }

    return () => {
      active = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt as EventListener);
    };
  }, []);

  const setTimeFormat = (val: TimeFormat) => {
    setTimeFormatState(val);
    try {
      localStorage.setItem("racectrl_time_format", val);
    } catch {}
  };

  const setTimezone = (val: TimezoneMode) => {
    setTimezoneState(val);
    try {
      localStorage.setItem("racectrl_timezone", val);
    } catch {}
  };

  const triggerPwaInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setCanInstall(false);
      }
    } catch (err) {
      console.error("Installation failed", err);
    }
    setDeferredPrompt(null);
  };

  const dismissPwaInstall = () => {
    setCanInstall(false);
    try {
      localStorage.setItem("racectrl_install_dismissed", String(Date.now()));
    } catch {}
  };

  const dismissIOSInstall = () => {
    setShowIOSInstallGuidance(false);
    try {
      localStorage.setItem("racectrl_ios_install_dismissed", String(Date.now()));
    } catch {}
  };

  return (
    <SettingsContext.Provider
      value={{
        timeFormat,
        timezone,
        setTimeFormat,
        setTimezone,
        refreshSettings: loadPreferences,
        isOnline,
        isStandalone,
        canInstall,
        showIOSInstallGuidance,
        triggerPwaInstall,
        dismissPwaInstall,
        dismissIOSInstall,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useDisplaySettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    return {
      timeFormat: "24h" as TimeFormat,
      timezone: "local" as TimezoneMode,
      setTimeFormat: () => {},
      setTimezone: () => {},
      refreshSettings: () => {},
      isOnline: true,
      isStandalone: false,
      canInstall: false,
      showIOSInstallGuidance: false,
      triggerPwaInstall: async () => {},
      dismissPwaInstall: () => {},
      dismissIOSInstall: () => {},
    };
  }
  return context;
}

