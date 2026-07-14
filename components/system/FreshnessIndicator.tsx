"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function FreshnessIndicator() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeText, setTimeText] = useState("UPDATED JUST NOW");

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diffMin = Math.floor((Date.now() - start) / 60000);
      if (diffMin <= 0) {
        setTimeText("UPDATED JUST NOW");
      } else {
        setTimeText(`UPDATED ${diffMin}M AGO`);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    // Provide visual animation feedback delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 750);
  };

  return (
    <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant/60 tracking-widest uppercase select-none font-mono">
      <span>{isRefreshing ? "REFRESHING..." : timeText}</span>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`p-1.5 rounded-full hover:bg-surface-2 hover:text-on-surface border border-outline/10 text-on-surface-variant transition-colors cursor-pointer select-none ${
          isRefreshing ? "animate-spin text-primary" : ""
        }`}
        aria-label="Manual refresh"
      >
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89"
          />
        </svg>
      </button>
    </div>
  );
}
