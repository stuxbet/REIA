/**
 * BRRRR calculator domain types + fixtures.
 * Formulas live in brrrr.ts (pure). Spec: docs/02-calculator-spec.md.
 * Conventions: money in whole dollars, rates as decimals (7.5% -> 0.075).
 */

export interface BrrrrInputs {
  // A · Acquisition
  purchasePrice: number;
  buyClosingCosts: number;
  rehabBudget: number;
  holdingMonths: number;
  monthlyHoldingCost: number; // carry during rehab (taxes/ins/utils/loan interest)
  acqLoanAmount: number; // hard-money/private principal financed at purchase (0 = all cash)
  acqLoanRate: number; // interest rate during hold (0 if folded into monthlyHoldingCost)
  acqLoanFees: number; // points + fees on the acquisition loan

  // B · After-repair value / sale
  arv: number;
  seventyRulePct: number; // rule-of-thumb screen, default 0.70
  sellingCostsPct: number; // fix & flip: sale costs as % of ARV (commission + closing)

  // C · Refinance
  refiLtv: number; // loan-to-value on ARV, default 0.75
  refiClosingCosts: number;
  refiRate: number;
  refiTermYears: number;

  // D · Rental operations (monthly)
  grossMonthlyRent: number;
  otherMonthlyIncome: number;
  propertyTaxesMonthly: number;
  insuranceMonthly: number;
  hoaMonthly: number;
  utilitiesMonthly: number;
  vacancyPct: number;
  managementPct: number;
  maintenancePct: number;
  capexReservePct: number;
}

export interface BrrrrResult {
  allInCost: number;
  totalCashInvested: number;
  mao: number; // max allowable offer (70% rule)
  equityCaptured: number;
  newLoanAmount: number;
  refiProceeds: number; // cash returned at refinance
  cashLeftInDeal: number; // the BRRRR number
  isFullyRecycled: boolean; // cashLeftInDeal <= 0

  noiMonthly: number;
  noiAnnual: number;
  capexReserveMonthly: number;
  newMortgageMonthly: number;
  annualDebtService: number;
  cashFlowMonthly: number;
  cashFlowAnnual: number;

  capRate: number; // NOI / ARV
  cashOnCash: number | null; // null when fully recycled (infinite)
  dscr: number; // NOI / annual debt service
  yieldOnCost: number; // NOI / all-in cost
  rentToValue: number; // monthly rent / ARV
  grm: number; // price / annual gross rent
}

/** Buy-box thresholds that drive verdicts + metric dots. */
export interface BuyBox {
  maxCashLeftIn: number;
  minMonthlyCashFlow: number;
  minCashOnCash: number; // decimal
  minCapRate: number; // decimal
  minDSCR: number;
}

export const DEFAULT_BUY_BOX: BuyBox = {
  maxCashLeftIn: 10_000,
  minMonthlyCashFlow: 100,
  minCashOnCash: 0.08,
  minCapRate: 0.06,
  minDSCR: 1.2,
};

/**
 * The canonical worked example from docs/02 — also the numbers shown in the
 * tactical mocks ($21K cash-left, 6.0% CoC, 1.19 DSCR, $33K equity, MAO $105K).
 * Used as the engine's snapshot test and as UNDERWRITE's seed deal.
 */
export const WORKED_EXAMPLE: BrrrrInputs = {
  purchasePrice: 120_000,
  buyClosingCosts: 3_000,
  rehabBudget: 35_000,
  holdingMonths: 6,
  monthlyHoldingCost: 1_000,
  acqLoanAmount: 108_000,
  acqLoanRate: 0, // interest folded into monthlyHoldingCost carry
  acqLoanFees: 3_000,
  arv: 200_000,
  seventyRulePct: 0.7,
  sellingCostsPct: 0.07,
  refiLtv: 0.75,
  refiClosingCosts: 4_000,
  refiRate: 0.075,
  refiTermYears: 30,
  grossMonthlyRent: 1_900,
  otherMonthlyIncome: 0,
  propertyTaxesMonthly: 200,
  insuranceMonthly: 90,
  hoaMonthly: 0,
  utilitiesMonthly: 0,
  vacancyPct: 0.05,
  managementPct: 0.09,
  maintenancePct: 0.05,
  capexReservePct: 0.05,
};
