"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { NAV_ITEMS } from "@/lib/nav-items";
import { LiquidGlassSurface } from "@/components/ui/LiquidGlassSurface";

// Custom hook to animate numeric values with spring physics
function useSpring(
  targetValue: number,
  bypass: boolean,
  options = { stiffness: 340, damping: 32, mass: 0.8 }
) {
  const [value, setValue] = useState(targetValue);
  const valueRef = useRef(value);
  const targetRef = useRef(targetValue);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (bypass) {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      valueRef.current = targetValue;
      velocityRef.current = 0;
      // Schedule asynchronously to avoid synchronous setState inside useEffect
      const frame = requestAnimationFrame(() => {
        setValue(targetValue);
      });
      return () => cancelAnimationFrame(frame);
    }

    targetRef.current = targetValue;
    
    if (animationFrameRef.current === null) {
      let lastTime = performance.now();
      
      const loop = (now: number) => {
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        
        if (dt > 0) {
          const stiffness = options.stiffness;
          const damping = options.damping;
          const mass = options.mass;
          
          const x = valueRef.current;
          const target = targetRef.current;
          const v = velocityRef.current;
          
          const force = -stiffness * (x - target) - damping * v;
          const acceleration = force / mass;
          const nextV = v + acceleration * dt;
          const nextX = x + nextV * dt;
          
          velocityRef.current = nextV;
          valueRef.current = nextX;
          
          const isAtTarget = Math.abs(nextX - target) < 0.001;
          const isStopped = Math.abs(nextV) < 0.001;
          
          if (isAtTarget && isStopped) {
            setValue(target);
            valueRef.current = target;
            velocityRef.current = 0;
            animationFrameRef.current = null;
            return;
          }
          
          setValue(nextX);
        }
        
        animationFrameRef.current = requestAnimationFrame(loop);
      };
      
      animationFrameRef.current = requestAnimationFrame(loop);
    }
    
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [targetValue, bypass, options.stiffness, options.damping, options.mass]);

  return value;
}

interface NavItemComponentProps {
  item: typeof NAV_ITEMS[0];
  isActive: boolean;
  prefersReducedMotion: boolean;
}

function NavItemComponent({
  item,
  isActive,
  prefersReducedMotion,
}: NavItemComponentProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scale = useSpring(isPressed ? 0.96 : 1, prefersReducedMotion, {
    stiffness: 340,
    damping: 32,
    mass: 0.8,
  });

  const Icon = item.icon;

  return (
    <li className="flex-1 list-none">
      <Link
        href={item.href}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={`racectrl-liquid-nav__item flex flex-col items-center justify-center gap-[3px] py-1 select-none relative z-10 ${
          isActive ? "is-active" : ""
        }`}
        style={{
          transform: `scale3d(${scale}, ${scale}, 1)`,
        }}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="racectrl-liquid-nav__icon h-[22px] w-[22px]" />
        <span className="racectrl-liquid-nav__label text-[11px] font-semibold leading-none">
          {item.label}
        </span>
      </Link>
    </li>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  // Find index of current route
  const activeIndex = NAV_ITEMS.findIndex((item) => {
    return (
      pathname === item.href ||
      (item.href === "/standings" && pathname === "/constructors")
    );
  });
  const resolvedActiveIndex = activeIndex === -1 ? 0 : activeIndex;

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Schedule asynchronously to avoid synchronous setState inside useEffect
    const frame = requestAnimationFrame(() => {
      setPrefersReducedMotion(mediaQuery.matches);
    });
    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => {
      cancelAnimationFrame(frame);
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  const springIndex = useSpring(resolvedActiveIndex, prefersReducedMotion, {
    stiffness: 340,
    damping: 32,
    mass: 0.8,
  });

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
        <div className="racectrl-liquid-nav">
          <ul className="relative flex w-full h-full items-center list-none p-0 m-0">
            {/* Shared active indicator layer */}
            <div
              className="absolute top-0 bottom-0 left-0 w-[20%] pointer-events-none z-0"
              style={{
                transform: `translate3d(${springIndex * 100}%, 0, 0)`,
                willChange: "transform",
              }}
            >
              <div className="racectrl-shared-indicator">
                <div className="racectrl-shared-indicator__marker" />
              </div>
            </div>

            {NAV_ITEMS.map((item, index) => {
              const active = index === resolvedActiveIndex;
              return (
                <NavItemComponent
                  key={item.href}
                  item={item}
                  isActive={active}
                  prefersReducedMotion={prefersReducedMotion}
                />
              );
            })}
          </ul>
        </div>
      </LiquidGlassSurface>
    </nav>
  );
}