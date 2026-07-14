"use client";

import { useState, useEffect } from "react";

export function formatRelativeRefreshTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) {
    return "REFRESHED JUST NOW";
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `REFRESHED ${diffMin} MIN AGO`;
  }
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 2) {
    return "REFRESHED 1 HR AGO";
  }
  return `REFRESHED ${diffHr} HRS AGO`;
}

export function FreshnessIndicator() {
  const [timeText, setTimeText] = useState("REFRESHED JUST NOW");

  useEffect(() => {
    const timeVal = Date.now();

    const frameId = requestAnimationFrame(() => {
      setTimeText(formatRelativeRefreshTime(timeVal));
    });

    const updateText = () => {
      setTimeText(formatRelativeRefreshTime(timeVal));
    };

    const interval = setInterval(updateText, 60000);

    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="text-[10px] font-bold text-on-surface-variant/60 tracking-widest uppercase select-none font-mono">
      {timeText}
    </div>
  );
}
