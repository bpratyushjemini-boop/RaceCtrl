"use client";

import React, { useState, useEffect } from "react";

export function PresentationMode({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Auto refresh simulated clocks (60 FPS refresh state timer simulation)
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#090A0C] text-white flex flex-col justify-between p-8 font-mono select-none overflow-hidden select-none animate-fade-in">
      {/* Header bar */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
          <h2 className="text-[20px] font-black uppercase tracking-widest font-sans">
            RACECTRL PRO LIVE BROADCAST OVERLAY
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-[12px] font-bold text-white/50 uppercase">
            REPLACE REFRESH TICK: {secondsElapsed}s
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 border border-white/20 text-[11px] font-black uppercase tracking-wider hover:bg-white/25 transition-all rounded-lg cursor-pointer"
          >
            EXIT OVERLAY [ESC]
          </button>
        </div>
      </div>

      {/* Broadcast Timing Standings */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full gap-6">
        <span className="text-[11px] font-bold tracking-widest text-red-600 uppercase font-mono">
          LEADERBOARD UPDATE
        </span>
        <div className="flex flex-col gap-4 text-[26px] font-black uppercase">
          {/* Row 1 */}
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4.5 rounded-2xl">
            <div className="flex items-center gap-5">
              <span className="text-red-500 w-12">01</span>
              <span>M. VERSTAPPEN</span>
              <span className="text-[12.5px] bg-red-600 text-white px-2 py-0.5 rounded font-mono font-bold leading-none">RED BULL</span>
            </div>
            <span className="text-[24px]">INTERVAL</span>
          </div>

          {/* Row 2 */}
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4.5 rounded-2xl">
            <div className="flex items-center gap-5">
              <span className="text-white/40 w-12">02</span>
              <span>L. NORRIS</span>
              <span className="text-[12.5px] bg-orange-500 text-white px-2 py-0.5 rounded font-mono font-bold leading-none">MCLAREN</span>
            </div>
            <span className="text-[24px] text-white/70">+1.845s</span>
          </div>

          {/* Row 3 */}
          <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4.5 rounded-2xl">
            <div className="flex items-center gap-5">
              <span className="text-white/40 w-12">03</span>
              <span>C. LECLERC</span>
              <span className="text-[12.5px] bg-red-600 text-white px-2 py-0.5 rounded font-mono font-bold leading-none">FERRARI</span>
            </div>
            <span className="text-[24px] text-white/70">+4.250s</span>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex justify-between items-center border-t border-white/10 pt-4 text-[12px] text-white/40">
        <span>POLLING TIMERS: 60Hz TICK ENGINE ACTIVE</span>
        <span>© 2026 RACECTRL SYSTEM INC.</span>
      </div>
    </div>
  );
}
