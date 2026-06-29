/**
 * Active-deal store. Holds the BRRRR inputs currently being underwritten so
 * they survive tab switches and can be read by VERDICT to save. Results are
 * always derived from these inputs via calc/brrrr.ts — never stored here.
 */
import { create } from "zustand";

import { type BrrrrInputs, WORKED_EXAMPLE } from "@/calc/types";

interface DealMeta {
  address: string;
  leadId: string | null;
}

interface DealState extends DealMeta {
  inputs: BrrrrInputs;
  setInput: (key: keyof BrrrrInputs, value: number) => void;
  bump: (key: keyof BrrrrInputs, delta: number, min?: number) => void;
  reset: () => void;
  load: (inputs: BrrrrInputs, meta: DealMeta) => void;
}

export const useDealStore = create<DealState>((set) => ({
  inputs: WORKED_EXAMPLE,
  address: "1428 ELM AVE",
  leadId: "TGT-0147",
  setInput: (key, value) => set((s) => ({ inputs: { ...s.inputs, [key]: value } })),
  bump: (key, delta, min = 0) =>
    set((s) => ({ inputs: { ...s.inputs, [key]: Math.max(min, +(s.inputs[key] + delta).toFixed(4)) } })),
  reset: () => set({ inputs: WORKED_EXAMPLE }),
  load: (inputs, meta) => set({ inputs, ...meta }),
}));
