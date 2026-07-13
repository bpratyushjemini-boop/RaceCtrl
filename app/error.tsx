"use client";

import { useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console for development/debugging as requested
    console.error("RaceCtrl telemetry error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <GlassCard
        className="w-full max-w-md p-6 text-center flex flex-col items-center gap-5 border border-primary/20"
      >
        {/* Warning Indicator */}
        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary" aria-hidden="true">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
            Data Link Interrupted
          </span>
          <h2 className="text-[20px] font-bold tracking-tight text-on-surface">
            Connection timed out
          </h2>
          <p className="text-[13px] text-on-surface-variant max-w-xs mt-0.5 leading-relaxed">
            RaceCtrl could not sync with the data provider. The timing connection is temporarily stale or offline.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full pt-1">
          <button
            type="button"
            onClick={reset}
            className="flex-1 h-11 bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] text-white text-[13px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer select-none"
          >
            Retry
          </button>
          <Link
            href="/"
            className="flex-1 flex h-11 items-center justify-center border border-outline/45 hover:border-outline/65 text-on-surface text-[13px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer select-none"
          >
            Home
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
