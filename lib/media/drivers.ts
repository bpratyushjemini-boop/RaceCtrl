export interface DriverMediaData {
  id: string;
  code: string;
  number: string;
  team: string;
  accent: string;
  nationality: string;
  flagColors: string[]; // Gradients for flag
  portrait?: string;
  focalPosition?: string;
  attribution?: string;
  fallback?: {
    gradient: string[];
    accent: string;
    code: string;
    number: string;
  };
}

export const DRIVERS_MEDIA: Record<string, DriverMediaData> = {
  hamilton: {
    id: "hamilton",
    code: "HAM",
    number: "44",
    team: "Mercedes",
    accent: "#27F4D2",
    nationality: "British",
    flagColors: ["#00247D", "#FFFFFF", "#CF142B"],
  },
  max_verstappen: {
    id: "max_verstappen",
    code: "VER",
    number: "1",
    team: "Red Bull",
    accent: "#3671C6",
    nationality: "Dutch",
    flagColors: ["#AE1C28", "#FFFFFF", "#21468B"],
  },
  norris: {
    id: "norris",
    code: "NOR",
    number: "4",
    team: "McLaren",
    accent: "#FF8000",
    nationality: "British",
    flagColors: ["#00247D", "#FFFFFF", "#CF142B"],
  },
  leclerc: {
    id: "leclerc",
    code: "LEC",
    number: "16",
    team: "Ferrari",
    accent: "#E8002D",
    nationality: "Monégasque",
    flagColors: ["#D11919", "#FFFFFF", "#D11919"],
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
  sainz: {
    id: "sainz",
    code: "SAI",
    number: "55",
    team: "Ferrari",
    accent: "#E8002D",
    nationality: "Spanish",
    flagColors: ["#AA151B", "#F1BF00", "#AA151B"],
  },
  russell: {
    id: "russell",
    code: "RUS",
    number: "63",
    team: "Mercedes",
    accent: "#27F4D2",
    nationality: "British",
    flagColors: ["#00247D", "#FFFFFF", "#CF142B"],
  },
  perez: {
    id: "perez",
    code: "PER",
    number: "11",
    team: "Red Bull",
    accent: "#3671C6",
    nationality: "Mexican",
    flagColors: ["#006847", "#FFFFFF", "#CE1126"],
  },
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
  hulkenberg: {
    id: "hulkenberg",
    code: "HUL",
    number: "27",
    team: "Haas F1 Team",
    accent: "#B6BABD",
    nationality: "German",
    flagColors: ["#000000", "#DD0000", "#FFCE00"],
  },
  tsunoda: {
    id: "tsunoda",
    code: "TSU",
    number: "22",
    team: "RB F1 Team",
    accent: "#6692FF",
    nationality: "Japanese",
    flagColors: ["#FFFFFF", "#BC002D", "#FFFFFF"],
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
  gasly: {
    id: "gasly",
    code: "GAS",
    number: "10",
    team: "Alpine",
    accent: "#FF87BC",
    nationality: "French",
    flagColors: ["#0055A5", "#FFFFFF", "#EF4135"],
  },
  ocon: {
    id: "ocon",
    code: "OCO",
    number: "31",
    team: "Alpine",
    accent: "#FF87BC",
    nationality: "French",
    flagColors: ["#0055A5", "#FFFFFF", "#EF4135"],
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
  colapinto: {
    id: "colapinto",
    code: "COL",
    number: "43",
    team: "Williams",
    accent: "#64C4FF",
    nationality: "Argentine",
    flagColors: ["#74ACDF", "#FFFFFF", "#74ACDF"],
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
  magnussen: {
    id: "magnussen",
    code: "MAG",
    number: "20",
    team: "Haas F1 Team",
    accent: "#B6BABD",
    nationality: "Danish",
    flagColors: ["#C8102E", "#FFFFFF", "#C8102E"],
  },
  bearman: {
    id: "bearman",
    code: "BEA",
    number: "87",
    team: "Ferrari",
    accent: "#E8002D",
    nationality: "British",
    flagColors: ["#00247D", "#FFFFFF", "#CF142B"],
  },
};

// Returns raw fallback metadata for any unmatched driver ID
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
