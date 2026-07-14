import { useState, useEffect } from "react";
import Link from "next/link";
import { useFavorites } from "@/lib/hooks/useFavorites";

interface DriverActionsProps {
  driverId: string;
  driverName: string;
  driverCode: string;
}

export function DriverActions({ driverId, driverName, driverCode }: DriverActionsProps) {
  const { isFavorite, toggleFavorite, mounted } = useFavorites([]);
  const [copied, setCopied] = useState(false);

  const isFav = isFavorite(driverId);

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
        console.warn("Share failed or dismissed", err);
      }
    } else {
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
        <div className="h-9 w-20 bg-surface-2/40 border border-outline/20 rounded-full animate-pulse" />
        <div className="h-9 w-20 bg-surface-2/40 border border-outline/20 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      {/* Follow / Following Button */}
      <button
        type="button"
        onClick={() => toggleFavorite(driverId)}
        className={`h-9 px-4 flex items-center gap-1.5 rounded-full border text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer active:scale-[0.97] duration-150 ${
          isFav
            ? "bg-[#30D158]/10 border-[#30D158]/40 text-[#30D158] hover:bg-[#30D158]/15"
            : "border-outline/40 text-on-surface-variant hover:text-on-surface hover-glass"
        }`}
        aria-label={isFav ? `Unfollow ${driverName}` : `Follow ${driverName}`}
      >
        <svg
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isFav ? "scale-110" : "scale-100"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          {isFav ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          )}
        </svg>
        <span>{isFav ? "Following" : "Follow"}</span>
      </button>

      {/* Compare Button */}
      <Link
        href={`/compare?a=${driverId}`}
        className="h-9 px-4 flex items-center gap-1.5 rounded-full border border-outline/40 text-on-surface-variant hover:text-on-surface hover-glass text-[11px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer active:scale-[0.97]"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span>Compare</span>
      </Link>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className={`h-9 px-4 flex items-center gap-1.5 rounded-full border text-[12px] font-bold tracking-wider uppercase transition-all cursor-pointer active:scale-[0.97] duration-150 ${
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
