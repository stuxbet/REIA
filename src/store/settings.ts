/**
 * Persisted user settings — currently the buy-box thresholds that drive every
 * verdict and metric dot. Stored via AsyncStorage so they survive restarts.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { type BuyBox, DEFAULT_BUY_BOX } from "@/calc/types";

interface SettingsState {
  buyBox: BuyBox;
  setBuyBox: (patch: Partial<BuyBox>) => void;
  resetBuyBox: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      buyBox: DEFAULT_BUY_BOX,
      setBuyBox: (patch) => set((s) => ({ buyBox: { ...s.buyBox, ...patch } })),
      resetBuyBox: () => set({ buyBox: DEFAULT_BUY_BOX }),
    }),
    { name: "reia-settings", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
