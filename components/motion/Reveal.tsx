"use client";

import React, { useEffect, useRef, useState } from "react";

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  duration?: number; // ms
  yOffset?: number; // px
  scale?: number; // initial scale e.g. 0.985
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 400,
  yOffset = 14,
  scale = 0.985,
}: RevealProps) {
  const [isRevealed, setIsRevealed] = useState(true); // Default to visible for SSR/fallback
  const [isPrepared, setIsPrepared] = useState(false); // Only prepare once detected below viewport
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    requestAnimationFrame(() => {
      if (active) setPrefersReducedMotion(motionQuery.matches);
    });

    const handleMotionChange = (e: MediaQueryListEvent) => {
      requestAnimationFrame(() => {
        if (active) setPrefersReducedMotion(e.matches);
      });
    };
    motionQuery.addEventListener("change", handleMotionChange);

    if (motionQuery.matches || !("IntersectionObserver" in window)) {
      return () => {
        active = false;
        motionQuery.removeEventListener("change", handleMotionChange);
      };
    }

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isBelowViewport = rect.top > window.innerHeight;

      if (isBelowViewport) {
        requestAnimationFrame(() => {
          if (active) {
            setIsRevealed(false);
            setIsPrepared(true);
          }
        });

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              requestAnimationFrame(() => {
                if (active) setIsRevealed(true);
              });
              observer.disconnect();
            }
          },
          {
            threshold: 0.01,
            rootMargin: "0px 0px -20px 0px", // Trigger slightly before coming into view
          }
        );

        observer.observe(ref.current);

        return () => {
          active = false;
          observer.disconnect();
          motionQuery.removeEventListener("change", handleMotionChange);
        };
      }
    }

    return () => {
      active = false;
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  const transitionStyle: React.CSSProperties = isPrepared && !prefersReducedMotion
    ? {
        opacity: isRevealed ? 1 : 0.01,
        transform: isRevealed
          ? "translate3d(0, 0, 0) scale(1)"
          : `translate3d(0, ${yOffset}px, 0) scale(${scale})`,
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
      }
    : {};

  return (
    <div ref={ref} className={className} style={transitionStyle}>
      {children}
    </div>
  );
}
