# 02 — BRRRR Calculator Spec

_Last updated: 2026-06-29_

The underwriting engine. Written precisely enough to implement directly as a pure, unit-tested TypeScript module (`calc/brrrr.ts`) with no UI dependencies.

## Convention note (read first)

- All money in whole dollars; all rates as decimals internally (7.5% → `0.075`).
- **Vacancy, maintenance, management** are modeled as monthly operating expenses (default % of gross rent).
- **NOI excludes** debt service, CapEx reserves, depreciation, and income tax (standard).
- **CapEx reserve** is shown as a separate line below NOI and subtracted to reach cash flow (conservative, investor-friendly).
- Where a number can be entered as `$` or `%`, store both the mode and value.

---

## Inputs

### A. Acquisition
| Input | Notes |
| --- | --- |
| `purchasePrice` | |
| `buyClosingCosts` | $ or % of price (default ~2–3%) |
| `rehabBudget` | total renovation cost |
| `holdingMonths` | months from purchase to refinance (the rehab/season period) |
| `monthlyHoldingCost` | taxes + insurance + utilities during rehab (carry) |
| `acqLoanAmount` | hard-money/private principal financed at purchase (0 if all cash) |
| `acqLoanRate` | interest rate during hold (often interest-only) |
| `acqLoanFees` | points + fees on the acquisition loan |

### B. After Repair Value
| Input | Notes |
| --- | --- |
| `arv` | after-repair value (from comps or estimate) |
| `seventyRulePct` | rule-of-thumb screen %, default `0.70` |

### C. Refinance (cash-out)
| Input | Notes |
| --- | --- |
| `refiLtv` | loan-to-value on ARV, default `0.75` |
| `refiClosingCosts` | $ or % of new loan (default ~2–3%) |
| `refiRate` | new permanent loan rate |
| `refiTermYears` | amortization, default `30` |

### D. Rental operations (post-refi, steady state)
| Input | Default |
| --- | --- |
| `grossMonthlyRent` | — |
| `otherMonthlyIncome` | 0 |
| `propertyTaxesMonthly` | — |
| `insuranceMonthly` | — |
| `vacancyPct` | 0.05 |
| `managementPct` | 0.08 |
| `maintenancePct` | 0.05 |
| `capexReservePct` | 0.05 |
| `hoaMonthly` / `utilitiesMonthly` | 0 |

### E. Buy-box thresholds (for the verdict)
`minCashOnCash`, `maxCashLeftIn`, `minDSCR`, `minMonthlyCashFlow`, `minCapRate`. Used to color-code pass/fail.

---

## Core formulas

**Monthly mortgage payment (amortizing)**
```
r = annualRate / 12
n = years * 12
payment = principal * r * (1+r)^n / ((1+r)^n - 1)
// if r == 0: payment = principal / n
```

**Acquisition / all-in**
```
allInCost      = purchasePrice + buyClosingCosts + rehabBudget
               + (holdingMonths * monthlyHoldingCost) + acqLoanFees
               + acqInterestDuringHold            // acqLoanAmount * acqLoanRate/12 * holdingMonths (interest-only approx)
totalCashInvested = allInCost - acqLoanAmount      // out-of-pocket before refi
```

**70% rule screen**
```
maxAllowableOffer (MAO) = arv * seventyRulePct - rehabBudget
equityCaptured          = arv - allInCost
```

**Refinance**
```
newLoanAmount   = arv * refiLtv
refiProceeds    = newLoanAmount - acqLoanAmount - refiClosingCosts   // cash returned at refi
cashLeftInDeal  = totalCashInvested - refiProceeds                   // ⭐ THE BRRRR NUMBER
```
> If `cashLeftInDeal <= 0`, all capital is recycled → return is effectively infinite. Flag as **"♾ capital fully recycled"** rather than dividing.

**Rental pro forma (monthly → annual)**
```
EGI            = grossMonthlyRent * (1 - vacancyPct) + otherMonthlyIncome
opEx           = propertyTaxesMonthly + insuranceMonthly + hoaMonthly + utilitiesMonthly
               + grossMonthlyRent * (managementPct + maintenancePct)
NOI_monthly    = EGI - opEx
capexReserve   = grossMonthlyRent * capexReservePct
newMortgage    = payment(newLoanAmount, refiRate, refiTermYears)
cashFlowMonthly= NOI_monthly - capexReserve - newMortgage
NOI_annual     = NOI_monthly * 12
cashFlowAnnual = cashFlowMonthly * 12
annualDebtSvc  = newMortgage * 12
```

## Output metrics

| Metric | Formula | Good benchmark (BRRRR) |
| --- | --- | --- |
| **All-in cost** | see above | ≤ ARV × 0.75 ideally |
| **Cash left in deal** ⭐ | `totalCashInvested - refiProceeds` | ≤ $0–10k (lower is better) |
| **Monthly cash flow** | `cashFlowMonthly` | > $100–200/unit |
| **Cash-on-cash** | `cashFlowAnnual / cashLeftInDeal` | > 8–12% (∞ if cash recycled) |
| **Cap rate** | `NOI_annual / arv` | ≥ market cap rate; 6–8%+ |
| **DSCR** | `NOI_annual / annualDebtSvc` | ≥ 1.20–1.25 (lender gate) |
| **Equity captured** | `arv - allInCost` | > $25–35k |
| **Yield on cost** | `NOI_annual / allInCost` | ≥ market cap + 1–2% spread |
| **Rent-to-value** | `grossMonthlyRent / arv` | ≥ ~1% (the "1% rule") |
| **GRM** | `purchasePrice / (grossMonthlyRent*12)` | lower is better |
| **Total ROI yr 1** | `(cashFlowAnnual + principalPaydownYr1 + appreciationYr1) / cashLeftInDeal` | strategy-dependent |

> When `cashLeftInDeal <= 0`, render cash-on-cash and total ROI as "♾ / fully recycled" and surface equity captured + monthly cash flow as the headline numbers instead.

---

## Worked example (use as the canonical unit test)

**Inputs:** purchase 120,000 · buy closing 3,000 · rehab 35,000 · holding 6 mo × ~1,000 ≈ 6,000 · acq loan 108,000 @ interest-only (fees folded to ≈3,000 all-in) · ARV 200,000 · refi LTV 75% · refi closing 4,000 · refi 30 yr @ 7.5% · rent 1,900.

| Result | Value |
| --- | --- |
| All-in cost | ≈ **167,000** |
| Total cash invested | 167,000 − 108,000 = **59,000** |
| New loan (200k × 75%) | **150,000** |
| Refi proceeds | 150,000 − 108,000 − 4,000 = **38,000** |
| **Cash left in deal** | 59,000 − 38,000 = **21,000** |
| New mortgage (150k, 7.5%, 30y) | ≈ **$1,049/mo** |
| NOI | ≈ **$1,249/mo** ($14,988/yr) |
| Monthly cash flow (after CapEx) | ≈ **$105/mo** |
| Cash-on-cash | 1,260 / 21,000 = **6.0%** |
| Cap rate (on ARV) | 14,988 / 200,000 = **7.5%** |
| DSCR | 14,988 / 12,588 = **1.19** |
| Equity captured | 200,000 − 167,000 = **33,000** |
| 70% rule MAO | 200k × 0.70 − 35k = **105,000** (purchase 120k is *above* MAO) |

This deal illustrates the BRRRR tension well: it **fails the 70% rule** and DSCR is borderline, but it recycles most capital and captures $33k equity — exactly the kind of nuanced call the calculator should make visible rather than reduce to a single yes/no.

## Implementation notes

- **Pure & testable.** All math lives in a framework-agnostic module returning a typed result object. No React, no I/O. Snapshot-test against the worked example.
- **Guard divide-by-zero / negatives.** `cashLeftInDeal <= 0`, `arv = 0`, `grossRent = 0` must not throw.
- **Sensitivity (fast-follow).** Recompute key metrics across a grid (ARV ±10%, rate ±1%, rehab ±20%) to show how fragile the deal is.
- **Strategy layers (later).** Long-term-rental, flip (ARV − all-in − selling costs = profit; ROI on cash), and STR variants reuse these same primitives — keep functions composable.
- **Persist inputs + computed snapshot** per saved deal so historical analyses don't silently change when defaults change.
