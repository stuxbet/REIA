/**
 * Pure BRRRR underwriting engine. No React, no I/O — see docs/02-calculator-spec.md.
 * The UI must not embed math; feed inputs here and render the result.
 */
import { type BrrrrInputs, type BrrrrResult, type BuyBox } from "./types";

/** Monthly amortizing payment. Guards the zero-rate case. */
export function mortgagePayment(principal: number, annualRate: number, years: number): number {
  const n = years * 12;
  if (n <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

export function computeBrrrr(i: BrrrrInputs): BrrrrResult {
  // A · Acquisition / all-in
  const acqInterestDuringHold = i.acqLoanAmount * (i.acqLoanRate / 12) * i.holdingMonths;
  const allInCost =
    i.purchasePrice +
    i.buyClosingCosts +
    i.rehabBudget +
    i.holdingMonths * i.monthlyHoldingCost +
    i.acqLoanFees +
    acqInterestDuringHold;
  const totalCashInvested = allInCost - i.acqLoanAmount;

  // B · 70% rule + equity
  const mao = i.arv * i.seventyRulePct - i.rehabBudget;
  const equityCaptured = i.arv - allInCost;

  // C · Refinance
  const newLoanAmount = i.arv * i.refiLtv;
  const refiProceeds = newLoanAmount - i.acqLoanAmount - i.refiClosingCosts;
  const cashLeftInDeal = totalCashInvested - refiProceeds;
  const isFullyRecycled = cashLeftInDeal <= 0;

  // D · Rental pro forma (monthly)
  const egi = i.grossMonthlyRent * (1 - i.vacancyPct) + i.otherMonthlyIncome;
  const opEx =
    i.propertyTaxesMonthly +
    i.insuranceMonthly +
    i.hoaMonthly +
    i.utilitiesMonthly +
    i.grossMonthlyRent * (i.managementPct + i.maintenancePct);
  const noiMonthly = egi - opEx;
  const noiAnnual = noiMonthly * 12;
  const capexReserveMonthly = i.grossMonthlyRent * i.capexReservePct;
  const newMortgageMonthly = mortgagePayment(newLoanAmount, i.refiRate, i.refiTermYears);
  const annualDebtService = newMortgageMonthly * 12;
  const cashFlowMonthly = noiMonthly - capexReserveMonthly - newMortgageMonthly;
  const cashFlowAnnual = cashFlowMonthly * 12;

  return {
    allInCost,
    totalCashInvested,
    mao,
    equityCaptured,
    newLoanAmount,
    refiProceeds,
    cashLeftInDeal,
    isFullyRecycled,
    noiMonthly,
    noiAnnual,
    capexReserveMonthly,
    newMortgageMonthly,
    annualDebtService,
    cashFlowMonthly,
    cashFlowAnnual,
    capRate: i.arv > 0 ? noiAnnual / i.arv : 0,
    cashOnCash: isFullyRecycled ? null : cashFlowAnnual / cashLeftInDeal,
    dscr: annualDebtService > 0 ? noiAnnual / annualDebtService : 0,
    yieldOnCost: allInCost > 0 ? noiAnnual / allInCost : 0,
    rentToValue: i.arv > 0 ? i.grossMonthlyRent / i.arv : 0,
    grm: i.grossMonthlyRent > 0 ? i.purchasePrice / (i.grossMonthlyRent * 12) : 0,
  };
}

export type MetricStatus = "pass" | "fail" | "watch";
export type Verdict = "GO" | "MARGINAL" | "NO-GO";

export interface BuyBoxEvaluation {
  verdict: Verdict;
  cashLeftIn: MetricStatus;
  cashFlow: MetricStatus;
  cashOnCash: MetricStatus;
  capRate: MetricStatus;
  dscr: MetricStatus;
}

/** Grade a result against the buy box and produce the go/no-go verdict. */
export function evaluateBuyBox(r: BrrrrResult, b: BuyBox): BuyBoxEvaluation {
  const cashLeftIn: MetricStatus = r.isFullyRecycled || r.cashLeftInDeal <= b.maxCashLeftIn ? "pass" : "fail";
  const cashFlow: MetricStatus = r.cashFlowMonthly >= b.minMonthlyCashFlow ? "pass" : "fail";
  const cashOnCash: MetricStatus =
    r.cashOnCash === null || r.cashOnCash >= b.minCashOnCash ? "pass" : "fail";
  const capRate: MetricStatus = r.capRate >= b.minCapRate ? "pass" : "fail";
  const dscr: MetricStatus = r.dscr >= b.minDSCR ? "pass" : "fail";

  let verdict: Verdict;
  if (r.cashFlowMonthly < 0 || r.dscr < 1.0) {
    verdict = "NO-GO";
  } else if (
    cashLeftIn === "pass" &&
    cashFlow === "pass" &&
    cashOnCash === "pass" &&
    capRate === "pass" &&
    dscr === "pass"
  ) {
    verdict = "GO";
  } else {
    verdict = "MARGINAL";
  }

  return { verdict, cashLeftIn, cashFlow, cashOnCash, capRate, dscr };
}
