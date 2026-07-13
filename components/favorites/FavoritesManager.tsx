"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { F1Driver } from "@/lib/api/f1";
import { getTeamColor } from "@/lib/team-colors";

interface FavoritesManagerProps {
  allDrivers: F1Driver[];
}

export function FavoritesManager({ allDrivers }: FavoritesManagerProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    let active = true;
    requestAnimationFrame(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem("racectrl_favorites");
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
      setMounted(true);
    });
    return () => {
      active = false;
    };
  }, []);


  // Sync favorites state changes to localStorage
  const toggleFavorite = (id: string) => {
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    
    setFavorites(nextFavorites);
    try {
      localStorage.setItem("racectrl_favorites", JSON.stringify(nextFavorites));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  };

  // Get favorite driver objects
  const favoriteDrivers = allDrivers.filter((driver) => favorites.includes(driver.id));

  // Filter drivers list based on search
  const filteredDrivers = allDrivers.filter((driver) => {
    const query = searchQuery.toLowerCase();
    return (
      driver.name.toLowerCase().includes(query) ||
      driver.code.toLowerCase().includes(query) ||
      driver.team.toLowerCase().includes(query)
    );
  });

  if (!mounted) {
    // Initial static state to prevent hydration flicker
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">Favorites</span>
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface">My Grid</h1>
        </div>
        <div className="h-40 bg-surface-2/30 rounded-md border border-outline/20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Page Title and Header ── */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          Favorites
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
          My Grid
        </h1>
      </div>

      {/* ── My Grid Dashboard Section ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
            Active Grid ({favoriteDrivers.length})
          </span>
        </div>

        {favoriteDrivers.length === 0 ? (
          <GlassCard variant="structural" className="p-8 text-center flex flex-col items-center justify-center min-h-[140px] border border-dashed border-outline/40">
            <svg
              className="h-8 w-8 text-on-surface-variant mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.385-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p className="text-[14px] font-semibold text-on-surface">Your grid is empty</p>
            <p className="text-[12px] text-on-surface-variant mt-1 max-w-[280px]">
              Tap the star icon on any driver below to customize your favorites.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {favoriteDrivers.map((driver) => {
              const teamColor = getTeamColor(driver.team);
              return (
                <GlassCard
                  key={driver.id}
                  variant="floating"
                  className="p-4 flex flex-col justify-between min-h-[110px] relative overflow-hidden transition-all hover:scale-[1.02]"
                  style={{
                    borderLeft: `3px solid ${teamColor}`,
                  }}
                >
                  <Link
                    href={`/drivers/${driver.id}`}
                    className="min-w-0 pr-6 block flex-1 group"
                    aria-label={`View profile for driver ${driver.name}`}
                  >
                    <span className="telemetry-numeric text-[20px] font-extrabold text-on-surface flex items-baseline gap-1 group-hover:text-primary transition-colors">
                      {driver.code}
                      <span className="text-[11px] font-bold text-on-surface-variant font-sans">
                        #{driver.number}
                      </span>
                    </span>
                    <p className="text-[13px] font-bold text-on-surface mt-1 truncate">
                      {driver.name}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                      {driver.team}
                    </p>
                  </Link>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => toggleFavorite(driver.id)}
                    className="absolute top-2.5 right-2.5 h-6 w-6 flex items-center justify-center text-on-surface-variant hover:text-primary rounded-full hover-glass transition-colors cursor-pointer z-10"
                    aria-label={`Remove ${driver.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Driver Search and Selection Grid ── */}
      <ScrollReveal delay={100}>
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
                Championship Roster
              </span>
            </div>

            {/* Search bar input */}
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search by driver, team or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-10 bg-surface-2/65 border border-outline/30 rounded-full text-[14px] text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary/50 transition-colors"
              />
              {/* Search Icon */}
              <span className="absolute inset-y-0 left-3.5 flex items-center justify-center text-on-surface-variant">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              {/* Clear Button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Selection Grid */}
          {filteredDrivers.length === 0 ? (
            <p className="text-[14px] text-on-surface-variant py-8 text-center">
              No drivers found matching your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredDrivers.map((driver) => {
                const isFav = favorites.includes(driver.id);
                const teamColor = getTeamColor(driver.team);
                return (
                  <GlassCard
                    key={driver.id}
                    variant={isFav ? "momentary" : "structural"}
                    className="p-4 flex items-center justify-between gap-4 border transition-all"
                    style={{
                      borderColor: isFav ? teamColor : "var(--glass-border-strong)",
                      boxShadow: isFav ? `inset 0 0 12px ${teamColor}10` : "none",
                    }}
                  >
                    <Link
                      href={`/drivers/${driver.id}`}
                      className="min-w-0 flex items-center gap-3 flex-1 group"
                      aria-label={`View profile for driver ${driver.name}`}
                    >
                      {/* Compact layout */}
                      <div
                        className="h-8 w-[3px] shrink-0 rounded-full"
                        style={{ backgroundColor: teamColor }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="telemetry-numeric text-[16px] font-bold text-on-surface leading-none group-hover:text-primary transition-colors">
                            {driver.code}
                          </span>
                          <span className="text-[11px] font-bold text-on-surface-variant font-sans leading-none">
                            #{driver.number}
                          </span>
                        </div>
                        <p className="text-[14px] font-semibold text-on-surface mt-1 truncate">
                          {driver.name}
                        </p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                          {driver.team}
                        </p>
                      </div>
                    </Link>

                    {/* Star Checkbox Button */}
                    <button
                      type="button"
                      onClick={() => toggleFavorite(driver.id)}
                      className={`h-9 w-9 flex items-center justify-center rounded-full border cursor-pointer transition-colors shrink-0 z-10 ${
                        isFav
                          ? "bg-primary/10 border-primary/40 text-primary"
                          : "bg-surface-2/40 border-outline/35 text-on-surface-variant hover:text-on-surface hover:border-outline/50"
                      }`}
                      aria-label={isFav ? `Remove ${driver.name} from favorites` : `Add ${driver.name} to favorites`}
                    >
                      <svg
                        className="h-4.5 w-4.5"
                        fill={isFav ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.385-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      </ScrollReveal>
      
      {/* Spacer to clear floating BottomNav island on mobile */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
