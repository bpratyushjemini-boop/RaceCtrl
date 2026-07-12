"use client";

import { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsSection";
import { SettingsRow } from "./SettingsRow";
import { Toggle } from "./Toggle";
import { SegmentedControl } from "./SegmentedControl";
import { useDisplaySettings, type TimeFormat, type TimezoneMode } from "@/lib/settings-context";

type AppearanceTheme = "system" | "dark" | "light";

interface NotificationSettings {
  raceReminders: boolean;
  sessionReminders: boolean;
  results: boolean;
  breakingF1Updates: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  raceReminders: true,
  sessionReminders: true,
  results: true,
  breakingF1Updates: false,
};

export function SettingsManager() {
  const {
    timeFormat,
    timezone,
    setTimeFormat,
    setTimezone,
    refreshSettings,
    isOnline,
    isStandalone,
    canInstall,
    showIOSInstallGuidance,
    triggerPwaInstall,
  } = useDisplaySettings();
  
  const [appearance, setAppearance] = useState<AppearanceTheme>("system");
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [mounted, setMounted] = useState(false);

  // Apply theme to the document root element
  const applyTheme = (theme: AppearanceTheme) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemIsLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      root.classList.add(systemIsLight ? "light" : "dark");
    } else {
      root.classList.add(theme);
    }
  };

  // Synchronise system-theme preference changes at runtime
  useEffect(() => {
    if (appearance !== "system") return;
    
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => applyTheme("system");
    
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [appearance]);

  // Load preferences on mount
  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (!active) return;
      
      try {
        // Theme
        const storedTheme = localStorage.getItem("racectrl_theme") as AppearanceTheme | null;
        if (storedTheme === "system" || storedTheme === "dark" || storedTheme === "light") {
          setAppearance(storedTheme);
          applyTheme(storedTheme);
        } else {
          applyTheme("system");
        }

        // Notifications
        const storedNotifs = localStorage.getItem("racectrl_notifications");
        if (storedNotifs) {
          setNotifications({ ...DEFAULT_NOTIFICATIONS, ...JSON.parse(storedNotifs) });
        }
      } catch (e) {
        console.error("Failed to load settings preferences", e);
      }
      setMounted(true);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleAppearanceChange = (value: AppearanceTheme) => {
    setAppearance(value);
    applyTheme(value);
    try {
      localStorage.setItem("racectrl_theme", value);
    } catch {}
  };

  const handleNotificationChange = (key: keyof NotificationSettings, checked: boolean) => {
    const nextNotifs = { ...notifications, [key]: checked };
    setNotifications(nextNotifs);
    try {
      localStorage.setItem("racectrl_notifications", JSON.stringify(nextNotifs));
    } catch {}
  };

  const handleResetPreferences = () => {
    try {
      localStorage.removeItem("racectrl_theme");
      localStorage.removeItem("racectrl_notifications");
      localStorage.removeItem("racectrl_time_format");
      localStorage.removeItem("racectrl_timezone");
      localStorage.removeItem("racectrl_favorites");
      
      // Update states instantly
      setAppearance("system");
      applyTheme("system");
      setNotifications(DEFAULT_NOTIFICATIONS);
      
      // Reset context
      setTimeFormat("24h");
      setTimezone("local");
      refreshSettings();

      alert("RaceCtrl preferences successfully reset.");
    } catch (e) {
      console.error("Failed to reset preferences", e);
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">Settings</span>
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface">Settings</h1>
        </div>
        <div className="h-40 bg-[#2C2C2E]/30 rounded-md border border-outline/20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          Settings
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
          Settings
        </h1>
      </div>

      {/* ── Section: Appearance ── */}
      <SettingsSection title="Appearance">
        <SettingsRow
          label="App Theme"
          description="Adjust how RaceCtrl looks on your device"
          control={
            <div className="w-[200px]">
              <SegmentedControl
                options={[
                  { label: "Sys", value: "system" },
                  { label: "Dark", value: "dark" },
                  { label: "Light", value: "light" },
                ]}
                selectedValue={appearance}
                onChange={handleAppearanceChange}
              />
            </div>
          }
        />
      </SettingsSection>

      {/* ── Section: Notifications ── */}
      <SettingsSection title="Notifications">
        <SettingsRow
          label="Race Reminders"
          description="Get notified before the grand prix begins"
          control={
            <Toggle
              checked={notifications.raceReminders}
              onChange={(val) => handleNotificationChange("raceReminders", val)}
            />
          }
        />
        <SettingsRow
          label="Session Reminders"
          description="Alerts for practices and qualifying rounds"
          control={
            <Toggle
              checked={notifications.sessionReminders}
              onChange={(val) => handleNotificationChange("sessionReminders", val)}
            />
          }
        />
        <SettingsRow
          label="Results"
          description="Session results and telemetry reports"
          control={
            <Toggle
              checked={notifications.results}
              onChange={(val) => handleNotificationChange("results", val)}
            />
          }
        />
        <SettingsRow
          label="Breaking F1 Updates"
          description="Official announcements and steward reports"
          control={
            <Toggle
              checked={notifications.breakingF1Updates}
              onChange={(val) => handleNotificationChange("breakingF1Updates", val)}
            />
          }
        />
      </SettingsSection>

      {/* ── Section: Time and Display ── */}
      <SettingsSection title="Time and Display">
        <SettingsRow
          label="Time Format"
          description="Choose preferred display configuration"
          control={
            <div className="w-[160px]">
              <SegmentedControl<TimeFormat>
                options={[
                  { label: "12H", value: "12h" },
                  { label: "24H", value: "24h" },
                ]}
                selectedValue={timeFormat}
                onChange={setTimeFormat}
              />
            </div>
          }
        />
        <SettingsRow
          label="Timezone Mode"
          description="Render timing locally or in track timezone"
          control={
            <div className="w-[160px]">
              <SegmentedControl<TimezoneMode>
                options={[
                  { label: "Local", value: "local" },
                  { label: "Circuit", value: "circuit" },
                ]}
                selectedValue={timezone}
                onChange={setTimezone}
              />
            </div>
          }
        />
      </SettingsSection>

      {/* ── Section: App ── */}
      <SettingsSection title="App">
        <SettingsRow
          label="App Mode"
          description="Standalone window or standard browser"
          control={
            <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
              {isStandalone ? "Standalone / Installed" : "Browser Mode"}
            </span>
          }
        />
        <SettingsRow
          label="Connection Status"
          description="Network state diagnostic indicator"
          control={
            <span className={`text-[12px] font-bold uppercase tracking-wider ${isOnline ? "text-[#30D158]" : "text-primary"}`}>
              {isOnline ? "Online" : "Offline / No Signal"}
            </span>
          }
        />
        {canInstall && (
          <SettingsRow
            label="Install RaceCtrl"
            description="Add to your device's home screen"
            control={
              <button
                type="button"
                onClick={triggerPwaInstall}
                className="h-8 px-4 bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] text-white text-[11px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer"
              >
                Install
              </button>
            }
          />
        )}
        {showIOSInstallGuidance && (
          <SettingsRow
            label="iOS Installation"
            description="Add shortcut from Safari options"
            control={
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Share → Add to Home
              </span>
            }
          />
        )}
      </SettingsSection>

      {/* ── Section: Data Source ── */}
      <SettingsSection title="Data Source">
        <SettingsRow
          label="Telemetry Provider"
          description="Main API endpoints connection"
          control={
            <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
              Jolpica / Ergast
            </span>
          }
        />
        <SettingsRow
          label="Standings Refresh Rate"
          description="Championship lists revalidation period"
          control={
            <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
              5 Min
            </span>
          }
        />
        <SettingsRow
          label="Calendar Sync Interval"
          description="Race weekend lists revalidation period"
          control={
            <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
              1 Hour
            </span>
          }
        />
      </SettingsSection>

      {/* ── Reset CTA Button ── */}
      <div className="pt-2 pb-6">
        <button
          type="button"
          onClick={handleResetPreferences}
          className="w-full h-11 bg-primary/10 hover:bg-primary/15 active:bg-primary/20 text-primary text-[13px] font-bold tracking-wider uppercase rounded-full border border-primary/25 transition-colors cursor-pointer select-none"
        >
          Reset RaceCtrl Preferences
        </button>
      </div>

      {/* Spacer to clear floating BottomNav island on mobile */}
      <div className="h-16 md:hidden" />
    </div>
  );
}

