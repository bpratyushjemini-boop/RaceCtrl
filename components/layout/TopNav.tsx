"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { SettingsIcon } from "@/components/ui/Icon";

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-outline glass-structural">
      {/* Height: 52px per design.md nav-bar-top spec */}
      <div className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-4">

        {/* Left: Brand mark — label-caps style per design.md typography.label-caps */}
        <Link href="/" className="flex items-center gap-2" aria-label="RaceCtrl home">
          <span className="h-2 w-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
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

        {/* Right: Settings icon */}
        <div className="flex items-center">
          <Link
            href="/settings"
            className={`p-2 rounded-full transition-colors ${
              pathname === "/settings"
                ? "text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            aria-label="Settings"
          >
            <SettingsIcon className="h-5 w-5" />
          </Link>

        </div>
      </div>
    </header>
  );
}