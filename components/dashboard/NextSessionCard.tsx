"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import type { Session } from "@/lib/types";
import { useDisplaySettings } from "@/lib/settings-context";
import { formatSessionDate, formatSessionTime } from "@/lib/time-utils";
import {
  getNotificationCapability,
  requestNotificationPermission,
  subscribeToPush,
} from "@/lib/notifications/support";
import {
  loadNotificationPreferences,
  loadReminderConfig,
  isSessionReminderEnabled,
  toggleSessionReminder,
} from "@/lib/notifications/preferences";
import { NotificationCapability, NotificationPreferences } from "@/lib/notifications/types";

export function NextSessionCard({ session, round }: { session: Session | null; round?: number }) {
  const { timeFormat, timezone, isOnline } = useDisplaySettings();
  const [capability, setCapability] = useState<NotificationCapability>("unsupported");
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState<number>(15);
  const [sessionEnabled, setSessionEnabled] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setCapability(getNotificationCapability());
      const prefs = loadNotificationPreferences();
      setNotifications(prefs);
      const config = loadReminderConfig();
      setLeadTimeMinutes(config.leadTimeMinutes);

      if (round && session) {
        setSessionEnabled(isSessionReminderEnabled(round, session.label, prefs));
      }
      setMounted(true);
    });
  }, [round, session]);

  if (!session) {
    return (
      <GlassCard className="p-6 text-center flex flex-col justify-center min-h-[200px]" variant="floating">
        <p className="text-[15px] font-medium text-on-surface">No upcoming session</p>
        <p className="mt-1 text-[13px] text-on-surface-variant">
          Check back once the next round is scheduled.
        </p>
      </GlassCard>
    );
  }

  const dateStr = formatSessionDate(session.date, session.time, timezone);
  const timeStr = formatSessionTime(session.date, session.time, timeFormat, timezone);

  const handleButtonClick = async () => {
    if (!mounted || !notifications) return;

    if (capability === "permission-default") {
      if (!isOnline) return;
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
          console.error("Subscription error during quick enablement:", err);
        }
        if (round) {
          const updatedPrefs = loadNotificationPreferences();
          setNotifications(updatedPrefs);
          setSessionEnabled(isSessionReminderEnabled(round, session.label, updatedPrefs));
        }
      }
    } else if (capability === "ready") {
      if (round) {
        const nextVal = toggleSessionReminder(round, session.label);
        setSessionEnabled(nextVal);
      }
    }
  };

  // Determine button state, styling, and text labels
  let buttonText = "Notify Me";
  let buttonClass = "bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] text-white";
  let isDisabled = false;
  let isBellOn = false;

  if (mounted) {
    if (capability === "unsupported") {
      buttonText = "Muted / Unsupported";
      buttonClass = "bg-surface-2 text-on-surface-variant cursor-not-allowed border border-outline/35";
      isDisabled = true;
    } else if (capability === "standalone-required") {
      buttonText = "Install App Required";
      buttonClass = "bg-surface-2 text-on-surface-variant cursor-not-allowed border border-outline/35";
      isDisabled = true;
    } else if (capability === "permission-denied") {
      buttonText = "Alerts Blocked";
      buttonClass = "bg-surface-2 text-primary cursor-not-allowed border border-primary/20";
      isDisabled = true;
    } else if (capability === "permission-default") {
      buttonText = "Enable Alerts";
      buttonClass = "bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] text-white";
    } else if (capability === "ready") {
      if (sessionEnabled) {
        buttonText = `Alert ${leadTimeMinutes}M`;
        buttonClass = "bg-[#30D158]/10 hover:bg-[#30D158]/15 active:bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/25";
        isBellOn = true;
      } else {
        buttonText = "Bell Off / Enable Alerts";
        buttonClass = "bg-surface-2 hover:bg-surface-2/80 active:bg-surface-2/60 text-on-surface border border-outline/40";
      }
    }
  }

  return (
    <GlassCard className="p-6 flex flex-col justify-between min-h-[200px] gap-4" variant="floating">
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="text-[11px] font-bold tracking-widest text-secondary uppercase">
            Next Session
          </span>
        </div>
        <p className="text-2xl font-bold text-on-surface tracking-tight leading-tight">
          {session.label}
        </p>
        <p className="text-[13px] font-medium text-on-surface-variant mt-1.5">
          {dateStr} • {timeStr} {timezone === "circuit" ? "Circuit" : "Local"}
        </p>
      </div>

      <button
        type="button"
        disabled={isDisabled}
        onClick={handleButtonClick}
        className={`flex items-center justify-center gap-2 w-full h-11 text-[13px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer select-none ${buttonClass} ${
          isDisabled ? "opacity-75" : ""
        }`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          {isBellOn ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          )}
        </svg>
        {buttonText}
      </button>
    </GlassCard>
  );
}