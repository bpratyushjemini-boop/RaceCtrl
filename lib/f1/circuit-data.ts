export interface CircuitMetadata {
  trackLength: string;
  lapCount: number;
  raceDistance: string;
  firstGrandPrix: number;
}

const CIRCUIT_METADATA_DB: Record<string, CircuitMetadata> = {
  albert_park: {
    trackLength: "5.278 km",
    lapCount: 58,
    raceDistance: "306.124 km",
    firstGrandPrix: 1996,
  },
  bahrain: {
    trackLength: "5.412 km",
    lapCount: 57,
    raceDistance: "308.238 km",
    firstGrandPrix: 2004,
  },
  jeddah: {
    trackLength: "6.174 km",
    lapCount: 50,
    raceDistance: "308.450 km",
    firstGrandPrix: 2021,
  },
  suzuka: {
    trackLength: "5.807 km",
    lapCount: 53,
    raceDistance: "307.471 km",
    firstGrandPrix: 1987,
  },
  shanghai: {
    trackLength: "5.451 km",
    lapCount: 56,
    raceDistance: "305.066 km",
    firstGrandPrix: 2004,
  },
  miami: {
    trackLength: "5.412 km",
    lapCount: 57,
    raceDistance: "308.326 km",
    firstGrandPrix: 2022,
  },
  imola: {
    trackLength: "4.909 km",
    lapCount: 63,
    raceDistance: "309.049 km",
    firstGrandPrix: 1980,
  },
  monaco: {
    trackLength: "3.337 km",
    lapCount: 78,
    raceDistance: "260.286 km",
    firstGrandPrix: 1950,
  },
  villeneuve: {
    trackLength: "4.361 km",
    lapCount: 70,
    raceDistance: "305.270 km",
    firstGrandPrix: 1978,
  },
  barcelona: {
    trackLength: "4.657 km",
    lapCount: 66,
    raceDistance: "307.236 km",
    firstGrandPrix: 1991,
  },
  red_bull_ring: {
    trackLength: "4.318 km",
    lapCount: 71,
    raceDistance: "306.452 km",
    firstGrandPrix: 1970,
  },
  silverstone: {
    trackLength: "5.891 km",
    lapCount: 52,
    raceDistance: "306.198 km",
    firstGrandPrix: 1950,
  },
  hungaroring: {
    trackLength: "4.381 km",
    lapCount: 70,
    raceDistance: "306.630 km",
    firstGrandPrix: 1986,
  },
  spa: {
    trackLength: "7.004 km",
    lapCount: 44,
    raceDistance: "308.052 km",
    firstGrandPrix: 1950,
  },
  zandvoort: {
    trackLength: "4.259 km",
    lapCount: 72,
    raceDistance: "306.587 km",
    firstGrandPrix: 1952,
  },
  monza: {
    trackLength: "5.793 km",
    lapCount: 53,
    raceDistance: "306.900 km",
    firstGrandPrix: 1950,
  },
  baku: {
    trackLength: "6.003 km",
    lapCount: 51,
    raceDistance: "306.049 km",
    firstGrandPrix: 2016,
  },
  marina_bay: {
    trackLength: "4.940 km",
    lapCount: 62,
    raceDistance: "306.143 km",
    firstGrandPrix: 2008,
  },
  americas: {
    trackLength: "5.513 km",
    lapCount: 56,
    raceDistance: "308.405 km",
    firstGrandPrix: 2012,
  },
  rodriguez: {
    trackLength: "4.304 km",
    lapCount: 71,
    raceDistance: "305.354 km",
    firstGrandPrix: 1963,
  },
  interlagos: {
    trackLength: "4.309 km",
    lapCount: 71,
    raceDistance: "305.879 km",
    firstGrandPrix: 1973,
  },
  vegas: {
    trackLength: "6.201 km",
    lapCount: 50,
    raceDistance: "309.958 km",
    firstGrandPrix: 2023,
  },
  losail: {
    trackLength: "5.419 km",
    lapCount: 57,
    raceDistance: "308.611 km",
    firstGrandPrix: 2021,
  },
  yas_marina: {
    trackLength: "5.281 km",
    lapCount: 58,
    raceDistance: "306.183 km",
    firstGrandPrix: 2009,
  },
};

/**
 * Retrieves the verified curated metadata for a circuit, or null if unavailable.
 */
export function getCircuitMetadata(circuitId?: string): CircuitMetadata | null {
  if (!circuitId) return null;
  return CIRCUIT_METADATA_DB[circuitId] || null;
}
