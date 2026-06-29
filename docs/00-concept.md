# 00 — Concept & Vision

_Last updated: 2026-06-29_

## One-line pitch

A mobile tool that helps a real estate investor **find** promising properties and **decide in seconds** whether a given deal is worth pursuing — with a calculator built specifically around the BRRRR strategy.

## The problem

Finding good investment deals is two jobs that usually live in different tools:

1. **Sourcing** is scattered across MLS portals, Facebook groups, auction sites, mailers, and "driving for dollars." There's no single place where deals that match *your_ criteria surface automatically.
2. **Underwriting** is done in clunky spreadsheets that are easy to fat-finger, hard to use on a phone while standing in a driveway, and not tailored to BRRRR (where the refinance and "cash left in the deal" are the whole game).

The result: investors either analyze too few deals (slow spreadsheets) or chase bad ones (no consistent screen). This app collapses both jobs into one phone-first workflow.

## Vision

> Open the app, see a short list of properties worth a closer look, tap one, and immediately know your all-in cost, how much cash you'll have left in after refinancing, and your post-refi cash-on-cash return. Save the keepers, dismiss the rest, repeat.

Speed and trust in the numbers are the product. Everything else is secondary.

## Target user (primary persona)

**"Active BRRRR investor"** — buys distressed/undervalued single-family or small multifamily, rehabs, rents, refinances to pull most of their capital back out, repeats. Analyzes many properties per week, makes fast go/no-go calls, and needs the refinance math to be exactly right because that's what determines whether they can recycle their down payment.

Secondary (later): buy-and-hold landlords, flippers, and house-hackers — the calculator can grow to cover them, but BRRRR is the v1 spine.

## The two pillars

### Pillar 1 — Deal Scouting via Driving for Dollars
The v1 scouting focus is **driving for dollars (D4D)**: finding off-market distressed properties in the field and working them through a lead pipeline. Full funnel (detailed in [`01-deal-scouting.md`](01-deal-scouting.md)):
- **Capture** — a visual map; drop pins manually at your location / on the map / by address; attach photos and distress tags.
- **Identify** — reverse-geocode the pin to a real address.
- **Enrich** — owner, absentee-owner flag, last sale, and tax status where free/cheap data allows (the one cost pressure point).
- **Organize** — lead lists and a status pipeline (new → researching → contacted → dead).
- **Outreach** — compose a message, then hand off to the user's own Mail/Messages/Phone; **nothing routes through our servers**.
- **→ Underwrite** — jump from any lead straight into the BRRRR calculator.

Deferred (not v1): GPS route tracking, on-market auto-underwriting (deal feed), market heatmaps. See scouting doc for why.

### Pillar 2 — Deal Calculator
A BRRRR-first underwriting engine (detailed in [`02-calculator-spec.md`](02-calculator-spec.md)) that takes a property's numbers and returns the metrics that decide the deal: all-in cost, ARV, refinance proceeds, **cash left in deal**, post-refi cash flow, cash-on-cash, cap rate, DSCR, and the 70% rule check.

## Scope & non-goals (v1)

**In scope**
- iPhone app (iOS only).
- BRRRR calculator with saved deals.
- Driving-for-dollars scouting: visual map, manual pin capture with photos/distress tags, owner/tax enrichment (free tiers), lead pipeline, and outreach composed in-app but **sent via the user's own apps**.
- Local-first storage of deals and leads, with optional cloud sync/account.

**Explicitly NOT in v1 (non-goals)**
- Android or web app.
- **GPS route tracking** (background-location breadcrumb trail) — deferred to post-v1.
- **On-market deal feed / market heatmaps** — deferred; D4D is the v1 scouting focus.
- **The app sending any outreach itself** — no email/SMS/mail-print service; outreach is composed then handed off to the user's apps (the user is always the sender).
- Paid/premium MLS data feeds and paid skip tracing (owner phone/email).
- Social-media scraping of Facebook/Nextdoor (API-locked and ToS-risky — see scouting doc).
- Transaction/closing management, seller CRM beyond the lead pipeline, or e-sign.
- Full tax modeling (depreciation schedules, 1031) beyond simple estimates.
- Multi-user / team features.

## Product principles

1. **The numbers must be trustworthy.** The calculator is pure, tested logic with no surprises. Show the formula behind every metric.
2. **Phone-first and fast.** A deal should be analyzable in under a minute, one-handed.
3. **Free-tier friendly.** Default to public/free data; never block the core workflow behind a paid API.
4. **Local-first.** The app is fully useful offline with manually entered deals; cloud is an enhancement, not a requirement.
5. **BRRRR is the spine.** Other strategies are additive layers on the same engine, not separate apps.

## Open questions (to revisit)

- Account model: fully local, or require sign-in for sync from day one? (Leaning local-first with optional account.)
- Geographic focus for data: nationwide US, or pilot in one metro the user knows? (Public data quality varies by county.)
- Monetization, if any (personal tool vs. future product). Not a v1 concern, but it influences the account/backend choices.
