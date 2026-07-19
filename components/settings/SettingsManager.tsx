"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SettingsSection } from "./SettingsSection";
import { SettingsRow } from "./SettingsRow";
import { DownloadManager } from "@/components/system/DownloadManager";
import { LiquidGlassSwitch } from "@/components/ui/LiquidGlassSwitch";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PageContainer } from "@/components/layout/PageContainer";
import { useDisplaySettings, type TimeFormat, type TimezoneMode } from "@/lib/settings-context";
import {
  getNotificationCapability,
  requestNotificationPermission,
  subscribeToPush,
} from "@/lib/notifications/support";
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  loadReminderConfig,
  saveReminderConfig,
  DEFAULT_NOTIFICATIONS,
} from "@/lib/notifications/preferences";
import { NotificationCapability, NotificationPreferences } from "@/lib/notifications/types";

type AppearanceTheme = "system" | "dark" | "light";

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
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState<number>(15);
  const [capability, setCapability] = useState<NotificationCapability>("unsupported");
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState<string>("");
  const [resetFeedback, setResetFeedback] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [systemDataExpanded, setSystemDataExpanded] = useState(false);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [telemetryOptIn, setTelemetryOptIn] = useState(true);
  const [storageSize, setStorageSize] = useState("0 KB");

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
        setNotifications(loadNotificationPreferences());

        // Lead time
        const config = loadReminderConfig();
        setLeadTimeMinutes(config.leadTimeMinutes);

        // Accessibility & Units
        setReducedMotion(localStorage.getItem("racectrl_reduced_motion") === "true");
        setHighContrast(localStorage.getItem("racectrl_high_contrast") === "true");
        setUnits((localStorage.getItem("racectrl_units") as "metric" | "imperial") || "metric");
        setTelemetryOptIn(localStorage.getItem("racectrl_telemetry") !== "false");

        // Local cache size
        let sum = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith("racectrl_")) {
            sum += localStorage.getItem(key)?.length || 0;
          }
        }
        setStorageSize(`${(sum / 1024).toFixed(1)} KB`);

        // Capability
        setCapability(getNotificationCapability());
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

  const handleNotificationChange = (key: keyof NotificationPreferences, checked: boolean | string) => {
    const nextNotifs = { ...notifications, [key]: checked };
    setNotifications(nextNotifs as NotificationPreferences);
    saveNotificationPreferences(nextNotifs as NotificationPreferences);
  };

  const handleLeadTimeChange = (value: number) => {
    setLeadTimeMinutes(value);
    saveReminderConfig({ leadTimeMinutes: value });
  };

  const handleReducedMotionChange = (val: boolean) => {
    setReducedMotion(val);
    try {
      localStorage.setItem("racectrl_reduced_motion", String(val));
      if (val) document.documentElement.classList.add("reduced-motion");
      else document.documentElement.classList.remove("reduced-motion");
    } catch {}
  };

  const handleHighContrastChange = (val: boolean) => {
    setHighContrast(val);
    try {
      localStorage.setItem("racectrl_high_contrast", String(val));
      if (val) document.documentElement.classList.add("high-contrast");
      else document.documentElement.classList.remove("high-contrast");
    } catch {}
  };

  const handleUnitsChange = (val: "metric" | "imperial") => {
    setUnits(val);
    try {
      localStorage.setItem("racectrl_units", val);
    } catch {}
  };

  const handleTelemetryChange = (val: boolean) => {
    setTelemetryOptIn(val);
    try {
      localStorage.setItem("racectrl_telemetry", String(val));
    } catch {}
  };

  const handleClearCache = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("racectrl_") && !key.includes("favorites") && !key.includes("notifications")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      setStorageSize("0 KB");
      alert("Cache cleared successfully!");
    } catch {}
  };

  const handleEnableAlerts = async () => {
    if (!isOnline) {
      setTestStatus("error");
      setTestMessage("Connection is required to enable alerts.");
      return;
    }

    const nextCap = await requestNotificationPermission();
    setCapability(nextCap);

    if (nextCap === "ready") {
      try {
        const sub = await subscribeToPush();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sub),
          });
        }
      } catch (err) {
        console.error("Error registering Web Push subscription on mount/permission grant:", err);
      }
    }
  };

  const handleSendTestAlert = async () => {
    setTestStatus("idle");
    setTestMessage("");

    if (!("serviceWorker" in navigator) || Notification.permission !== "granted") {
      setTestStatus("error");
      setTestMessage("Notification permissions are not active.");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("RaceCtrl", {
        body: "Race alerts are ready.",
        icon: "/icon?sizes=192x192",
        badge: "/icon?sizes=192x192",
        data: {
          url: "/weekend"
        }
      });
      setTestStatus("success");
      setTestMessage("Test alert sent to device locally.");
      setTimeout(() => {
        setTestStatus("idle");
        setTestMessage("");
      }, 5000);
    } catch {
      setTestStatus("error");
      setTestMessage("Failed to display local alert.");
    }
  };

  const handleResetPreferences = () => {
    try {
      localStorage.removeItem("racectrl_theme");
      localStorage.removeItem("racectrl_notifications");
      localStorage.removeItem("racectrl_time_format");
      localStorage.removeItem("racectrl_timezone");
      localStorage.removeItem("racectrl_favorites");
      localStorage.removeItem("racectrl_reminder_lead_time");
      localStorage.removeItem("racectrl_session_reminders");
      
      // Update states instantly
      setAppearance("system");
      applyTheme("system");
      setNotifications(DEFAULT_NOTIFICATIONS);
      setLeadTimeMinutes(15);
      setCapability(getNotificationCapability());
      
      // Reset context
      setTimeFormat("24h");
      setTimezone("local");
      refreshSettings();

      setResetFeedback(true);
      setTimeout(() => setResetFeedback(false), 3000);
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
        <div className="h-40 bg-surface-2/30 rounded-md border border-outline/20" />
      </div>
    );
  }

  return (
    <PageContainer>
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

      {/* ── Section: Offline Downloads ── */}
      <SettingsSection title="Offline Cache Downloads">
        <div className="w-full">
          <DownloadManager />
        </div>
      </SettingsSection>

      {/* ── Section: Notifications ── */}
      <SettingsSection title="Notifications">
        {capability === "unsupported" && (
          <SettingsRow
            label="Push Alerts"
            description="Notifications are not supported on this device."
            control={
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Unsupported
              </span>
            }
          />
        )}
        {capability === "standalone-required" && (
          <SettingsRow
            label="Push Alerts"
            description="Install RaceCtrl to enable race alerts."
            control={
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Install Required
              </span>
            }
          />
        )}
        {capability === "permission-default" && (
          <SettingsRow
            label="Push Alerts"
            description="Race alerts are ready to set up."
            control={
              <button
                type="button"
                onClick={handleEnableAlerts}
                disabled={!isOnline}
                className="h-8 px-4 bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer"
              >
                Enable Alerts
              </button>
            }
          />
        )}
        {capability === "ready" && (
          <SettingsRow
            label="Push Alerts"
            description="Race alerts enabled."
            control={
              <span className="text-[11px] font-bold text-[#30D158] uppercase tracking-wider">
                Active
              </span>
            }
          />
        )}
        {capability === "permission-denied" && (
          <SettingsRow
            label="Push Alerts"
            description="Notifications are blocked in system/browser settings."
            control={
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Blocked
              </span>
            }
          />
        )}

        <SettingsRow
          label="Race Reminders"
          description="Get notified before the grand prix begins"
          control={
            <LiquidGlassSwitch
              checked={notifications.raceReminders}
              onCheckedChange={(val) => handleNotificationChange("raceReminders", val)}
              disabled={capability !== "ready"}
            />
          }
        />
        <SettingsRow
          label="Session Reminders"
          description="Alerts for practices and qualifying rounds"
          control={
            <LiquidGlassSwitch
              checked={notifications.sessionReminders}
              onCheckedChange={(val) => handleNotificationChange("sessionReminders", val)}
              disabled={capability !== "ready"}
            />
          }
        />
        <SettingsRow
          label="Reminder Lead Time"
          description="Alert window before session start"
          control={
            <div className="w-[160px]">
              <SegmentedControl<number>
                options={[
                  { label: "15M", value: 15 },
                  { label: "30M", value: 30 },
                  { label: "1H", value: 60 },
                ]}
                selectedValue={leadTimeMinutes}
                onChange={handleLeadTimeChange}
                disabled={capability !== "ready"}
              />
            </div>
          }
        />
        <SettingsRow
          label="Results"
          description="Session results and telemetry reports"
          control={
            <LiquidGlassSwitch
              checked={notifications.results}
              onCheckedChange={(val) => handleNotificationChange("results", val)}
              disabled={capability !== "ready"}
            />
          }
        />
        <SettingsRow
          label="Breaking F1 Updates"
          description="Official announcements and updates"
          control={
            <LiquidGlassSwitch
              checked={notifications.breakingF1Updates}
              onCheckedChange={(val) => handleNotificationChange("breakingF1Updates", val)}
              disabled={capability !== "ready"}
            />
          }
        />
        <SettingsRow
          label="Weekend Reminders"
          description="Alerts for practices, qualifying, and sprints"
          control={
            <LiquidGlassSwitch
              checked={notifications.weekendReminders}
              onCheckedChange={(val) => handleNotificationChange("weekendReminders", val)}
              disabled={capability !== "ready"}
            />
          }
        />
        <SettingsRow
          label="Live Flags & Timing"
          description="Yellow/Red flags, safety cars, and leader switches"
          control={
            <LiquidGlassSwitch
              checked={notifications.liveEvents}
              onCheckedChange={(val) => handleNotificationChange("liveEvents", val)}
              disabled={capability !== "ready"}
            />
          }
        />
        <SettingsRow
          label="Track Weather"
          description="Alerts for rain risk, air temp or delays"
          control={
            <LiquidGlassSwitch
              checked={notifications.weatherAlerts}
              onCheckedChange={(val) => handleNotificationChange("weatherAlerts", val)}
              disabled={capability !== "ready"}
            />
          }
        />
        <SettingsRow
          label="Quiet Hours"
          description="Silence alerts during custom hours"
          control={
            <LiquidGlassSwitch
              checked={notifications.quietHoursEnabled}
              onCheckedChange={(val) => handleNotificationChange("quietHoursEnabled", val)}
              disabled={capability !== "ready"}
            />
          }
        />
        {notifications.quietHoursEnabled && (
          <SettingsRow
            label="Quiet Hours Window"
            description="Start and End window (24h)"
            control={
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={notifications.quietHoursStart}
                  onChange={(e) => handleNotificationChange("quietHoursStart", e.target.value)}
                  placeholder="22:00"
                  className="w-16 h-8 text-center bg-surface-2 text-on-surface text-[12px] font-bold rounded border border-outline/30 focus:outline-none"
                />
                <span className="text-[11px] text-on-surface-variant font-bold font-mono">to</span>
                <input
                  type="text"
                  value={notifications.quietHoursEnd}
                  onChange={(e) => handleNotificationChange("quietHoursEnd", e.target.value)}
                  placeholder="07:00"
                  className="w-16 h-8 text-center bg-surface-2 text-on-surface text-[12px] font-bold rounded border border-outline/30 focus:outline-none"
                />
              </div>
            }
          />
        )}

        {capability === "ready" && (
          <SettingsRow
            label="Test Notification"
            description="Send a local capability test alert"
            control={
              <button
                type="button"
                onClick={handleSendTestAlert}
                className="h-8 px-4 bg-surface-2 hover:bg-surface-2/80 active:bg-surface-2/60 text-on-surface text-[11px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer border border-outline/40"
              >
                Send Test Alert
              </button>
            }
          />
        )}
      </SettingsSection>

      {!isOnline && (
        <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-[11px] text-primary font-medium text-center">
            Device is offline. Notification configuration is deferred until connection is restored.
          </p>
        </div>
      )}
      {testMessage && (
        <div className={`px-4 py-2 border rounded-lg ${testStatus === "success" ? "bg-[#30D158]/10 border-[#30D158]/20 text-[#30D158]" : "bg-primary/10 border-primary/20 text-primary"}`}>
          <p className="text-[11px] font-medium text-center">{testMessage}</p>
        </div>
      )}

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
        <SettingsRow
          label="Measurement Units"
          description="Select Metric (Celsius/km/h) or Imperial (Fahrenheit/mph)"
          control={
            <div className="w-[160px]">
              <SegmentedControl<"metric" | "imperial">
                options={[
                  { label: "Metric", value: "metric" },
                  { label: "Imperial", value: "imperial" },
                ]}
                selectedValue={units}
                onChange={handleUnitsChange}
              />
            </div>
          }
        />
        <SettingsRow
          label="High Contrast"
          description="Increase contrast layout colors"
          control={
            <LiquidGlassSwitch
              checked={highContrast}
              onCheckedChange={handleHighContrastChange}
            />
          }
        />
        <SettingsRow
          label="Reduced Motion"
          description="Disable hover and layout transition animations"
          control={
            <LiquidGlassSwitch
              checked={reducedMotion}
              onCheckedChange={handleReducedMotionChange}
            />
          }
        />
      </SettingsSection>

      {/* ── Section: RaceCtrl Support ── */}
      <SettingsSection title="RaceCtrl Support">
        <SettingsRow
          label="What's New"
          description="View recent updates and feature logs"
          control={
            <Link
              href="/changelog"
              className="h-8 px-4 bg-surface-2 hover:bg-surface-2/80 active:bg-surface-2/60 text-on-surface text-[11px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer border border-outline/40 flex items-center justify-center"
            >
              Changelog
            </Link>
          }
        />
        <SettingsRow
          label="Send Feedback"
          description="Report a bug or suggest feature improvements"
          control={
            <Link
              href="/feedback"
              className="h-8 px-4 bg-surface-2 hover:bg-surface-2/80 active:bg-surface-2/60 text-on-surface text-[11px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer border border-outline/40 flex items-center justify-center"
            >
              Feedback Form
            </Link>
          }
        />
      </SettingsSection>

      {/* ── Collapsible Section: System & Data ── */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setSystemDataExpanded(!systemDataExpanded)}
          className="flex items-center justify-between w-full px-1.5 py-2.5 bg-surface-2/20 border border-outline/25 rounded-md hover:bg-surface-2/30 active:bg-surface-2/40 cursor-pointer select-none text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold tracking-widest text-on-surface uppercase">
              System & Data
            </span>
          </div>
          <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            {systemDataExpanded ? "Hide Details" : "Show Details"}
            <svg
              className={`h-3 w-3 transition-transform duration-200 ${
                systemDataExpanded ? "transform rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {systemDataExpanded && (
          <div className="flex flex-col gap-6 animate-page-transition mt-1">
            {/* ── Section: App Cache & Privacy ── */}
            <SettingsSection title="App Storage & Privacy">
              <SettingsRow
                label="Diagnostic Telemetry"
                description="Share diagnostic logs to improve app reliability"
                control={
                  <LiquidGlassSwitch
                    checked={telemetryOptIn}
                    onCheckedChange={handleTelemetryChange}
                  />
                }
              />
              <SettingsRow
                label="Cache Footprint"
                description={`RaceCtrl local offline cache size: ${storageSize}`}
                control={
                  <button
                    type="button"
                    onClick={handleClearCache}
                    className="h-8 px-4 bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] text-white text-[11px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer"
                  >
                    Clear Cache
                  </button>
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
                label="Data Provider"
                description="Ergast-compatible database connection"
                control={
                  <span className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Jolpica F1 API
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
          </div>
        )}
      </div>

      {/* ── Reset CTA Button ── */}
      <div className="pt-2 pb-6">
        <button
          type="button"
          onClick={handleResetPreferences}
          className="w-full h-11 bg-primary/10 hover:bg-primary/15 active:bg-primary/20 text-primary text-[13px] font-bold tracking-wider uppercase rounded-full border border-primary/25 transition-colors cursor-pointer select-none"
        >
          {resetFeedback ? "Preferences Reset Successfully" : "Reset RaceCtrl Preferences"}
        </button>
      </div>

      {/* Spacer to clear floating BottomNav island on mobile */}
      <div className="h-16 md:hidden" />
    </PageContainer>
  );
}
