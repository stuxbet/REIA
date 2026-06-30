# REIA — Real Estate Investment Analyzer

An iOS app for **scouting real estate deals** and **underwriting them** with a fast, BRRRR-focused investment calculator.

> Status: **Phases 1–2 Expo Go-complete.** Tested BRRRR engine + SQLite-persistent calculator, plus the full driving-for-dollars loop (capture with real GPS + photos → persist → pipeline → outreach) on a dark "tactical" UI (Expo SDK 56 · Expo Router · TypeScript). Remaining: the real map + App Store ship, both gated on a one-time dev build. See [`docs/06-implementation-plan.md`](docs/06-implementation-plan.md).

---

## The two pillars

1. **Deal Scouting (Driving for Dollars)** — find off-market distressed properties in the field: a visual map, manual pin-dropping with photos and distress tags, owner/tax enrichment, lead-pipeline management, and outreach the user sends from their own Mail/Messages/Phone (nothing routes through a backend).
2. **Deal Calculator** — run any property through a BRRRR-first underwriting model (rehab, ARV, refinance, cash-left-in-deal, post-refi cash flow) and instantly see whether the numbers work.

## Locked scope decisions

These came out of the initial concept conversation (2026-06-29) and drive every other doc:

| Decision | Choice | Why it matters |
| --- | --- | --- |
| Developer experience | Experienced dev, some mobile | Can go full-custom code; roadmap can move fast |
| Target platform | **iPhone only** | No Android/web parity work in v1 |
| Build machine | **Windows** | Rules out local Xcode → drives the stack choice |
| Primary strategy | **BRRRR** | Calculator is built around rehab → refi → cash-out |
| Scouting approach | **Driving for dollars** (full funnel; outreach via handoff, no route tracking yet) | Off-market deals on free phone capabilities; see scouting doc |
| Deal data (v1) | **Free / low-cost APIs** | Scouting starts with free tiers + public data; owner enrichment is the cost pressure point |

## Recommended stack (headline)

**React Native + Expo (managed workflow) + EAS Build, in TypeScript.**
The only mainstream way to build, device-test, and ship an iOS app *from Windows with no Mac*. See [`docs/04-tech-stack.md`](docs/04-tech-stack.md) for the full breakdown and alternatives.

## Documentation index

| Doc | What's in it |
| --- | --- |
| [`docs/00-concept.md`](docs/00-concept.md) | Vision, problem, target user, scope & non-goals |
| [`docs/01-deal-scouting.md`](docs/01-deal-scouting.md) | Driving-for-dollars funnel + free/low-cost data sources |
| [`docs/02-calculator-spec.md`](docs/02-calculator-spec.md) | BRRRR calculator: inputs, formulas, output metrics |
| [`docs/03-user-stories.md`](docs/03-user-stories.md) | Personas, epics, user stories with acceptance criteria |
| [`docs/04-tech-stack.md`](docs/04-tech-stack.md) | Full stack recommendation + Windows→iOS pipeline |
| [`docs/05-roadmap.md`](docs/05-roadmap.md) | Phased plan, goal-level (what/why per phase) |
| [`docs/06-implementation-plan.md`](docs/06-implementation-plan.md) | Build-level: ordered, commit-sized tasks per phase |

## Conventions

- Docs are numbered by reading order. Start at `00-concept.md`.
- Decisions are dated; when a decision changes, update the doc and note the date rather than deleting the old rationale.
