"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";
import { GlassCard } from "@/components/ui/GlassCard";
import { useNotificationCenter } from "@/lib/hooks/useNotificationCenter";
import { formatTimeAgo } from "@/lib/time-utils";

type NotificationCategory = "all" | "weekendReminders" | "liveEvents" | "favDriverEvents" | "favTeamEvents" | "championshipChanges" | "newsUpdates" | "weatherAlerts";

export default function NotificationCenterPage() {
  const {
    history,
    unreadCount,
    mounted,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationCenter();

  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  if (!mounted) {
    return (
      <PageContainer gap="md" className="animate-pulse pb-10">
        <div className="h-10 w-44 bg-surface-2/40 rounded mb-4" />
        <div className="h-40 bg-surface-2/30 rounded-lg border border-outline/20" />
      </PageContainer>
    );
  }

  // Filter alerts
  const filtered = history.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUnread = !unreadOnly || !item.read;
    return matchesCategory && matchesSearch && matchesUnread;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "weatherAlerts":
        return (
          <svg className="h-4.5 w-4.5 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case "newsUpdates":
        return (
          <svg className="h-4.5 w-4.5 text-[#FF9500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case "liveEvents":
        return (
          <svg className="h-4.5 w-4.5 text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        );
      case "championshipChanges":
        return (
          <svg className="h-4.5 w-4.5 text-[#FFD60A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7.468 7.468A9 9 0 1119.468 12c0 2.22-.801 4.254-2.127 5.827" />
          </svg>
        );
      default:
        return (
          <svg className="h-4.5 w-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getCategoryLabel = (cat: string): string => {
    switch (cat) {
      case "weatherAlerts": return "Weather";
      case "newsUpdates": return "News";
      case "liveEvents": return "Live Events";
      case "weekendReminders": return "Reminders";
      case "favDriverEvents": return "Fav Driver";
      case "favTeamEvents": return "Fav Team";
      case "championshipChanges": return "Championship";
      default: return "System";
    }
  };

  return (
    <PageContainer gap="md" className="pb-12">
      {/* Back to Home Link */}
      <div className="flex items-center">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Header block with actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
            Alert Center
          </span>
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2.5 text-sm font-mono font-bold text-white px-2 py-0.5 bg-primary rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={markAllAsRead}
              className="text-[10px] font-bold text-on-surface-variant hover:text-on-surface uppercase tracking-wider bg-surface-2 px-3 py-1.5 rounded border border-outline/25 cursor-pointer transition-colors"
            >
              Mark All Read
            </button>
            <button
              onClick={clearAll}
              className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider bg-primary/5 px-3 py-1.5 rounded border border-primary/20 cursor-pointer transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {/* Sidebar Filters */}
        <div className="md:col-span-1 flex flex-col gap-3.5">
          {/* Search */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-surface-2/65 border border-outline/30 rounded-xl text-[13px] text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary/50 transition-colors"
            />
            <span className="absolute inset-y-0 left-3 flex items-center justify-center text-on-surface-variant">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          {/* Toggle read status filter */}
          <label className="flex items-center gap-2 px-1 text-[12px] text-on-surface-variant font-medium select-none cursor-pointer">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-outline/40 text-primary focus:ring-primary/20"
            />
            Unread Alerts Only
          </label>

          {/* Categories select list */}
          <PageSection title="Filter Category" className="hidden md:flex">
            <div className="flex flex-col gap-1 text-[13px]">
              {(
                [
                  { label: "All Events", val: "all" },
                  { label: "Race Reminders", val: "weekendReminders" },
                  { label: "Live Flags & Timing", val: "liveEvents" },
                  { label: "Fav Driver Updates", val: "favDriverEvents" },
                  { label: "Fav Team Radio", val: "favTeamEvents" },
                  { label: "Championship Race", val: "championshipChanges" },
                  { label: "F1 News Feed", val: "newsUpdates" },
                  { label: "Track Weather", val: "weatherAlerts" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.val}
                  onClick={() => setActiveCategory(cat.val)}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer ${
                    activeCategory === cat.val
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-2/20"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </PageSection>

          {/* Category Pill select for mobile viewports */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {(
              [
                { label: "All", val: "all" },
                { label: "Reminders", val: "weekendReminders" },
                { label: "Live Flags", val: "liveEvents" },
                { label: "Drivers", val: "favDriverEvents" },
                { label: "Teams", val: "favTeamEvents" },
                { label: "Championship", val: "championshipChanges" },
                { label: "News", val: "newsUpdates" },
                { label: "Weather", val: "weatherAlerts" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.val}
                onClick={() => setActiveCategory(cat.val)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  activeCategory === cat.val
                    ? "bg-primary text-white"
                    : "bg-surface-2 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Content Feed */}
        <div className="md:col-span-3 flex flex-col gap-3">
          {filtered.length === 0 ? (
            <GlassCard variant="structural" className="p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
              <svg className="h-10 w-10 text-on-surface-variant/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 className="text-[14px] font-extrabold text-on-surface uppercase tracking-wider mt-4">
                No Notifications Found
              </h3>
              <p className="text-[12px] text-on-surface-variant mt-2 max-w-[280px]">
                {history.length === 0
                  ? "Alerts will appear here in real-time during live race weekends and schedules."
                  : "Try clearing your filters or type a different search query."}
              </p>
            </GlassCard>
          ) : (
            filtered.map((item) => (
              <GlassCard
                key={item.id}
                variant={item.read ? "structural" : "floating"}
                className={`p-4 border transition-all duration-200 hover:border-primary/25 relative ${
                  item.read ? "opacity-75 border-outline/10" : "border-outline/25"
                }`}
              >
                {!item.read && (
                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                )}

                <div className="flex gap-3.5 items-start">
                  <div className="h-8 w-8 rounded-full bg-surface-2 flex items-center justify-center shrink-0 border border-outline/10">
                    {getCategoryIcon(item.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-mono">
                        {getCategoryLabel(item.category)}
                      </span>
                      <span className="text-[9px] text-on-surface-variant/40">•</span>
                      <span className="text-[10px] text-on-surface-variant font-medium">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>

                    <Link
                      href={item.url}
                      onClick={() => markAsRead(item.id)}
                      className="block group mt-1"
                    >
                      <h4 className="text-[14px] font-bold text-on-surface leading-tight group-hover:text-primary transition-colors uppercase">
                        {item.title}
                      </h4>
                      <p className="text-[13px] text-on-surface-variant leading-relaxed mt-1">
                        {item.body}
                      </p>
                    </Link>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="h-7 w-7 flex items-center justify-center text-on-surface-variant hover:text-primary rounded-full hover-glass transition-colors cursor-pointer shrink-0"
                    aria-label="Delete alert"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
      
      {/* Mobile Safe Bar Spacer */}
      <div className="h-16 md:hidden" />
    </PageContainer>
  );
}
