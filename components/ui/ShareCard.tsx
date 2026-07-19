"use client";

import React, { useState } from "react";
import { GlassCard } from "./GlassCard";

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  markdownContent: string;
  shareUrl?: string;
}

export function ShareCard({
  isOpen,
  onClose,
  title,
  subtitle = "Export & Share Card",
  markdownContent,
  shareUrl = typeof window !== "undefined" ? window.location.href : "https://racectrl.app",
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const [layout, setLayout] = useState<"story" | "post">("story");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  if (!isOpen) return null;

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy markdown content", err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await navigator.share({
          title,
          text: markdownContent.split("\n")[0] || title,
          url: shareUrl,
        });
      } catch (err) {
        console.warn("Native share dismissed or failed", err);
      }
    } else {
      handleCopyMarkdown();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <GlassCard
        variant="floating"
        className="w-full max-w-lg p-6 flex flex-col gap-5 border border-outline/35 relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-full hover-glass text-on-surface-variant hover:text-on-surface cursor-pointer z-20"
          aria-label="Close modal"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
            {subtitle}
          </span>
          <h3 className="text-[18px] font-black text-on-surface uppercase tracking-tight">
            {title}
          </h3>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Format Layout</span>
            <div className="flex bg-surface-2/60 border border-outline/15 rounded-xl p-0.5 gap-0.5">
              <button
                onClick={() => setLayout("story")}
                className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  layout === "story" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                9:16 Story
              </button>
              <button
                onClick={() => setLayout("post")}
                className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  layout === "post" ? "bg-primary text-white" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                16:9 Post
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Design Style</span>
            <div className="flex bg-surface-2/60 border border-outline/15 rounded-xl p-0.5 gap-0.5">
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  theme === "dark" ? "bg-surface-3 text-on-surface border border-outline/25" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Dark Carbon
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all ${
                  theme === "light" ? "bg-white text-black border border-outline/20" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Light Aero
              </button>
            </div>
          </div>
        </div>

        {/* Live Visual Canvas Preview Frame */}
        <div className="flex justify-center items-center py-2 bg-surface-2/20 border border-outline/15 rounded-2xl">
          <div
            className={`transition-all duration-300 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 shadow-xl border select-none ${
              layout === "story" ? "w-[200px] h-[320px] aspect-[9/16]" : "w-[320px] h-[180px] aspect-[16/9]"
            } ${
              theme === "dark"
                ? "bg-gradient-to-b from-[#1C1C1E] to-black text-white border-outline/40"
                : "bg-gradient-to-b from-white to-[#F5F5F7] text-black border-outline/20"
            }`}
          >
            {/* Visual Header F1 accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

            <div className="flex flex-col gap-1.5">
              <span className={`text-[8px] font-black tracking-widest uppercase font-mono ${theme === "dark" ? "text-primary" : "text-primary"}`}>
                RACECTRL V3 · COMPANION
              </span>
              <h4 className="text-[12px] font-black uppercase tracking-tight line-clamp-2 leading-tight">
                {title}
              </h4>
              <p className={`text-[9px] font-mono whitespace-pre-wrap leading-relaxed mt-1 line-clamp-[8] ${theme === "dark" ? "text-on-surface-variant/80" : "text-black/60"}`}>
                {markdownContent.replace("🏎️ RaceCtrl F3 Profile\n", "")}
              </p>
            </div>

            {/* Footer with App Details and Mock QR Code */}
            <div className="flex items-center justify-between pt-2 border-t border-outline/10">
              <div className="flex flex-col">
                <span className="text-[7px] font-mono tracking-wider opacity-60">VISIT WEB PORTAL</span>
                <span className="text-[9px] font-black uppercase tracking-widest mt-0.5">RACECTRL.APP</span>
              </div>
              
              {/* Specialized Mock QR code SVG vector overlay */}
              <svg className={`h-8 w-8 shrink-0 ${theme === "dark" ? "text-white" : "text-black"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="6" height="6" strokeWidth="2" />
                <rect x="16" y="2" width="6" height="6" strokeWidth="2" />
                <rect x="2" y="16" width="6" height="6" strokeWidth="2" />
                {/* QR matrix dot details */}
                <path d="M4 4h2v2H4zM18 4h2v2h-2zM4 18h2v2H4z" fill="currentColor" />
                <path d="M11 3h2v2h-2zm0 6h2v2h-2zm0 6h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm2-2h2v2h-2zm-6-2h2v2h-2z" fill="currentColor" stroke="none" />
              </svg>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2 mt-1 w-full">
          <button
            onClick={handleCopyMarkdown}
            className={`flex-1 h-9 rounded-full font-bold text-[11px] tracking-wider uppercase cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 duration-100 ${
              copied
                ? "bg-[#30D158]/10 border border-[#30D158]/40 text-[#30D158]"
                : "border border-outline/30 text-on-surface hover:bg-surface-2/70"
            }`}
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied Markdown!</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m-6 4h10m-5-5l5 5-5 5" />
                </svg>
                <span>Copy Stats</span>
              </>
            )}
          </button>

          <button
            onClick={handleNativeShare}
            className="flex-1 h-9 rounded-full bg-primary text-white font-bold text-[11px] tracking-wider uppercase cursor-pointer transition-all hover:bg-primary/95 active:scale-[0.98] flex items-center justify-center gap-1.5 duration-100"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l5.06-2.53m0 7.576l-5.06-2.53m2.77 1.378a3 3 0 11-6 0 3 3 0 016 0zm6-8a3 3 0 11-6 0 3 3 0 016 0zm0 8a3 3 0 11-6 0 3 3 0 016 0zm0 8a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Share Image</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
