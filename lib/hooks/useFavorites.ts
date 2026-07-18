"use client";

import { useState, useEffect, useCallback } from "react";
import { resolveDriverMedia } from "@/lib/media/resolver";

export interface ResolvedFavoriteDriver {
  id: string;
  code: string;
  name: string;
  team: string;
  number: string;
  isUnavailable: boolean;
  position?: number;
  points?: number;
}

export interface FavoriteDriverSource {
  id: string;
  name: string;
  code?: string;
  team?: string;
  subtitle?: string;
  number?: string;
  position?: number;
  points?: number;
}

export type FavoriteCategory = "drivers" | "teams" | "circuits" | "weekends";

const STORAGE_KEYS: Record<FavoriteCategory, string> = {
  drivers: "racectrl_favorites",
  teams: "racectrl_favorites_teams",
  circuits: "racectrl_favorites_circuits",
  weekends: "racectrl_favorites_weekends",
};

export function useFavorites(allDrivers: FavoriteDriverSource[] = []) {
  const [mounted, setMounted] = useState(false);

  // Helper to load list safely
  const loadList = useCallback((category: FavoriteCategory): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS[category]);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string" && /^[a-zA-Z0-9_-]+$/.test(x))) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(`Failed to load favorites for ${category}`, e);
    }
    return [];
  }, []);

  const [drivers, setDrivers] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [circuits, setCircuits] = useState<string[]>([]);
  const [weekends, setWeekends] = useState<string[]>([]);

  // Load on mount
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setDrivers(loadList("drivers"));
      setTeams(loadList("teams"));
      setCircuits(loadList("circuits"));
      setWeekends(loadList("weekends"));
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, [loadList]);

  // General Toggle helper
  const toggleFavoriteCategory = useCallback((category: FavoriteCategory, id: string) => {
    const key = STORAGE_KEYS[category];
    const updateFn = (prev: string[]) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new Event("racectrl_favorites_changed"));
      } catch (e) {
        console.error(`Failed to save favorites for ${category}`, e);
      }
      return next;
    };

    if (category === "drivers") setDrivers(updateFn);
    else if (category === "teams") setTeams(updateFn);
    else if (category === "circuits") setCircuits(updateFn);
    else if (category === "weekends") setWeekends(updateFn);
  }, []);

  // Backwards compatibility toggles
  const toggleFavorite = useCallback((id: string) => {
    toggleFavoriteCategory("drivers", id);
  }, [toggleFavoriteCategory]);

  const isFavorite = useCallback((id: string) => {
    return drivers.includes(id);
  }, [drivers]);

  const isFavoriteCategory = useCallback((category: FavoriteCategory, id: string) => {
    if (category === "drivers") return drivers.includes(id);
    if (category === "teams") return teams.includes(id);
    if (category === "circuits") return circuits.includes(id);
    if (category === "weekends") return weekends.includes(id);
    return false;
  }, [drivers, teams, circuits, weekends]);

  // Synchronize state changes across tabs/events
  useEffect(() => {
    const handler = () => {
      setDrivers(loadList("drivers"));
      setTeams(loadList("teams"));
      setCircuits(loadList("circuits"));
      setWeekends(loadList("weekends"));
    };
    window.addEventListener("racectrl_favorites_changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("racectrl_favorites_changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, [loadList]);

  // Resolve driver entities against active roster list
  const resolvedFavorites: ResolvedFavoriteDriver[] = mounted
    ? drivers.map((id) => {
        const active = allDrivers.find((d) => d.id === id);
        if (active) {
          return {
            id: active.id,
            code: active.code || active.id.slice(0, 3).toUpperCase(),
            name: active.name,
            team: active.team || active.subtitle || "Inactive / Reserve",
            number: active.number || "0",
            isUnavailable: false,
            position: active.position,
            points: active.points,
          };
        }
        
        // Falling back to metadata
        const media = resolveDriverMedia(id);
        const parsedName = id.includes("_") 
          ? id.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ")
          : id.charAt(0).toUpperCase() + id.slice(1);
          
        return {
          id,
          code: media.code || id.slice(0, 3).toUpperCase(),
          name: media.id !== "unknown" ? parsedName : id,
          team: "Inactive / Reserve",
          number: media.number || "0",
          isUnavailable: true,
          position: undefined,
          points: undefined,
        };
      })
    : [];

  return {
    favorites: drivers, // for backward compatibility
    favoriteDrivers: drivers,
    favoriteTeams: teams,
    favoriteCircuits: circuits,
    favoriteWeekends: weekends,
    toggleFavorite,
    isFavorite,
    toggleFavoriteCategory,
    isFavoriteCategory,
    resolvedFavorites,
    mounted,
  };
}
