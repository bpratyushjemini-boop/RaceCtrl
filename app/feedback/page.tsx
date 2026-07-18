"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageContainer } from "@/components/layout/PageContainer";

type FeedbackCategory = "feature" | "bug" | "general" | "telemetry";

export default function FeedbackPage() {
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !message.trim()) return;

    setSubmitting(true);
    // Simulate API request delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <PageContainer>
      {/* Breadcrumbs */}
      <div className="flex items-center">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-primary uppercase hover:opacity-85 transition-opacity"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Settings
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold tracking-widest text-primary uppercase">
          Support
        </span>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-on-surface leading-none">
          Send Feedback
        </h1>
      </div>

      <div className="max-w-md w-full mx-auto">
        {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase pl-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
              className="w-full bg-surface-2 hover:bg-surface-3 text-on-surface text-[13px] font-bold py-2.5 px-4 rounded-xl border border-outline/30 focus:outline-none focus:border-primary/80 transition-colors cursor-pointer appearance-none text-left"
              aria-label="Feedback Category"
            >
              <option value="general">General Feedback</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug / Issue Report</option>
              <option value="telemetry">Telemetry & Timing Source Data</option>
            </select>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase pl-1">
              App Rating
            </label>
            <div className="flex items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95"
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <svg
                      className={`h-7 w-7 transition-all ${
                        filled ? "text-primary fill-primary scale-105" : "text-outline/45 fill-none"
                      }`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499c.195-.583 1.026-.583 1.221 0l2.36 7.066H20.5a.614.614 0 01.59.808l-1.854 5.56 2.36 7.066a.614.614 0 01-.893.754l-5.617-4.214-5.617 4.214a.614.614 0 01-.893-.754l2.36-7.066-1.854-5.56a.614.614 0 01.59-.808h5.459l2.36-7.066z"
                      />
                    </svg>
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="text-[11px] font-mono text-outline font-bold tracking-wider ml-2 uppercase">
                  {rating === 5 ? "Excellent!" : rating === 4 ? "Great" : rating === 3 ? "Good" : rating === 2 ? "Needs Work" : "Poor"}
                </span>
              )}
            </div>
          </div>

          {/* Message Textarea */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase pl-1">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you like or what we can improve. If reporting a bug, please describe the steps to reproduce..."
              rows={5}
              required
              className="w-full bg-surface-2 text-on-surface text-[13px] font-medium py-3 px-4 rounded-xl border border-outline/30 focus:outline-none focus:border-primary/80 transition-colors placeholder-on-surface-variant/60 resize-none font-sans"
              aria-label="Feedback Message"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || rating === 0 || !message.trim()}
            className="w-full h-11 bg-primary hover:bg-[#D6382F] active:bg-[#C8102E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-bold tracking-wider uppercase rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 select-none"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <span>Send Feedback</span>
            )}
          </button>
        </form>
      ) : (
        <GlassCard
          variant="structural"
          className="p-8 text-center border border-[#30D158]/20 flex flex-col items-center justify-center min-h-[260px] mt-4 animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="h-12 w-12 rounded-full bg-[#30D158]/10 border border-[#30D158]/35 text-[#30D158] flex items-center justify-center mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-[15px] font-black text-on-surface uppercase tracking-wider">
            Feedback Transmitted
          </h3>
          <p className="text-[12px] text-on-surface-variant mt-2.5 max-w-[280px] leading-relaxed">
            Thank you for helping us make RaceCtrl the ultimate Formula 1 companion. Your report has been saved.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setRating(0);
              setMessage("");
            }}
            className="mt-6 text-[11px] font-bold tracking-wider text-primary hover:text-primary/80 uppercase font-mono transition-colors cursor-pointer"
          >
            Submit Another Report
          </button>
        </GlassCard>
      )}
      </div>
    </PageContainer>
  );
}
