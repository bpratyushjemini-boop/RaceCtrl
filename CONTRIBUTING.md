# Contributing to RaceCtrl

We welcome contributions to the RaceCtrl Motorsport Platform. Follow these guidelines to get started.

---

## 1. Setup Development Server
* Install dependencies:
  ```bash
  npm install
  ```
* Start dev server:
  ```bash
  npm run dev
  ```

---

## 2. Coding Guidelines
* **Strict TypeScript**: Avoid `any` types. Provide explicit union signatures for CSS and SVG coordinates.
* **Liquid Glass styles**: Ensure components utilize variables from `app/globals.css` (e.g. `--glass-structural-bg`).
* **Linter Compliance**: Run ESLint checking before submitting commits:
  ```bash
  npm run lint
  ```

---

## 3. Pull Request Standards
* Always verify the production Next.js bundle compiles clean:
  ```bash
  npm run build
  ```
