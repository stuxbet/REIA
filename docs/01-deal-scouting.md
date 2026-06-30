# 01 — Deal Scouting (Driving for Dollars)

_Last updated: 2026-06-29_

**Decision (2026-06-29):** Driving for dollars (D4D) is the **primary scouting pillar** for v1. On-market auto-underwriting and market heatmaps are deferred; social media is out. Rationale: D4D produces the off-market, distressed BRRRR deals this app is built for, and it runs on free phone capabilities (GPS, camera, Apple Maps) — a perfect fit for the free/low-cost constraint.

## Scope decisions locked

| Decision | Choice |
| --- | --- |
| Funnel depth | **Full pipeline:** capture → identify → enrich → organize → outreach |
| Visual map | **Yes** — pins shown on a real map (Apple Maps base, free on iOS) |
| Route tracking (GPS breadcrumb trail) | **Dropped** — not building it (decision 2026-06-29). |
| Pin capture | **Manual** — tap to drop at current location, tap the map, or search an address |
| Outreach sending | **Handoff only** — app composes; user sends via their own Mail/Messages/Phone. **Nothing routes through our servers.** |

---

## The D4D funnel

Five stages plus the handoff into the calculator. Each stage notes what it needs and the free/low-cost data behind it.

### 1. Capture
The core in-the-field loop. Must be fast and one-handed (often a passenger logging while someone drives).
- **Visual map** centered on the user (react-native-maps, Apple Maps base — free on iOS).
- **Drop a pin** three ways: one tap at current location (foreground GPS via expo-location), tap anywhere on the map, or search an address.
- **Attach evidence:** photo(s) from the camera, free-text notes, and **distress tags** (vacant, overgrown, boarded windows, tarped/damaged roof, fire damage, code-violation notice, FSBO sign, hoarder, etc.).
- **Offline-first:** capture works with no signal and syncs when back online (you're driving through dead zones).

### 2. Identify
Turn a dropped location into a real property.
- **Reverse-geocode** the pin to a street address (Apple's geocoder via expo-location — free). User confirms/edits.
- De-dupe against existing leads so the same house isn't logged twice.

### 3. Enrich (owner & property data)
Gauge seller motivation. **This is the one stage that bumps against "free":** good owner/skip-trace data is mostly paid or limited on free tiers.
- **Auto-pull where free/cheap data allows:** owner name, mailing address, **absentee-owner flag** (mailing address ≠ property address — a top motivation signal), last sale date/price, assessed value, and tax-delinquency status (RentCast/ATTOM limited tiers; county assessor where accessible).
- **Manual entry fills gaps:** any field can be typed in from a quick county-records lookup the user does themselves.
- **Motivation score (simple):** combine distress tags + absentee flag + tax status into a rough hot/warm/cold rank.
- Paid skip tracing (owner phone/email) is an **optional later add**, not v1.

### 4. Organize
Manage the pipeline.
- **Lead lists** and a **status workflow:** new → researching → contacted → negotiating → under contract → dead.
- Tags, notes, sort/filter, and both **map view** and **list view** of leads.

### 5. Outreach (compose + handoff — never send through us)
The tier-3 pipeline, done the free/compliance-light way you specified.
- **Compose from a template** with merge fields (owner name, property address) — e.g., a "we'd like to buy your house" letter/message.
- **Hand off to the user's own apps** via deep links / the iOS share sheet:
  - Email → `mailto:` opens Apple Mail/Gmail pre-filled
  - Text → `sms:` opens Messages
  - Call → `tel:` opens Phone
  - Physical letter → generate a **printable/exportable** letter the user prints and mails themselves
- **We are never the sender.** No email server, no SMS gateway, no mail-printing service in the loop. This keeps outreach free and keeps us out of the sending/compliance path (the user is the sender and owns that responsibility).

### → Underwrite (bridge to Pillar 2)
From any lead, **jump straight into the BRRRR calculator** with an estimated ARV pre-filled, so a curbside find can be underwritten on the spot. This is where scouting hands off to [`02-calculator-spec.md`](02-calculator-spec.md).

---

## Data sources (free / low-cost)

| Need | Source | Cost |
| --- | --- | --- |
| Map + base tiles | **Apple MapKit** (react-native-maps) | Free on iOS |
| Current location + reverse geocode | **expo-location** (foreground only) | Free |
| Custom map styles / heatmaps (later) | **Mapbox** | Generous free tier |
| Owner / tax / sale records (enrichment) | **RentCast**, **ATTOM** (limited/trial tiers), **county assessor** | Free tier → paid; the cost pressure point |
| Outreach delivery | **Device's own Mail/Messages/Phone** via deep links | Free — nothing through us |
| Printable letter | Generated in-app (PDF/print) | Free |

## Compliance notes (lighter, but not zero)

Because the **user** sends every message through their own apps, we avoid being a regulated sender — a deliberate design win. Still, document for the user:
- Cold calls/texts touch **TCPA / Do-Not-Call**; email touches **CAN-SPAM**; physical mail and owner-data use touch state-specific rules.
- Since outreach is composed-then-handed-off, responsibility sits with the user. Add a short in-app reminder rather than building compliance machinery.
- Respect data-source ToS and rate limits when enriching; cache results.

## Deferred / future angles (not v1)

- **Route tracking (GPS breadcrumb trail)** — **dropped** (not building it).
- **On-market auto-underwriting ("deal feed")** — pull listings and auto-run the BRRRR model against a buy box. Strong complement once D4D ships; reuses the same calculator.
- **Market heatmaps** — rent-to-price overlays to aim drives at the right neighborhoods.
- **Social media** — still out: Facebook/Nextdoor are API-locked and scraping is ToS/legal risk. Revisit only as public-source monitoring feeding the deferred deal feed.
- **Paid skip tracing** — owner phone/email lookup, if/when outreach needs direct contact beyond mailing address.
