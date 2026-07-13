import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <GlassCard
        className="w-full max-w-md p-6 text-center flex flex-col items-center gap-5"
      >
        {/* Flag Icon Indicator */}
        <div className="h-12 w-12 rounded-full bg-surface-2 border border-outline/35 flex items-center justify-center text-on-surface-variant" aria-hidden="true">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
          </svg>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            Off Track
          </span>
          <h2 className="text-[20px] font-bold tracking-tight text-on-surface">
            Wrong turn.
          </h2>
          <p className="text-[13px] text-on-surface-variant max-w-xs mt-0.5 leading-relaxed">
            The page you are looking for has been retired, disqualified, or never existed in the schedule grid.
          </p>
        </div>

        {/* Back Home Button */}
        <Link
          href="/"
          className="w-full flex h-11 items-center justify-center bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] text-white text-[13px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer select-none"
        >
          Back Home
        </Link>
      </GlassCard>
    </div>
  );
}
