"use client";

import { useState, useEffect } from "react";

export function formatRelativeRefreshTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) {
    return "Updated just now";
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `Updated ${diffMin} min ago`;
  }
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 2) {
    return "Updated 1 hr ago";
  }
  return `Updated ${diffHr} hrs ago`;
}

export function FreshnessIndicator() {
  const [timeText, setTimeText] = useState("Updated just now");

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
    <div className="text-[10px] font-bold text-on-surface-variant/60 select-none font-mono">
      {timeText}
    </div>
  );
}
