import type { Session } from "@/lib/types";

function formatSessionTime(session: Session) {
  return new Date(`${session.date}T${session.time}`).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NextSessionCard({ session }: { session: Session | null }) {
  if (!session) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-4 py-6 text-center">
        <p className="text-[15px] font-medium text-text">No upcoming session</p>
        <p className="mt-1 text-[13px] text-text-dim">
          Check back once the next round is scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-text-dim">Next session</p>
        <p className="truncate text-[15px] font-semibold text-text">{session.label}</p>
      </div>
      <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-[13px] font-medium text-text">
        {formatSessionTime(session)}
      </span>
    </div>
  );
}