"use client";

import React, { useState } from "react";
import { useAuth, type UserProfile, type AuthProviderType } from "@/lib/auth/auth-context";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageSection } from "@/components/layout/PageSection";
import { getTeamColor } from "@/lib/team-colors";

const AVAILABLE_AVATARS = ["🏎️", "🏆", "🏁", "🔧", "🔋", "🔴", "⚡", "🦖", "🌟", "🔥"];

const BADGES = [
  { id: "watched_10", label: "GP Veteran", desc: "Watched 10+ live race sessions", icon: "📺" },
  { id: "streak_5", label: "Predictor Guru", desc: "5+ correct predictions streak", icon: "🔮" },
  { id: "history_expert", label: "History Scholar", desc: "Explored historic timeline back to 1950", icon: "📚" },
  { id: "ferrari_fan", label: "Ferrari Tifoso", desc: "Favorited Scuderia Ferrari", icon: "🇮🇹" },
  { id: "mclaren_legend", label: "McLaren Loyal", desc: "Favorited McLaren Team", icon: "🧡" },
  { id: "night_owl", label: "Night Owl", desc: "Tracked a late-night session live", icon: "🦉" },
  { id: "rain_master", label: "Rain Master", desc: "Checked track wet weather radar active", icon: "🌧️" }
];

export default function ProfilePage() {
  const {
    isAuthenticated,
    provider,
    user,
    isSyncing,
    login,
    logout,
    updateProfile,
    triggerSync,
    unlockedBadges
  } = useAuth();

  const [emailInput, setEmailInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);

  const startEdit = () => {
    if (!user) return;
    setEditedUser({ ...user });
    setEditing(true);
  };

  const saveEdit = () => {
    if (!editedUser) return;
    updateProfile(editedUser);
    setEditing(false);
  };

  const handleLogin = (prov: AuthProviderType) => {
    if (prov === "email") {
      if (!emailInput.trim()) return;
      login("email", emailInput);
    } else {
      login(prov);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <PageContainer gap="md" className="pb-12 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center gap-1.5 mt-8">
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
            Get Started
          </span>
          <h1 className="text-[28px] font-black tracking-tight text-on-surface uppercase leading-none">
            RaceCtrl Account
          </h1>
          <p className="text-[13px] text-on-surface-variant max-w-xs mt-1">
            Unlock predictions, synchronization, personalized insights, and stats achievements.
          </p>
        </div>

        <GlassCard variant="floating" className="p-6 flex flex-col gap-4 border border-outline/25">
          {/* Email input login */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="driver@racectrl.app"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 h-10 px-3 bg-surface-2 border border-outline/25 rounded-xl text-[13px] text-on-surface focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={() => handleLogin("email")}
                disabled={isSyncing}
                className="h-10 px-4 bg-primary text-white text-[12px] font-bold uppercase rounded-xl transition-all cursor-pointer hover:bg-primary/95 disabled:opacity-50"
              >
                Go
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-outline/10"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-outline uppercase font-bold">Or Connect Social</span>
            <div className="flex-grow border-t border-outline/10"></div>
          </div>

          {/* Social login buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => handleLogin("google")}
              disabled={isSyncing}
              className="w-full h-10 border border-outline/35 text-on-surface hover:bg-surface-2/40 text-[12px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Google SSO</span>
            </button>
            <button
              onClick={() => handleLogin("apple")}
              disabled={isSyncing}
              className="w-full h-10 border border-outline/35 text-on-surface hover:bg-surface-2/40 text-[12px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Apple ID</span>
            </button>
            <button
              onClick={() => handleLogin("github")}
              disabled={isSyncing}
              className="w-full h-10 border border-outline/35 text-on-surface hover:bg-surface-2/40 text-[12px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>GitHub Account</span>
            </button>
          </div>
        </GlassCard>
      </PageContainer>
    );
  }

  const teamColor = getTeamColor(user.favoriteTeam);

  return (
    <PageContainer gap="md" className="pb-12 max-w-3xl mx-auto">
      {/* Profile Header */}
      <GlassCard
        variant="floating"
        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-outline/25"
        style={{
          background: `linear-gradient(135deg, ${teamColor}0F 0%, var(--glass-content-bg) 70%, var(--color-bg) 100%)`,
        }}
      >
        <div className="flex items-center gap-4.5">
          <span className="text-[44px] leading-none select-none">{user.avatar}</span>
          <div>
            <h1 className="text-[24px] font-black text-on-surface uppercase tracking-tight leading-none">
              {user.username}
            </h1>
            <p className="text-[11px] text-on-surface-variant font-medium mt-1 font-mono uppercase tracking-wider">
              Connected via {provider} · {user.country}
            </p>
            <p className="text-[12px] text-on-surface-variant mt-2 leading-relaxed max-w-md font-medium">
              {user.bio}
            </p>
          </div>
        </div>

        <button
          onClick={startEdit}
          className="h-9 px-4 self-start md:self-auto border border-outline/40 text-on-surface-variant hover:text-on-surface hover-glass text-[11px] font-bold tracking-wider uppercase transition-all duration-150 rounded-full cursor-pointer active:scale-[0.97]"
        >
          Edit Profile
        </button>
      </GlassCard>

      {/* Grid: Editor vs Display */}
      {editing && editedUser ? (
        <GlassCard variant="structural" className="p-6 flex flex-col gap-4 border border-outline/25">
          <h3 className="text-[14px] font-black uppercase text-on-surface tracking-wider">Edit Profile Stats</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={editedUser.username}
                onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                className="h-10 px-3 bg-surface-2 border border-outline/25 rounded-xl text-[13px] text-on-surface focus:outline-none"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Avatar Icon</label>
              <div className="flex gap-2 overflow-x-auto py-1">
                {AVAILABLE_AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => setEditedUser({ ...editedUser, avatar: av })}
                    className={`text-[20px] p-1.5 rounded-lg border shrink-0 transition-colors ${
                      editedUser.avatar === av ? "bg-primary/20 border-primary" : "border-outline/15 hover:bg-surface-2"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Short Bio</label>
              <textarea
                value={editedUser.bio}
                onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                className="h-16 p-3 bg-surface-2 border border-outline/25 rounded-xl text-[13px] text-on-surface focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Country</label>
              <input
                type="text"
                value={editedUser.country}
                onChange={(e) => setEditedUser({ ...editedUser, country: e.target.value })}
                className="h-10 px-3 bg-surface-2 border border-outline/25 rounded-xl text-[13px] text-on-surface focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Favorite Team</label>
              <input
                type="text"
                value={editedUser.favoriteTeam}
                onChange={(e) => setEditedUser({ ...editedUser, favoriteTeam: e.target.value })}
                className="h-10 px-3 bg-surface-2 border border-outline/25 rounded-xl text-[13px] text-on-surface focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-4">
            <button
              onClick={() => setEditing(false)}
              className="h-9 px-4 border border-outline/25 text-on-surface-variant hover:text-on-surface rounded-full text-[11px] font-bold uppercase transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="h-9 px-4 bg-primary text-white rounded-full text-[11px] font-bold uppercase transition-all cursor-pointer hover:bg-primary/95"
            >
              Save Changes
            </button>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Favorites List & Settings Sync */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <PageSection title="My F1 Grid Selection">
            <GlassCard variant="structural" className="p-5 flex flex-col gap-3.5 border border-outline/15">
              <div className="grid grid-cols-2 gap-4 text-[12px] font-medium text-on-surface-variant">
                <div className="flex flex-col p-2.5 rounded-lg bg-surface-2/30 border border-outline/10">
                  <span className="text-[9px] font-bold uppercase tracking-wider">Favorite Driver</span>
                  <span className="text-[13px] font-bold text-on-surface mt-1 truncate uppercase">
                    {user.favoriteDriver}
                  </span>
                </div>
                <div className="flex flex-col p-2.5 rounded-lg bg-surface-2/30 border border-outline/10" style={{ borderLeft: `3px solid ${teamColor}` }}>
                  <span className="text-[9px] font-bold uppercase tracking-wider">Favorite Team</span>
                  <span className="text-[13px] font-bold text-on-surface mt-1 truncate uppercase">
                    {user.favoriteTeam}
                  </span>
                </div>
                <div className="flex flex-col p-2.5 rounded-lg bg-surface-2/30 border border-outline/10">
                  <span className="text-[9px] font-bold uppercase tracking-wider">Favorite Track</span>
                  <span className="text-[13px] font-bold text-on-surface mt-1 truncate uppercase">
                    {user.favoriteCircuit}
                  </span>
                </div>
                <div className="flex flex-col p-2.5 rounded-lg bg-surface-2/30 border border-outline/10">
                  <span className="text-[9px] font-bold uppercase tracking-wider">Favorite Era</span>
                  <span className="text-[13px] font-bold text-on-surface mt-1 truncate uppercase">
                    {user.favoriteEra}
                  </span>
                </div>
              </div>
            </GlassCard>
          </PageSection>

          {/* Unlocked Badges */}
          <PageSection title="Unlocked Achievements">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BADGES.map((badge) => {
                const unlocked = unlockedBadges.includes(badge.id);
                return (
                  <GlassCard
                    key={badge.id}
                    variant={unlocked ? "floating" : "structural"}
                    className={`p-4 flex items-center gap-3.5 border transition-all duration-200 ${
                      unlocked ? "border-primary/20 opacity-100" : "border-outline/5 opacity-40 select-none"
                    }`}
                  >
                    <span className="text-[28px] shrink-0 leading-none select-none">{badge.icon}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-primary uppercase font-mono tracking-wider">
                        {unlocked ? "UNLOCKED" : "LOCKED"}
                      </span>
                      <h4 className="text-[13px] font-bold text-on-surface truncate uppercase mt-0.5">
                        {badge.label}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5 font-medium leading-none">
                        {badge.desc}
                      </p>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </PageSection>
        </div>

        {/* Right Col: Cloud Sync Backup */}
        <div className="flex flex-col gap-6">
          <PageSection title="Cloud Synchronization">
            <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15 justify-between">
              <div>
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">RaceCtrl Cloud Backups</span>
                <p className="text-[12.5px] text-on-surface-variant mt-1 leading-relaxed font-medium">
                  Keep favorites, predictions, alert filters, and recent search logs backup synced securely across all of your active client devices.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-outline/10">
                <button
                  onClick={triggerSync}
                  disabled={isSyncing}
                  className="w-full h-9 bg-primary hover:bg-primary/95 text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                >
                  {isSyncing ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Backing Up...</span>
                    </>
                  ) : (
                    <span>Sync Settings Now</span>
                  )}
                </button>

                <div className="text-center text-[9px] text-on-surface-variant/50 font-mono mt-1 select-none">
                  LAST BACKUP SYNCED: JUST NOW
                </div>
              </div>
            </GlassCard>
          </PageSection>

          {/* Danger Zone: logout */}
          <PageSection title="Account Actions">
            <button
              onClick={logout}
              className="w-full h-10 border border-red-500/20 text-red-500 hover:bg-red-500/5 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-[0.98]"
            >
              Sign Out Account
            </button>
          </PageSection>
        </div>
      </div>
    </PageContainer>
  );
}
