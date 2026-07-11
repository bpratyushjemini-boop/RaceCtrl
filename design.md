---
version: alpha
name: RaceCtrl
description: Liquid Glass instrument cluster for a premium personal Formula 1 companion — calm, dark, precise. Not a news app.
colors:
  primary: "#FF453A"            # Race Red — the app's single call-to-action color
  secondary: "#0A84FF"          # Telemetry Blue — informational accents, links, selection
  tertiary: "#30D158"           # Podium Green — DRS active, green flag, positive deltas
  fastest: "#BF5AF2"            # Purple — fastest sector/lap (F1 timing-tower convention)
  neutral: "#000000"            # True Black canvas — fixed across every theme
  surface: "#1C1C1E"            # Base glass sheet fill (nav bars, cards, rows)
  surface-variant: "#2C2C2E"    # Nested/secondary glass fill (chips, inputs, tiles)
  outline: "#38383A"            # Hairline border on every glass edge
  on-surface: "#F5F5F7"         # Primary text/icon on dark
  on-surface-variant: "#8E8E93" # Secondary/tertiary text, resting icons
  on-primary: "#FFFFFF"         # Text/icon on Race Red or Purple fills
  on-warning: "#1C1C1E"         # Text/icon on Yellow Flag fills
  warning: "#FFD60A"            # Yellow flag
  error: "#FF453A"              # Red flag — intentionally shares Race Red's value
typography:
  display-hero:
    fontFamily: SF Pro Display
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: SF Pro Display
    fontSize: 34px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.01em
  headline-md:
    fontFamily: SF Pro Display
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: SF Pro Display
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: SF Pro Text
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: SF Pro Text
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.4
  body-md:
    fontFamily: SF Pro Text
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.4
  body-sm:
    fontFamily: SF Pro Text
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.35
  label-md:
    fontFamily: SF Pro Text
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.01em
  label-caps:
    fontFamily: SF Pro Text
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0.06em
  caption:
    fontFamily: SF Pro Text
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0.02em
  telemetry-numeric:
    fontFamily: SF Pro Display
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.1
    fontFeature: '"tnum" 1, "lnum" 1'
rounded:
  sm: 12px
  md: 16px
  lg: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
components:
  canvas:
    backgroundColor: "{colors.neutral}"
  nav-bar-top:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    height: 52px
    padding: "{spacing.lg}"
  tab-bar:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    rounded: "{rounded.lg}"
    height: 64px
    padding: "{spacing.sm}"
  glass-card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
    height: 50px
  button-primary-pressed:
    backgroundColor: "#D6382F"
  button-secondary:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.md}"
    height: 50px
  button-secondary-pressed:
    backgroundColor: "#3A3A3C"
  chip-status:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
    height: 24px
  chip-status-live:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
  chip-status-drs:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-primary}"
  chip-status-fastest:
    backgroundColor: "{colors.fastest}"
    textColor: "{colors.on-primary}"
  list-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    padding: "{spacing.lg}"
    height: 56px
  list-item-pressed:
    backgroundColor: "{colors.surface-variant}"
  metadata-label:
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.caption}"
  leaderboard-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.telemetry-numeric}"
    padding: "{spacing.md}"
    height: 52px
  leaderboard-row-fastest:
    textColor: "{colors.fastest}"
  flag-banner:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-warning}"
    typography: "{typography.headline-sm}"
    height: 44px
  flag-banner-red:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
  countdown-tile:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.on-surface}"
    typography: "{typography.display-hero}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  tooltip:
    backgroundColor: "#3A3A3C"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  checkbox:
    backgroundColor: "{colors.surface-variant}"
    borderColor: "{colors.outline}"
    rounded: 6px
    size: 22px
  checkbox-checked:
    backgroundColor: "{colors.secondary}"
  radio:
    backgroundColor: "{colors.surface-variant}"
    borderColor: "{colors.outline}"
    rounded: "{rounded.full}"
    size: 22px
  radio-selected:
    backgroundColor: "{colors.secondary}"
  input-field:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.sm}"
    padding: "{spacing.lg}"
    height: 48px
circuitThemes:
  australia: "#FF8C42"     # Sunrise amber — Albert Park
  monaco: "#D4AF37"        # Luxury gold
  silverstone: "#0B5C36"   # British Racing Green
  spa: "#2E4B3D"           # Forest rain, muted and wet
  monza: "#C8102E"         # Circuit Red — deeper and more saturated than Race Red
  singapore: "#00C2D1"     # Electric cyan — neon night race
  las_vegas: "#B026FF"     # Purple neon — the Strip
  abu_dhabi: "#E8973D"     # Sunset gold — warmer than Monaco's
---

# RaceCtrl

## Overview

RaceCtrl is a premium **personal** Formula 1 companion — not a news app, not a broadcast-adjacent content hub. The entire product exists to answer one question the instant it opens: *what's happening right now, and where does my favorite driver stand?* Every screen is designed to be understood in under 10 seconds, glanced at and put away.

The emotional register is the calm confidence of a race engineer's pit-wall monitor, not the breathless urgency of a sports-news feed. Target user: an engaged, knowledgeable F1 fan who doesn't need articles or explainers — they need fast, precise, beautifully rendered numbers. The tone is dense with information but never cluttered; density is achieved through hierarchy and glass layering, not through smaller text or more chrome.

RaceCtrl must never visually resemble the official F1 app. Where that app is a broadcast-branded content hub (red/black corporate chrome, editorial feeds, video-first), RaceCtrl reads like an Apple system app that happens to be about racing — closer in spirit to Weather or Stocks than to any sports-media property. Dark Mode only, iPhone-first, installable as a PWA, responsive up to tablet/desktop widths.

## Colors

The palette is fixed True Black with two rotating system-accent colors and a small set of racing-specific semantic colors borrowed directly from real F1 timing-tower conventions, so the meanings are already familiar to the target user.

- **Primary — Race Red (#FF453A):** the app's only call-to-action color. Used for the single most important action per screen and doubles deliberately as the Red Flag / critical-state color — reinforcing "stop" the same way it does on track.
- **Secondary — Telemetry Blue (#0A84FF):** informational accents — links, selection states, active toggle fills.
- **Tertiary — Podium Green (#30D158):** DRS-active indicators, green-flag state, positive lap-time deltas.
- **Fastest — Purple (#BF5AF2):** fastest sector or lap, matching the purple used on real F1 timing towers so the convention transfers instantly.
- **Neutral — True Black (#000000):** the fixed canvas. Never tinted, never replaced, regardless of race-weekend theme.
- **Surface (#1C1C1E) / Surface Variant (#2C2C2E):** the two glass-sheet fills used for every card, row, and control.
- **Outline (#38383A):** the hairline that edges every glass surface.
- **On-Surface (#F5F5F7):** primary text — a warm off-white rather than pure white, softening glare against True Black while staying comfortably within AA contrast.
- **On-Surface Variant (#8E8E93):** secondary and tertiary text, resting icon tint — Apple's own systemGray value.
- **Warning — Yellow Flag (#FFD60A)** pairs with dark on-warning text; error/primary red and fastest-purple pair with white on-primary text.

## Typography

Two-family system matching Apple's real pairing rule: **SF Pro Display** for anything 20px and above, **SF Pro Text** below that threshold. Eleven levels cover the full app.

- **Display Hero:** SF Pro Display Bold, 56px — the countdown's D/H/M/S digits and a driver's race number on Driver Details. This is the single largest, most confident element in the app.
- **Headlines (lg/md/sm):** SF Pro Display Semibold–Bold, 20–34px — page titles, hero card names, section headers.
- **Title / Body (lg/md/sm):** SF Pro Text, 13–17px — nav titles, card content, dense metadata rows.
- **Label:** SF Pro Text Semibold, 15px — button and control text.
- **Label Caps:** SF Pro Text Bold, 11px, wide tracking — short uppercase tags like P1, DRS, SC, VSC.
- **Telemetry Numeric:** SF Pro Display Semibold, 17px, tabular figures (`"tnum" 1`) — every gap, interval, and lap-time column. Tabular numerals are non-negotiable here: without them, a live-updating leaderboard visibly jitters as digit widths change.
- **Caption:** SF Pro Text, 11px — timestamps, helper text, session metadata.

## Layout

iPhone-first fluid layout on an 4/8/12/16/24/32 spacing rhythm. Content lives inside `glass-card` containers with generous internal padding (`spacing.xl`, 24px) rather than raw full-bleed lists — containment is how the UI stays calm at high information density.

- **< 600px (iPhone):** single column, sticky translucent top nav, floating bottom tab bar. Safe-area insets respected top and bottom at all times.
- **600–900px (iPad portrait / small tablet):** content reflows to a two-column grid for standings and card grids; tab bar remains.
- **≥ 900px (iPad landscape / desktop PWA):** bottom tab bar is replaced by a persistent left sidebar carrying the same five destinations; content area becomes a max-width, multi-column grid so leaderboard and standings tables gain breathing room instead of stretching edge to edge.

As a PWA, the manifest `theme-color` is True Black by default and may adopt the active `circuitThemes` accent during a live race weekend so the browser chrome itself reflects the theme.

## Elevation & Depth

Depth comes entirely from **Liquid Glass** layering over True Black — no drop-shadow-heavy skeuomorphism. Three levels:

- **Level 1 — Structural glass** (top nav, tab bar): 20pt backdrop blur, `surface` fill at ~78% opacity, 1px hairline at ~12% white opacity along the leading edge.
- **Level 2 — Floating glass** (sheets, modals, action menus): 30pt blur, ~65% fill, 16% hairline, plus a soft upward shadow (24px blur, 20% black opacity, 8px y-offset) to lift it visually off Level 1.
- **Level 3 — Momentary glass** (toasts, the Live Activity compact view): 40pt blur, ~55% fill, spring-in/spring-out only — never lingers, never gets a persistent shadow.

A subtle specular highlight — a faint brighter line along the top edge of Level 1 and Level 2 surfaces — simulates glass catching ambient light, consistent with Apple's Liquid Glass material language. This highlight is the only "shine" permitted anywhere in the UI; it never appears on flat surfaces.

## Shapes

Corners use Apple's continuous (squircle) curvature, not simple circular arcs — every rounded element should feel like it was cut from a single continuous surface, not stamped with a compass. Three radii cover the entire app: `sm` (12px) for tiles and controls, `md` (16px) for standard cards, `lg` (24px) for the tab bar and the largest hero surfaces. `full` (9999px) is reserved for pills, chips, and circular avatars/badges. Corner radius never mixes with sharp corners in the same view.

## Components

Standard atoms plus RaceCtrl-specific composites. `borderColor` is used throughout as a domain extension beyond the eight canonical component properties, to express Liquid Glass's signature hairline edge — conforming DESIGN.md consumers accept unknown component properties with a warning, not an error.

- **canvas** — the fixed True Black page background beneath every glass layer.
- **nav-bar-top / tab-bar** — Level 1 glass, hairline bottom/top border respectively.
- **glass-card** — the general-purpose container for every content block on every screen.
- **button-primary / button-secondary** — pill-shaped, `label-md` text, 50px tall for confident touch targets.
- **chip-status** family — pill tags for P1/P2/P3, DRS, Live, and Fastest, each swapping fill via a variant key.
- **list-item** — standard row for menus, sessions, settings.
- **metadata-label** — dimmed caption text used under a primary label (team name under driver name, "Lap 34/58" under a session title).
- **leaderboard-row** — tabular-numeral row for Live Timing; the `-fastest` variant recolors its numeric text purple in place.
- **flag-banner** — full-width sticky strip for Yellow/Safety Car (`warning` fill) and Red Flag (`error` fill, white text).
- **countdown-tile** — the individual D/H/M/S unit inside the countdown.
- **checkbox / radio / input-field / tooltip** — standard form atoms for Settings and Favorites.

## Do's and Don'ts

- Do reserve Race Red for exactly one primary action per screen — it is not a decorative color.
- Don't let a `circuitThemes` accent override `colors.neutral`, `on-surface`, or `on-surface-variant` — only the accent rotates; legibility tokens are fixed.
- Do pair any saturated accent fill (Race Red, Telemetry Blue, Purple) with Semibold-or-heavier text at 15px+; this clears WCAG AA's large-text 3:1 threshold. Regular-weight small text on these fills will fail contrast — use `on-surface` on a `surface-variant` fill instead.
- Do keep the purple/green/yellow sector-color meaning identical to real F1 broadcast convention — this is borrowed recognition, not a place to be original.
- Don't mix rounded and sharp corners in the same view.
- Don't use more than two typeface weights on a single screen (one Bold/Semibold accent weight, one Regular reading weight).
- Do use blur and hairlines, not drop shadows, as the primary depth cue; reserve soft shadow for Level 2 floating glass only.
- Don't reproduce F1's official app layout, iconography, or red/black corporate chrome — RaceCtrl should read as an Apple system app, not a broadcast property.
- Do keep the countdown and next-session data the first thing visible on Home, above the fold, on the smallest supported iPhone.

## Screens & Information Architecture

Nine screens, organized so the bottom tab bar never exceeds Apple's five-item guidance:

**Bottom tab bar (5 destinations):** Home · Live Timing · Weekend · Standings · Favorites.
**Reached by push, not by tab:** Driver Details, Settings (gear icon in the top nav, not a tab — same pattern as App Store/Music).
**Segmented control, not separate tabs:** Standings contains a Drivers/Constructors segmented switch — they are one screen with two data sets, not two destinations.
**Template reuse:** Driver Details is the single template for both a generic driver page and the "Favorite Driver" deep-view described in the brief — opening it from the Home favorite card, from Standings, or from Live Timing all resolve to the same screen.

- **Home:** Next Race hero card → Countdown → Weekend Timeline strip → Next Session card → Top 5 Drivers (`glass-card` + `leaderboard-row` ×5, "View all" to Standings) → Top 5 Constructors (same pattern) → Favorite Driver card → Favorite Team card → Quick Actions row (pill buttons: Live Timing, Weekend, Favorites).
- **Live Timing:** sticky `flag-banner` at top when a flag/Safety Car is active; live leaderboard of `leaderboard-row` (position, gap, interval, tire, pit status, last lap, best lap, DRS chip); mini track map with sector-colored arcs (green/purple/yellow per real-time pace); radio indicator icon per driver row when team radio is playing.
- **Weekend:** vertical timeline of Practice 1–3, Qualifying, Sprint (if applicable), Race — each a `list-item` with local time and countdown chip; weather card; track map hero.
- **Standings:** segmented Drivers/Constructors; full `leaderboard-row` list with position badges.
- **Driver Details / Favorite Driver view:** large hero photo/helmet, name and number in `display-hero`, current position, gap, last lap, best lap, tire compound, pit strategy timeline, championship points, race-by-race result history list.
- **Favorites:** searchable driver + constructor list with a tap-to-favorite star; sets what surfaces on Home's Favorite cards and in push notifications.
- **Settings:** notification toggles, units (km/h vs mph), appearance (theme rotation on/off), accessibility shortcuts.

## Widgets & System Surfaces

- **Small widget:** countdown only — circuit name + D/H/M/S.
- **Medium widget:** countdown + Next Session card.
- **Large widget:** countdown + Next Session + Top 3 Drivers.
- **Lock Screen widget:** circular — countdown digits only, rendered in monochrome per Lock Screen convention.
- **Live Activity:** appears once a session goes live — compact view shows favorite driver's position and gap; expanded (Dynamic Island) view adds last lap and an active flag chip. Uses Level 3 momentary glass exclusively.

## Notifications

Each notification type inherits its lead color from the same semantic tokens used on-screen, so the system notification and the in-app state always agree:

- **Session starting** — neutral/`on-surface-variant`, informational tone.
- **Favorite driver pits** — `secondary` (Telemetry Blue).
- **Fastest lap** — `fastest` (Purple).
- **Overtake** — `tertiary` (Podium Green).
- **Yellow Flag** — `warning`.
- **Safety Car** — `warning`, elevated urgency (persistent until cleared).
- **Race finished** — `tertiary`/neutral, calm close-out tone.

## Motion & Haptics

Spring-based motion throughout, matching Liquid Glass's physical material feel — nothing linear, nothing abrupt.

- Sheet/modal presentation: spring (response ~0.4s, damping ~0.85).
- Countdown digit change: soft roll, ~0.25s.
- Leaderboard position change: rows cross-fade + reorder over ~0.3s, never an instant jump-cut.
- Haptics: light impact on overtake, success haptic on fastest lap, warning haptic on flag-state change, selection haptic on tab/segment switches.
- **Reduce Motion:** replace all springs and position-reorder animation with plain cross-fades; countdown digits change instantly with no roll.

## Accessibility

- **Dynamic Type:** `leaderboard-row` truncates the constructor name before the driver name; at the largest accessibility sizes, gap/interval/last-lap columns stack vertically inside the row rather than compressing to illegibility.
- **VoiceOver:** each `leaderboard-row` reads as one element in the order position → driver → gap → interval → tire → last lap; flag-state changes are announced immediately as a live region, not left to be discovered by swiping.
- **Reduce Transparency / Increase Contrast:** every glass surface falls back to a solid `surface`/`surface-variant` fill with no blur, and hairline opacity increases to full `outline` solid — Liquid Glass degrades gracefully to a flat, high-legibility UI rather than breaking.
- **WCAG AA** is the floor for every text/background pairing at body sizes; saturated-accent-fill exceptions are documented above in Do's and Don'ts and are restricted to bold, large-scale labels only.

## Race Weekend Theming

The app's canvas never changes — True Black is permanent. What rotates is a single accent color, sourced from `circuitThemes`, applied only to the current race weekend's hero card, countdown tiles, and primary CTA on Home and Weekend. Everything else — text, surfaces, borders, semantic flag colors — stays fixed, so the app never loses legibility or its racing-telemetry meaning in pursuit of a seasonal look.

The eight themes above are a representative sample, not the full calendar; extend `circuitThemes` with one accent per remaining round as the season is added, following the same rule — one hex, evocative of place, never touching `neutral` or the `on-*` text tokens.