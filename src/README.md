# Source layout

App code lives under `src/`. The `@/*` TypeScript path alias maps here — import as `@/calc/brrrr`, `@/lib/format`, etc.

| Module | Responsibility | Spec |
| --- | --- | --- |
| `app/` | Expo Router routes/screens (file-based routing) | — |
| `components/` | Reusable UI components | — |
| `constants/`, `hooks/` | Theme + shared hooks (from the Expo template) | — |
| `calc/` | **Pure BRRRR engine** — framework-agnostic, unit-tested | [docs/02](../docs/02-calculator-spec.md) |
| `leads/` | Driving-for-dollars: map, capture, enrichment, outreach handoff | [docs/01](../docs/01-deal-scouting.md) |
| `data/` | External API clients (RentCast, HUD) + query hooks | [docs/01](../docs/01-deal-scouting.md) |
| `store/` | Zustand stores (deal, lead, buybox, settings) | [docs/04](../docs/04-tech-stack.md) |
| `db/` | expo-sqlite schema + repositories (deals + leads) | [docs/04](../docs/04-tech-stack.md) |
| `lib/` | Formatting, money/percent helpers, deep-link + template builders | — |

**Architecture rule:** `calc/` and `lib/` stay pure — no React, no I/O — so they're trivially unit-testable. UI and side effects live in `app/`, `components/`, `store/`, `db/`, and `data/`.
