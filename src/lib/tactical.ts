/**
 * Pure mappers from domain enums to tactical palette colors.
 */
import type { Verdict } from "@/calc/brrrr";
import { Tactical } from "@/constants/theme";
import type { Heat, PipelineStatus } from "@/data/sample";

export function heatColor(h: Heat): string {
  return h === "HOT" ? Tactical.heat.hot : h === "WARM" ? Tactical.heat.warm : Tactical.heat.cold;
}

export function statusColor(s: PipelineStatus): string {
  return Tactical.pipeline[s];
}

export function verdictColor(v: Verdict): string {
  return v === "GO" ? Tactical.verdict.go : v === "MARGINAL" ? Tactical.verdict.marginal : Tactical.verdict.nogo;
}

/** Short glyph for a verdict, matching the mocks (▲ GO · ◐ MARGINAL · ▼ NO-GO). */
export function verdictGlyph(v: Verdict): string {
  return v === "GO" ? "▲" : v === "MARGINAL" ? "◐" : "▼";
}
