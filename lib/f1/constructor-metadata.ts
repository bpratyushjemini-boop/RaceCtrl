export interface ConstructorMetadata {
  id: string;
  name: string;
  principal: string;
  carName: string;
  base: string;
  firstEntry: number;
  championships: number;
}

export const CONSTRUCTOR_METADATA_DB: Record<string, ConstructorMetadata> = {
  mclaren: {
    id: "mclaren",
    name: "McLaren",
    principal: "Andrea Stella",
    carName: "MCL38",
    base: "Woking, United Kingdom",
    firstEntry: 1966,
    championships: 8,
  },
  ferrari: {
    id: "ferrari",
    name: "Ferrari",
    principal: "Frédéric Vasseur",
    carName: "SF-24",
    base: "Maranello, Italy",
    firstEntry: 1950,
    championships: 16,
  },
  red_bull: {
    id: "red_bull",
    name: "Red Bull Racing",
    principal: "Christian Horner",
    carName: "RB20",
    base: "Milton Keynes, United Kingdom",
    firstEntry: 1997,
    championships: 6,
  },
  mercedes: {
    id: "mercedes",
    name: "Mercedes-AMG",
    principal: "Toto Wolff",
    carName: "W15",
    base: "Brackley, United Kingdom",
    firstEntry: 1954,
    championships: 8,
  },
  aston_martin: {
    id: "aston_martin",
    name: "Aston Martin",
    principal: "Mike Krack",
    carName: "AMR24",
    base: "Silverstone, United Kingdom",
    firstEntry: 1959,
    championships: 0,
  },
  alpine: {
    id: "alpine",
    name: "Alpine",
    principal: "Oliver Oakes",
    carName: "A524",
    base: "Enstone, United Kingdom",
    firstEntry: 1986,
    championships: 2,
  },
  haas: {
    id: "haas",
    name: "Haas F1 Team",
    principal: "Ayao Komatsu",
    carName: "VF-24",
    base: "Kannapolis, United States",
    firstEntry: 2016,
    championships: 0,
  },
  sauber: {
    id: "sauber",
    name: "Kick Sauber",
    principal: "Alessandro Alunni Bravi",
    carName: "C44",
    base: "Hinwil, Switzerland",
    firstEntry: 1993,
    championships: 0,
  },
  williams: {
    id: "williams",
    name: "Williams",
    principal: "James Vowles",
    carName: "FW46",
    base: "Grove, United Kingdom",
    firstEntry: 1977,
    championships: 9,
  },
  rb: {
    id: "rb",
    name: "RB F1 Team",
    principal: "Laurent Mekies",
    carName: "VCARB 01",
    base: "Faenza, Italy",
    firstEntry: 1985,
    championships: 0,
  },
};

export function getConstructorMetadata(id: string): ConstructorMetadata | null {
  if (!id) return null;
  return CONSTRUCTOR_METADATA_DB[id] || null;
}
