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
  duration = 500,
  yOffset = 16,
}: ScrollRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    motionQuery.addEventListener("change", handleMotionChange);

    if (motionQuery.matches) {
      setIsRevealed(true);
      return () => motionQuery.removeEventListener("change", handleMotionChange);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px", // Trigger slightly before viewport entry
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  if (!mounted || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const transitionStyle: React.CSSProperties = {
    opacity: isRevealed ? 1 : 0,
    transform: isRevealed ? "translateY(0)" : `translateY(${yOffset}px)`,
    transitionProperty: "opacity, transform",
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
    transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)", // ease-out (easeOutQuart)
  };

  return (
    <div ref={ref} className={className} style={transitionStyle}>
      {children}
    </div>
  );
}
