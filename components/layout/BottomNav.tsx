"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-items";
import { LiquidGlassSurface } from "@/components/ui/LiquidGlassSurface";

export function BottomNav() {
  const pathname = usePathname();

  return (
    /**
     * Floating pill island tab bar per Figma reference and design.md:
     *   - tab-bar: height 64px, rounded.lg (24px), padding spacing.sm (8px)
     *   - Positioned fixed at the bottom with horizontal + bottom margins
     *     so it floats above the page content rather than anchoring to the edge
     *   - Upgraded to real liquid glass refraction using LiquidGlassSurface
     *   - No border-t edge line — the pill shape + glass replace the flat bar
     *   - Hidden on md+ (desktop uses TopNav for navigation)
     */
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 md:hidden"
      aria-label="Primary navigation"
    >
      <LiquidGlassSurface
        className="flex w-full max-w-sm items-center justify-around rounded-[24px] px-2 py-2"
        style={{ height: "64px" }}
        variant="structural"
      >
        <ul className="flex w-full items-center justify-around list-none p-0 m-0">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/standings" && pathname === "/constructors");
            const Icon = item.icon;

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-[3px] py-1"
                  aria-current={active ? "page" : undefined}
                >
                  {/* Icon — active: full on-surface white; inactive: on-surface-variant grey */}
                  <Icon
                    className={`h-[22px] w-[22px] transition-colors ${
                      active ? "text-on-surface" : "text-on-surface-variant"
                    }`}
                  />
                  {/* Label — label-caps style: 11px, 700, but no uppercase per Figma (uses sentence case labels) */}
                  <span
                    className={`text-[11px] font-semibold leading-none transition-colors ${
                      active ? "text-on-surface" : "text-on-surface-variant"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </LiquidGlassSurface>
    </nav>
  );
}