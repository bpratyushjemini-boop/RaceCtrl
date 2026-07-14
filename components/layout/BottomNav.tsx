"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { NAV_ITEMS } from "@/lib/nav-items";
import { LiquidGlassSurface } from "@/components/ui/LiquidGlassSurface";

export function BottomNav() {
  const pathname = usePathname();

  // Find index of current route
  const activeIndex = NAV_ITEMS.findIndex((item) => {
    return pathname === item.href || (item.href === "/standings" && pathname === "/constructors");
  });
  const resolvedActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  const [mounted, setMounted] = useState(false);
  const [isPressingActive, setIsPressingActive] = useState(false);
  const [glidingState, setGlidingState] = useState<"idle" | "left" | "right">("idle");
  const prevActiveIndex = useRef(resolvedActiveIndex);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (resolvedActiveIndex !== prevActiveIndex.current) {
      const dir = resolvedActiveIndex > prevActiveIndex.current ? "right" : "left";
      setGlidingState(dir);
      prevActiveIndex.current = resolvedActiveIndex;

      const timer = setTimeout(() => {
        setGlidingState("idle");
      }, 520); // matches the 520ms transition duration
      return () => clearTimeout(timer);
    }
  }, [resolvedActiveIndex, mounted]);

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 md:hidden"
      aria-label="Primary navigation"
    >
      <LiquidGlassSurface
        className="flex w-full max-w-sm items-center justify-around rounded-[24px] px-2 py-2 relative"
        style={{ height: "64px" }}
        variant="structural"
        enableLiquidRefraction={true}
      >
        <div
          className={`racectrl-liquid-nav ${mounted ? "is-mounted" : ""} ${isPressingActive ? "is-pressing-active" : ""} ${
            glidingState !== "idle" ? `is-gliding is-gliding-${glidingState}` : ""
          }`}
          style={{
            "--active-index": resolvedActiveIndex,
          } as React.CSSProperties}
        >
          {/* Shared active indicator layer */}
          <div className="racectrl-liquid-nav__indicator-wrapper">
            <div className="racectrl-liquid-nav__lens">
              <div className="racectrl-liquid-nav__lens-inner" />
            </div>
          </div>

          {/* Navigation Items */}
          <ul className="flex w-full items-center justify-around list-none p-0 m-0 z-10 relative">
            {NAV_ITEMS.map((item, index) => {
              const active = index === resolvedActiveIndex;
              const Icon = item.icon;

              return (
                <li key={item.href} className="flex-1">
                  <Link
                    href={item.href}
                    onTouchStart={() => {}} // Activates instantaneous :active support in WebKit
                    onClick={() => {
                      if (active) {
                        setIsPressingActive(true);
                        setTimeout(() => setIsPressingActive(false), 150);
                      }
                    }}
                    className={`racectrl-liquid-nav__item flex flex-col items-center justify-center gap-[3px] py-1 ${
                      active ? "is-active" : ""
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="racectrl-liquid-nav__icon h-[22px] w-[22px]" />
                    <span className="racectrl-liquid-nav__label text-[11px] font-semibold leading-none">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </LiquidGlassSurface>
    </nav>
  );
}