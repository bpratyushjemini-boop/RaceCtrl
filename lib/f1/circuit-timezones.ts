const CIRCUIT_TIMEZONES: Record<string, string> = {
  albert_park: "Australia/Melbourne",
  bahrain: "Asia/Bahrain",
  jeddah: "Asia/Riyadh",
  suzuka: "Asia/Tokyo",
  shanghai: "Asia/Shanghai",
  miami: "America/New_York",
  imola: "Europe/Rome",
  monaco: "Europe/Monaco",
  villeneuve: "America/Toronto",
  barcelona: "Europe/Madrid",
  red_bull_ring: "Europe/Vienna",
  silverstone: "Europe/London",
  hungaroring: "Europe/Budapest",
  spa: "Europe/Brussels",
  zandvoort: "Europe/Amsterdam",
  monza: "Europe/Rome",
  baku: "Asia/Baku",
  marina_bay: "Asia/Singapore",
  americas: "America/Chicago",
  rodriguez: "America/Mexico_City",
  interlagos: "America/Sao_Paulo",
  vegas: "America/Los_Angeles",
  losail: "Asia/Qatar",
  yas_marina: "Asia/Dubai",
};

/**
 * Returns the proper IANA timezone for the circuit ID, falling back to UTC if unknown.
 */
export function getCircuitTimezone(circuitId?: string): string {
  if (!circuitId) return "UTC";
  return CIRCUIT_TIMEZONES[circuitId] || "UTC";
}
