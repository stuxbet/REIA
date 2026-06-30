# 03 — User Stories

_Last updated: 2026-06-29_

Format: `As a <role>, I want <goal>, so that <benefit>.` Each story has acceptance criteria (AC) and a priority tag: **[MVP]**, **[v1]**, or **[Later]**.

## Personas

- **Marcus — Active BRRRR investor (primary).** Analyzes many properties weekly, makes fast go/no-go calls, lives and dies by the refinance math and "cash left in deal." Often underwriting on his phone in a driveway.
- **Dana — Buy-and-hold landlord (secondary, later).** Wants steady cash-flowing rentals; cares about cap rate and cash-on-cash more than refinance mechanics.

---

## Epic 1 — BRRRR Calculator

**1.1 [MVP]** As Marcus, I want to enter a property's purchase, rehab, ARV, refinance, and rental numbers, so that I can see whether the deal works.
- AC: All inputs from [`02-calculator-spec.md`](02-calculator-spec.md) are editable.
- AC: Outputs update live as I type.
- AC: `$`/`%` toggle works for closing costs, vacancy, management, etc.

**1.2 [MVP]** As Marcus, I want to instantly see **cash left in deal**, monthly cash flow, cash-on-cash, cap rate, and DSCR, so that I can make a go/no-go call.
- AC: These five are shown as headline metrics above the fold.
- AC: When cash left in deal ≤ 0, the app shows "♾ capital fully recycled" instead of dividing by zero.

**1.3 [MVP]** As Marcus, I want sensible default assumptions (vacancy, management, maintenance, CapEx %), so that I can underwrite fast without filling every field.
- AC: Defaults match the spec and are applied to new deals.
- AC: I can edit defaults in Settings (see Epic 6).

**1.4 [v1]** As Marcus, I want each metric to show the formula/explanation behind it, so that I trust the number.
- AC: Tapping a metric reveals its formula and the inputs feeding it.

**1.5 [v1]** As Marcus, I want a clear pass/fail verdict against my buy box, so that marginal deals are obvious at a glance.
- AC: Metrics are color-coded vs. my thresholds; an overall verdict chip summarizes.

**1.6 [Later]** As Marcus, I want a sensitivity view (ARV ±10%, rate ±1%, rehab ±20%), so that I know how fragile the deal is.
- AC: A grid/heat strip shows key metrics across the ranges.

**1.7 [Later]** As Dana, I want a long-term-rental and a fix-&-flip mode, so that the calculator fits other strategies.
- AC: Mode switch reuses the same engine; flip mode shows projected profit and ROI.

## Epic 2 — Saved deals

**2.1 [MVP]** As Marcus, I want to save a deal with its inputs and computed results, so that I can revisit it later.
- AC: A saved deal persists locally and survives app restarts.
- AC: The computed snapshot is stored so later default changes don't alter history.

**2.2 [MVP]** As Marcus, I want a list of my saved deals with key metrics and a name/address, so that I can compare them.
- AC: List shows address, cash left in, cash flow, CoC; sortable.

**2.3 [v1]** As Marcus, I want to duplicate and tweak a saved deal, so that I can run scenarios.
- AC: "Duplicate" creates an independent copy.

**2.4 [v1]** As Marcus, I want to set a status on a deal (analyzing / pursuing / dead), so that I can manage my pipeline.

## Epic 3 — Driving for Dollars (primary scouting)

The v1 scouting pillar. Stories follow the funnel in [`01-deal-scouting.md`](01-deal-scouting.md).

**3.1 [v1]** As Marcus, I want a map centered on my location showing leads I've already logged, so that I can see where I am and avoid duplicates while driving.
- AC: Map shows current location and existing lead pins (map view + list view).

**3.2 [v1]** As Marcus, I want to drop a pin in one tap — at my current location, by tapping the map, or by searching an address — so that I can log a property fast while driving.
- AC: Pin created at the chosen location with minimal taps.
- AC: Capture works **offline** and syncs when back online.

**3.3 [v1]** As Marcus, I want to attach photos, notes, and distress tags (vacant, overgrown, boarded, damaged roof, code violation, FSBO…) to a lead, so that I remember why it's worth pursuing.
- AC: One or more camera photos, free-text notes, and multi-select tags persist on the lead.

**3.4 [v1]** As Marcus, I want a dropped pin reverse-geocoded to a street address I can confirm or edit, so that the lead has a real address.
- AC: Address auto-fills from coordinates and is editable; a near-duplicate triggers a warning.

**3.5 [v1]** As Marcus, I want owner name, absentee-owner flag, last sale, and tax status pulled (or entered) for a lead, so that I can gauge seller motivation.
- AC: Auto-filled where free data allows; every field manually editable.
- AC: Absentee flag computed from owner mailing address ≠ property address; a simple hot/warm/cold motivation score combines tags + absentee + tax status.

**3.6 [v1]** As Marcus, I want lead lists and a status pipeline (new → researching → contacted → negotiating → under contract → dead), so that I can manage follow-up.
- AC: Status settable per lead; filter/sort by status, tag, and motivation.

**3.7 [v1]** As Marcus, I want to compose a templated message and send it from my own Mail/Messages/Phone, so that I can reach owners without anything going through a server.
- AC: Template merges owner name + property address.
- AC: Buttons open `mailto:` / `sms:` / `tel:` or the iOS share sheet; a physical letter exports to print/PDF.
- AC: **No backend send path** — the user is always the sender.

**3.8 [v1]** As Marcus, I want to jump from a lead into the BRRRR calculator with an estimated ARV pre-filled, so that I can underwrite a find on the spot.
- AC: Calculator opens linked to the lead; the saved deal references the lead.

**3.9 [Dropped]** GPS breadcrumb trail / route tracking — **cut from scope** (decision 2026-06-29). Not building it.

## Epic 4 — On-market deal feed (deferred)

**4.1 [Later]** As Marcus, I want to define a buy box and have the app pull active listings and auto-run my numbers, so that on-market deals surface without manual entry.

**4.2 [Later]** As Marcus, I want a ranked feed of listings that pass my buy box, openable into the calculator, so that I review only worthwhile candidates.

**4.3 [Later]** As Marcus, I want alerts when a new passing deal appears, so that I act before others.

## Epic 5 — Market intelligence (deferred)

**5.1 [Later]** As Marcus, I want a heatmap of rent-to-price ratio by ZIP/tract, so that I can target cash-flow-friendly areas to drive.

**5.2 [Later]** As Marcus, I want median price/rent/trend overlays, so that I understand a market before drilling into houses.

## Epic 6 — Settings & assumptions

**6.1 [MVP]** As Marcus, I want to set my default assumptions and buy-box thresholds, so that every new deal starts from my standards.
- AC: Changes apply to new deals only, not retroactively to saved ones.

**6.2 [v1]** As Marcus, I want to manage data-source API keys, so that I can use free-tier services I sign up for.

## Epic 7 — Account & sync (optional)

**7.1 [Later]** As Marcus, I want optional sign-in with cloud sync, so that my deals survive a lost phone and sync across devices.
- AC: App is fully usable offline/local without an account; sync is additive.

---

## MVP cut line

**First ship = Epics 1 (1.1–1.3), 2 (2.1–2.2), 6 (6.1).** A trustworthy BRRRR calculator with saved deals and editable defaults — usable entirely offline with manual entry. This is the smallest thing that delivers the core promise: *underwrite a BRRRR deal in under a minute and keep it.*

**Immediate next (Phase 2) = Epic 3, Driving for Dollars**, built capture-first: map + pins + photos/tags + lead pipeline (3.1–3.4, 3.6) before enrichment and outreach (3.5, 3.7) and the calculator bridge (3.8). Epics 4–5 remain deferred.
