import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { type BuyBox } from "@/calc/types";
import {
  ActionBar,
  BackButton,
  ChamferButton,
  Mono,
  ScreenHeader,
  ScreenShell,
  SectionLabel,
  Stepper,
  TopBar,
} from "@/components/tactical";
import { Tactical, TacticalFonts, hairline } from "@/constants/theme";
import { formatPercent, formatUSD } from "@/lib/format";
import { useSettingsStore } from "@/store/settings";

const GREEN = Tactical.green.primary;
type Kind = "money" | "percent" | "ratio";

function SettingRow({
  label,
  value,
  kind,
  step,
  decimals = 1,
  onChange,
}: {
  label: string;
  value: number;
  kind: Kind;
  step: number;
  decimals?: number;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const display = kind === "money" ? formatUSD(value) : kind === "percent" ? formatPercent(value, decimals) : value.toFixed(2);

  const startEdit = () => {
    setDraft(kind === "percent" ? String(+(value * 100).toFixed(2)) : kind === "money" ? String(Math.round(value)) : String(value));
    setEditing(true);
  };
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n)) onChange(kind === "percent" ? n / 100 : Math.max(0, n));
    setEditing(false);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: Tactical.bg.panel2,
        borderWidth: 1,
        borderColor: hairline(0.1),
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}
    >
      <Mono size={9} color={Tactical.text.muted} spacing={0.5}>
        {label}
      </Mono>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onBlur={commit}
            onSubmitEditing={commit}
            autoFocus
            keyboardType="decimal-pad"
            selectionColor={GREEN}
            style={{ minWidth: 70, textAlign: "right", fontFamily: TacticalFonts.monoMed, fontSize: 14, color: GREEN, padding: 0 }}
          />
        ) : (
          <Pressable onPress={startEdit} hitSlop={6}>
            <Mono size={14} weight="med" color={Tactical.text.heading}>
              {display}
            </Mono>
          </Pressable>
        )}
        <Stepper onDec={() => onChange(Math.max(0, +(value - step).toFixed(4)))} onInc={() => onChange(+(value + step).toFixed(4))} />
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const buyBox = useSettingsStore((s) => s.buyBox);
  const setBuyBox = useSettingsStore((s) => s.setBuyBox);
  const resetBuyBox = useSettingsStore((s) => s.resetBuyBox);
  const set = (k: keyof BuyBox) => (v: number) => setBuyBox({ [k]: v } as Partial<BuyBox>);

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="SETTINGS"
          titleSize={18}
          titleSpacing={2}
          left={<BackButton onPress={() => router.back()} />}
          sub="BUY-BOX // PARAMETERS"
        />
      </TopBar>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 10 }} keyboardShouldPersistTaps="handled">
        <SectionLabel>BUY-BOX THRESHOLDS</SectionLabel>
        <SettingRow label="MAX CASH LEFT IN" value={buyBox.maxCashLeftIn} kind="money" step={1000} onChange={set("maxCashLeftIn")} />
        <SettingRow label="MIN CASH FLOW / MO" value={buyBox.minMonthlyCashFlow} kind="money" step={25} onChange={set("minMonthlyCashFlow")} />
        <SettingRow label="MIN CASH-ON-CASH" value={buyBox.minCashOnCash} kind="percent" decimals={0} step={0.01} onChange={set("minCashOnCash")} />
        <SettingRow label="MIN CAP RATE" value={buyBox.minCapRate} kind="percent" decimals={0} step={0.005} onChange={set("minCapRate")} />
        <SettingRow label="MIN DSCR" value={buyBox.minDSCR} kind="ratio" step={0.05} onChange={set("minDSCR")} />
        <Mono size={9} color={Tactical.text.dim} style={{ marginTop: 8, lineHeight: 14 }}>
          Thresholds drive every verdict and metric dot. Saved automatically.
        </Mono>
      </ScrollView>

      <ActionBar>
        <ChamferButton label="RESET DEFAULTS" variant="outline" color={Tactical.text.muted} onPress={resetBuyBox} full />
      </ActionBar>
    </ScreenShell>
  );
}
