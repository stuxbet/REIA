# 06 — Implementation Plan

_Last updated: 2026-06-29_

The build-level companion to [`05-roadmap.md`](05-roadmap.md). The roadmap says *what_ each phase delivers and *why*; this doc says *how* — ordered, commit-sized tasks with sizing, deliverables, and validation.

## How to read this

- **Checkboxes** are commit-sized units of work. Aim for one focused commit (or small PR) per task.
- **Sizing** is rough solo-dev effort, not calendar time: **(S)** a few hours · **(M)** a day or two · **(L)** several days.
- **Vertical slices.** Within a phase, prefer finishing one thin end-to-end slice over building every layer half-way.
- **Definition of done (every task):** typechecks (strict TS) · lint/format clean · tests green · runs on a real iPhone · committed.
- **Guiding rules** (from the roadmap): engine before UI · tests before features · ship after Phase 1 · local-first · outreach never touches a backend.

## Status — 2026-06-29

- **Phase 0 — Foundation: ✅ done.** Expo SDK 56 + Router + strict TS, module structure, Jest; on GitHub ([stuxbet/REIA](https://github.com/stuxbet/REIA)).
- **Phase 1 — Calculator: ✅ done** (except the user-gated App Store ship). Tested BRRRR engine; UNDERWRITE wired live; SQLite-persisted saved deals; editable inputs; persisted buy-box + Settings screen; per-metric formula reveal. Runs in Expo Go.
- **"REIA Tactical" frontend leapt ahead of the roadmap:** all 8 v1 screens exist as UI (dark tactical theme). So the _calculator_ screens (UNDERWRITE/VERDICT/DOSSIER) are real + persistent; the _D4D_ screens (RECON/CAPTURE/TARGETS/TARGET DOSSIER/OUTREACH) currently render **sample data** — except OUTREACH, whose native handoff is already real.
- **Phase 2 — Driving for Dollars: ✅ Expo Go-complete.** Leads persist; CAPTURE drops a real GPS pin, reverse-geocodes the address, and attaches real photos; TARGETS/RECON/DOSSIER read real leads; lead status-pipeline editing; owner/tax enrichment (manual **+ explicit RentCast pull via the self-hosted VPS backend in `/server`**); lead→calculator bridge; OUTREACH template library + printable-letter export. **Only the real map (`react-native-maps`) remains — gated on a one-time dev build.**
- **Backend = the user's own VPS** (`/server`, Node/Hono, Dockerized), **not Supabase**. Route tracking is dropped.
- Remaining Phase 1 step (user-gated): `eas build -p ios` → TestFlight → App Store (needs your Apple Developer account).

## Critical path (the spine)

```
Phase 0 (toolchain proven)
   └─> Phase 1 calc engine + tests  ──>  Phase 1 UI + persistence  ──>  SHIP v1.0
                                                                          └─> Phase 2 D4D (2a→2e)
                                                                                 └─> Phase 3+ (deferred)
```
Everything gates on two things: a proven Windows→TestFlight pipeline (Phase 0) and a correct, tested calculator engine (Phase 1). Do those first; they de-risk the rest.

---

## Phase 0 — Foundation ✅

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

## Phase 1 — Calculator MVP (ship v1.0) ⭐ ✅ (ship step pending)

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

## Phase 2 — Driving for Dollars (make the shells real) 🚧

**Context:** the RECON / CAPTURE / TARGETS / TARGET DOSSIER / OUTREACH screens already exist from the tactical frontend. This phase replaces their **sample data** with real capture + SQLite persistence, then adds the native pieces. Persistence-first, mirroring Phase 1.

### 2.1 — Leads persistence (Expo Go) ✅
- [x] `/db` leads table + repository (list/get/save/count), offline-first SQLite — mirrors the deals repo.
- [x] Seed the sample leads on first run; load helpers.

### 2.2 — Capture → save (Expo Go) ✅
- [x] CAPTURE's CONFIRM writes a real lead (address, distress tags, heat, coords) into the DB.

### 2.3 — Real reads + organize (Expo Go) ✅
- [x] TARGETS reads real leads; status filter chips + counts actually filter.
- [x] TARGET DOSSIER reads the lead by id from the DB.
- [x] RECON nearby-targets come from real leads.
- [x] Lead status-pipeline editing (NEW→…→DEAD) in TARGET DOSSIER, persisted.

### 2.4 — Bridge to the calculator ✅
- [x] "Underwrite" on a lead loads it into the deal store (address/leadId) so UNDERWRITE opens pre-filled and the saved deal links back via leadId.

### 2.5 — Native capture
- [x] Foreground location + reverse-geocode in CAPTURE (`expo-location`) — Expo Go.
- [x] Real photos in CAPTURE (`expo-image-picker` → `expo-image`) — Expo Go.
- [ ] **(L)** Real map (`react-native-maps`, Apple provider) with live pins — **needs a one-time dev build** (not in Expo Go); RECON map stays stylized until then.

### 2.6 — Outreach + templates ✅
- [x] Channel handoff via `expo-linking` (`mailto:`/`sms:`/`tel:`) + merged message with fields — **no backend send**.
- [x] Switchable template library (3 templates, real `[OWNER]`/`[PROP]` merge fields from the lead) + `expo-print` printable-letter export.

### 2.7 — Enrich ✅
- [x] **Manual-entry** owner/tax editor in TARGET DOSSIER; persisted; auto-computes the absentee flag (mailing ≠ site).
- [x] **Self-hosted VPS backend** (`/server` — Node/Hono, Dockerized) proxying **RentCast** with the key server-side; **explicit, confirmed "PULL RENTCAST · 1 REQ" button** in TARGET DOSSIER (never auto-fetches — protects the 50/mo free quota). **Not Supabase.**
- Setup: deploy `/server` to the VPS with `RENTCAST_API_KEY`, set `EXPO_PUBLIC_API_URL` in the app's `.env`.

**Deliverable:** capture a property → it persists → appears in TARGETS / RECON / DOSSIER → underwrite it → reach out from your own apps.
**Validation:** a captured lead survives an app restart; TARGETS filters work; underwrite opens pre-filled from a lead.

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

- [ ] **(M)** Sensitivity analysis (ARV ±10% / rate ±1% / rehab ±20% grid).
- [x] **Long-term-rental and fix-&-flip modes** on the same engine — UNDERWRITE toggle switches the readout + inputs; `computeFlip`/`computeLtr` tested.
- [ ] **(L)** Optional account + cloud sync via the VPS backend — additive; app stays local-first.

---

## Cross-cutting concerns (apply throughout)

- **Testing.** The `/calc` engine and `/lib` helpers stay pure and unit-tested (highest ROI). Add a few React Native Testing Library tests for critical screens (calculator, capture). Don't chase coverage on UI glue.
- **Releases.** Use EAS build profiles (`development` / `preview` / `production`). Consider **EAS Update** (OTA) for JS-only fixes between store submissions. Bump version + build number per submission.
- **Observability.** Add lightweight error reporting (e.g., Sentry) before/at first ship so production crashes are visible.
- **Data & privacy.** Local-first means minimal privacy surface; once enrichment (2c) and any account (5) land, document data handling and update the App Store privacy questionnaire. Add the in-app outreach-compliance reminder noted in [`01-deal-scouting.md`](01-deal-scouting.md).
- **Secrets.** No API keys in the app bundle — they live in the VPS backend (`/server`, env vars) behind a shared secret.

## Phase definition of done

| Phase | Done when… |
| --- | --- |
| 0 | App runs on device via Expo Go **and** TestFlight |
| 1 | Calculator + saved deals shipped to the App Store; engine tests green |
| 2 | Full D4D funnel usable end-to-end offline-first; outreach via native handoff |
| 3 | Ranked on-market feed openable into the calculator |
| 4 | Heatmap + market overlays on the map |
| 5 | Sensitivity + multi-strategy modes + optional sync |

## Start here

1. Phase 0 toolchain + scaffold, and **prove the TestFlight pipeline once** (don't skip — it's the riskiest unknown on Windows).
2. Phase 1.1: write `brrrr.test.ts` from the worked example, then `brrrr.ts` until it's green.
3. Build the calculator UI on top of the proven engine and ship v1.0 before touching D4D.
