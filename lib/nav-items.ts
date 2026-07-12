import type { ComponentType, SVGProps } from "react";
import { HomeIcon, TimerIcon, PodiumIcon, CalendarIcon, StarIcon } from "@/components/ui/Icon";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Live Timing", href: "/timing", icon: TimerIcon },
  { label: "Weekend", href: "/weekend", icon: CalendarIcon },
  { label: "Standings", href: "/standings", icon: PodiumIcon },
  { label: "Favorites", href: "/favorites", icon: StarIcon },
];