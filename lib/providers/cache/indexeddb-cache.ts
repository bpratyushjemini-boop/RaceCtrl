/**
 * IndexedDB Cache — client-side persistent cache for offline PWA support.
 *
 * Supplements the server-side fs cache with browser-local storage:
 * - Stores standings, schedule, driver profiles for instant offline access
 * - TTL-based expiry with background refresh when online
 * - Graceful degradation — returns null if IndexedDB is unavailable
 */

const DB_NAME = "racectrl-cache";
const DB_VERSION = 1;
const STORE_NAME = "api-cache";

interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.reject(new Error("IndexedDB not available"));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Get a cached value from IndexedDB.
 * Returns null if the entry doesn't exist, is expired, or IndexedDB fails.
 */
export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise<T | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check TTL expiry
        if (Date.now() - entry.timestamp > entry.ttl) {
          // Expired — delete in background, return null
          idbDelete(key).catch(() => {});
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Store a value in IndexedDB with a TTL.
 * @param key Cache key
 * @param data Data to store
 * @param ttl Time-to-live in milliseconds (default: 30 minutes)
 */
export async function idbSet<T>(
  key: string,
  data: T,
  ttl: number = 30 * 60 * 1000
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
      };

      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Silently fail — cache is supplementary
  }
}

/**
 * Delete a single cache entry.
 */
export async function idbDelete(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve(); // Don't throw on delete failure
    });
  } catch {
    // Silently fail
  }
}

/**
 * Clear all cached entries.
 */
export async function idbClear(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch {
    // Silently fail
  }
}

/**
 * Get a value with a stale-while-revalidate strategy:
 * - Returns cached data immediately (even if stale)
 * - Triggers background refresh via the provided fetcher
 * - Next call will have fresh data
 */
export async function idbGetOrFetch<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  ttl: number = 30 * 60 * 1000
): Promise<T | null> {
  const cached = await idbGet<T>(key);

  if (cached !== null) {
    // Background refresh — fire and forget
    fetcher().then((fresh) => {
      if (fresh !== null) {
        idbSet(key, fresh, ttl).catch(() => {});
      }
    }).catch(() => {});

    return cached;
  }

  // No cache — fetch synchronously
  try {
    const data = await fetcher();
    if (data !== null) {
      await idbSet(key, data, ttl);
    }
    return data;
  } catch {
    return null;
  }
}
