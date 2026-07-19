/**
 * Weather Provider — fetches current conditions and forecasts via Open-Meteo.
 * Free API, no key required. Perfect for Vercel / serverless deployment.
 *
 * Uses circuit GPS coordinates from schedule data to provide:
 * - Current conditions (temperature, wind, precipitation)
 * - Hourly forecast for session windows
 * - Race weekend weather outlook
 */

export interface WeatherConditions {
  temperature: number; // °C
  feelsLike: number;
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: number; // degrees
  precipitation: number; // mm
  cloudCover: number; // %
  weatherCode: number;
  isDay: boolean;
  description: string;
  icon: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  icon: string;
}

export interface WeatherForecast {
  current: WeatherConditions;
  hourly: HourlyForecast[];
  location: { latitude: number; longitude: number };
  timezone: string;
  lastUpdated: number;
}

// WMO Weather interpretation codes → human-readable
const WMO_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Fog", icon: "🌫️" },
  48: { description: "Depositing rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌦️" },
  55: { description: "Dense drizzle", icon: "🌧️" },
  56: { description: "Light freezing drizzle", icon: "🌨️" },
  57: { description: "Dense freezing drizzle", icon: "🌨️" },
  61: { description: "Slight rain", icon: "🌧️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Light freezing rain", icon: "🌨️" },
  67: { description: "Heavy freezing rain", icon: "🌨️" },
  71: { description: "Slight snow fall", icon: "🌨️" },
  73: { description: "Moderate snow fall", icon: "🌨️" },
  75: { description: "Heavy snow fall", icon: "❄️" },
  77: { description: "Snow grains", icon: "❄️" },
  80: { description: "Slight rain showers", icon: "🌦️" },
  81: { description: "Moderate rain showers", icon: "🌧️" },
  82: { description: "Violent rain showers", icon: "⛈️" },
  85: { description: "Slight snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "❄️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️" },
};

function decodeWMO(code: number): { description: string; icon: string } {
  return WMO_CODES[code] || { description: "Unknown", icon: "❓" };
}

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1";

// Cache: 10 minutes for weather data (server-side in-memory)
const weatherCache = new Map<string, { data: WeatherForecast; expires: number }>();
const CACHE_TTL = 10 * 60 * 1000;

/**
 * Fetch current weather and hourly forecast for a given location.
 * Returns null on failure — never throws.
 */
export async function getWeather(
  latitude: number,
  longitude: number
): Promise<WeatherForecast | null> {
  // Only run server-side
  if (typeof window !== "undefined") return null;

  const cacheKey = `weather_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "wind_speed_10m",
        "wind_direction_10m",
        "precipitation",
        "cloud_cover",
        "weather_code",
        "is_day",
      ].join(","),
      hourly: [
        "temperature_2m",
        "precipitation",
        "precipitation_probability",
        "wind_speed_10m",
        "weather_code",
      ].join(","),
      forecast_days: "3",
      timezone: "auto",
    });

    const response = await fetch(`${OPEN_METEO_BASE}/forecast?${params}`, {
      next: { revalidate: 600 }, // Next.js ISR: 10 minutes
    });

    if (!response.ok) {
      console.warn(`[WeatherProvider] Open-Meteo returned ${response.status}`);
      return null;
    }

    const data = await response.json();

    const wmo = decodeWMO(data.current?.weather_code ?? 0);

    const forecast: WeatherForecast = {
      current: {
        temperature: data.current?.temperature_2m ?? 0,
        feelsLike: data.current?.apparent_temperature ?? 0,
        humidity: data.current?.relative_humidity_2m ?? 0,
        windSpeed: data.current?.wind_speed_10m ?? 0,
        windDirection: data.current?.wind_direction_10m ?? 0,
        precipitation: data.current?.precipitation ?? 0,
        cloudCover: data.current?.cloud_cover ?? 0,
        weatherCode: data.current?.weather_code ?? 0,
        isDay: data.current?.is_day === 1,
        description: wmo.description,
        icon: wmo.icon,
      },
      hourly: (data.hourly?.time ?? []).slice(0, 48).map((time: string, i: number) => {
        const hourWmo = decodeWMO(data.hourly?.weather_code?.[i] ?? 0);
        return {
          time,
          temperature: data.hourly?.temperature_2m?.[i] ?? 0,
          precipitation: data.hourly?.precipitation?.[i] ?? 0,
          precipitationProbability: data.hourly?.precipitation_probability?.[i] ?? 0,
          windSpeed: data.hourly?.wind_speed_10m?.[i] ?? 0,
          weatherCode: data.hourly?.weather_code?.[i] ?? 0,
          description: hourWmo.description,
          icon: hourWmo.icon,
        };
      }),
      location: { latitude, longitude },
      timezone: data.timezone ?? "UTC",
      lastUpdated: Date.now(),
    };

    weatherCache.set(cacheKey, { data: forecast, expires: Date.now() + CACHE_TTL });

    return forecast;
  } catch (err) {
    console.warn("[WeatherProvider] Failed to fetch weather:", err);
    return null;
  }
}

/**
 * Get a rain risk assessment string for the next N hours.
 */
export function getRainRisk(forecast: WeatherForecast, hours: number = 6): string {
  const upcoming = forecast.hourly.slice(0, hours);
  const maxPrecipProb = Math.max(0, ...upcoming.map((h) => h.precipitationProbability));
  const totalPrecip = upcoming.reduce((sum, h) => sum + h.precipitation, 0);

  if (maxPrecipProb >= 70 || totalPrecip > 5) return "High rain risk";
  if (maxPrecipProb >= 40 || totalPrecip > 1) return "Moderate rain risk";
  if (maxPrecipProb >= 15) return "Low rain risk";
  return "Dry conditions expected";
}

/**
 * Get a wind assessment for the circuit.
 */
export function getWindAssessment(windSpeed: number): string {
  if (windSpeed >= 50) return "Very strong winds";
  if (windSpeed >= 30) return "Strong winds";
  if (windSpeed >= 15) return "Moderate winds";
  return "Light winds";
}
