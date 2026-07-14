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

export function useFavorites(allDrivers: FavoriteDriverSource[] = []) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("racectrl_favorites");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    }
    return [];
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("racectrl_favorites", JSON.stringify(next));
        // Dispatch custom event to notify other components instantly
        window.dispatchEvent(new Event("racectrl_favorites_changed"));
      } catch (e) {
        console.error("Failed to save favorites", e);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => {
    return favorites.includes(id);
  }, [favorites]);

  // Listen for changes from other tabs / components
  useEffect(() => {
    const handler = () => {
      try {
        const stored = localStorage.getItem("racectrl_favorites");
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load favorites", e);
      }
    };
    window.addEventListener("racectrl_favorites_changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("racectrl_favorites_changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  // Resolve driver entities against active roster list
  const resolvedFavorites: ResolvedFavoriteDriver[] = mounted
    ? favorites.map((id) => {
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
    favorites,
    toggleFavorite,
    isFavorite,
    resolvedFavorites,
    mounted,
  };
}
