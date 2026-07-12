import type { ReactNode } from "react";

interface SettingsRowProps {
  label: string;
  description?: string;
  control?: ReactNode;
}

export function SettingsRow({ label, description, control }: SettingsRowProps) {
  return (
    <li className="flex items-center justify-between min-h-[52px] px-4 py-3 gap-4">
      {/* Label and description details */}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[14px] font-bold text-on-surface leading-tight tracking-tight">
          {label}
        </span>
        {description && (
          <span className="text-[11px] text-on-surface-variant mt-0.5 leading-tight">
            {description}
          </span>
        )}
      </div>

      {/* Controller element (Toggles, Controls, text fields) */}
      {control && (
        <div className="shrink-0 flex items-center justify-end max-w-[200px]">
          {control}
        </div>
      )}
    </li>
  );
}
