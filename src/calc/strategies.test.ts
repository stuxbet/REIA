import { describe, expect, it } from "@jest/globals";

import { computeFlip, computeLtr } from "@/calc/strategies";
import { WORKED_EXAMPLE } from "@/calc/types";

describe("computeFlip — worked example inputs", () => {
  const r = computeFlip(WORKED_EXAMPLE);
  it("profit + returns", () => {
    expect(r.allInCost).toBeCloseTo(167_000, 2);
    expect(r.sellingCosts).toBeCloseTo(14_000, 2); // 200k * 7%
    expect(r.saleProceeds).toBeCloseTo(186_000, 2);
    expect(r.netProfit).toBeCloseTo(19_000, 2); // 186k - 167k
    expect(r.cashInvested).toBeCloseTo(59_000, 2);
    expect(r.roi).toBeCloseTo(0.322, 3); // 19k / 59k
    expect(r.annualizedRoi).toBeCloseTo(0.644, 2); // roi * 12/6
    expect(r.mao).toBeCloseTo(105_000, 2);
  });
});

describe("computeLtr — worked example inputs", () => {
  const r = computeLtr(WORKED_EXAMPLE);
  it("financed at purchase price", () => {
    expect(r.loanAmount).toBeCloseTo(90_000, 2); // 120k * 75%
    expect(r.downPayment).toBeCloseTo(30_000, 2);
    expect(r.cashInvested).toBeCloseTo(68_000, 2); // down + closing + rehab
    expect(r.mortgageMonthly).toBeCloseTo(629, 0);
    expect(r.noiMonthly).toBeCloseTo(1_249, 2);
    expect(r.cashFlowMonthly).toBeCloseTo(525, 0);
    expect(r.capRate).toBeCloseTo(0.125, 2); // NOI / purchase
    expect(r.cashOnCash).not.toBeNull();
    expect(r.dscr).toBeCloseTo(1.98, 1);
  });
});
