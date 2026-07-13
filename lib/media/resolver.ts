import { DRIVERS_MEDIA, getDriverFallback, type DriverMediaData } from "./drivers";
import { CONSTRUCTORS_MEDIA, getConstructorFallback, type ConstructorMediaData } from "./constructors";
import { CIRCUITS_MEDIA, getCircuitFallback, type CircuitMediaData } from "./circuits";

// Normalizes input strings for matching
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

export function resolveDriverMedia(driverId: string, name?: string): DriverMediaData {
  if (!driverId) {
    const fb = getDriverFallback("unknown", name);
    return {
      ...fb,
      fallback: {
        gradient: fb.flagColors,
        accent: fb.accent,
        code: fb.code,
        number: fb.number
      }
    };
  }
  
  const key = Object.keys(DRIVERS_MEDIA).find(
    (k) => normalize(k) === normalize(driverId) || normalize(DRIVERS_MEDIA[k].code) === normalize(driverId)
  );

  const matched = key ? DRIVERS_MEDIA[key] : getDriverFallback(driverId, name);
  return {
    ...matched,
    fallback: {
      gradient: matched.flagColors,
      accent: matched.accent,
      code: matched.code,
      number: matched.number,
    }
  };
}

import { normalizeConstructorId } from "@/lib/f1/normalize";

export function resolveConstructorMedia(constructorId: string): ConstructorMediaData {
  if (!constructorId) {
    const fb = getConstructorFallback("unknown");
    return {
      ...fb,
      fallback: {
        accent: fb.accent,
        secondary: fb.secondary,
        pattern: fb.pattern
      }
    };
  }

  const canonicalId = normalizeConstructorId(constructorId);
  const key = Object.keys(CONSTRUCTORS_MEDIA).find(
    (k) => normalize(k) === normalize(canonicalId) || normalize(CONSTRUCTORS_MEDIA[k].name) === normalize(canonicalId)
  );

  const matched = key ? CONSTRUCTORS_MEDIA[key] : getConstructorFallback(constructorId);
  return {
    ...matched,
    fallback: {
      accent: matched.accent,
      secondary: matched.secondary,
      pattern: matched.pattern,
    }
  };
}

export function resolveCircuitMedia(circuitId: string): CircuitMediaData {
  if (!circuitId) {
    const fb = getCircuitFallback("unknown");
    return {
      ...fb,
      fallback: {
        svgPath: fb.svgPath,
        viewBox: fb.viewBox,
        country: fb.country || "International"
      }
    };
  }

  const key = Object.keys(CIRCUITS_MEDIA).find(
    (k) => normalize(k) === normalize(circuitId) || normalize(CIRCUITS_MEDIA[k].name) === normalize(circuitId)
  );

  const matched = key ? CIRCUITS_MEDIA[key] : getCircuitFallback(circuitId);
  return {
    ...matched,
    fallback: {
      svgPath: matched.svgPath,
      viewBox: matched.viewBox,
      country: matched.country || "International",
    }
  };
}

export interface RaceIdentity {
  visualAccent: string;
  secondaryAccent: string;
  locationLabel: string;
  fallbackGradient: string;
}

const RACE_IDENTITIES: Record<string, Omit<RaceIdentity, "fallbackGradient">> = {
  monaco: {
    visualAccent: "#D4AF37", // Gold
    secondaryAccent: "#1E3A8A", // Mediterranean blue
    locationLabel: "Monte Carlo",
  },
  silverstone: {
    visualAccent: "#0B5C36", // Racing green
    secondaryAccent: "#1F2937", // Technical dark gray
    locationLabel: "Silverstone",
  },
  spa: {
    visualAccent: "#2E4B3D", // Forest green
    secondaryAccent: "#065F46", // Cool pine
    locationLabel: "Spa-Francorchamps",
  },
  suzuka: {
    visualAccent: "#C8102E", // Red
    secondaryAccent: "#111827", // Asphalt
    locationLabel: "Suzuka",
  },
  albert_park: {
    visualAccent: "#FF8C42", // Albert Park orange
    secondaryAccent: "#047857", // Park green
    locationLabel: "Melbourne",
  },
  monza: {
    visualAccent: "#E8002D", // Italian Red
    secondaryAccent: "#15803D", // Monza green
    locationLabel: "Monza",
  },
  marina_bay: {
    visualAccent: "#00C2D1", // Neon teal
    secondaryAccent: "#312E81", // Indigo night
    locationLabel: "Marina Bay",
  },
  vegas: {
    visualAccent: "#B026FF", // Neon purple
    secondaryAccent: "#F59E0B", // Amber Strip
    locationLabel: "Las Vegas",
  },
  yas_marina: {
    visualAccent: "#E8973D", // Desert gold
    secondaryAccent: "#0369A1", // Yas blue
    locationLabel: "Yas Island",
  },
  hungaroring: {
    visualAccent: "#00904B", // Hungarian green
    secondaryAccent: "#C8102E", // Hungarian red
    locationLabel: "Mogyoród",
  },
};

export function getRaceIdentity(circuitId: string): RaceIdentity {
  const normId = (circuitId || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  
  // Find key matching normalized circuitId
  const matchedKey = Object.keys(RACE_IDENTITIES).find(
    (k) => k.replace(/[^a-z0-9]/g, "") === normId
  );
  
  const identity = matchedKey ? RACE_IDENTITIES[matchedKey] : {
    visualAccent: "#FF453A", // Neutral RaceCtrl Red
    secondaryAccent: "#2C2C2E", // Neutral gray
    locationLabel: "International",
  };
  
  return {
    ...identity,
    fallbackGradient: `linear-gradient(135deg, ${identity.visualAccent}1C 0%, ${identity.secondaryAccent}0F 50%, var(--color-bg) 100%)`,
  };
}
