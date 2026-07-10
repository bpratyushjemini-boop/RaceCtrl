import type { ComponentType, SVGProps } from "react";
import { HomeIcon, TimerIcon, PodiumIcon, SettingsIcon } from "@/components/ui/Icon";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: HomeIcon },
  { label: "Live Timing", href: "/timing", icon: TimerIcon },
  { label: "Standings", href: "/standings", icon: PodiumIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];