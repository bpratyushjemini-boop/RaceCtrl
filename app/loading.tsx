import { GlassCard } from "@/components/ui/GlassCard";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse select-none motion-reduce:animate-none">
      {/* Skeleton Header Card */}
      <GlassCard variant="floating" className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 flex flex-col gap-2">
            {/* Round / active label pill */}
            <div className="h-3.5 w-24 bg-surface-2 rounded-md" />
            {/* Grand Prix title line */}
            <div className="h-7 w-3/4 bg-surface-2 rounded-md mt-1" />
            {/* Locality info line */}
            <div className="h-3 w-1/2 bg-surface-2 rounded-md mt-1" />
          </div>
          {/* Status badge skeleton */}
          <div className="h-7 w-16 bg-surface-2 rounded-full" />
        </div>
      </GlassCard>

      {/* Content section mock */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <div className="h-3.5 w-32 bg-surface-2 rounded-md" />
        </div>

        {/* Skeleton Row Cards */}
        <GlassCard variant="structural" className="p-1.5 flex flex-col gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center h-[52px] gap-3 px-3 border-b border-outline/10 last:border-0"
            >
              {/* Badge shape */}
              <div className="h-7 w-7 bg-surface-2 rounded-full shrink-0" />
              {/* Vertical accent stripe shape */}
              <div className="h-7 w-[3px] bg-surface-2 rounded-full shrink-0" />
              {/* Label strings block */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3.5 w-1/4 bg-surface-2 rounded-md" />
                <div className="h-2.5 w-1/3 bg-surface-2 rounded-md" />
              </div>
              {/* Value timing text block */}
              <div className="h-4.5 w-16 bg-surface-2 rounded-md shrink-0" />
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}
