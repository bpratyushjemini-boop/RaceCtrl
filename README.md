# RaceCtrl — Unified Formula 1 Data Platform

RaceCtrl is a premium, high-performance Formula 1 session companion built with Next.js (App Router), leveraging the Liquid Glass design language. It integrates multiple specialized data providers to deliver canonical championship contexts, analytics, and live session timings.

---

## Data Platform Architecture

RaceCtrl decouples components from data fetching details using a **Unified Data Providers Layer** located in `lib/providers/`. Queries are resolved dynamically by the coordinator based on data requirements:

```
                  [ Next.js Client / UI Pages ]
                                │
                                ▼
                       [ F1Coordinator Service ]
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
  [ JolpicaProvider ]   [ FastF1Provider ]     [ LiveF1Provider ]
          │                     │                     │
      REST API            Python Bridge         Python Bridge
   (api.jolpi.ca)      (fastf1_bridge.py)     (livef1_bridge.py)
          │                     │                     │
          └─────────────┬───────┴─────────────────────┘
                        ▼
                 [ CacheManager ] (Local File / In-Memory TTL)
```

### Specialized Data Providers
1.  **Jolpica (Ergast API)**: Served as the canonical championship database. Responsible for seasons metadata, driver and constructor profiles, weekend schedules, and final race classifications.
2.  **FastF1**: Used exclusively for post-session analytics: driver speed/throttle telemetry, tire stints, stint lengths, laps comparisons, and sector time distribution maps.
3.  **LiveF1**: Powering live active session timings: Safety Car flags (SC, VSC, Red, Green), live classifications list, intervals, gaps, and session control warnings.

---

## Caching Strategy

To prevent redundant API hits and keep sub-process triggers to a minimum, RaceCtrl enforces provider-aware TTL caches via `CacheManager` (`lib/providers/cache/cache-manager.ts`):

| Data Type | Cache TTL | Backend Storage | Provider |
| :--- | :--- | :--- | :--- |
| **Standings & Profiles** | 24 Hours (Long) | File System / REST CDN | Jolpica |
| **Race Schedule** | 1 Hour (Medium) | File System / REST CDN | Jolpica |
| **Historical Telemetry** | 30 Days (Very Long) | `.fastf1_raw_cache` / File System | FastF1 |
| **Active Live Timing** | 5 Seconds (Very Short) | File System (`livef1_cache`) | LiveF1 |

---

## Local Setup

RaceCtrl requires only a standard Node.js environment to run.

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## Deployment & Fallback System

Because serverless runtimes (like Vercel) have execution limits:
* **Pure HTTP Stack**: All telemetry, timings, weather, and news are fetched using high-performance, lightweight HTTP endpoints.
* **Graceful Degradation**: If an external provider experiences downtime, the coordinator automatically serves offline fallback data or caches, ensuring that empty pages are never shown to the user.


---

## Adding New Data Providers

All new providers must adhere to the `BaseProvider` interface (`lib/providers/base.ts`):

```typescript
export interface BaseProvider {
  name: string;
  fetch(key: string, ...args: any[]): Promise<any>;
  normalize(key: string, data: any, context?: any): any;
  validate(key: string, data: any): boolean;
}
```

Implement your provider under `lib/providers/new-source/` and register it inside the routing manager `lib/providers/services/f1-coordinator.ts`.
