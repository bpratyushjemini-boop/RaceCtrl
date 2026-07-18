"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { SettingsIcon } from "@/components/ui/Icon";
import { LiquidGlassSurface } from "@/components/ui/LiquidGlassSurface";
import { CommandSearch } from "@/components/search/CommandSearch";
import { useNotificationCenter } from "@/lib/hooks/useNotificationCenter";

export function TopNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { unreadCount, mounted: notificationsMounted } = useNotificationCenter();

  // Global Ctrl/Cmd + K trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <LiquidGlassSurface
      variant="structural"
      className="safe-top sticky top-0 z-40 border-b border-outline"
      style={{ borderRadius: 0 }}
    >
      <header className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-4">

        {/* Left: Brand mark — label-caps style per design.md typography.label-caps */}
        <Link href="/" className="flex items-center gap-2" aria-label="RaceCtrl home">
          <svg
            className="h-4 w-4 text-primary shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 4L4 20" />
            <path d="M8.5 4L12.5 4L14.5 8L12.5 12L7.5 12" />
            <path d="M9.5 12L13.5 20" />
            <path d="M21 4L18.5 4L16.5 12L19 20L21.5 20" />
          </svg>
          <span
            className="text-[11px] font-bold text-on-surface"
            style={{ letterSpacing: "0.06em" }}
          >
            RACECTRL
          </span>
        </Link>

        {/* Center: Desktop navigation links (hidden on mobile — BottomNav handles mobile) */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/standings" && pathname === "/constructors");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-surface-2 text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search & Settings icon */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="topnav-icon-btn"
            aria-label="Search Command Center"
          >
            <div className="topnav-icon-btn__inner">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </button>

          {/* Notification Bell */}
          <Link
            href="/notifications"
            className={`topnav-icon-btn relative ${pathname === "/notifications" ? "is-active" : ""}`}
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <div className="topnav-icon-btn__inner">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationsMounted && unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
          </Link>

          <Link
            href="/settings"
            className={`topnav-icon-btn ${pathname === "/settings" ? "is-active" : ""}`}
            aria-label="Settings"
          >
            <div className="topnav-icon-btn__inner">
              <SettingsIcon className="h-4.5 w-4.5" />
            </div>
          </Link>
        </div>
      </header>
      <CommandSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </LiquidGlassSurface>
  );
}