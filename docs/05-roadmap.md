# 05 — Roadmap

_Last updated: 2026-06-29_

Sequenced by dependency and value, not calendar dates (solo-dev timing varies). Each phase has a goal and exit criteria. The guiding idea: **ship the calculator as a real App Store app early, then layer scouting on top.**

## Phase 0 — Foundation
**Goal:** a Windows→iPhone dev loop that works end to end.
- Initialize Expo (TypeScript) + Expo Router project; set up `/calc`, `/db`, `/store` structure.
- Install Expo Go on your iPhone; confirm hot-reload on device.
- Create Apple Developer account ($99/yr); run one `eas build` + TestFlight install to prove the pipeline.
- Git repo + Jest configured.

**Exit:** you can change code on Windows and see it on your iPhone, and you've shipped a "hello world" build to TestFlight.

## Phase 1 — Calculator MVP (ship this) ⭐
**Goal:** the smallest trustworthy product — maps to the MVP cut line in [`03-user-stories.md`](03-user-stories.md).
- Implement the pure BRRRR engine (`calc/brrrr.ts`) exactly per [`02-calculator-spec.md`](02-calculator-spec.md).
- Snapshot-test it against the worked example **before** building UI.
- Build the input form (grouped: Acquisition / ARV / Refinance / Rental) with `$`/`%` toggles.
- Headline metrics: cash left in deal, monthly cash flow, cash-on-cash, cap rate, DSCR (with the ♾-recycled case).
- Save/list deals via expo-sqlite; editable default assumptions (Settings).

**Exit:** you can underwrite a real BRRRR deal in under a minute, save it, and reopen it. **Submit v1.0 to the App Store.**

## Phase 2 — Driving for Dollars (primary scouting) ⭐
**Goal:** find and work off-market leads in the field — the v1 scouting pillar ([`01-deal-scouting.md`](01-deal-scouting.md)). Build in slices:
- **2a Capture (local-first):** visual map (react-native-maps), one-tap manual pin (current location / map tap / address search), camera photos, notes, distress tags; offline capture + sync.
- **2b Identify + organize:** reverse-geocode pins to addresses (expo-location); dedupe; lead lists + status pipeline; map and list views; filter/sort.
- **2c Enrich:** stand up a Supabase Edge Function to proxy owner/tax data (RentCast/ATTOM free tiers, keys off-device); manual entry fills gaps; absentee flag + simple motivation score.
- **2d Outreach (handoff):** templated message → `mailto:`/`sms:`/`tel:`/share sheet/printable letter. **No backend send.**
- **2e Bridge:** jump from a lead into the BRRRR calculator with an estimated ARV.

**Exit:** you can drive a neighborhood, log distressed properties with photos, see owner/motivation, reach out from your own apps, and underwrite any lead — with no paid data feed.

> Only **2c enrichment** needs a backend. 2a/2b/2d/2e are local + native. If you want zero backend in Phase 2, do enrichment by manual entry first and add the Edge Function later.

## Phase 3 — On-market deal feed (deferred scouting expansion)
**Goal:** deals also find you from MLS-style listings.
- Buy-box editor; pull active listings (RentCast); auto-estimate calculator inputs; run the engine; rank passers; tap-through into the calculator with editable, confidence-flagged estimates.

**Exit:** a ranked feed of on-market listings that pass your buy box, openable into the calculator.

## Phase 4 — Market intelligence
**Goal:** aim the user at the right neighborhoods (Angle 3).
- Rent-to-price heatmap (Mapbox layer) from RentCast/HUD/Census data.
- Median price/rent/trend overlays.

**Exit:** a map view that highlights cash-flow-friendly areas before you pick houses.

## Phase 5 — Depth & polish
**Goal:** make it sticky and broaden the engine.
- **Route tracking (GPS breadcrumb trail)** for D4D — the signature upgrade deferred from v1; introduces background-location permission + App Store review justification.
- Sensitivity analysis (ARV/rate/rehab grids).
- Long-term-rental and fix-&-flip modes on the same engine.
- Optional account + cloud sync (Supabase Auth) — additive, app stays local-first.
- New-deal alerts/notifications.

**Exit:** a multi-strategy analyzer with route-tracked scouting, sync, and alerts.

---

## Sequencing principles
1. **Engine before UI, tests before features.** The calculator must be provably correct first.
2. **Ship after Phase 1.** A great standalone BRRRR calculator is already App-Store-worthy; don't gate launch on scouting.
3. **Stay free until you need to pay.** No backend until enrichment (Phase 2c), and even then only to proxy data-API keys; no paid data until free tiers are outgrown. Outreach never touches a backend.
4. **Local-first throughout.** Cloud is always additive — the app must keep working offline.

## Immediate next steps (when you're ready to build)
1. Scaffold the Expo + TypeScript project and the `/calc` module.
2. Implement `brrrr.ts` and its test against the worked example.
3. Prove the EAS → TestFlight pipeline once, early, so there are no surprises later.

> When you want to start, say the word and I can scaffold the Expo project and write the BRRRR engine + tests as the first concrete code.
