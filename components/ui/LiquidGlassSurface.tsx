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
    let active = true;
    requestAnimationFrame(() => {
      if (active) setMounted(true);
    });
    
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const transparencyQuery = window.matchMedia("(prefers-reduced-transparency: reduce)");
    
    const checkFallback = () => {
      // 1. Reduced motion or transparency check
      if (motionQuery.matches || transparencyQuery.matches) return true;

      // 2. Client environment check
      if (typeof window === "undefined" || typeof navigator === "undefined") return true;
      
      const ua = navigator.userAgent;
      
      // iOS / WebKit check:
      const isIOS = /iPhone|iPad|iPod/.test(ua) || 
                    (typeof navigator.platform === "string" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isSafari = /^((?!chrome|chromium|android).)*safari/i.test(ua);
      const isFirefox = /Firefox/i.test(ua);
      
      // If it is iOS, Safari, or Firefox, we fall back to CSS-only glass to avoid SVG/compositing repaint bugs
      if (isIOS || isSafari || isFirefox) return true;

      // Check if it's Chrome/Blink on Desktop or Android
      const hasChromium = /\b(Chrome|Chromium|Edg)\//.test(ua);
      const isCriOS = /\b(CriOS|FxiOS|OPiOS)\b/.test(ua);
      
      return !hasChromium || isCriOS;
    };

    requestAnimationFrame(() => {
      if (active) setUseFallback(checkFallback());
    });

    const handleMotionChange = () => {
      requestAnimationFrame(() => {
        if (active) setUseFallback(checkFallback());
      });
    };
    const handleTransparencyChange = () => {
      requestAnimationFrame(() => {
        if (active) setUseFallback(checkFallback());
      });
    };

    motionQuery.addEventListener("change", handleMotionChange);
    transparencyQuery.addEventListener("change", handleTransparencyChange);

    return () => {
      active = false;
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

  // Local containment to physically isolate visual/compositions layers
  const containmentStyle: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    isolation: "isolate",
    contain: "paint",
    ...style,
  };

  // If in SSR or prefers-reduced-motion/transparency or Safari/Firefox/iOS, degrade to static CSS glass class.
  if (!mounted || useFallback) {
    return (
      <div className={`${glassClass} ${className}`} style={containmentStyle}>
        {children}
      </div>
    );
  }

  // Real liquid-glass wrapper using @samasante/liquid-glass.
  return (
    <Glass
      className={`${glassClass} ${className}`}
      style={containmentStyle}
    >
      {children}
    </Glass>
  );
}

