"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { SettingsIcon } from "@/components/ui/Icon";
import { LiquidGlassSurface } from "@/components/ui/LiquidGlassSurface";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen sticky top-0 shrink-0 z-40 select-none">
      <LiquidGlassSurface
        variant="structural"
        className="flex flex-col justify-between w-full h-full p-4 border-r border-outline"
        style={{ borderRadius: 0 }}
      >
        <div className="flex flex-col gap-6">
          {/* Top Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-2.5 py-1.5" aria-label="RaceCtrl home">
            <svg
              className="h-5 w-5 text-primary shrink-0"
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
              className="text-[12px] font-black text-on-surface tracking-widest uppercase font-mono"
              style={{ letterSpacing: "0.08em" }}
            >
              RACECTRL
            </span>
          </Link>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1.5" aria-label="Desktop navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href === "/standings" && pathname === "/constructors");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-4 h-11 rounded-2xl text-[13px] font-bold tracking-tight transition-all active:scale-[0.98] ${
                    active
                      ? "bg-primary text-white font-black shadow-md shadow-primary/10"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-2/40"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Profile & Settings */}
        <div className="flex flex-col gap-2 pt-4 border-t border-outline/10">
          <Link
            href="/profile"
            className={`flex items-center gap-3.5 px-4 h-11 rounded-2xl text-[13px] font-bold tracking-tight transition-all active:scale-[0.98] ${
              pathname === "/profile"
                ? "bg-surface-2 text-on-surface border border-outline/25"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-2/40"
            }`}
          >
            <span className="text-[18px] leading-none w-5 text-center shrink-0">👤</span>
            <span>Profile</span>
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-3.5 px-4 h-11 rounded-2xl text-[13px] font-bold tracking-tight transition-all active:scale-[0.98] ${
              pathname === "/settings"
                ? "bg-surface-2 text-on-surface border border-outline/25"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-2/40"
            }`}
          >
            <SettingsIcon className="h-5 w-5 shrink-0" />
            <span>Settings</span>
          </Link>
          
          <div className="px-4 py-1.5 text-[9px] font-mono text-on-surface-variant/40 select-none">
            v4.0.0-PLATFORM · OFFLINE
          </div>
        </div>
      </LiquidGlassSurface>
    </aside>
  );
}
