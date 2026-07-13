"use client";

import React from "react";
import { resolveConstructorMedia } from "@/lib/media/resolver";

export type ConstructorMarkSize = "compact" | "card" | "hero";

interface ConstructorMarkProps {
  constructorId: string;
  name?: string;
  size?: ConstructorMarkSize;
  className?: string;
}

const SIZE_MAP: Record<ConstructorMarkSize, { container: string; text: string; patternHeight: string; rounded: string }> = {
  compact: {
    container: "h-8 w-8",
    text: "text-[9px]",
    patternHeight: "h-1.5",
    rounded: "rounded-md"
  },
  card: {
    container: "h-12 w-12",
    text: "text-[12px]",
    patternHeight: "h-2.5",
    rounded: "rounded-lg"
  },
  hero: {
    container: "h-16 w-16",
    text: "text-[16px]",
    patternHeight: "h-3.5",
    rounded: "rounded-xl"
  }
};

export function ConstructorMark({
  constructorId,
  name,
  size = "compact",
  className = ""
}: ConstructorMarkProps) {
  const media = resolveConstructorMedia(constructorId);
  const config = SIZE_MAP[size];

  // Resolve 3-letter abbreviation code for the constructor
  const resolvedName = name || media.name || constructorId;
  let code = "UNK";
  if (resolvedName.toLowerCase().includes("red bull")) code = "RBR";
  else if (resolvedName.toLowerCase().includes("aston martin")) code = "AMR";
  else if (resolvedName.toLowerCase().includes("haas")) code = "HAA";
  else if (resolvedName.toLowerCase().includes("kick") || resolvedName.toLowerCase().includes("sauber")) code = "KSA";
  else if (resolvedName.toLowerCase().includes("racing bulls") || resolvedName.toLowerCase().includes("rb f1") || resolvedName.toLowerCase().includes("cash app")) code = "VCB";
  else code = resolvedName.slice(0, 3).toUpperCase();

  // Procedural SVG patterns to represent team identity backgrounds
  const renderPattern = () => {
    switch (media.pattern) {
      case "stripes":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.12] dark:opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`stripes-${constructorId}`} width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#stripes-${constructorId})`} />
          </svg>
        );
      case "checkered":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`checkered-${constructorId}`} width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="6" height="6" fill="currentColor" />
                <rect x="6" y="6" width="6" height="6" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#checkered-${constructorId})`} />
          </svg>
        );
      case "wave":
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.12] dark:opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`wave-${constructorId}`} width="20" height="10" patternUnits="userSpaceOnUse">
                <path d="M0,5 Q5,0 10,5 T20,5" fill="none" stroke="currentColor" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#wave-${constructorId})`} />
          </svg>
        );
      case "geometric":
      default:
        return (
          <svg className="absolute inset-0 w-full h-full opacity-[0.12] dark:opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`geo-${constructorId}`} width="16" height="16" patternUnits="userSpaceOnUse">
                <polygon points="0,0 8,8 0,16" fill="none" stroke="currentColor" strokeWidth="1" />
                <polygon points="16,0 8,8 16,16" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#geo-${constructorId})`} />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center shrink-0 border border-outline/35 shadow-sm text-on-surface select-none ${config.rounded} ${config.container} ${className}`}
      style={{
        backgroundColor: `${media.accent}12`,
        borderColor: `${media.accent}40`,
        color: media.accent,
      }}
    >
      {/* Background patterns representing team design */}
      {renderPattern()}

      {/* Overlay to dim backgrounds */}
      <div className="absolute inset-0 bg-surface/20 dark:bg-black/10" />

      {/* Typographic constructor mark code */}
      <span className={`font-black relative z-10 font-mono tracking-tighter leading-none text-on-surface`}>
        {code}
      </span>

      {/* Bottom accent colored solid footer strip */}
      <div
        className={`absolute inset-x-0 bottom-0 ${config.patternHeight} z-10`}
        style={{ backgroundColor: media.accent }}
      >
        <div className="w-1/2 h-full" style={{ backgroundColor: media.secondary }} />
      </div>
    </div>
  );
}
