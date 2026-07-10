"use client";

import { useEffect, useState } from "react";

function getRemaining(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownCard({
  target,
  title,
  subtitle,
}: {
  target: string;
  title: string;
  subtitle: string;
}) {
  const targetMs = new Date(target).getTime();
  const [remaining, setRemaining] = useState(() => getRemaining(targetMs));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const units = [
    { label: "D", value: remaining.days },
    { label: "H", value: remaining.hours },
    { label: "M", value: remaining.minutes },
    { label: "S", value: remaining.seconds },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-[13px] font-medium text-text-dim">{subtitle}</p>
      <h2 className="mt-0.5 text-[19px] font-semibold tracking-tight text-text">
        {title}
      </h2>

      <div className="mt-4 flex items-stretch gap-2">
        {units.map((unit) => (
          <div key={unit.label} className="flex-1 rounded-xl bg-surface-2 py-2.5 text-center">
            <p className="text-[20px] font-semibold tabular-nums text-text">
              {String(unit.value).padStart(2, "0")}
            </p>
            <p className="text-[11px] font-medium text-text-dim">{unit.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}