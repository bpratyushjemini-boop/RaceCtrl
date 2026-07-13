"use client";

import React, { useState } from "react";
import type { DriverMediaData } from "@/lib/media/drivers";
import { resolveDriverMedia } from "@/lib/media/resolver";
import { getTeamColor } from "@/lib/team-colors";

export type DriverAvatarSize = "xs" | "sm" | "md" | "lg" | "hero";

const SIZE_MAP: Record<DriverAvatarSize, { container: number; code: number; number: number; dot: number; shape: string }> = {
  xs:   { container: 28, code: 8,  number: 6,  dot: 0,  shape: "rounded-full" },
  sm:   { container: 36, code: 10, number: 7,  dot: 8,  shape: "rounded-full" },
  md:   { container: 48, code: 13, number: 9,  dot: 12, shape: "rounded-full" },
  lg:   { container: 72, code: 20, number: 11, dot: 16, shape: "rounded-full" },
  hero: { container: 96, code: 28, number: 14, dot: 20, shape: "rounded-full" },
};

interface DriverAvatarProps {
  /** Jolpica/Ergast driverId */
  driverId: string;
  /** Full driver name for fallback generation */
  driverName?: string;
  /** Team name for accent color dot */
  team?: string;
  /** Size variant */
  size?: DriverAvatarSize;
  /** Optional override of the resolved media data */
  media?: DriverMediaData;
  /** Additional CSS classes */
  className?: string;
  /** Show team color indicator dot */
  showTeamDot?: boolean;
}

/**
 * DriverAvatar — Reusable driver visual identity component.
 *
 * Renders a portrait photo when available, otherwise a premium flag-gradient
 * monogram fallback with driver code + team accent dot.
 *
 * Does NOT show a broken image icon when media is missing.
 */
export function DriverAvatar({
  driverId,
  driverName,
  team,
  size = "sm",
  media: mediaProp,
  className = "",
  showTeamDot = true,
}: DriverAvatarProps) {
  const media = mediaProp || resolveDriverMedia(driverId, driverName);
  const teamColor = getTeamColor(team || media.team);
  const config = SIZE_MAP[size];
  const flagGradient = `linear-gradient(135deg, ${media.flagColors.join(", ")})`;

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasPortrait = !!media.portrait && !imgError;

  return (
    <div
      className={`${config.shape} shrink-0 flex items-center justify-center relative overflow-hidden border border-outline/30 shadow-sm ${className}`}
      style={{
        width: config.container,
        height: config.container,
        background: flagGradient,
      }}
    >
      {/* Darkening overlay for text readability on flag gradient */}
      <div className="absolute inset-0 bg-bg/40" />

      {/* Portrait image layer (when available) */}
      {hasPortrait && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.portrait}
            alt={driverName || media.code}
            className="absolute inset-0 w-full h-full object-cover z-[1]"
            style={{
              objectPosition: media.focalPosition || "center 20%",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 250ms ease",
            }}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      )}

      {/* Fallback monogram — always rendered behind portrait, visible when no portrait or loading */}
      {(!hasPortrait || !imgLoaded) && (
        <span
          className="font-black text-white relative z-[2] font-mono tracking-tighter leading-none"
          style={{ fontSize: config.code }}
        >
          {media.code}
        </span>
      )}

      {/* Team accent dot */}
      {showTeamDot && config.dot > 0 && (
        <div
          className="absolute bottom-0 right-0 rounded-full border border-bg z-[3] flex items-center justify-center shadow-sm"
          style={{
            width: config.dot,
            height: config.dot,
            backgroundColor: teamColor,
          }}
        >
          {config.dot >= 12 && (
            <span
              className="font-black text-white font-mono leading-none"
              style={{ fontSize: config.number - 2 }}
            >
              {media.number.length <= 2 ? media.number : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
