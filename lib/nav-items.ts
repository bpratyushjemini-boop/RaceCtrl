import type { ComponentType, SVGProps } from "react";
import { HomeIcon, TimerIcon, PodiumIcon, CalendarIcon, StarIcon, ChartIcon, HubIcon } from "@/components/ui/Icon";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Live Timing", href: "/timing", icon: TimerIcon },
  { label: "Weekend", href: "/weekend", icon: CalendarIcon },
  { label: "Calendar", href: "/calendar", icon: CalendarIcon },
  { label: "Standings", href: "/standings", icon: PodiumIcon },
  { label: "Analytics", href: "/analytics", icon: ChartIcon },
  { label: "Paddock Hub", href: "/community", icon: HubIcon },
  { label: "Encyclopedia", href: "/encyclopedia", icon: HubIcon },
  { label: "RaceCtrl Pro", href: "/pro", icon: ChartIcon },
  { label: "Favorites", href: "/favorites", icon: StarIcon },
];