"use client";

import { useEffect, useState } from "react";
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
import { NotificationCapability } from "@/lib/notifications/types";

export type SessionState = "completed" | "up-next" | "upcoming";

interface SessionRowProps {
  session: Session;
  state: SessionState;
  isLast: boolean;
  round?: number;
  now: number;
}

const STATE_CONFIG = {
  completed: {
    badge: "DONE",
    badgeClass: "text-on-surface-variant bg-surface-2",
    rowClass: "opacity-50",
    labelClass: "text-on-surface-variant",
    timeClass: "text-on-surface-variant font-tabular",
    dotClass: "bg-outline",
    lineClass: "bg-outline/40",
  },
  "up-next": {
    badge: "UP NEXT",
    badgeClass: "text-primary bg-primary/10 border border-primary/30",
    rowClass: "",
    labelClass: "text-on-surface font-semibold",
    timeClass: "text-primary font-tabular font-semibold",
    dotClass: "bg-primary animate-pulse",
    lineClass: "bg-outline/40",
  },
  upcoming: {
    badge: "UPCOMING",
    badgeClass: "text-on-surface-variant bg-surface-2",
    rowClass: "",
    labelClass: "text-on-surface",
    timeClass: "text-on-surface font-tabular",
    dotClass: "bg-outline",
    lineClass: "bg-outline/40",
  },
} as const;

export function SessionRow({ session, state, isLast, round, now }: SessionRowProps) {
  const { timeFormat, timezone, isOnline } = useDisplaySettings();
  const [capability, setCapability] = useState<NotificationCapability>("unsupported");
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(false);
  const [leadTimeMinutes, setLeadTimeMinutes] = useState<number>(15);
  const [mounted, setMounted] = useState<boolean>(false);

  const config = STATE_CONFIG[state];
  const formattedDay = formatSessionDate(session.date, session.time, timezone);
  const formattedTime = formatSessionTime(session.date, session.time, timeFormat, timezone);

  const sessionTime = new Date(`${session.date}T${session.time}`).getTime();
  const isFuture = sessionTime > now;

  useEffect(() => {
    setCapability(getNotificationCapability());
    const prefs = loadNotificationPreferences();
    const config = loadReminderConfig();
    setLeadTimeMinutes(config.leadTimeMinutes);

    if (round) {
      setReminderEnabled(isSessionReminderEnabled(round, session.label, prefs));
    }
    setMounted(true);
  }, [round, session, now]);

  const handleToggle = () => {
    if (round) {
      const nextVal = toggleSessionReminder(round, session.label);
      setReminderEnabled(nextVal);
    }
  };

  const handleEnableAlerts = async () => {
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
        console.error("Subscription error during timeline permission click:", err);
      }
      if (round) {
        const updatedPrefs = loadNotificationPreferences();
        setReminderEnabled(isSessionReminderEnabled(round, session.label, updatedPrefs));
      }
    }
  };

  return (
    <li className={`flex gap-3 ${config.rowClass}`}>
      {/* Timeline track */}
      <div className="flex flex-col items-center pt-1 shrink-0" aria-hidden="true">
        <span
          className={`h-2 w-2 rounded-full shrink-0 mt-0.5 ${config.dotClass}`}
        />
        {!isLast && (
          <span className={`w-px flex-1 mt-1 min-h-[28px] ${config.lineClass}`} />
        )}
      </div>

      {/* Session content */}
      <div className="flex flex-1 items-start justify-between gap-4 pb-5">
        <div className="min-w-0">
          {/* State badge */}
          <span
            className={`inline-block text-[10px] font-bold tracking-widest uppercase rounded-full px-2 py-0.5 mb-1 ${config.badgeClass}`}
            aria-label={`Session status: ${config.badge}`}
          >
            {config.badge}
          </span>
          {/* Session name */}
          <p className={`text-[15px] leading-tight ${config.labelClass}`}>
            {session.label}
          </p>
          {/* Day */}
          <p className="text-[12px] text-on-surface-variant mt-0.5">
            {formattedDay}
          </p>
        </div>

        {/* Local time and Reminder alert */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 pt-5">
          <p
            className={`text-[17px] leading-none ${config.timeClass}`}
            aria-label={`Session start time: ${formattedTime}`}
          >
            {formattedTime}
          </p>

          {mounted && isFuture && capability === "ready" && (
            <button
              type="button"
              onClick={handleToggle}
              className={`p-1 rounded-full transition-colors cursor-pointer border ${
                reminderEnabled
                  ? "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20 hover:bg-[#30D158]/15"
                  : "bg-surface-2 text-on-surface-variant hover:text-on-surface border border-outline/35"
              }`}
              title={reminderEnabled ? `Alert active (${leadTimeMinutes}m before)` : "Enable alert"}
            >
              <svg
                className="h-3.5 w-3.5"
                fill={reminderEnabled ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
          )}

          {mounted && isFuture && capability === "permission-default" && (
            <button
              type="button"
              onClick={handleEnableAlerts}
              className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider cursor-pointer"
              title="Request permission to enable reminders"
            >
              Notify
            </button>
          )}

          {mounted && isFuture && capability === "permission-denied" && (
            <span className="text-[9px] font-bold text-primary/75 uppercase tracking-wider" title="Alerts blocked in settings">
              Blocked
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
