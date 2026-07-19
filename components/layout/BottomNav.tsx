"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, forwardRef } from "react";
import { BOTTOM_NAV_ITEMS } from "@/lib/nav-items";
import { LiquidGlassSurface } from "@/components/ui/LiquidGlassSurface";

// Custom hook to animate numeric values with spring physics
function useSpring(
  targetValue: number,
  bypass: boolean,
  options = { stiffness: 260, damping: 28, mass: 0.85 }
) {
  const [value, setValue] = useState(targetValue);
  const [velocity, setVelocity] = useState(0);
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
        setVelocity(0);
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
            setVelocity(0);
            valueRef.current = target;
            velocityRef.current = 0;
            animationFrameRef.current = null;
            return;
          }
          
          setValue(nextX);
          setVelocity(nextV);
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

  return { value, velocity };
}

interface NavItemComponentProps {
  item: typeof BOTTOM_NAV_ITEMS[0];
  isActive: boolean;
  prefersReducedMotion: boolean;
}

const NavItemComponent = forwardRef<HTMLLIElement, NavItemComponentProps>(
  ({ item, isActive, prefersReducedMotion }, ref) => {
    const [isPressed, setIsPressed] = useState(false);
    const [prevActive, setPrevActive] = useState(isActive);
    const [isActiveTriggered, setIsActiveTriggered] = useState(false);

    if (isActive !== prevActive) {
      setPrevActive(isActive);
      if (isActive) {
        setIsActiveTriggered(true);
      }
    }
    
    useEffect(() => {
      if (isActiveTriggered) {
        const timer = setTimeout(() => {
          setIsActiveTriggered(false);
        }, 200);
        return () => clearTimeout(timer);
      }
    }, [isActiveTriggered]);

    // Unified spring target scale: 
    // Inactive resting scale: 0.96. Active resting scale: 1.0. Active trigger burst scale: 1.04.
    // Apply 0.97 touch-press compression factor.
    const baseScale = isActiveTriggered ? 1.04 : (isActive ? 1.0 : 0.96);
    const targetScale = isPressed ? baseScale * 0.97 : baseScale;

    const springScale = useSpring(targetScale, prefersReducedMotion, {
      stiffness: 260,
      damping: 28,
      mass: 0.85,
    });

    const Icon = item.icon;

    return (
      <li ref={ref} className="flex-1 list-none">
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
            transform: `scale3d(${springScale.value}, ${springScale.value}, 1)`,
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
);

NavItemComponent.displayName = "NavItemComponent";

export function BottomNav() {
  const pathname = usePathname();

  // Find index of current route
  const activeIndex = BOTTOM_NAV_ITEMS.findIndex((item) => {
    if (item.href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(item.href);
  });
  const resolvedActiveIndex = activeIndex === -1 ? 4 : activeIndex;

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

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [coords, setCoords] = useState({ x: 0, width: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const activeTab = tabRefs.current[resolvedActiveIndex];
      const container = containerRef.current;
      if (activeTab && container) {
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const x = tabRect.left - containerRect.left;
        setCoords({ x, width: tabRect.width });
      }
    };

    const frame = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
    };
  }, [resolvedActiveIndex]);

  const springX = useSpring(coords.x, prefersReducedMotion, {
    stiffness: 260,
    damping: 28,
    mass: 0.85,
  });

  // Calculate micro-deformation scale based on velocity of transition
  const velocity = springX.velocity;
  const scaleX = prefersReducedMotion ? 1 : 1 + Math.min(Math.abs(velocity) * 0.00005, 0.035);
  const scaleY = prefersReducedMotion ? 1 : 1 - Math.min(Math.abs(velocity) * 0.000015, 0.01);

  return (
    <nav
      className="fixed left-4 right-4 z-40 mx-auto w-[calc(100%-32px)] max-w-md md:hidden"
      style={{
        bottom: "calc(16px + env(safe-area-inset-bottom))",
      }}
      aria-label="Primary navigation"
    >
      <LiquidGlassSurface
        className="flex w-full items-center justify-around rounded-[30px] px-3 py-2 relative racectrl-liquid-nav-container"
        style={{ height: "72px" }}
        variant="structural"
        enableLiquidRefraction={false}
      >
        <div ref={containerRef} className="racectrl-liquid-nav w-full h-full relative">
          <ul className="relative flex w-full h-full items-center list-none p-0 m-0">
            {/* Shared active indicator layer */}
            {coords.width > 0 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none z-0"
                style={{
                  width: `${coords.width}px`,
                  transform: `translate3d(${springX.value}px, 0, 0) scale(${scaleX}, ${scaleY})`,
                  height: "56px",
                  willChange: "transform",
                }}
              >
                <div className="mx-[5px] h-full rounded-[20px] racectrl-shared-indicator relative">
                  <div className="racectrl-shared-indicator__marker" />
                </div>
              </div>
            )}

            {BOTTOM_NAV_ITEMS.map((item, index) => {
              const active = index === resolvedActiveIndex;
              return (
                <NavItemComponent
                  key={item.href}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
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