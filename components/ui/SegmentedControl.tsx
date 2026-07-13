"use client";

import { useEffect, useRef, useState } from "react";

export interface SegmentedControlOption<T> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T> {
  options: SegmentedControlOption<T>[];
  selectedValue: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function SegmentedControl<T extends string | number>({
  options,
  selectedValue,
  onChange,
  disabled = false,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  
  const [capsuleStyle, setCapsuleStyle] = useState<React.CSSProperties>({
    transform: "translate3d(0, 0, 0)",
    width: "0px",
    opacity: 0,
  });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    requestAnimationFrame(() => {
      setPrefersReducedMotion(motionQuery.matches);
    });
  }, []);

  useEffect(() => {
    const updateCapsule = () => {
      const activeBtn = buttonRefs.current[String(selectedValue)];
      if (activeBtn) {
        setCapsuleStyle({
          transform: `translate3d(${activeBtn.offsetLeft}px, 0, 0)`,
          width: `${activeBtn.offsetWidth}px`,
          opacity: 1,
        });
      }
    };

    const frameId = requestAnimationFrame(updateCapsule);

    window.addEventListener("resize", updateCapsule);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateCapsule);
    };
  }, [selectedValue, options]);

  return (
    <div 
      ref={containerRef}
      className={`flex h-9 p-[3px] bg-surface-2/65 border border-outline/30 rounded-full w-full relative overflow-hidden transition-opacity duration-200 ${
        disabled ? "opacity-[0.45] pointer-events-none" : ""
      }`}
    >
      {/* Shared sliding selection capsule */}
      <div
        className="absolute top-[3px] bottom-[3px] left-0 bg-surface border border-outline/35 shadow-sm rounded-full z-0 pointer-events-none"
        style={{
          ...capsuleStyle,
          transition: prefersReducedMotion 
            ? "none" 
            : "transform 220ms cubic-bezier(0.25, 1, 0.5, 1), width 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 150ms ease",
        }}
      />

      {options.map((opt) => {
        const isSelected = selectedValue === opt.value;
        return (
          <button
            key={String(opt.value)}
            ref={(el) => {
              buttonRefs.current[String(opt.value)] = el;
            }}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`flex-1 flex items-center justify-center text-[12px] font-bold tracking-widest uppercase rounded-full cursor-pointer select-none z-10 relative transition-colors duration-200 ${
              isSelected
                ? "text-on-surface"
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
