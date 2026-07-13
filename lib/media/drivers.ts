export interface DriverMediaData {
  id: string;
  code: string;
  number: string;
  team: string;
  accent: string;
  nationality: string;
  flagColors: string[]; // National flag gradient colors
  portrait?: string; // Optional path to portrait image
  heroImage?: string; // Optional path to larger hero image
  focalPosition?: string; // CSS object-position for portrait cropping
  attribution?: string;
  fallback?: {
    gradient: string[];
    accent: string;
    code: string;
    number: string;
  };
}

/**
 * Complete 2025 F1 Grid driver media database.
 * Keys match Jolpica/Ergast driverId values.
 * The resolver normalizes lookups so code-based and name-based matches also work.
 */
export const DRIVERS_MEDIA: Record<string, DriverMediaData> = {
  // ── Red Bull Racing ──────────────────────────────────────
  max_verstappen: {
    id: "max_verstappen",
    code: "VER",
    number: "1",
    team: "Red Bull",
    accent: "#3671C6",
    nationality: "Dutch",
    flagColors: ["#AE1C28", "#FFFFFF", "#21468B"],
  },
  lawson: {
    id: "lawson",
    code: "LAW",
    number: "30",
    team: "Red Bull",
    accent: "#3671C6",
    nationality: "New Zealander",
    flagColors: ["#00247D", "#CC142B", "#FFFFFF"],
  },

  // ── McLaren ──────────────────────────────────────────────
  norris: {
    id: "norris",
    code: "NOR",
    number: "4",
    team: "McLaren",
    accent: "#FF8000",
    nationality: "British",
    flagColors: ["#00247D", "#FFFFFF", "#CF142B"],
  },
  piastri: {
    id: "piastri",
    code: "PIA",
    number: "81",
    team: "McLaren",
    accent: "#FF8000",
    nationality: "Australian",
    flagColors: ["#00008B", "#FFFFFF", "#FF0000"],
  },

  // ── Ferrari ──────────────────────────────────────────────
  leclerc: {
    id: "leclerc",
    code: "LEC",
    number: "16",
    team: "Ferrari",
    accent: "#E8002D",
    nationality: "Monégasque",
    flagColors: ["#D11919", "#FFFFFF", "#D11919"],
  },
  hamilton: {
    id: "hamilton",
    code: "HAM",
    number: "44",
    team: "Ferrari",
    accent: "#E8002D",
    nationality: "British",
    flagColors: ["#00247D", "#FFFFFF", "#CF142B"],
  },

  // ── Mercedes ─────────────────────────────────────────────
  russell: {
    id: "russell",
    code: "RUS",
    number: "63",
    team: "Mercedes",
    accent: "#27F4D2",
    nationality: "British",
    flagColors: ["#00247D", "#FFFFFF", "#CF142B"],
  },
  antonelli: {
    id: "antonelli",
    code: "ANT",
    number: "12",
    team: "Mercedes",
    accent: "#27F4D2",
    nationality: "Italian",
    flagColors: ["#009246", "#FFFFFF", "#CE2B37"],
  },

  // ── Aston Martin ─────────────────────────────────────────
  alonso: {
    id: "alonso",
    code: "ALO",
    number: "14",
    team: "Aston Martin",
    accent: "#229971",
    nationality: "Spanish",
    flagColors: ["#AA151B", "#F1BF00", "#AA151B"],
  },
  stroll: {
    id: "stroll",
    code: "STR",
    number: "18",
    team: "Aston Martin",
    accent: "#229971",
    nationality: "Canadian",
    flagColors: ["#D80621", "#FFFFFF", "#D80621"],
  },

  // ── Alpine ───────────────────────────────────────────────
  gasly: {
    id: "gasly",
    code: "GAS",
    number: "10",
    team: "Alpine",
    accent: "#FF87BC",
    nationality: "French",
    flagColors: ["#0055A5", "#FFFFFF", "#EF4135"],
  },
  doohan: {
    id: "doohan",
    code: "DOO",
    number: "7",
    team: "Alpine",
    accent: "#FF87BC",
    nationality: "Australian",
    flagColors: ["#00008B", "#FFFFFF", "#FF0000"],
  },

  // ── Haas F1 Team ─────────────────────────────────────────
  ocon: {
    id: "ocon",
    code: "OCO",
    number: "31",
    team: "Haas F1 Team",
    accent: "#B6BABD",
    nationality: "French",
    flagColors: ["#0055A5", "#FFFFFF", "#EF4135"],
  },
  bearman: {
    id: "bearman",
    code: "BEA",
    number: "87",
    team: "Haas F1 Team",
    accent: "#B6BABD",
    nationality: "British",
    flagColors: ["#00247D", "#FFFFFF", "#CF142B"],
  },

  // ── RB (Racing Bulls) ───────────────────────────────────
  tsunoda: {
    id: "tsunoda",
    code: "TSU",
    number: "22",
    team: "RB F1 Team",
    accent: "#6692FF",
    nationality: "Japanese",
    flagColors: ["#FFFFFF", "#BC002D", "#FFFFFF"],
  },
  hadjar: {
    id: "hadjar",
    code: "HAD",
    number: "20",
    team: "RB F1 Team",
    accent: "#6692FF",
    nationality: "French",
    flagColors: ["#0055A5", "#FFFFFF", "#EF4135"],
  },

  // ── Williams ─────────────────────────────────────────────
  sainz: {
    id: "sainz",
    code: "SAI",
    number: "55",
    team: "Williams",
    accent: "#64C4FF",
    nationality: "Spanish",
    flagColors: ["#AA151B", "#F1BF00", "#AA151B"],
  },
  albon: {
    id: "albon",
    code: "ALB",
    number: "23",
    team: "Williams",
    accent: "#64C4FF",
    nationality: "Thai",
    flagColors: ["#A51931", "#FFFFFF", "#2D2A4A"],
  },

  // ── Kick Sauber ──────────────────────────────────────────
  hulkenberg: {
    id: "hulkenberg",
    code: "HUL",
    number: "27",
    team: "Kick Sauber",
    accent: "#52E252",
    nationality: "German",
    flagColors: ["#000000", "#DD0000", "#FFCE00"],
  },
  bortoleto: {
    id: "bortoleto",
    code: "BOR",
    number: "5",
    team: "Kick Sauber",
    accent: "#52E252",
    nationality: "Brazilian",
    flagColors: ["#009B3A", "#FEDF00", "#002776"],
  },

  // ── Legacy / Reserve (for historical results) ────────────
  perez: {
    id: "perez",
    code: "PER",
    number: "11",
    team: "Red Bull",
    accent: "#3671C6",
    nationality: "Mexican",
    flagColors: ["#006847", "#FFFFFF", "#CE1126"],
  },
  ricciardo: {
    id: "ricciardo",
    code: "RIC",
    number: "3",
    team: "RB F1 Team",
    accent: "#6692FF",
    nationality: "Australian",
    flagColors: ["#00008B", "#FFFFFF", "#FF0000"],
  },
  magnussen: {
    id: "magnussen",
    code: "MAG",
    number: "20",
    team: "Haas F1 Team",
    accent: "#B6BABD",
    nationality: "Danish",
    flagColors: ["#C8102E", "#FFFFFF", "#C8102E"],
  },
  bottas: {
    id: "bottas",
    code: "BOT",
    number: "77",
    team: "Kick Sauber",
    accent: "#52E252",
    nationality: "Finnish",
    flagColors: ["#FFFFFF", "#002F6C", "#FFFFFF"],
  },
  zhou: {
    id: "zhou",
    code: "ZHO",
    number: "24",
    team: "Kick Sauber",
    accent: "#52E252",
    nationality: "Chinese",
    flagColors: ["#EE1C25", "#FFFF00", "#EE1C25"],
  },
  colapinto: {
    id: "colapinto",
    code: "COL",
    number: "43",
    team: "Williams",
    accent: "#64C4FF",
    nationality: "Argentine",
    flagColors: ["#74ACDF", "#FFFFFF", "#74ACDF"],
  },
};

/** Returns raw fallback metadata for any unmatched driver ID */
export function getDriverFallback(driverId: string, name?: string): DriverMediaData {
  const parts = (name || driverId).split(" ");
  const lastPart = parts[parts.length - 1] || driverId;
  const code = lastPart.slice(0, 3).toUpperCase();

  return {
    id: driverId,
    code,
    number: "99",
    team: "Unknown Team",
    accent: "#8E8E93",
    nationality: "International",
    flagColors: ["#2C2C2E", "#3A3A3C", "#2C2C2E"],
  };
}
