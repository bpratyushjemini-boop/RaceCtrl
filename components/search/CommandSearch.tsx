"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DRIVERS_MEDIA } from "@/lib/media/drivers";
import { CONSTRUCTORS_MEDIA } from "@/lib/media/constructors";
import { CIRCUITS_MEDIA } from "@/lib/media/circuits";
import { GlassCard } from "@/components/ui/GlassCard";

interface SearchResult {
  id: string;
  type: "driver" | "constructor" | "circuit" | "action" | "race";
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
  const searchPool = useMemo<SearchResult[]>(() => {
    return [
      {
        id: "open-archive",
        type: "action" as const,
        title: "Explore F1 Season History Archive",
        subtitle: "ACTION · Historic standings & results since 1950",
        href: "/archive",
      },
      {
        id: "open-notifications",
        type: "action" as const,
        title: "Open Notifications Alert Center",
        subtitle: "ACTION · View and manage race weekend triggers",
        href: "/notifications",
      },
      { id: "archive-2023", type: "race" as const, title: "2023 Season History", subtitle: "ARCHIVE · Max Verstappen Champion", href: "/archive?year=2023" },
      { id: "archive-2021", type: "race" as const, title: "2021 Season History", subtitle: "ARCHIVE · Max Verstappen Champion", href: "/archive?year=2021" },
      { id: "archive-1998", type: "race" as const, title: "1998 Season History", subtitle: "ARCHIVE · Mika Häkkinen Champion", href: "/archive?year=1998" },
      {
        id: "compare-drivers",
        type: "action" as const,
        title: "Compare Drivers & Teams",
        subtitle: "ACTION · Compare head-to-head stats",
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
      // 2024 Grand Prix Calendar
      { id: "gp-1", type: "race" as const, title: "Bahrain Grand Prix", subtitle: "ROUND 1 · Sakhir", href: "/weekend/1" },
      { id: "gp-2", type: "race" as const, title: "Saudi Arabian Grand Prix", subtitle: "ROUND 2 · Jeddah", href: "/weekend/2" },
      { id: "gp-3", type: "race" as const, title: "Australian Grand Prix", subtitle: "ROUND 3 · Melbourne", href: "/weekend/3" },
      { id: "gp-4", type: "race" as const, title: "Japanese Grand Prix", subtitle: "ROUND 4 · Suzuka", href: "/weekend/4" },
      { id: "gp-5", type: "race" as const, title: "Chinese Grand Prix", subtitle: "ROUND 5 · Shanghai", href: "/weekend/5" },
      { id: "gp-6", type: "race" as const, title: "Miami Grand Prix", subtitle: "ROUND 6 · Miami", href: "/weekend/6" },
      { id: "gp-7", type: "race" as const, title: "Emilia Romagna Grand Prix", subtitle: "ROUND 7 · Imola", href: "/weekend/7" },
      { id: "gp-8", type: "race" as const, title: "Monaco Grand Prix", subtitle: "ROUND 8 · Monaco", href: "/weekend/8" },
      { id: "gp-9", type: "race" as const, title: "Canadian Grand Prix", subtitle: "ROUND 9 · Montreal", href: "/weekend/9" },
      { id: "gp-10", type: "race" as const, title: "Spanish Grand Prix", subtitle: "ROUND 10 · Barcelona", href: "/weekend/10" },
      { id: "gp-11", type: "race" as const, title: "Austrian Grand Prix", subtitle: "ROUND 11 · Spielberg", href: "/weekend/11" },
      { id: "gp-12", type: "race" as const, title: "British Grand Prix", subtitle: "ROUND 12 · Silverstone", href: "/weekend/12" },
      { id: "gp-13", type: "race" as const, title: "Hungarian Grand Prix", subtitle: "ROUND 13 · Budapest", href: "/weekend/13" },
      { id: "gp-14", type: "race" as const, title: "Belgian Grand Prix", subtitle: "ROUND 14 · Spa-Francorchamps", href: "/weekend/14" },
      { id: "gp-15", type: "race" as const, title: "Dutch Grand Prix", subtitle: "ROUND 15 · Zandvoort", href: "/weekend/15" },
      { id: "gp-16", type: "race" as const, title: "Italian Grand Prix", subtitle: "ROUND 16 · Monza", href: "/weekend/16" },
      { id: "gp-17", type: "race" as const, title: "Azerbaijan Grand Prix", subtitle: "ROUND 17 · Baku", href: "/weekend/17" },
      { id: "gp-18", type: "race" as const, title: "Singapore Grand Prix", subtitle: "ROUND 18 · Marina Bay", href: "/weekend/18" },
      { id: "gp-19", type: "race" as const, title: "United States Grand Prix", subtitle: "ROUND 19 · Austin", href: "/weekend/19" },
      { id: "gp-20", type: "race" as const, title: "Mexico City Grand Prix", subtitle: "ROUND 20 · Mexico City", href: "/weekend/20" },
      { id: "gp-21", type: "race" as const, title: "São Paulo Grand Prix", subtitle: "ROUND 21 · Interlagos", href: "/weekend/21" },
      { id: "gp-22", type: "race" as const, title: "Las Vegas Grand Prix", subtitle: "ROUND 22 · Las Vegas", href: "/weekend/22" },
      { id: "gp-23", type: "race" as const, title: "Qatar Grand Prix", subtitle: "ROUND 23 · Lusail", href: "/weekend/23" },
      { id: "gp-24", type: "race" as const, title: "Abu Dhabi Grand Prix", subtitle: "ROUND 24 · Yas Marina", href: "/weekend/24" },
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
  }, []);

  // Simple filtering
  const filtered = useMemo<SearchResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return searchPool.filter(
        (item) =>
          item.type === "action" ||
          item.id === "gp-1" ||
          item.id === "gp-8"
      );
    }
    return searchPool.filter(
      (item) =>
        item.title.toLowerCase().includes(trimmed) ||
        item.subtitle.toLowerCase().includes(trimmed)
    );
  }, [query, searchPool]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery("");
        setHighlightedIndex(0);
        inputRef.current?.focus();
      }, 50);
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
      const activeEl = scrollContainerRef.current.children[highlightedIndex + (query.trim() === "" ? 1 : 0)] as HTMLElement;
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
  }, [highlightedIndex, query]);

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
            {filtered.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-on-surface-variant">
                No results matched your search query.
              </p>
            ) : (
              <>
                {query.trim() === "" && (
                  <div className="px-5 py-2 text-[10px] font-bold text-on-surface-variant/75 uppercase tracking-wider bg-surface-2/20 border-b border-outline/10 select-none">
                    Quick Suggestions
                  </div>
                )}
                {filtered.map((item, idx) => {
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
                })}
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
