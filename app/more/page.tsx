import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";

interface MoreLink {
  label: string;
  href: string;
  icon: string;
  description: string;
}

interface MoreSection {
  title: string;
  links: MoreLink[];
}

const SECTIONS: MoreSection[] = [
  {
    title: "Championships & Standings",
    links: [
      { label: "Standings", href: "/standings", icon: "🏆", description: "Drivers & Constructors points" },
      { label: "Global Calendar", href: "/calendar", icon: "📅", description: "Unified multi-series schedules" },
      { label: "Encyclopedia", href: "/encyclopedia", icon: "📖", description: "Technical glossaries & rules history" }
    ]
  },
  {
    title: "Paddock & Social",
    links: [
      { label: "Paddock Hub", href: "/community", icon: "💬", description: "Community threads & radio explainers" },
      { label: "Favorites", href: "/favorites", icon: "⭐️", description: "Your pinned drivers & teams" }
    ]
  },
  {
    title: "Analytics & Pro Workspace",
    links: [
      { label: "RaceCtrl Pro", href: "/pro", icon: "🖥️", description: "Custom builders & developer center" },
      { label: "Analytics Studio", href: "/analytics", icon: "📈", description: "Strategy simulators & telemetries" }
    ]
  },
  {
    title: "Personalization",
    links: [
      { label: "User Profile", href: "/profile", icon: "👤", description: "Avatars, usernames & credentials" },
      { label: "Settings", href: "/settings", icon: "⚙️", description: "App configurations & notifications toggle" }
    ]
  }
];

export default function MorePage() {
  return (
    <PageContainer gap="md" className="pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Top Header */}
      <div className="flex justify-between items-center select-none">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">
            Navigation Portal
          </span>
          <h1 className="text-[26px] font-black text-on-surface uppercase leading-none mt-1">
            Explore RaceCtrl
          </h1>
        </div>

        <Link
          href="/"
          className="h-9 w-9 rounded-full bg-surface-2 border border-outline/35 flex items-center justify-center text-on-surface hover:bg-surface-3 transition-colors active:scale-95 cursor-pointer"
          aria-label="Close menu"
        >
          ✕
        </Link>
      </div>

      {/* Grid of Sections */}
      <div className="flex flex-col gap-6 mt-4">
        {SECTIONS.map((sec, sIdx) => (
          <div key={sIdx} className="flex flex-col gap-3">
            <h3 className="text-[11px] font-mono font-black text-on-surface-variant/60 uppercase tracking-widest leading-none pl-1">
              {sec.title}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {sec.links.map((link, lIdx) => (
                <Link key={lIdx} href={link.href} className="block group">
                  <GlassCard
                    variant="structural"
                    className="p-4 border border-outline/15 hover:border-primary/45 transition-all duration-200 active:scale-[0.99] flex items-center gap-4 h-full"
                  >
                    <span className="text-[24px] leading-none shrink-0 group-hover:scale-110 transition-transform duration-200">
                      {link.icon}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-extrabold text-on-surface group-hover:text-primary transition-colors uppercase leading-none">
                        {link.label}
                      </h4>
                      <p className="text-[11.5px] text-on-surface-variant/80 font-medium leading-tight mt-1 truncate">
                        {link.description}
                      </p>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
