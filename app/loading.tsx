import { GlassCard } from "@/components/ui/GlassCard";

export default function Loading() {
  return (
    <div className="grid grid-cols-6 gap-4 items-start w-full animate-pulse select-none motion-reduce:animate-none pb-12">
      {/* ── A. COUNTDOWN HERO SKELETON ── */}
      <div className="col-span-6 md:col-span-4">
        <GlassCard variant="floating" className="p-5 flex flex-col justify-between gap-4 min-h-[240px]">
          <div className="flex flex-col gap-1">
            <div className="h-3 w-16 bg-surface-2 rounded-md mb-1.5" />
            <div className="h-8 w-1/2 bg-surface-2 rounded-md" />
            <div className="h-4 w-1/3 bg-surface-2 rounded-md mt-1" />
            <div className="h-5 w-24 bg-surface-2 rounded-full mt-3" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-2 w-24 bg-surface-2 rounded-md" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-1 items-center">
                  <div className="h-14 w-14 bg-surface-2 rounded-md" />
                  <div className="h-2 w-6 bg-surface-2 rounded-md mt-0.5" />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── B. NEXT SESSION SKELETON ── */}
      <div className="col-span-6 md:col-span-2">
        <GlassCard variant="floating" className="p-5 flex flex-col justify-between gap-4 min-h-[240px]">
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-20 bg-surface-2 rounded-md" />
            <div className="h-6 w-3/4 bg-surface-2 rounded-md mt-1" />
            <div className="h-3.5 w-1/2 bg-surface-2 rounded-md" />
          </div>
          <div className="h-8 w-full bg-surface-2 rounded-full mt-4" />
        </GlassCard>
      </div>

      {/* ── C. PERSONALIZED INSIGHTS SKELETON ── */}
      <div className="col-span-6 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <div className="h-3.5 w-32 bg-surface-2 rounded-md" />
        </div>
        <GlassCard className="p-1 flex flex-col" variant="floating">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between h-[52px] px-4 gap-3 border-b border-outline/10 last:border-b-0"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="h-6 w-16 bg-surface-2 rounded-md shrink-0" />
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  <div className="h-3.5 w-1/3 bg-surface-2 rounded-md" />
                  <div className="h-2.5 w-1/4 bg-surface-2 rounded-md" />
                </div>
              </div>
              <div className="h-4 w-4 bg-surface-2 rounded-full shrink-0" />
            </div>
          ))}
        </GlassCard>
      </div>

      {/* ── D. MY DRIVERS SKELETON ── */}
      <div className="col-span-6 md:col-span-3 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <div className="h-3.5 w-28 bg-surface-2 rounded-md" />
        </div>
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <GlassCard
              key={i}
              variant="structural"
              className="p-3.5 flex items-center justify-between border border-outline/15 border-l-[3px] border-l-surface-2"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-surface-2 rounded-full shrink-0" />
                <div className="flex flex-col gap-1">
                  <div className="h-3.5 w-16 bg-surface-2 rounded-md" />
                  <div className="h-2.5 w-24 bg-surface-2 rounded-md" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="h-3.5 w-8 bg-surface-2 rounded-md" />
                <div className="h-2.5 w-12 bg-surface-2 rounded-md" />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* ── E. CHAMPIONSHIP PULSE SKELETON ── */}
      <div className="col-span-6 md:col-span-3 flex flex-col gap-3">
        <div className="flex items-center gap-1.5 px-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <div className="h-3.5 w-36 bg-surface-2 rounded-md" />
        </div>
        <GlassCard className="p-4 flex flex-col justify-between min-h-[160px]" variant="floating">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 w-20 bg-surface-2 rounded-md" />
              <div className="h-4 w-28 bg-surface-2 rounded-md mt-1" />
              <div className="h-3 w-16 bg-surface-2 rounded-md" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-2.5 w-24 bg-surface-2 rounded-md" />
              <div className="h-4 w-28 bg-surface-2 rounded-md mt-1" />
              <div className="h-3 w-16 bg-surface-2 rounded-md" />
            </div>
          </div>
          <div className="h-7 w-full bg-surface-2 rounded-full mt-4" />
        </GlassCard>
      </div>
    </div>
  );
}
