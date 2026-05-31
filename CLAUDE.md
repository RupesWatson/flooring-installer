# Flooring Installer — Claude Code Context

Web-first PWA for a single UK flooring installer. Offline-first (IndexedDB only, no backend in v1).

## Stack

| Concern | Choice |
|---------|--------|
| Language | TypeScript (strict) |
| Build / app | React 18 + Vite 5 |
| PWA / offline | vite-plugin-pwa (Workbox) |
| Local data | Dexie.js over IndexedDB |
| State | Zustand (UI); domain logic in pure functions |
| Styling | Tailwind CSS 3, CSS variables for design tokens |
| PDF | @react-pdf/renderer (client-side, works offline) |
| Unit tests | Vitest 2 |
| E2E | Playwright |
| Package manager | npm |

**Node constraint:** Node.js v20.5.0 on this machine — must stay on Vite 5.x and Vitest 2.x.
Newer versions require Node ≥ 20.12 for `styleText` / rolldown.

## Repo structure

```
src/
  domain/          # PURE TypeScript. No React, no Dexie, no I/O. Heavily tested.
    units/         # Mm, M2, Pence types; conversions (mm↔ft/in, m²↔ft², pence↔£, VAT)
    measurement/   # Room, Rectangle, UK presets, roomAreaM2, roomPerimeterMm
    materials/     # Selling-format calculators (roll, pack, area, linear, unit, step)
    pricing/       # computeTotals, presentTotals, BusinessSettings, PriceProvider seam
  data/            # Dexie schema + repositories (only place touching IndexedDB)
    repositories/  # createSettingsRepo, createCustomersRepo, createJobsRepo,
                   # createMaterialsRepo, createQuotesRepo (factory functions for testability)
    exportImport.ts # JSON backup export + import
  features/
    catalogue/     # Material CRUD with format-specific fields
    customers/     # Customer CRUD
    jobs/          # Job CRUD
    measure/       # Room measurement wizard (RoomForm with imperial toggle)
    quote/         # Quote builder (AddLineModal, QuoteBuilderPage, computeLine.ts)
    output/        # QuoteOutputPage + QuotePDF (react-pdf)
    settings/      # SettingsPage + useSettings hook
  ui/              # Shared components: Button, Input, Select, Textarea, Modal,
                   # Badge, ConfirmDialog, EmptyState, PageHeader, Spinner
  app/             # Router, Layout (with install prompt), useUnitSystem, useInstallPrompt
tests/
  e2e/             # Playwright (scaffold only)
```

## Key invariants

- **Lengths** stored as integer **millimetres** (`Mm = number`).
- **Money** stored as integer **pence** (`Pence = number`). Never floating-point for currency.
- **Areas** computed as `M2 = number` (square metres, derived from mm).
- `src/domain/` has zero framework/IO imports. ESLint rule enforces this.
- Unit system toggle (`metric` | `imperial`) changes display only — stored mm/pence never mutate.
- Quantities rounded **up** to purchasable units (whole packs via `ceil`, linear metres for gripper).
- VAT computed with `addVat` / `vatPortion` / `removeVat` — all integer pence arithmetic.

## Domain calculators (§5 of spec)

### 5.1 Roll goods (`calcRollSingleRect`, `calcRollMultiRect`)
Try both orientations; pick fewest seams, then least linear metres.
Worked example: 4.2 m × 3.5 m room, 4 m roll → orientation A wins (0 seams, 4.2 lin m, 16.8 m² purchased vs 14.7 m² actual).

### 5.2 Pack goods (`calcPacks`)
`packsNeeded = ceil((area × (1 + wasteFactor)) / coveragePerPackM2)`
Default waste: straight 8%, diagonal 12%, herringbone 15%.
Worked example: 14.7 m², 2.2 m²/pack, straight → 8 packs.

### 5.3 Area goods (`calcArea`) — area × (1 + waste), rounded up.
### 5.4 Linear goods (`calcLinear`) — perimeter − doorways, rounded up to whole metres.
### 5.5 Per-unit (`calcUnits`) — user-entered count, `ceil`.
### 5.6 Per-step (`calcSteps`) — `room.stairSteps` direct.

## Pricing engine

`computeTotals(lines, settings)` → integer-pence totals with VAT and minimum charge.
`presentTotals(totals, vatInclusiveDisplay)` → display values. Toggle never mutates canonical totals.

## Data layer patterns

- Repos are **factory functions**: `createCustomersRepo(db: FlooringDb)` + a default singleton.
  Tests use `fake-indexeddb/auto` + unique db names per test for isolation.
- Dexie `transaction()` takes an **array** of tables as the 2nd arg (not variadic).
- `exportData()` / `importData()` — full JSON round-trip of all 5 tables, version-checked.

## Design tokens (CSS variables)

```css
--color-brand: #1e3a5f       /* navy — sidebar, header, PDF accent */
--color-brand-dark: #152b47
--color-accent: #e07b22      /* orange — install prompt, highlights */
```

Override these to re-brand without touching components.

## Running

```bash
npm run dev          # dev server → http://localhost:5173
npm test             # Vitest unit tests (70 tests, ~1 s)
npm run build        # production build + PWA SW generation
npm run test:e2e     # Playwright (requires npm run dev running)
```

## Phase status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Scaffold (Vite, Tailwind, Vitest, PWA) | ✅ |
| 1 | Domain core — units, measurement, calculators, pricing | ✅ |
| 2 | Local persistence — Dexie schema, repos, export/import | ✅ |
| 3 | Materials catalogue UI | ✅ |
| 4 | Customers, jobs, measurement wizard | ✅ |
| 5 | Quote builder | ✅ |
| 6 | Branded PDF output | ✅ |
| 7 | PWA polish, settings, install prompt | ✅ |

## Out of scope (v1)

Backend/server, data sync, multi-user, multi-tenancy, price scraping, AR measurement, e-signature, payments.

## Designed seams (interfaces only)

- `PriceProvider` in `src/domain/pricing/types.ts` — for future supplier price imports.
- CSS variables — for future multi-tenant theming without component changes.
- `src/domain/` is framework-free and extractable to its own package for a future React Native app.
