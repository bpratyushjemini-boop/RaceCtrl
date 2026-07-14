# Security Audit Report

**Audit Date**: July 15, 2026

## Areas Inspected

1. **Client-Side Secret Exposure**: Audited configuration files, service workers, environment variables (`process.env` / `NEXT_PUBLIC_*`), and source maps.
2. **Server / Client Boundaries**: Inspected client components (`"use client"`), props, and serialized data payloads to prevent accidental server logic leaks.
3. **HTTP Security Headers**: Reviewed standard Next.js headers config, Permissions Policy, HSTS, and clickjacking protection (CSP).
4. **XSS & Unsafe Rendering**: Searched for dangerous execution points (`dangerouslySetInnerHTML`, `eval`, `new Function`, `innerHTML`).
5. **URL & Navigation Safety**: Verified external links configuration (`rel="noopener noreferrer"`) and validated dynamic URL parameters.
6. **API Data Validation**: Hardened F1 API response extraction to prevent application crashes from external trust boundary payloads.
7. **Fetch Resilience**: Audited fetch configurations, added request timeouts, and validated response content-types.
8. **Client Storage (localStorage)**: Hardened parsing and retrieval of user favorites, preferences, and dismissed banners.
9. **Notification & Push Security**: Evaluated permission requests (user-interaction bound) and validated redirect target URLs in push and click handlers.
10. **Service Worker/PWA Safety**: Audited service worker registration, navigation fallbacks, and redirection validation.
11. **Dependencies**: Checked `package.json` and audited dependencies for known vulnerabilities.
12. **Git Hygiene**: Checked `.gitignore` for standard secret exclusions.

---

## Verified Findings

### Critical
*No critical vulnerabilities were found in the codebase.*

### High
*No high severity vulnerabilities were found.*

### Medium
- **M1: Moderate Vulnerability in postcss**: `postcss` version < 8.5.10 (transitive dependency of `next`) contains a vulnerability allowing XSS via unescaped CSS stringify outputs.
- **M2: Potential Open Redirect in Service Worker**: Redirection logic in `public/sw.js` push notification click handler did not check path prefixes, allowing potential protocol-relative redirection injection (e.g. `//evil.com`).
- **M3: Missing Production Security Headers**: Next.js configuration lacked production-grade HTTP security policies (CSP, Permissions Policy, HSTS), making the app vulnerable to clickjacking and script injection.

### Low
- **L1: Missing localStorage Payload Type Guarding**: Parsing storage items (`racectrl_favorites`, `racectrl_notifications`) did not validate internal types, potentially causing a application crash if the browser storage was corrupted or tampered with.
- **L2: Dynamic API Parameter Traversal**: Dynamic routing inputs like `driverId` and `circuitId` were not validated before requesting the Ergast/Jolpica endpoints, leaving open path traversal and parameter injection vectors.
- **L3: Missing Fetch Timeouts**: Dynamic requests to `https://api.jolpi.ca/` were not bound by execution timeouts, making pages vulnerable to hanging fetches on slow networks.
- **L4: Error Information Leakage**: The session-reminders cron route exposed internal error message details to users in production responses.

---

## Fixes Implemented

1. **Dependency Overrides**: Added `overrides` block in `package.json` for `postcss: ^8.5.10` which resolved the security warning successfully.
2. **Security Headers in `next.config.ts`**:
   - Implemented strict same-origin CSP (allowing `unsafe-inline` styles and conditionally restricting `unsafe-eval` to development only for hot reload compatibility).
   - Configured `X-Content-Type-Options: nosniff`.
   - Configured `Referrer-Policy: strict-origin-when-cross-origin`.
   - Disabled unused browser features (camera, microphone, geolocation, bluetooth, etc.) in `Permissions-Policy`.
   - Configured Strict-Transport-Security (`max-age=31536000`).
   - Configured `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` to block clickjacking.
3. **API & Fetch Hardening**:
   - Implemented `AbortSignal.timeout(8000)` in `fetchF1` to abort requests hanging over 8 seconds.
   - Enforced `Content-Type` header verification before reading response body JSON.
   - Created safe parameter regex helper `isSafeId` (`^[a-zA-Z0-9_-]+$`) to validate all user-controlled variables.
   - Added robust filtering and structure validation in all F1 API response handlers.
4. **Client Storage & SW Hardening**:
   - Added strict validation checks in `useFavorites` and `preferences.ts` load functions to ensure parsed localStorage data strictly adheres to expected structures and types.
   - Validated install dismissed timestamps against `isNaN`.
   - Hardened `public/sw.js` url validation against protocol-relative, protocol-absolute, and backslash paths.
5. **Cron Error Redaction**: Redacted exception messages in `session-reminders/route.ts` response payload, logging them securely to the server console instead.

---

## Dependency Audit Summary

Run of `npm audit` returned:
- **Total Vulnerabilities**: 0
- Overrode transient dependency `postcss` to `^8.5.10` to address the CSS Stringify moderate vulnerability.

---

## Residual Risks

1. **Local storage tampering**: A user or a malicious browser extension can edit `localStorage` values. Since the values are not authenticated or encrypted, they can be corrupted. However, our new validation checks ensure that corrupted storage values do not crash the application.
2. **External API dependency**: The app depends entirely on the public Jolpica F1 API. If it is down or returns corrupted data, the application will fallback to cached mocks.
3. **PWA Offline Sync**: The Service Worker caches HTML pages and fallbacks to the offline page. Cached content could be stale, but is mitigated by standard Cache-Control headers and dynamic network-first loading.

---

## Future Security Recommendations

1. **Subresource Integrity (SRI)**: If any external CDN scripts are introduced in the future, ensure SRI hashes are added to block code tampering.
2. **Data Encryption**: If sensitive user information is ever stored locally in the future, encrypt the data before persisting to localStorage using Web Crypto APIs.
