import { describe, expect, it } from "@jest/globals";

import { formatPercent, formatUSD, round2 } from "@/lib/format";

// Also serves as the Phase 0 smoke test: proves Jest + TypeScript + the
// "@/*" path alias all resolve correctly.
describe("format helpers", () => {
  it("round2 rounds to two decimals", () => {
    expect(round2(1048.835)).toBe(1048.84);
    expect(round2(1249)).toBe(1249);
  });

  it("formatUSD formats whole dollars with separators", () => {
    expect(formatUSD(167000)).toBe("$167,000");
  });

  it("formatPercent formats a decimal ratio", () => {
    expect(formatPercent(0.075)).toBe("7.5%");
  });
});
