"use client";

export interface SegmentedControlOption<T> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T> {
  options: SegmentedControlOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string | number>({
  options,
  selectedValue,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex h-9 p-[3px] bg-surface-2/65 border border-outline/30 rounded-full w-full">
      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center text-[12px] font-bold tracking-widest uppercase rounded-full transition-all cursor-pointer select-none ${
              isSelected
                ? "bg-surface text-on-surface border border-outline/35 shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

