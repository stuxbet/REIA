/**
 * Formatting + numeric helpers. Pure, dependency-free, and unit-tested.
 * Keep this module free of React and I/O so it stays trivially testable.
 */

/** Round to 2 decimal places using currency-safe rounding. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Format a number as whole-dollar USD, e.g. 167000 -> "$167,000". */
export function formatUSD(n: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n);
}

/** Format a decimal ratio as a percent, e.g. 0.075 -> "7.5%". */
export function formatPercent(ratio: number, fractionDigits = 1): string {
  return `${(ratio * 100).toFixed(fractionDigits)}%`;
}
