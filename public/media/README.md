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
* **Size Guide**: `300x300` px (square ratio), close crop on driver's helmet or face.
* **Resolution Guidelines**: Less than 50kb per file. WebP is highly recommended.
* **Registration**:
  Open [drivers.ts](file:///d:/pagalpan/Github/racectrl/lib/media/drivers.ts) and add the `portrait` field to the driver entry matching their Jolpica ID.
  
  ```typescript
  max_verstappen: {
    id: "max_verstappen",
    code: "VER",
    number: "1",
    team: "Red Bull",
    accent: "#3671C6",
    nationality: "Dutch",
    flagColors: ["#AE1C28", "#FFFFFF", "#21468B"],
    portrait: "/media/drivers/max_verstappen.webp" // ← Add this registered path
  }
  ```

---

## 2. Constructors Media

* **File Location**: `public/media/constructors/{constructorId}.svg`
* **Format**: SVG vector graphic preferred for crisp scaling under light and dark backgrounds.
* **Registration**:
  Open [constructors.ts](file:///d:/pagalpan/Github/racectrl/lib/media/constructors.ts) and register the `logo` field:
  
  ```typescript
  mclaren: {
    id: "mclaren",
    name: "McLaren",
    accent: "#FF8000",
    secondary: "#1E1E1E",
    pattern: "stripes",
    logo: "/media/constructors/mclaren.svg" // ← Add this registered path
  }
  ```

---

## 3. Circuits Media

* **File Location**: `public/media/circuits/{circuitId}.webp`
* **Format**: Widescreen aspect ratio (e.g. 16:9), optimized compressed WebP.
* **Registration**:
  Open [circuits.ts](file:///d:/pagalpan/Github/racectrl/lib/media/circuits.ts) and register the `heroImage` field:
  
  ```typescript
  silverstone: {
    id: "silverstone",
    name: "Silverstone Circuit",
    svgPath: "...",
    viewBox: "...",
    country: "UK",
    heroImage: "/media/circuits/silverstone.webp" // ← Add this registered path
  }
  ```
