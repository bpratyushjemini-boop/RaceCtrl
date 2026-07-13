"use client";

import React, { useEffect, useState } from "react";
import { Glass } from "@samasante/liquid-glass";

interface LiquidGlassSurfaceProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: "structural" | "content" | "floating" | "momentary";
}

export function LiquidGlassSurface({
  children,
  className = "",
  style,
  variant = "structural",
}: LiquidGlassSurfaceProps) {
  const [mounted, setMounted] = useState(false);
  const [useFallback, setUseFallback] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const transparencyQuery = window.matchMedia("(prefers-reduced-transparency: reduce)");
    
    const checkFallback = () => {
      return motionQuery.matches || transparencyQuery.matches;
    };

    setUseFallback(checkFallback());

    const handleMotionChange = () => setUseFallback(checkFallback());
    const handleTransparencyChange = () => setUseFallback(checkFallback());

    motionQuery.addEventListener("change", handleMotionChange);
    transparencyQuery.addEventListener("change", handleTransparencyChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      transparencyQuery.removeEventListener("change", handleTransparencyChange);
    };
  }, []);

  const glassClassMap = {
    structural: "glass-structural",
    content: "glass-content",
    floating: "glass-floating",
    momentary: "glass-momentary",
  } as const;

  const glassClass = glassClassMap[variant];

  // If in SSR or prefers-reduced-motion/transparency, degrade to static CSS glass class.
  if (!mounted || useFallback) {
    return (
      <div className={`${glassClass} ${className}`} style={style}>
        {children}
      </div>
    );
  }

  // Real liquid-glass wrapper using @samasante/liquid-glass.
  // We feed it our styling and let the displacement map run on the live DOM.
  return (
    <Glass
      className={`${glassClass} ${className}`}
      style={style}
    >
      {children}
    </Glass>
  );
}
