"use client";

import { useState, useEffect, useCallback } from "react";
import type { NotificationHistoryEntry, NotificationPreferences } from "@/lib/notifications/types";
import { loadNotificationPreferences, saveNotificationPreferences } from "@/lib/notifications/preferences";

const HISTORY_KEY = "racectrl_notifications_history";

// Helper to determine if Quiet Hours is currently active
export function isQuietHoursActive(start: string, end: string): boolean {
  try {
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return false;

    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin <= endMin) {
      return currentMin >= startMin && currentMin <= endMin;
    } else {
      // Overnight window (e.g., 22:00 to 07:00)
      return currentMin >= startMin || currentMin <= endMin;
    }
  } catch {
    return false;
  }
}

export function useNotificationCenter() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [history, setHistory] = useState<NotificationHistoryEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load preferences and history on mount
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setPreferences(loadNotificationPreferences());
      
      try {
        const storedHistory = localStorage.getItem(HISTORY_KEY);
        if (storedHistory) {
          const parsed = JSON.parse(storedHistory);
          if (Array.isArray(parsed)) {
            // Validate structure of entries
            const validated = parsed.filter((item): item is NotificationHistoryEntry => {
              return (
                item &&
                typeof item.id === "string" &&
                typeof item.title === "string" &&
                typeof item.body === "string" &&
                typeof item.timestamp === "string" &&
                typeof item.read === "boolean" &&
                typeof item.url === "string"
              );
            });
            setHistory(validated);
          }
        }
      } catch (e) {
        console.error("Failed to load notification history", e);
      }
      
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const savePreferences = useCallback((newPrefs: NotificationPreferences) => {
    setPreferences(newPrefs);
    saveNotificationPreferences(newPrefs);
  }, []);

  // Save history helper
  const saveHistory = useCallback((newHistory: NotificationHistoryEntry[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      window.dispatchEvent(new Event("racectrl_notifications_changed"));
    } catch (e) {
      console.error("Failed to save notification history", e);
    }
  }, []);

  // Add notification to history
  const addNotification = useCallback((
    category: NotificationHistoryEntry["category"],
    title: string,
    body: string,
    url: string = "/notifications"
  ) => {
    const activePrefs = preferences || loadNotificationPreferences();
    
    // Check if category is enabled globally
    if (activePrefs[category] === false) {
      console.log(`[NotificationCenter] Blocked category "${category}" per preferences.`);
      return;
    }

    const isQuiet = activePrefs.quietHoursEnabled && isQuietHoursActive(activePrefs.quietHoursStart, activePrefs.quietHoursEnd);

    const entry: NotificationHistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      category,
      title,
      body: isQuiet ? `${body} (Muted during quiet hours)` : body,
      timestamp: new Date().toISOString(),
      read: false,
      url,
    };

    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 100); // Max 100 entries
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        window.dispatchEvent(new Event("racectrl_notifications_changed"));
      } catch {}
      return next;
    });

    // Fire browser/push alerts if quiet hours are not active
    if (!isQuiet && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, { body, icon: "/icon?sizes=192x192" });
      } catch (err) {
        console.warn("Local notification display failed:", err);
      }
    }
  }, [preferences]);

  const markAsRead = useCallback((id: string) => {
    const next = history.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveHistory(next);
  }, [history, saveHistory]);

  const markAllAsRead = useCallback(() => {
    const next = history.map((n) => ({ ...n, read: true }));
    saveHistory(next);
  }, [history, saveHistory]);

  const deleteNotification = useCallback((id: string) => {
    const next = history.filter((n) => n.id !== id);
    saveHistory(next);
  }, [history, saveHistory]);

  const clearAll = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  // Synchronise history across tabs
  useEffect(() => {
    const sync = () => {
      try {
        const storedHistory = localStorage.getItem(HISTORY_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch {}
    };
    window.addEventListener("racectrl_notifications_changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("racectrl_notifications_changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const unreadCount = history.filter((n) => !n.read).length;

  return {
    preferences,
    history,
    unreadCount,
    mounted,
    savePreferences,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
