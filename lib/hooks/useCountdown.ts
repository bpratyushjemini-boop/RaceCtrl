"use client";

import { useEffect, useState } from "react";

export type CountdownValues = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function computeRemaining(targetMs: number): CountdownValues {
  if (isNaN(targetMs) || targetMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

/**
 * Shared countdown hook. Initialises asynchronously (via rAF) to avoid
 * React's set-state-in-effect lint rule and SSR hydration mismatches.
 *
 * Returns null until the first client-side tick so callers can render safe
 * placeholder values on the server without a hydration error.
 */
export function useCountdown(targetIso: string): CountdownValues | null {
  const targetMs = new Date(targetIso).getTime();
  const [values, setValues] = useState<CountdownValues | null>(null);

  useEffect(() => {
    let active = true;

    const frameId = requestAnimationFrame(() => {
      if (active) {
        setValues(computeRemaining(targetMs));
      }
    });

    const intervalId = setInterval(() => {
      if (active) {
        setValues(computeRemaining(targetMs));
      }
    }, 1000);

    return () => {
      active = false;
      cancelAnimationFrame(frameId);
      clearInterval(intervalId);
    };
  }, [targetMs]);

  return values;
}
