"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/80 backdrop-blur-md md:hidden">
      <ul className="mx-auto flex max-w-6xl items-stretch justify-between px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center gap-1 py-2.5"
              >
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <Icon
                    className={`h-5 w-5 ${
                      active ? "text-text" : "text-text-dim"
                    }`}
                  />
                  {active && (
                    <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-accent" />
                  )}
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    active ? "text-text" : "text-text-dim"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}   