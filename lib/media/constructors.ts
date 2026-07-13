export interface ConstructorMediaData {
  id: string;
  name: string;
  accent: string;
  secondary: string;
  pattern: "stripes" | "checkered" | "geometric" | "wave";
  logo?: string;
  fallback?: {
    accent: string;
    secondary: string;
    pattern: "stripes" | "checkered" | "geometric" | "wave";
  };
}

export const CONSTRUCTORS_MEDIA: Record<string, ConstructorMediaData> = {
  mclaren: {
    id: "mclaren",
    name: "McLaren",
    accent: "#FF8000",
    secondary: "#1E1E1E",
    pattern: "stripes",
  },
  ferrari: {
    id: "ferrari",
    name: "Ferrari",
    accent: "#E8002D",
    secondary: "#FFE800",
    pattern: "geometric",
  },
  red_bull: {
    id: "red_bull",
    name: "Red Bull",
    accent: "#3671C6",
    secondary: "#FFCC00",
    pattern: "wave",
  },
  mercedes: {
    id: "mercedes",
    name: "Mercedes",
    accent: "#27F4D2",
    secondary: "#C0C0C0",
    pattern: "stripes",
  },
  aston_martin: {
    id: "aston_martin",
    name: "Aston Martin",
    accent: "#229971",
    secondary: "#D4AF37",
    pattern: "geometric",
  },
  alpine: {
    id: "alpine",
    name: "Alpine",
    accent: "#FF87BC",
    secondary: "#0055A5",
    pattern: "checkered",
  },
  haas: {
    id: "haas",
    name: "Haas F1 Team",
    accent: "#B6BABD",
    secondary: "#EF1B2D",
    pattern: "stripes",
  },
  sauber: {
    id: "sauber",
    name: "Kick Sauber",
    accent: "#52E252",
    secondary: "#000000",
    pattern: "geometric",
  },
  williams: {
    id: "williams",
    name: "Williams",
    accent: "#64C4FF",
    secondary: "#005AFF",
    pattern: "wave",
  },
  rb: {
    id: "rb",
    name: "RB F1 Team",
    accent: "#6692FF",
    secondary: "#FFFFFF",
    pattern: "checkered",
  },
};

export function getConstructorFallback(id: string): ConstructorMediaData {
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1).replace("_", " "),
    accent: "#8E8E93",
    secondary: "#1C1C1E",
    pattern: "geometric",
  };
}
