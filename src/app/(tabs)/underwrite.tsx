import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { computeBrrrr, evaluateBuyBox } from "@/calc/brrrr";
import { type BrrrrInputs, DEFAULT_BUY_BOX, WORKED_EXAMPLE } from "@/calc/types";
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
import { Tactical, hairline } from "@/constants/theme";
import { formatPercent, formatUSD } from "@/lib/format";
import { verdictColor } from "@/lib/tactical";

const GREEN = Tactical.green.primary;

type NumKey = keyof BrrrrInputs;

function InputCell({
  label,
  value,
  mode,
  emphasize,
  onDec,
  onInc,
}: {
  label: string;
  value: string;
  mode?: "$" | "%";
  emphasize?: boolean;
  onDec: () => void;
  onInc: () => void;
}) {
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
        <Mono size={13} weight="med" color={emphasize ? GREEN : Tactical.text.heading}>
          {value}
        </Mono>
        <Stepper onDec={onDec} onInc={onInc} />
      </View>
    </View>
  );
}

function Strategy() {
  return (
    <View style={{ flexDirection: "row", borderWidth: 1, borderColor: hairline(0.16), alignSelf: "flex-start" }}>
      {(["BRRRR", "FLIP", "LTR"] as const).map((s) => {
        const active = s === "BRRRR";
        return (
          <View key={s} style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: active ? "rgba(124,255,155,0.12)" : "transparent" }}>
            <Ui size={9} weight="bold" spacing={1} color={active ? GREEN : Tactical.text.dim}>
              {s}
            </Ui>
          </View>
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
  const [inp, setInp] = useState<BrrrrInputs>(WORKED_EXAMPLE);

  const bump = (key: NumKey, delta: number, min = 0) =>
    setInp((p) => ({ ...p, [key]: Math.max(min, +(p[key] + delta).toFixed(4)) }));

  const r = computeBrrrr(inp);
  const ev = evaluateBuyBox(r, DEFAULT_BUY_BOX);
  const vc = verdictColor(ev.verdict);
  const heroColor = ev.verdict === "GO" ? GREEN : ev.verdict === "MARGINAL" ? Tactical.status.amberBright : Tactical.status.red;
  const mc = (s: "pass" | "fail" | "watch") => (s === "pass" ? GREEN : s === "watch" ? Tactical.status.amber : Tactical.status.red);
  const purchaseOver = inp.purchasePrice - r.mao;

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="UNDERWRITE"
          titleSize={18}
          titleSpacing={2}
          sub="TGT-0147 · 1428 ELM AVE"
          right={
            <IconButton onPress={() => setInp(WORKED_EXAMPLE)}>
              <Ui size={11} weight="semi" spacing={1} color={Tactical.text.secondary}>
                ↻
              </Ui>
            </IconButton>
          }
        />
        <View style={{ marginTop: 10 }}>
          <Strategy />
        </View>
      </TopBar>

      {/* LIVE READOUT */}
      <View style={{ margin: 14, marginBottom: 0, position: "relative", backgroundColor: Tactical.bg.panel, borderWidth: 1, borderColor: vc, padding: 14 }}>
        <CornerBrackets color={vc} size={13} inset={5} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Ui size={9} weight="semi" spacing={1.5} color={Tactical.text.secondary}>
            ★ CASH LEFT IN DEAL
          </Ui>
          <View style={{ borderWidth: 1, borderColor: vc, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Ui size={8} weight="bold" spacing={1} color={vc}>
              {ev.verdict}
            </Ui>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 4 }}>
          <Mono size={34} weight="xbold" color={heroColor} glow={heroColor}>
            {r.isFullyRecycled ? "♾" : formatUSD(r.cashLeftInDeal)}
          </Mono>
          <Mono size={9} color={Tactical.text.muted}>
            TGT ≤ {formatUSD(DEFAULT_BUY_BOX.maxCashLeftIn)}
          </Mono>
        </View>
        <View style={{ flexDirection: "row", gap: 14, marginTop: 10, borderTopWidth: 1, borderTopColor: hairline(0.1), paddingTop: 10 }}>
          <ReadoutMetric label="CASH FLOW" value={`${formatUSD(Math.round(r.cashFlowMonthly))}/MO`} color={mc(ev.cashFlow)} />
          <ReadoutMetric label="COC" value={r.cashOnCash === null ? "♾" : formatPercent(r.cashOnCash)} color={ev.cashOnCash === "pass" ? GREEN : Tactical.status.amber} />
          <ReadoutMetric label="DSCR" value={r.dscr.toFixed(2)} color={mc(ev.dscr)} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* A · ACQUISITION */}
        <Module label="A · ACQUISITION">
          <Row>
            <InputCell label="PURCHASE" value={formatUSD(inp.purchasePrice)} onDec={() => bump("purchasePrice", -5000)} onInc={() => bump("purchasePrice", 5000)} />
            <InputCell label="REHAB" value={formatUSD(inp.rehabBudget)} onDec={() => bump("rehabBudget", -5000)} onInc={() => bump("rehabBudget", 5000)} />
          </Row>
          <Row>
            <InputCell label="BUY CLOSING" mode="$" value={formatUSD(inp.buyClosingCosts)} onDec={() => bump("buyClosingCosts", -500)} onInc={() => bump("buyClosingCosts", 500)} />
            <InputCell label="HOLD MONTHS" value={`${inp.holdingMonths}`} onDec={() => bump("holdingMonths", -1)} onInc={() => bump("holdingMonths", 1)} />
          </Row>
          <Row>
            <InputCell label="CARRY/MO" value={formatUSD(inp.monthlyHoldingCost)} onDec={() => bump("monthlyHoldingCost", -250)} onInc={() => bump("monthlyHoldingCost", 250)} />
            <InputCell label="ACQ LOAN" value={formatUSD(inp.acqLoanAmount)} onDec={() => bump("acqLoanAmount", -2000)} onInc={() => bump("acqLoanAmount", 2000)} />
          </Row>
        </Module>

        {/* B · ARV */}
        <Module label="B · AFTER-REPAIR VALUE">
          <Row>
            <InputCell label="ARV" emphasize value={formatUSD(inp.arv)} onDec={() => bump("arv", -5000)} onInc={() => bump("arv", 5000)} />
            <InputCell label="70% RULE" value={inp.seventyRulePct.toFixed(2)} onDec={() => bump("seventyRulePct", -0.05)} onInc={() => bump("seventyRulePct", 0.05)} />
          </Row>
          <Callout danger={purchaseOver > 0}>
            <Mono size={10} color={Tactical.text.secondary}>
              MAO = <Mono size={10} weight="bold" color={Tactical.text.heading}>{formatUSD(r.mao)}</Mono>
            </Mono>
            {purchaseOver > 0 ? (
              <Mono size={10} weight="bold" color={Tactical.status.red}>
                ⚠ PURCHASE +{formatUSD(purchaseOver)} OVER
              </Mono>
            ) : null}
          </Callout>
        </Module>

        {/* C · REFINANCE */}
        <Module label="C · REFINANCE">
          <Row>
            <InputCell label="REFI LTV" mode="%" value={formatPercent(inp.refiLtv, 0)} onDec={() => bump("refiLtv", -0.05)} onInc={() => bump("refiLtv", 0.05)} />
            <InputCell label="REFI RATE" value={formatPercent(inp.refiRate, 1)} onDec={() => bump("refiRate", -0.0025)} onInc={() => bump("refiRate", 0.0025)} />
          </Row>
          <Callout>
            <Mono size={10} color={Tactical.text.secondary}>
              NEW LOAN <Mono size={10} weight="bold" color={Tactical.text.heading}>{formatUSD(r.newLoanAmount)}</Mono>
            </Mono>
            <Mono size={10} color={Tactical.text.muted}>
              · PMT {formatUSD(Math.round(r.newMortgageMonthly))}/MO · {inp.refiTermYears}YR
            </Mono>
          </Callout>
        </Module>

        {/* D · RENTAL OPS (collapsed) */}
        <Module label="D · RENTAL OPS">
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Tactical.bg.panel2, borderWidth: 1, borderColor: hairline(0.1), paddingHorizontal: 12, paddingVertical: 11 }}>
            <Mono size={11} color={Tactical.text.secondary}>
              RENT {formatUSD(inp.grossMonthlyRent)} · VAC {formatPercent(inp.vacancyPct, 0)}
            </Mono>
            <Ui size={11} weight="bold" color={Tactical.text.muted}>
              ▾
            </Ui>
          </View>
        </Module>

        <ChamferButton label="RUN ANALYSIS ▸ VERDICT" onPress={() => router.push("/analysis/TGT-0147")} />
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
