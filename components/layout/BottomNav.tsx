"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState, useEffect } from "react";
import { NAV_ITEMS } from "@/lib/nav-items";
import { LiquidGlassSurface } from "@/components/ui/LiquidGlassSurface";

export function BottomNav() {
  const pathname = usePathname();
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const navGooId = `liquid-nav-goo-${safeId}`;

  // Find index of current route
  const activeIndex = NAV_ITEMS.findIndex((item) => {
    return pathname === item.href || (item.href === "/standings" && pathname === "/constructors");
  });
  const resolvedActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  const navRef = useRef<HTMLDivElement>(null);
  const animationId = useRef<number | null>(null);
  
  // Animation refs to track spring physics state
  const currentVal = useRef(resolvedActiveIndex);
  const velocity = useRef(0);
  const prevIndex = useRef(resolvedActiveIndex);
  const lastTime = useRef(0);

  const [previousIndex, setPreviousIndex] = useState(resolvedActiveIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isPressingActive, setIsPressingActive] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) || 
                  (typeof navigator.platform === "string" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafariBrowser = /^((?!chrome|chromium|android).)*safari/i.test(ua);
    const isFirefox = /Firefox/i.test(ua);
    requestAnimationFrame(() => {
      setIsSafari(isIOS || isSafariBrowser || isFirefox);
    });
  }, []);

  // Update initial tab weights on mount or change
  useEffect(() => {
    if (navRef.current) {
      const items = navRef.current.querySelectorAll(".racectrl-liquid-nav__item");
      items.forEach((item, idx) => {
        (item as HTMLElement).style.setProperty(
          "--tab-active-weight",
          idx === resolvedActiveIndex ? "1" : "0"
        );
      });
    }
  }, [resolvedActiveIndex]);

  useEffect(() => {
    // Detect prefers-reduced-motion media query
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = motionQuery.matches;

    if (resolvedActiveIndex !== currentVal.current) {
      if (prefersReducedMotion) {
        // Instant/short fade transition for accessibility
        currentVal.current = resolvedActiveIndex;
        prevIndex.current = resolvedActiveIndex;
        if (navRef.current) {
          navRef.current.style.setProperty("--nav-complete", resolvedActiveIndex.toString());
          navRef.current.style.setProperty("--nav-scale-x", "1");
          navRef.current.style.setProperty("--nav-scale-y", "1");
          navRef.current.style.setProperty("--nav-source-opacity", "0");
          
          const items = navRef.current.querySelectorAll(".racectrl-liquid-nav__item");
          items.forEach((item, idx) => {
            (item as HTMLElement).style.setProperty(
              "--tab-active-weight",
              idx === resolvedActiveIndex ? "1" : "0"
            );
          });
        }
        return;
      }

      // Cancel any running animation tick
      if (animationId.current !== null) {
        cancelAnimationFrame(animationId.current);
      }

      // Start transition physics asynchronously to satisfy React set-state-in-effect lint
      const targetIndex = resolvedActiveIndex;
      const prevIdx = currentVal.current;

      animationId.current = requestAnimationFrame(() => {
        setIsAnimating(true);
        setPreviousIndex(prevIdx);
        lastTime.current = performance.now();

        const tick = (nowTime: number) => {
          // Clamp delta time to avoid huge physics calculations on frame lag
          const dt = Math.min((nowTime - lastTime.current) / 1000, 0.1);
          lastTime.current = nowTime;

          // Spring physics parameters
          const stiffness = 120;
          const damping = 16;

          const springForce = (targetIndex - currentVal.current) * stiffness;
          const dampingForce = -damping * velocity.current;
          const acceleration = springForce + dampingForce;

          velocity.current += acceleration * dt;
          currentVal.current += velocity.current * dt;

          if (navRef.current) {
            navRef.current.style.setProperty("--nav-complete", currentVal.current.toString());
            
            // Calculate horizontal stretch based on transition velocity
            const stretch = Math.min(Math.abs(velocity.current) * 0.08, 0.35);
            navRef.current.style.setProperty("--nav-scale-x", (1 + stretch).toString());
            navRef.current.style.setProperty("--nav-scale-y", (1 - stretch * 0.40).toString());
            
            // Compute trailing source blob opacity based on travel distance
            const dist = Math.abs(currentVal.current - prevIdx);
            const opacity = Math.max(0, 1 - dist * 1.2);
            navRef.current.style.setProperty("--nav-source-opacity", opacity.toString());

            // Dynamically synchronize active weight of each tab item
            const items = navRef.current.querySelectorAll(".racectrl-liquid-nav__item");
            items.forEach((item, idx) => {
              const tabDist = Math.abs(currentVal.current - idx);
              const weight = Math.max(0, 1 - tabDist);
              (item as HTMLElement).style.setProperty(
                "--tab-active-weight",
                weight.toFixed(3)
              );
            });
          }

          // Snap and settle threshold check
          if (Math.abs(targetIndex - currentVal.current) < 0.001 && Math.abs(velocity.current) < 0.01) {
            currentVal.current = targetIndex;
            velocity.current = 0;
            
            if (navRef.current) {
              navRef.current.style.setProperty("--nav-complete", targetIndex.toString());
              navRef.current.style.setProperty("--nav-scale-x", "1");
              navRef.current.style.setProperty("--nav-scale-y", "1");
              navRef.current.style.setProperty("--nav-source-opacity", "0");

              const items = navRef.current.querySelectorAll(".racectrl-liquid-nav__item");
              items.forEach((item, idx) => {
                (item as HTMLElement).style.setProperty(
                  "--tab-active-weight",
                  idx === targetIndex ? "1" : "0"
                );
              });
            }
            setIsAnimating(false);
          } else {
            animationId.current = requestAnimationFrame(tick);
          }
        };

        animationId.current = requestAnimationFrame(tick);
      });
    }

    return () => {
      if (animationId.current !== null) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [resolvedActiveIndex]);

  return (
    <nav
      ref={navRef}
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 md:hidden"
      aria-label="Primary navigation"
      style={{
        "--nav-complete": resolvedActiveIndex,
        "--nav-scale-x": 1,
        "--nav-scale-y": 1,
        "--nav-source-opacity": 0,
        "--nav-goo-filter": `url(#${navGooId})`,
      } as React.CSSProperties}
    >
      <LiquidGlassSurface
        className="flex w-full max-w-sm items-center justify-around rounded-[24px] px-2 py-2 relative"
        style={{ height: "64px" }}
        variant="structural"
        enableLiquidRefraction={true}
      >
        <div className={`racectrl-liquid-nav ${isAnimating ? "is-animating" : ""} ${isSafari ? "no-goo" : ""} ${isPressingActive ? "is-pressing-active" : ""}`}>
          
          {/* Shared liquid active indicator layer */}
          <div className="racectrl-liquid-nav__indicator-wrapper">
            {/* 1. Source blob (trailing lens shadow) */}
            {isAnimating && !isSafari && (
              <div
                className="racectrl-liquid-nav__lens-source"
                style={{
                  transform: `translate3d(calc(${previousIndex} * 100%), 0, 0)`,
                }}
              >
                <div className="racectrl-liquid-nav__lens-source-inner" />
              </div>
            )}
            
            {/* 2. Primary sliding lens */}
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

      {/* SVG gooey filter container */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <filter id={navGooId} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </nav>
  );
}