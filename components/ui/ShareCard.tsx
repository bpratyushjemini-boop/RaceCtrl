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
  shareUrl = typeof window !== "undefined" ? window.location.href : "",
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <GlassCard
        variant="floating"
        className="w-full max-w-md p-5 flex flex-col gap-4 border border-outline/35 relative animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-full hover-glass text-on-surface-variant hover:text-on-surface cursor-pointer"
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

        {/* Preview Container */}
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
            Copy Preview
          </span>
          <pre className="w-full h-32 overflow-y-auto bg-surface-2/60 border border-outline/25 rounded-xl p-3 text-[11px] font-mono text-on-surface-variant whitespace-pre-wrap leading-relaxed select-all">
            {markdownContent}
          </pre>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2 mt-2 w-full">
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
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          {typeof navigator !== "undefined" && (navigator as any).share && (
            <button
              onClick={handleNativeShare}
              className="flex-1 h-9 rounded-full bg-primary text-white font-bold text-[11px] tracking-wider uppercase cursor-pointer transition-all hover:bg-primary/95 active:scale-[0.98] flex items-center justify-center gap-1.5 duration-100"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l5.06-2.53m0 7.576l-5.06-2.53m2.77 1.378a3 3 0 11-6 0 3 3 0 016 0zm6-8a3 3 0 11-6 0 3 3 0 016 0zm0 8a3 3 0 11-6 0 3 3 0 016 0zm0 8a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Share Social</span>
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
