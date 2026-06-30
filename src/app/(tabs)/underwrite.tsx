import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { computeBrrrr, evaluateBuyBox } from "@/calc/brrrr";
import { computeFlip, computeLtr } from "@/calc/strategies";
import { type BrrrrInputs } from "@/calc/types";
import {
  ChamferButton,
  CornerBrackets,
  IconButton,
  Mono,
  ScreenHeader,
  ScreenShell,
  SectionLabel,
  Stepper,
  TopBar,
  Ui,
} from "@/components/tactical";
import { Tactical, TacticalFonts, hairline } from "@/constants/theme";
import { formatPercent, formatUSD } from "@/lib/format";
import { verdictColor } from "@/lib/tactical";
import { useDealStore } from "@/store/deal";
import { useSettingsStore } from "@/store/settings";

const GREEN = Tactical.green.primary;

type Kind = "money" | "percent" | "ratio" | "months";

/** Field-bound input cell: tap the value to type, or use the steppers. */
function InputCell({
  field,
  label,
  step,
  kind,
  decimals = 1,
  mode,
  emphasize,
}: {
  field: keyof BrrrrInputs;
  label: string;
  step: number;
  kind: Kind;
  decimals?: number;
  mode?: "$" | "%";
  emphasize?: boolean;
}) {
  const value = useDealStore((s) => s.inputs[field]);
  const setInput = useDealStore((s) => s.setInput);
  const bump = useDealStore((s) => s.bump);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const display =
    kind === "money" ? formatUSD(value) : kind === "percent" ? formatPercent(value, decimals) : kind === "ratio" ? value.toFixed(2) : `${value}`;

  const startEdit = () => {
    setDraft(kind === "percent" ? String(+(value * 100).toFixed(2)) : kind === "money" ? String(Math.round(value)) : String(value));
    setEditing(true);
  };
  const commit = () => {
    const n = parseFloat(draft);
    if (!Number.isNaN(n)) {
      const v = kind === "percent" ? n / 100 : kind === "months" ? Math.max(0, Math.round(n)) : Math.max(0, n);
      setInput(field, v);
    }
    setEditing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Tactical.bg.panel2, borderWidth: 1, borderColor: hairline(0.1), padding: 9, gap: 7 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Mono size={7.5} color={Tactical.text.faint} spacing={0.5}>
          {label}
        </Mono>
        {mode ? (
          <View style={{ borderWidth: 1, borderColor: hairline(0.2), paddingHorizontal: 4 }}>
            <Mono size={7} color={Tactical.text.muted}>
              {mode}
            </Mono>
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onBlur={commit}
            onSubmitEditing={commit}
            autoFocus
            keyboardType={kind === "months" ? "number-pad" : "decimal-pad"}
            selectionColor={GREEN}
            style={{ flex: 1, fontFamily: TacticalFonts.monoMed, fontSize: 13, color: GREEN, padding: 0 }}
          />
        ) : (
          <Pressable onPress={startEdit} hitSlop={6} style={{ flex: 1 }}>
            <Mono size={13} weight="med" color={emphasize ? GREEN : Tactical.text.heading}>
              {display}
            </Mono>
          </Pressable>
        )}
        <Stepper onDec={() => bump(field, -step)} onInc={() => bump(field, step)} />
      </View>
    </View>
  );
}

type Strat = "BRRRR" | "FLIP" | "LTR";

function Strategy({ value, onChange }: { value: Strat; onChange: (s: Strat) => void }) {
  return (
    <View style={{ flexDirection: "row", borderWidth: 1, borderColor: hairline(0.16), alignSelf: "flex-start" }}>
      {(["BRRRR", "FLIP", "LTR"] as const).map((s) => {
        const active = s === value;
        return (
          <Pressable key={s} onPress={() => onChange(s)} style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: active ? "rgba(124,255,155,0.12)" : "transparent" }}>
            <Ui size={9} weight="bold" spacing={1} color={active ? GREEN : Tactical.text.dim}>
              {s}
            </Ui>
          </Pressable>
        );
      })}
    </View>
  );
}

function Callout({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        alignItems: "center",
        backgroundColor: Tactical.bg.panel2,
        borderLeftWidth: 2,
        borderLeftColor: danger ? Tactical.status.red : Tactical.green.deep,
        paddingHorizontal: 10,
        paddingVertical: 7,
      }}
    >
      {children}
    </View>
  );
}

export default function UnderwriteScreen() {
  const router = useRouter();
  const inp = useDealStore((s) => s.inputs);
  const reset = useDealStore((s) => s.reset);
  const address = useDealStore((s) => s.address);
  const leadId = useDealStore((s) => s.leadId);
  const buyBox = useSettingsStore((s) => s.buyBox);

  const r = computeBrrrr(inp);
  const ev = evaluateBuyBox(r, buyBox);
  const vc = verdictColor(ev.verdict);
  const heroColor = ev.verdict === "GO" ? GREEN : ev.verdict === "MARGINAL" ? Tactical.status.amberBright : Tactical.status.red;
  const mc = (s: "pass" | "fail" | "watch") => (s === "pass" ? GREEN : s === "watch" ? Tactical.status.amber : Tactical.status.red);
  const purchaseOver = inp.purchasePrice - r.mao;

  const [strategy, setStrategy] = useState<Strat>("BRRRR");
  const flip = computeFlip(inp);
  const ltr = computeLtr(inp);

  const readout =
    strategy === "FLIP"
      ? {
          label: "★ NET PROFIT",
          value: formatUSD(Math.round(flip.netProfit)),
          valueColor: flip.netProfit >= 0 ? GREEN : Tactical.status.red,
          accent: flip.netProfit >= 0 ? GREEN : Tactical.status.red,
          chip: flip.netProfit >= 0 ? "PROFIT" : "LOSS",
          target: `SALE ${formatUSD(Math.round(flip.saleProceeds))}`,
          metrics: [
            { label: "ROI", value: formatPercent(flip.roi), color: flip.roi >= 0.2 ? GREEN : Tactical.status.amber },
            { label: "ANN ROI", value: formatPercent(flip.annualizedRoi), color: GREEN },
            { label: "ALL-IN", value: formatUSD(Math.round(flip.allInCost)), color: Tactical.text.heading },
          ],
        }
      : strategy === "LTR"
        ? {
            label: "★ CASH FLOW / MO",
            value: formatUSD(Math.round(ltr.cashFlowMonthly)),
            valueColor: ltr.cashFlowMonthly >= 0 ? GREEN : Tactical.status.red,
            accent: ltr.cashFlowMonthly >= 0 ? GREEN : Tactical.status.red,
            chip: ltr.cashFlowMonthly >= 0 ? "CASH-FLOWS" : "NEGATIVE",
            target: `DOWN ${formatUSD(Math.round(ltr.downPayment))}`,
            metrics: [
              { label: "COC", value: ltr.cashOnCash === null ? "♾" : formatPercent(ltr.cashOnCash), color: GREEN },
              { label: "CAP", value: formatPercent(ltr.capRate), color: GREEN },
              { label: "DSCR", value: ltr.dscr.toFixed(2), color: ltr.dscr >= 1.2 ? GREEN : Tactical.status.amber },
            ],
          }
        : {
            label: "★ CASH LEFT IN DEAL",
            value: r.isFullyRecycled ? "♾" : formatUSD(r.cashLeftInDeal),
            valueColor: heroColor,
            accent: vc,
            chip: ev.verdict,
            target: `TGT ≤ ${formatUSD(buyBox.maxCashLeftIn)}`,
            metrics: [
              { label: "CASH FLOW", value: `${formatUSD(Math.round(r.cashFlowMonthly))}/MO`, color: mc(ev.cashFlow) },
              { label: "COC", value: r.cashOnCash === null ? "♾" : formatPercent(r.cashOnCash), color: ev.cashOnCash === "pass" ? GREEN : Tactical.status.amber },
              { label: "DSCR", value: r.dscr.toFixed(2), color: mc(ev.dscr) },
            ],
          };

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="UNDERWRITE"
          titleSize={18}
          titleSpacing={2}
          sub={`${leadId ?? "—"} · ${address}`}
          right={
            <IconButton onPress={reset}>
              <Ui size={11} weight="semi" spacing={1} color={Tactical.text.secondary}>
                ↻
              </Ui>
            </IconButton>
          }
        />
        <View style={{ marginTop: 10 }}>
          <Strategy value={strategy} onChange={setStrategy} />
        </View>
      </TopBar>

      {/* LIVE READOUT */}
      <View style={{ margin: 14, marginBottom: 0, position: "relative", backgroundColor: Tactical.bg.panel, borderWidth: 1, borderColor: readout.accent, padding: 14 }}>
        <CornerBrackets color={readout.accent} size={13} inset={5} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Ui size={9} weight="semi" spacing={1.5} color={Tactical.text.secondary}>
            {readout.label}
          </Ui>
          <View style={{ borderWidth: 1, borderColor: readout.accent, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Ui size={8} weight="bold" spacing={1} color={readout.accent}>
              {readout.chip}
            </Ui>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 4 }}>
          <Mono size={34} weight="xbold" color={readout.valueColor} glow={readout.valueColor}>
            {readout.value}
          </Mono>
          <Mono size={9} color={Tactical.text.muted}>
            {readout.target}
          </Mono>
        </View>
        <View style={{ flexDirection: "row", gap: 14, marginTop: 10, borderTopWidth: 1, borderTopColor: hairline(0.1), paddingTop: 10 }}>
          {readout.metrics.map((m) => (
            <ReadoutMetric key={m.label} label={m.label} value={m.value} color={m.color} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Module label="A · ACQUISITION">
          <Row>
            <InputCell field="purchasePrice" label="PURCHASE" step={5000} kind="money" />
            <InputCell field="rehabBudget" label="REHAB" step={5000} kind="money" />
          </Row>
          <Row>
            <InputCell field="buyClosingCosts" label="BUY CLOSING" step={500} kind="money" mode="$" />
            <InputCell field="holdingMonths" label="HOLD MONTHS" step={1} kind="months" />
          </Row>
          <Row>
            <InputCell field="monthlyHoldingCost" label="CARRY/MO" step={250} kind="money" />
            <InputCell field="acqLoanAmount" label="ACQ LOAN" step={2000} kind="money" />
          </Row>
        </Module>

        <Module label="B · AFTER-REPAIR VALUE">
          <Row>
            <InputCell field="arv" label="ARV" step={5000} kind="money" emphasize />
            <InputCell field="seventyRulePct" label="70% RULE" step={0.05} kind="ratio" />
          </Row>
          {strategy === "FLIP" ? (
            <Row>
              <InputCell field="sellingCostsPct" label="SELL COSTS" step={0.005} kind="percent" decimals={1} mode="%" />
              <View style={{ flex: 1 }} />
            </Row>
          ) : null}
          <Callout danger={purchaseOver > 0}>
            <Mono size={10} color={Tactical.text.secondary}>
              MAO ={" "}
              <Mono size={10} weight="bold" color={Tactical.text.heading}>
                {formatUSD(r.mao)}
              </Mono>
            </Mono>
            {purchaseOver > 0 ? (
              <Mono size={10} weight="bold" color={Tactical.status.red}>
                ⚠ PURCHASE +{formatUSD(purchaseOver)} OVER
              </Mono>
            ) : null}
          </Callout>
        </Module>

        {strategy !== "FLIP" ? (
          <>
            <Module label={strategy === "LTR" ? "C · FINANCING" : "C · REFINANCE"}>
              <Row>
                <InputCell field="refiLtv" label="LTV" step={0.05} kind="percent" decimals={0} mode="%" />
                <InputCell field="refiRate" label="RATE" step={0.0025} kind="percent" decimals={1} />
              </Row>
              {strategy === "BRRRR" ? (
                <Callout>
                  <Mono size={10} color={Tactical.text.secondary}>
                    NEW LOAN{" "}
                    <Mono size={10} weight="bold" color={Tactical.text.heading}>
                      {formatUSD(r.newLoanAmount)}
                    </Mono>
                  </Mono>
                  <Mono size={10} color={Tactical.text.muted}>
                    · PMT {formatUSD(Math.round(r.newMortgageMonthly))}/MO · {inp.refiTermYears}YR
                  </Mono>
                </Callout>
              ) : null}
            </Module>

            <Module label="D · RENTAL OPS">
              <Row>
                <InputCell field="grossMonthlyRent" label="RENT/MO" step={50} kind="money" />
                <InputCell field="vacancyPct" label="VACANCY" step={0.01} kind="percent" decimals={0} mode="%" />
              </Row>
              <Row>
                <InputCell field="managementPct" label="MGMT" step={0.01} kind="percent" decimals={0} mode="%" />
                <InputCell field="maintenancePct" label="MAINT" step={0.01} kind="percent" decimals={0} mode="%" />
              </Row>
              <Row>
                <InputCell field="capexReservePct" label="CAPEX" step={0.01} kind="percent" decimals={0} mode="%" />
                <InputCell field="propertyTaxesMonthly" label="TAXES/MO" step={25} kind="money" />
              </Row>
            </Module>
          </>
        ) : null}

        {strategy === "BRRRR" ? (
          <ChamferButton label="RUN ANALYSIS ▸ VERDICT" onPress={() => router.push(`/analysis/${leadId ?? "TGT-0147"}`)} />
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

function ReadoutMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ gap: 3 }}>
      <Mono size={7.5} color={Tactical.text.faint} spacing={0.5}>
        {label}
      </Mono>
      <Mono size={12} weight="med" color={color}>
        {value}
      </Mono>
    </View>
  );
}

function Module({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <SectionLabel>{label}</SectionLabel>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: "row", gap: 8 }}>{children}</View>;
}
