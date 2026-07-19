"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  username: string;
  avatar: string; // Emoji or image URL
  bio: string;
  country: string;
  favoriteDriver: string;
  favoriteTeam: string;
  favoriteCircuit: string;
  favoriteEra: string;
}

export type AuthProviderType = "google" | "apple" | "github" | "email";

export interface AuthContextType {
  isAuthenticated: boolean;
  provider: AuthProviderType | null;
  user: UserProfile | null;
  isSyncing: boolean;
  login: (provider: AuthProviderType, email?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  triggerSync: () => Promise<void>;
  unlockedBadges: string[];
  unlockBadge: (badgeId: string) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  username: "Tifosi_99",
  avatar: "🏎️",
  bio: "Formula 1 enthusiast tracking the 2026 regulations reset.",
  country: "Monaco",
  favoriteDriver: "leclerc",
  favoriteTeam: "Ferrari",
  favoriteCircuit: "monaco",
  favoriteEra: "2000s (V10 Screamers)",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [provider, setProvider] = useState<AuthProviderType | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(["watched_10"]);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAuth = localStorage.getItem("racectrl_auth");
      const storedUser = localStorage.getItem("racectrl_user_profile");
      const storedBadges = localStorage.getItem("racectrl_badges");

      if (storedAuth && storedUser) {
        const authProv = storedAuth as AuthProviderType;
        const userProf = JSON.parse(storedUser);
        setTimeout(() => {
          setIsAuthenticated(true);
          setProvider(authProv);
          setUser(userProf);
        }, 0);
      }
      if (storedBadges) {
        const badgesArr = JSON.parse(storedBadges);
        setTimeout(() => {
          setUnlockedBadges(badgesArr);
        }, 0);
      }
    }
  }, []);

  const login = async (loginProvider: AuthProviderType, email?: string) => {
    setIsSyncing(true);
    // Simulate cloud sync delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const finalProfile = {
      ...DEFAULT_PROFILE,
      username: email ? email.split("@")[0] : `F1_Racer_${Math.floor(Math.random() * 900 + 100)}`,
    };

    setIsAuthenticated(true);
    setProvider(loginProvider);
    setUser(finalProfile);
    setIsSyncing(false);

    localStorage.setItem("racectrl_auth", loginProvider);
    localStorage.setItem("racectrl_user_profile", JSON.stringify(finalProfile));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setProvider(null);
    setUser(null);
    localStorage.removeItem("racectrl_auth");
    localStorage.removeItem("racectrl_user_profile");
  };

  const updateProfile = (updatedFields: Partial<UserProfile>) => {
    if (!user) return;
    const nextProfile = { ...user, ...updatedFields };
    setUser(nextProfile);
    localStorage.setItem("racectrl_user_profile", JSON.stringify(nextProfile));
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    // Simulate secure cloud backups syncing settings, history, favorites
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSyncing(false);
  };

  const unlockBadge = (badgeId: string) => {
    setUnlockedBadges((prev) => {
      if (prev.includes(badgeId)) return prev;
      const updated = [...prev, badgeId];
      localStorage.setItem("racectrl_badges", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        provider,
        user,
        isSyncing,
        login,
        logout,
        updateProfile,
        triggerSync,
        unlockedBadges,
        unlockBadge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
