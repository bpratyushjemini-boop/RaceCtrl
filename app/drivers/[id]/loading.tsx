import { GlassCard } from "@/components/ui/GlassCard";

export default function DriverProfileLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 animate-pulse select-none motion-reduce:animate-none">
      {/* Action Header Skeleton */}
      <div className="flex items-center justify-between gap-4 h-9">
        <div className="h-4 w-32 bg-surface-2 rounded-md" />
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-surface-2 rounded-full" />
          <div className="h-9 w-20 bg-surface-2 rounded-full" />
        </div>
      </div>

      {/* Hero Card Skeleton */}
      <GlassCard variant="floating" className="p-6 md:p-8 flex flex-col gap-6 border border-outline/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1 flex flex-col gap-3">
            <div className="h-6 w-32 bg-surface-2 rounded-md" />
            <div className="h-9 w-3/4 bg-surface-2 rounded-md" />
            <div className="h-4.5 w-1/2 bg-surface-2 rounded-md" />
          </div>
          <div className="h-20 w-32 bg-surface-2 rounded-md" />
        </div>
        <div className="border-t border-outline/10 pt-4 mt-2 flex gap-6">
          <div className="h-4 w-24 bg-surface-2 rounded-md" />
          <div className="h-4 w-24 bg-surface-2 rounded-md" />
        </div>
      </GlassCard>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stats Grid Skeleton */}
        <div className="flex flex-col gap-3">
          <div className="h-4 w-32 bg-surface-2 rounded-md px-1" />
          <div className="grid grid-cols-2 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <GlassCard key={i} variant="structural" className="p-4 flex flex-col gap-2 border border-outline/10">
                <div className="h-3 w-16 bg-surface-2 rounded-md" />
                <div className="h-7 w-12 bg-surface-2 rounded-md" />
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Recent Form Skeleton */}
        <div className="flex flex-col gap-3">
          <div className="h-4 w-24 bg-surface-2 rounded-md px-1" />
          <GlassCard variant="structural" className="p-1.5 flex flex-col border border-outline/10 gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center h-[52px] gap-3 px-4 border-b border-outline/10 last:border-0">
                <div className="h-3.5 w-6 bg-surface-2 rounded-md shrink-0" />
                <div className="h-4.5 flex-1 bg-surface-2 rounded-md" />
                <div className="h-7 w-10 bg-surface-2 rounded-md shrink-0" />
                <div className="h-4.5 w-8 bg-surface-2 rounded-md shrink-0" />
              </div>
            ))}
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
