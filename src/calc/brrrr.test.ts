import { describe, expect, it } from "@jest/globals";

import { computeBrrrr, evaluateBuyBox, mortgagePayment } from "@/calc/brrrr";
import { DEFAULT_BUY_BOX, WORKED_EXAMPLE } from "@/calc/types";

describe("computeBrrrr — canonical worked example (docs/02)", () => {
  const r = computeBrrrr(WORKED_EXAMPLE);

  it("acquisition + refinance figures", () => {
    expect(r.allInCost).toBeCloseTo(167_000, 2);
    expect(r.totalCashInvested).toBeCloseTo(59_000, 2);
    expect(r.mao).toBeCloseTo(105_000, 2);
    expect(r.equityCaptured).toBeCloseTo(33_000, 2);
    expect(r.newLoanAmount).toBeCloseTo(150_000, 2);
    expect(r.refiProceeds).toBeCloseTo(38_000, 2);
    expect(r.cashLeftInDeal).toBeCloseTo(21_000, 2);
    expect(r.isFullyRecycled).toBe(false);
  });

  it("rental pro forma + headline metrics", () => {
    expect(r.noiMonthly).toBeCloseTo(1_249, 2);
    expect(r.newMortgageMonthly).toBeCloseTo(1_049, 0);
    expect(r.cashFlowMonthly).toBeCloseTo(105, 0);
    expect(r.capRate).toBeCloseTo(0.0749, 3);
    expect(r.cashOnCash).toBeCloseTo(0.06, 2);
    expect(r.dscr).toBeCloseTo(1.19, 2);
    expect(r.yieldOnCost).toBeCloseTo(0.09, 2);
    expect(r.rentToValue).toBeCloseTo(0.0095, 4);
  });

  it("grades as MARGINAL against the default buy box", () => {
    const v = evaluateBuyBox(r, DEFAULT_BUY_BOX);
    expect(v.verdict).toBe("MARGINAL");
    expect(v.cashLeftIn).toBe("fail");
    expect(v.cashFlow).toBe("pass");
    expect(v.cashOnCash).toBe("fail");
    expect(v.capRate).toBe("pass");
    expect(v.dscr).toBe("fail");
  });
});

describe("infinity / fully-recycled case", () => {
  it("returns null cash-on-cash when all capital is recycled", () => {
    const r = computeBrrrr({ ...WORKED_EXAMPLE, arv: 260_000 });
    expect(r.cashLeftInDeal).toBeLessThanOrEqual(0);
    expect(r.isFullyRecycled).toBe(true);
    expect(r.cashOnCash).toBeNull();
    expect(evaluateBuyBox(r, DEFAULT_BUY_BOX).cashLeftIn).toBe("pass");
  });
});

describe("guards", () => {
  it("zero-rate mortgage is principal / months", () => {
    expect(mortgagePayment(120_000, 0, 30)).toBeCloseTo(333.33, 2);
  });

  it("does not divide by zero on empty inputs", () => {
    const r = computeBrrrr({ ...WORKED_EXAMPLE, arv: 0, grossMonthlyRent: 0 });
    expect(r.capRate).toBe(0);
    expect(r.rentToValue).toBe(0);
    expect(Number.isFinite(r.allInCost)).toBe(true);
  });
});
