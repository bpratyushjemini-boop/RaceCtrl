"use client";

import { useState, useEffect } from "react";

interface DriverActionsProps {
  driverId: string;
  driverName: string;
  driverCode: string;
}

export function DriverActions({ driverId, driverName, driverCode }: DriverActionsProps) {
  const [isFav, setIsFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync with localStorage on mount
  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem("racectrl_favorites");
        if (stored) {
          const list = JSON.parse(stored) as string[];
          setIsFav(list.includes(driverId));
        }
      } catch (e) {
        console.error("Failed to read favorites on profile", e);
      }
      setMounted(true);
    });
    return () => {
      active = false;
    };
  }, [driverId]);

  const toggleFavorite = () => {
    try {
      const stored = localStorage.getItem("racectrl_favorites");
      let list: string[] = [];
      if (stored) {
        list = JSON.parse(stored) as string[];
      }
      
      const isCurrentlyFav = list.includes(driverId);
      const nextList = isCurrentlyFav
        ? list.filter((id) => id !== driverId)
        : [...list, driverId];

      setIsFav(!isCurrentlyFav);
      localStorage.setItem("racectrl_favorites", JSON.stringify(nextList));
    } catch (e) {
      console.error("Failed to toggle favorite", e);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${driverName} (${driverCode}) · RaceCtrl`,
      text: `Check out ${driverName}'s stats on RaceCtrl, your Formula 1 companion.`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Dismissed or unsupported
        console.warn("Share failed or dismissed", err);
      }
    } else {
      // Fallback: clipboard copy
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy URL to clipboard", err);
      }
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-2.5 h-9 shrink-0">
        <div className="h-9 w-9 bg-surface-2/40 border border-outline/20 rounded-full animate-pulse" />
        <div className="h-9 w-20 bg-surface-2/40 border border-outline/20 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      {/* Favorite Button */}
      <button
        type="button"
        onClick={toggleFavorite}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all cursor-pointer ${
          isFav
            ? "bg-primary/10 border-primary/40 text-primary hover:bg-primary/15"
            : "border-outline/40 text-on-surface-variant hover:text-on-surface hover-glass"
        }`}
        aria-label={isFav ? `Remove ${driverName} from favorites` : `Add ${driverName} to favorites`}
      >
        <svg
          className={`h-4.5 w-4.5 motion-reduce:transition-none transition-transform duration-200 ${isFav ? "fill-current scale-110" : "scale-100"}`}
          fill={isFav ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.246.58 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 9.42c-.78-.564-.38-1.81.58-1.81h4.908a1 1 0 00.95-.69l1.519-4.674z"
          />
        </svg>
      </button>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className={`h-9 px-4 flex items-center gap-1.5 rounded-full border text-[12px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
          copied
            ? "bg-[#30D158]/10 border-[#30D158]/40 text-[#30D158]"
            : "border-outline/40 text-on-surface-variant hover:text-on-surface hover-glass"
        }`}
        aria-label={`Share profile link for ${driverName}`}
      >
        {copied ? (
          <span className="telemetry-numeric">COPIED</span>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l5.06-2.53m0 7.576l-5.06-2.53m2.77 1.378a3 3 0 11-6 0 3 3 0 016 0zm6-8a3 3 0 11-6 0 3 3 0 016 0zm0 8a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
}
