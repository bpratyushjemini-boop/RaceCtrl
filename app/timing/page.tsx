export const revalidate = 300;

export default function TimingPage() {
  return (
    <div className="flex min-h-[60vh] flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
      <h1 className="text-[22px] font-semibold tracking-tight text-text">Live Timing</h1>
      <p className="text-[15px] text-text-dim">
        Timing data is not available in this demo. Check back once a session starts.
      </p>
    </div>
  );
}
