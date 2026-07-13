"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  duration?: number; // ms
  yOffset?: number; // px
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 450,
  yOffset = 12,
}: ScrollRevealProps) {
  const [isRevealed, setIsRevealed] = useState(true); // Default to visible for fail-safe
  const [isPrepared, setIsPrepared] = useState(false); // Only prepare animation below the viewport
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
        // Only trigger slide-up animation if the element starts below the visible viewport
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
            rootMargin: "0px 0px -10px 0px", // Trigger slightly before it comes into view
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
        transform: isRevealed ? "translateY(0)" : `translateY(${yOffset}px)`,
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)", // ease-out
      }
    : {};

  return (
    <div ref={ref} className={className} style={transitionStyle}>
      {children}
    </div>
  );
}

