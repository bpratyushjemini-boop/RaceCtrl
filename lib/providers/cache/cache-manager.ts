import fs from "fs";
import path from "path";

export class CacheManager {
  private static getCachePath(key: string): string {
    const cacheDir = path.join(process.cwd(), "data", "racectrl_cache");
    if (typeof window === "undefined" && !fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    return path.join(cacheDir, `${key.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);
  }

  /**
   * Retrieves item from cache if it exists and is within its TTL.
   */
  static get<T>(key: string, ttlMs: number): T | null {
    if (typeof window !== "undefined") return null;
    const file = this.getCachePath(key);
    if (!fs.existsSync(file)) return null;

    try {
      const stats = fs.statSync(file);
      const age = Date.now() - stats.mtimeMs;
      if (age > ttlMs) {
        return null; // Expired
      }
      return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
    } catch {
      return null;
    }
  }

  /**
   * Writes item to disk cache.
   */
  static set<T>(key: string, val: T): void {
    if (typeof window !== "undefined") return;
    const file = this.getCachePath(key);
    try {
      fs.writeFileSync(file, JSON.stringify(val, null, 2), "utf-8");
    } catch (e) {
      console.warn(`Failed to write cache file: ${file}`, e);
    }
  }
}
