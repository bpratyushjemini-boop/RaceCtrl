# RaceCtrl — Unified Motorsport Operating System

RaceCtrl is a premium, high-performance motorsport companion and workspace platform built with Next.js (App Router) using the Liquid Glass design system. It handles live timings, multi-series calendars, custom dashboard builders, and developer API engines.

---

## Technical Stack & Architecture

* **Framework**: Next.js 16 (App Router)
* **Styling**: Tailwind CSS & custom Liquid Glass variables (`app/globals.css`)
* **Logic & Types**: Strict TypeScript type-safety
* **Decoupled Data Providers**:
  * **Jolpica (Ergast API)**: Canonical standings and weekend classifications.
  * **Motorsport DB**: Offline-first provider handling WEC, Formula E, IndyCar, MotoGP, and 10 other championships.
  * **API Keys & Webhooks**: Client-persisted developer center.

---

## Core Features

1. **Workspace Dashboard Builder**: Drag-and-drop dashboard canvas that lets users resize, duplicate, toggle, and order widgets.
2. **Advanced Analytics Studio**: Custom interactive SVG pacing charts and Report Exporters.
3. **Developer Center**: API key generators, webhook endpoint configurations, and interactive docs.
4. **Presentation Mode**: Full-screen overlay with timing rows and auto-refresh ticking clocks.
5. **Unified Calendars & Glossaries**: Multi-series schedules filterable by category and racing glossaries.

---

## Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```

### 3. Run Linter
```bash
npm run lint
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## Directory Structure

* `/app`: Route pages including `/pro`, `/calendar`, `/encyclopedia`, `/more`.
* `/components`: Layout headers, ui glass cards, and specific pro workspaces widgets.
* `/lib`: Standings calculations, motorsport data arrays, and authentication scopes.
* `/public`: Static icons and media cards.
