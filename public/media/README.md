# RaceCtrl Media Asset Directory Guide

This directory holds visual assets for Formula 1 drivers, constructors, and circuits. 

To prevent browser console 404 errors, **RaceCtrl does not guess paths at runtime**. Images are only loaded if they are explicitly registered in the media manifest databases inside `lib/media/`.

---

## Directory Structure

```text
public/
  media/
    drivers/       # Driver portraits (webp)
    constructors/  # Constructor logos (svg/png)
    circuits/      # Circuit outlines or hero cards (svg/webp)
```

---

## 1. Drivers Media

* **File Location**: `public/media/drivers/{driverId}.webp`
* **Size Guide**:
  - `portrait`: Approximately `800x1000` px or equivalent portrait ratio.
  - `hero`: Approximately `1600x1000` px (if supported).
* **Resolution Guidelines**: Optimized compressed WebP formats under 100kb.
* **Registration**:
  Open [drivers.ts](file:///d:/pagalpan/Github/racectrl/lib/media/drivers.ts) and add the fields to the driver entry matching their Jolpica ID.
  
  ```typescript
  max_verstappen: {
    id: "max_verstappen",
    code: "VER",
    number: "1",
    team: "Red Bull",
    accent: "#3671C6",
    nationality: "Dutch",
    flagColors: ["#AE1C28", "#FFFFFF", "#21468B"],
    portrait: "/media/drivers/max_verstappen.webp", // ← Add this registered path
    focalPosition: "center 20%" // ← CSS object-position focal override
  }
  ```

---

## 2. Constructors Media

* **File Location**: `public/media/constructors/{constructorId}.svg`
* **Format**: SVG vector graphic preferred for crisp scaling under light and dark backgrounds.
* **Registration**:
  Open [constructors.ts](file:///d:/pagalpan/Github/racectrl/lib/media/constructors.ts) and register the `logo`, `logoLight`, or `logoDark` fields:
  
  ```typescript
  mclaren: {
    id: "mclaren",
    name: "McLaren",
    accent: "#FF8000",
    secondary: "#1E1E1E",
    pattern: "stripes",
    logoLight: "/media/constructors/mclaren_light.svg",
    logoDark: "/media/constructors/mclaren_dark.svg"
  }
  ```

---

## 3. Circuits Media

* **File Location**: `public/media/circuits/{circuitId}.webp`
* **Format**: Widescreen aspect ratio (approximately `1600x900` px), optimized compressed WebP.
* **Registration**:
  Open [circuits.ts](file:///d:/pagalpan/Github/racectrl/lib/media/circuits.ts) and register the `heroImage` and `trackOutline` fields:
  
  ```typescript
  silverstone: {
    id: "silverstone",
    name: "Silverstone Circuit",
    svgPath: "...",
    viewBox: "...",
    country: "UK",
    heroImage: "/media/circuits/silverstone.webp",
    trackOutline: "/media/circuits/silverstone_outline.svg"
  }
  ```
