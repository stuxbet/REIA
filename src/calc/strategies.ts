/**
 * FLIP and LTR strategies on the same input set + primitives as the BRRRR
 * engine. Pure; reuses mortgagePayment from brrrr.ts. See docs/02 for the
 * shared conventions (NOI excludes debt service, capex is a separate reserve).
 */
import { mortgagePayment } from "./brrrr";
import type { BrrrrInputs } from "./types";

function allInCost(i: BrrrrInputs): number {
  const acqInterest = i.acqLoanAmount * (i.acqLoanRate / 12) * i.holdingMonths;
  return (
    i.purchasePrice +
    i.buyClosingCosts +
    i.rehabBudget +
    i.holdingMonths * i.monthlyHoldingCost +
    i.acqLoanFees +
    acqInterest
  );
}

export interface FlipResult {
  allInCost: number;
  sellingCosts: number;
  saleProceeds: number;
  netProfit: number;
  cashInvested: number;
  roi: number; // netProfit / cashInvested
  annualizedRoi: number; // roi scaled to a 12-month basis
  mao: number; // 70% rule max allowable offer
}

export function computeFlip(i: BrrrrInputs): FlipResult {
  const cost = allInCost(i);
  const sellingCosts = i.arv * (i.sellingCostsPct ?? 0.07);
  const saleProceeds = i.arv - sellingCosts;
  const netProfit = saleProceeds - cost;
  const cashInvested = cost - i.acqLoanAmount;
  const roi = cashInvested > 0 ? netProfit / cashInvested : 0;
  return {
    allInCost: cost,
    sellingCosts,
    saleProceeds,
    netProfit,
    cashInvested,
    roi,
    annualizedRoi: i.holdingMonths > 0 ? roi * (12 / i.holdingMonths) : roi,
    mao: i.arv * i.seventyRulePct - i.rehabBudget,
  };
}

export interface LtrResult {
  loanAmount: number;
  downPayment: number;
  cashInvested: number;
  mortgageMonthly: number;
  noiMonthly: number;
  noiAnnual: number;
  cashFlowMonthly: number;
  cashFlowAnnual: number;
  capRate: number;
  cashOnCash: number | null;
  dscr: number;
}

/** Buy-and-hold financed at PURCHASE price (reuses refiLtv/refiRate as the purchase loan). */
export function computeLtr(i: BrrrrInputs): LtrResult {
  const loanAmount = i.purchasePrice * i.refiLtv;
  const downPayment = i.purchasePrice - loanAmount;
  const cashInvested = downPayment + i.buyClosingCosts + i.rehabBudget;
  const mortgageMonthly = mortgagePayment(loanAmount, i.refiRate, i.refiTermYears);

  const egi = i.grossMonthlyRent * (1 - i.vacancyPct) + i.otherMonthlyIncome;
  const opEx =
    i.propertyTaxesMonthly +
    i.insuranceMonthly +
    i.hoaMonthly +
    i.utilitiesMonthly +
    i.grossMonthlyRent * (i.managementPct + i.maintenancePct);
  const noiMonthly = egi - opEx;
  const noiAnnual = noiMonthly * 12;
  const capexReserve = i.grossMonthlyRent * i.capexReservePct;
  const cashFlowMonthly = noiMonthly - capexReserve - mortgageMonthly;
  const annualDebt = mortgageMonthly * 12;

  return {
    loanAmount,
    downPayment,
    cashInvested,
    mortgageMonthly,
    noiMonthly,
    noiAnnual,
    cashFlowMonthly,
    cashFlowAnnual: cashFlowMonthly * 12,
    capRate: i.purchasePrice > 0 ? noiAnnual / i.purchasePrice : 0,
    cashOnCash: cashInvested > 0 ? (cashFlowMonthly * 12) / cashInvested : null,
    dscr: annualDebt > 0 ? noiAnnual / annualDebt : 0,
  };
}
