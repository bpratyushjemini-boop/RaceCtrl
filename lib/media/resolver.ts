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

  const key = Object.keys(CONSTRUCTORS_MEDIA).find(
    (k) => normalize(k) === normalize(constructorId) || normalize(CONSTRUCTORS_MEDIA[k].name) === normalize(constructorId)
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
