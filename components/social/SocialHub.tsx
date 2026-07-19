"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuth } from "@/lib/auth/auth-context";

interface Friend {
  username: string;
  avatar: string;
  favoriteTeam: string;
  points: number;
  badgeCount: number;
}

const FRIENDS_POOL: Friend[] = [
  { username: "Scuderia_Dan", avatar: "🔴", favoriteTeam: "Ferrari", points: 285, badgeCount: 4 },
  { username: "McLaren_Lando_4", avatar: "🧡", favoriteTeam: "McLaren", points: 250, badgeCount: 5 },
  { username: "Max_Speed_33", avatar: "⚡", favoriteTeam: "Red Bull", points: 310, badgeCount: 6 },
  { username: "SilverArrows_Lewis", avatar: "⚪", favoriteTeam: "Mercedes", points: 190, badgeCount: 3 }
];

export function SocialHub() {
  const { isAuthenticated, user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>(FRIENDS_POOL);
  const [newFriendName, setNewFriendName] = useState("");

  const addFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;
    
    const newFriend: Friend = {
      username: newFriendName.trim(),
      avatar: "🏁",
      favoriteTeam: "Aston Martin",
      points: 0,
      badgeCount: 1
    };

    setFriends([...friends, newFriend]);
    setNewFriendName("");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Head to Head Friends Leaderboard */}
      <GlassCard variant="structural" className="p-5 flex flex-col gap-4 border border-outline/15">
        <div className="flex items-center justify-between border-b border-outline/10 pb-2">
          <div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest font-mono">
              F1 Community
            </span>
            <h3 className="text-[16px] font-black text-on-surface uppercase mt-0.5">
              Friend Leaderboard
            </h3>
          </div>
          <span className="text-[9px] font-mono text-on-surface-variant font-bold uppercase">
            Prediction Points
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Include current user if logged in */}
          {isAuthenticated && user && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 text-[13px] font-bold text-on-surface select-none">
              <div className="flex items-center gap-3">
                <span className="text-[20px]">{user.avatar}</span>
                <div className="flex flex-col">
                  <span className="text-primary uppercase tracking-tight">{user.username} (You)</span>
                  <span className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">{user.favoriteTeam} Fan</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-right font-mono">
                <div>
                  <span className="text-[9px] block text-on-surface-variant/60 font-bold uppercase">PTS</span>
                  <span className="text-[14px] text-primary font-black">150</span>
                </div>
              </div>
            </div>
          )}

          {/* Friends list */}
          {friends
            .sort((a, b) => b.points - a.points)
            .map((f, idx) => (
              <div
                key={f.username}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-2/40 border border-outline/10 text-[13px] font-medium text-on-surface hover:bg-surface-2/65 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">{f.avatar}</span>
                  <div className="flex flex-col">
                    <span className="font-bold truncate uppercase">{f.username}</span>
                    <span className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">{f.favoriteTeam} Fan</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right font-mono">
                  <div>
                    <span className="text-[9px] block text-on-surface-variant/60 font-bold uppercase">Rank</span>
                    <span className="text-[13px] font-bold text-on-surface-variant">#{idx + 1}</span>
                  </div>
                  <div>
                    <span className="text-[9px] block text-on-surface-variant/60 font-bold uppercase">PTS</span>
                    <span className="text-[13px] font-black text-on-surface">{f.points}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </GlassCard>

      {/* Add Friend Form */}
      <GlassCard variant="structural" className="p-4 border border-outline/15">
        <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider pl-1">
          Add Friend By Username
        </span>
        <form onSubmit={addFriend} className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="f1_champion"
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            className="flex-grow h-10 px-3 bg-surface-2 border border-outline/25 rounded-xl text-[13px] text-on-surface focus:outline-none focus:border-primary/50"
          />
          <button
            type="submit"
            className="h-10 px-4 bg-primary text-white text-[12px] font-bold uppercase rounded-xl transition-all cursor-pointer hover:bg-primary/95"
          >
            Add
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
