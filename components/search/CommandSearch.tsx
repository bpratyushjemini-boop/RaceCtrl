"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DRIVERS_MEDIA } from "@/lib/media/drivers";
import { CONSTRUCTORS_MEDIA } from "@/lib/media/constructors";
import { CIRCUITS_MEDIA } from "@/lib/media/circuits";
import { GlassCard } from "@/components/ui/GlassCard";

interface SearchResult {
  id: string;
  type: "driver" | "constructor" | "circuit" | "action";
  title: string;
  subtitle: string;
  href: string;
}

export function CommandSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Flat list of searchable entities
  const searchPool: SearchResult[] = [
    {
      id: "compare-drivers",
      type: "action" as const,
      title: "Compare Drivers",
      subtitle: "ACTION · Compare two drivers head-to-head",
      href: "/compare",
    },
    {
      id: "open-my-grid",
      type: "action" as const,
      title: "Open My Grid",
      subtitle: "ACTION · Manage your favorite drivers grid",
      href: "/favorites",
    },
    {
      id: "open-weekend",
      type: "action" as const,
      title: "Open Weekend",
      subtitle: "ACTION · Schedule, sessions, and live state",
      href: "/weekend",
    },
    {
      id: "open-standings",
      type: "action" as const,
      title: "Open Standings",
      subtitle: "ACTION · Drivers and constructors standings",
      href: "/standings",
    },
    ...Object.values(DRIVERS_MEDIA).map((d) => ({
      id: d.id,
      type: "driver" as const,
      title: d.id.split("_").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
      subtitle: `${d.code} · ${d.team}`,
      href: `/drivers/${d.id}`,
    })),
    ...Object.values(CONSTRUCTORS_MEDIA).map((c) => ({
      id: c.id,
      type: "constructor" as const,
      title: c.name,
      subtitle: "Constructor",
      href: `/constructors/${c.id}`,
    })),
    ...Object.values(CIRCUITS_MEDIA).map((c) => ({
      id: c.id,
      type: "circuit" as const,
      title: c.name,
      subtitle: c.country || "Circuit",
      href: `/circuits/${c.id}`,
    })),
  ];

  // Simple filtering
  const filtered = query.trim()
    ? searchPool.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setHighlightedIndex(0);
      // Short delay for DOM render focus
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        if (filtered[highlightedIndex]) {
          e.preventDefault();
          router.push(filtered[highlightedIndex].href);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, highlightedIndex, onClose, router]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        const container = scrollContainerRef.current;
        const activeTop = activeEl.offsetTop;
        const activeBottom = activeTop + activeEl.offsetHeight;
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.offsetHeight;

        if (activeTop < containerTop) {
          container.scrollTop = activeTop;
        } else if (activeBottom > containerBottom) {
          container.scrollTop = activeBottom - container.offsetHeight;
        }
      }
    }
  }, [highlightedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-bg/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg mt-16 md:mt-24"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard 
          variant="floating" 
          className="flex flex-col max-h-[420px] overflow-hidden border border-outline/35 shadow-2xl"
        >
          {/* Header Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-outline/20">
            <svg className="h-5 w-5 text-on-surface-variant shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search driver, constructor, track..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlightedIndex(0);
              }}
              className="w-full bg-transparent text-[15px] font-medium text-on-surface placeholder-on-surface-variant focus:outline-none"
            />
            <button 
              type="button"
              onClick={onClose}
              className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface bg-surface-2 px-2.5 py-1 rounded-md border border-outline/25 cursor-pointer"
            >
              ESC
            </button>
          </div>

          {/* Results List */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto py-2 divide-y divide-outline/5"
          >
            {query.trim() === "" ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[13px] text-on-surface-variant">Type to find grid entities...</p>
                <div className="flex justify-center gap-3 mt-4 text-[10px] text-outline font-bold tracking-widest uppercase">
                  <span>HAM</span>
                  <span>·</span>
                  <span>Ferrari</span>
                  <span>·</span>
                  <span>Spa</span>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-on-surface-variant">
                No results matched your search query.
              </p>
            ) : (
              filtered.map((item, idx) => {
                const isHighlighted = idx === highlightedIndex;
                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between px-5 py-3 transition-colors text-left ${
                      isHighlighted 
                        ? "bg-primary/10 text-primary border-l-2 border-primary" 
                        : "text-on-surface hover:bg-surface-2/25"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold truncate">{item.title}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 truncate uppercase tracking-wide font-medium">{item.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 border border-primary/20 rounded px-2 py-0.5 ml-3 font-mono">
                      {item.type}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
