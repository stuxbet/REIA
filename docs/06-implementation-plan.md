# 06 — Implementation Plan

_Last updated: 2026-06-29_

The build-level companion to [`05-roadmap.md`](05-roadmap.md). The roadmap says *what_ each phase delivers and *why*; this doc says *how* — ordered, commit-sized tasks with sizing, deliverables, and validation.

## How to read this

- **Checkboxes** are commit-sized units of work. Aim for one focused commit (or small PR) per task.
- **Sizing** is rough solo-dev effort, not calendar time: **(S)** a few hours · **(M)** a day or two · **(L)** several days.
- **Vertical slices.** Within a phase, prefer finishing one thin end-to-end slice over building every layer half-way.
- **Definition of done (every task):** typechecks (strict TS) · lint/format clean · tests green · runs on a real iPhone · committed.
- **Guiding rules** (from the roadmap): engine before UI · tests before features · ship after Phase 1 · local-first · outreach never touches a backend.

## Critical path (the spine)

```
Phase 0 (toolchain proven)
   └─> Phase 1 calc engine + tests  ──>  Phase 1 UI + persistence  ──>  SHIP v1.0
                                                                          └─> Phase 2 D4D (2a→2e)
                                                                                 └─> Phase 3+ (deferred)
```
Everything gates on two things: a proven Windows→TestFlight pipeline (Phase 0) and a correct, tested calculator engine (Phase 1). Do those first; they de-risk the rest.

---

## Phase 0 — Foundation

**Objective:** a working Windows→iPhone dev loop and an empty-but-shippable app skeleton.

- [ ] **(S)** Install toolchain on Windows: Node LTS, pnpm, Git, VS Code; `npm i -g eas-cli`; install **Expo Go** on your iPhone.
- [ ] **(S)** Scaffold: `npx create-expo-app@latest reia` with the **TypeScript + Expo Router** template. Confirm it runs in Expo Go via QR.
- [ ] **(S)** Create the module skeleton: `/app /components /calc /leads /data /store /db /lib /docs` (move these docs into `/docs`).
- [ ] **(S)** Tooling config: TS **strict** mode, ESLint + Prettier, absolute imports (tsconfig paths), `jest-expo` + React Native Testing Library; add a trivial passing test.
- [ ] **(S)** `git init`, `.gitignore`, first commit. (Repo isn't git yet — this is also when to decide remote hosting.)
- [ ] **(M)** Apple Developer Program enrollment ($99/yr); Expo account; `eas login`; `eas build:configure` (creates `eas.json`).
- [ ] **(M)** **Prove the pipeline once:** `eas build -p ios --profile preview` → `eas submit` → install from **TestFlight** on your device.

**Deliverable:** "hello world" running on your iPhone from *both* Expo Go and TestFlight.
**Validation:** a code change hot-reloads in Expo Go; the TestFlight build launches. No surprises left in the release path.

---

## Phase 1 — Calculator MVP (ship v1.0) ⭐

**Objective:** the smallest trustworthy product — a BRRRR calculator with saved deals. Built engine-first, tests-first.

### 1.1 Engine (no UI yet)
- [ ] **(S)** `/calc/types.ts` — input types (Acquisition, ARV, Refinance, RentalOps, BuyBox) and a `BrrrrResult` output type. Decide number/rounding convention (store raw numbers, round at display).
- [ ] **(M)** `/calc/brrrr.test.ts` — encode the **worked example** from [`02-calculator-spec.md`](02-calculator-spec.md) as the canonical test (all-in 167k, cash-left 21k, CoC 6.0%, cap 7.5%, DSCR 1.19, MAO 105k) **before** writing the engine.
- [ ] **(M)** `/calc/brrrr.ts` — implement: mortgage payment, all-in cost, total cash invested, refinance proceeds, **cash left in deal**, pro forma (EGI/opEx/NOI/cash flow), and all metrics. Make the example test pass.
- [ ] **(S)** Edge-case tests: `cashLeftInDeal ≤ 0` → "♾ recycled"; zero ARV / zero rent / zero-rate loan don't throw.
- [ ] **(S)** `/lib/format.ts` — currency, percent, and `$`/`%` input parsing helpers (+ tests).

### 1.2 Persistence & state
- [ ] **(S)** `/store/settings.ts` — default assumptions (vacancy 5%, mgmt 8%, maint 5%, capex 5%, refi LTV 75%, etc.) + buy-box thresholds; persist (MMKV).
- [ ] **(M)** `/db` — expo-sqlite schema for **deals** (raw inputs JSON + computed snapshot + name, address, status, timestamps) and repository fns: create / list / get / update / duplicate / delete (+ tests).
- [ ] **(S)** `/store/deal.ts` — Zustand store for the active deal; results derived from the engine on input change.

### 1.3 UI
- [ ] **(M)** Input form (`/app` + `/components`): grouped sections (Acquisition · ARV · Refinance · Rental Ops), `$`/`%` toggle fields, numeric keyboards, sensible defaults applied to new deals.
- [ ] **(M)** Results view: headline card — **cash left in deal, monthly cash flow, CoC, cap rate, DSCR** — with the ♾-recycled state; secondary metrics below; live recompute as you type.
- [ ] **(S)** Buy-box verdict: color-code each metric vs. thresholds + an overall pass/marginal/fail chip (story 1.5).
- [ ] **(S)** Per-metric "show formula" reveal (story 1.4).
- [ ] **(M)** Saved deals: list screen (address + key metrics + status, sortable), open/edit, **duplicate**, delete; "Save" on the active deal.
- [ ] **(S)** Settings screen: edit default assumptions + buy-box thresholds (apply to new deals only).
- [ ] **(S)** Navigation/IA: Expo Router tabs/stack — Deals · New/Edit · Settings; empty states.

### 1.4 Ship
- [ ] **(S)** Branding: app name, icon, splash, accent color (see frontend-design guidance when you start UI).
- [ ] **(S)** Hardening: input validation, error boundaries, a manual pass against the worked example **on device**.
- [ ] **(M)** Store prep: App Store Connect listing, screenshots, privacy questionnaire (note: no data collection if fully local).
- [ ] **(M)** `eas build --profile production` → `eas submit` → TestFlight beta → **App Store submission**.

**Deliverable:** a shippable BRRRR calculator with saved deals, submitted to the App Store.
**Validation:** engine tests green; on-device underwriting of the worked example matches expected numbers; saved deals survive an app restart.

---

## Phase 2 — Driving for Dollars (primary scouting)

**Objective:** the full off-market funnel. Built in slices; each slice is independently useful and shippable as an update.

### 2a — Capture (local-first, no backend)
- [ ] **(M)** Map screen: `react-native-maps`; request **foreground** location (`expo-location`); center on user; render existing lead pins.
- [ ] **(M)** Drop a pin three ways: one-tap at current location · tap-on-map · address search (geocode). Create a lead record (lat/lng, timestamp).
- [ ] **(M)** `/db` leads schema + repository (offline-first SQLite).
- [ ] **(M)** Capture form: photos (`expo-camera`/`expo-image-picker` → `expo-file-system`), notes, multi-select **distress tags**.
- [ ] **(S)** Offline check: capture + photos work in airplane mode and persist.

### 2b — Identify & organize
- [ ] **(S)** Reverse-geocode pin → address (`expo-location`), confirm/edit; near-duplicate warning.
- [ ] **(M)** Lead list view ↔ map view toggle; **status pipeline** (new → researching → contacted → negotiating → under contract → dead); filter/sort by status, tag, motivation.

### 2c — Enrich (first backend; optional)
- [ ] **(M)** Supabase project + **Edge Function** proxying RentCast/ATTOM (keys server-side); client hooks via TanStack Query.
- [ ] **(M)** Enrichment UI: pull owner, last sale, tax status; manual entry fallback; compute **absentee flag** (mailing ≠ property) + simple hot/warm/cold **motivation score**.

### 2d — Outreach (handoff, never through us)
- [ ] **(S)** Message templates with merge fields (owner name, property address) + a template editor.
- [ ] **(M)** Handoff actions: `expo-linking` (`mailto:`/`sms:`/`tel:`), Share API, and `expo-print` letter PDF. Confirm **no backend send path**.

### 2e — Bridge to the calculator
- [ ] **(S)** "Underwrite" on a lead opens the Phase 1 calculator pre-filled with an estimated ARV; link the saved deal ↔ lead.

**Deliverable:** drive a neighborhood → log distressed properties with photos → see owner/motivation → reach out from your own apps → underwrite any lead, with no paid data feed (enrichment optional).
**Validation:** a lead captured offline with photos survives sync; outreach opens the correct native app pre-filled; underwrite round-trips to a saved deal.

---

## Phase 3 — On-market deal feed (deferred)

**Objective:** deals also surface from MLS-style listings.
- [ ] **(M)** Buy-box editor (reuse thresholds from settings).
- [ ] **(L)** Pull active listings (RentCast) via the Edge Function; auto-estimate calculator inputs per listing (flagged as editable assumptions).
- [ ] **(M)** Run the engine per listing; ranked feed; tap-through into the calculator.
- [ ] **(M)** New-passing-deal alerts (push notifications).

## Phase 4 — Market intelligence (deferred)

**Objective:** aim drives at the right neighborhoods.
- [ ] **(L)** Rent-to-price heatmap (Mapbox layer) from RentCast/HUD/Census.
- [ ] **(M)** Median price / rent / trend overlays.

## Phase 5 — Depth & polish (deferred)

- [ ] **(L)** **Route tracking** (GPS breadcrumb trail) — introduces background-location permission + App Store review justification.
- [ ] **(M)** Sensitivity analysis (ARV ±10% / rate ±1% / rehab ±20% grid).
- [ ] **(M)** Long-term-rental and fix-&-flip modes on the same engine.
- [ ] **(L)** Optional account + cloud sync (Supabase Auth) — additive; app stays local-first.

---

## Cross-cutting concerns (apply throughout)

- **Testing.** The `/calc` engine and `/lib` helpers stay pure and unit-tested (highest ROI). Add a few React Native Testing Library tests for critical screens (calculator, capture). Don't chase coverage on UI glue.
- **Releases.** Use EAS build profiles (`development` / `preview` / `production`). Consider **EAS Update** (OTA) for JS-only fixes between store submissions. Bump version + build number per submission.
- **Observability.** Add lightweight error reporting (e.g., Sentry) before/at first ship so production crashes are visible.
- **Data & privacy.** Local-first means minimal privacy surface; once enrichment (2c) and any account (5) land, document data handling and update the App Store privacy questionnaire. Add the in-app outreach-compliance reminder noted in [`01-deal-scouting.md`](01-deal-scouting.md).
- **Secrets.** No API keys in the app bundle — they live in the Supabase Edge Function from 2c onward.

## Phase definition of done

| Phase | Done when… |
| --- | --- |
| 0 | App runs on device via Expo Go **and** TestFlight |
| 1 | Calculator + saved deals shipped to the App Store; engine tests green |
| 2 | Full D4D funnel usable end-to-end offline-first; outreach via native handoff |
| 3 | Ranked on-market feed openable into the calculator |
| 4 | Heatmap + market overlays on the map |
| 5 | Route tracking + sensitivity + multi-strategy + optional sync |

## Start here

1. Phase 0 toolchain + scaffold, and **prove the TestFlight pipeline once** (don't skip — it's the riskiest unknown on Windows).
2. Phase 1.1: write `brrrr.test.ts` from the worked example, then `brrrr.ts` until it's green.
3. Build the calculator UI on top of the proven engine and ship v1.0 before touching D4D.
