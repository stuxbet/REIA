import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { computeBrrrr, evaluateBuyBox, type MetricStatus } from "@/calc/brrrr";
import {
  ActionBar,
  BackButton,
  ChamferButton,
  HazardStripes,
  IconButton,
  MetricTile,
  Mono,
  ScreenHeader,
  ScreenShell,
  SectionLabel,
  TopBar,
  Ui,
} from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import { saveDeal } from "@/db/deals-repo";
import { formatPercent, formatUSD } from "@/lib/format";
import { verdictColor, verdictGlyph } from "@/lib/tactical";
import { useDealStore } from "@/store/deal";
import { useSettingsStore } from "@/store/settings";

const SUBTITLE: Record<string, string> = {
  GO: "CLEAR TO ENGAGE",
  MARGINAL: "PROCEED W/ CAUTION · OPERATOR CALL",
  "NO-GO": "ABORT · DOES NOT PENCIL",
};

interface Tile {
  label: string;
  value: string;
  benchmark: string;
  status: MetricStatus;
  formula: string;
  detail: string;
}

export default function AnalysisScreen() {
  const router = useRouter();
  const inp = useDealStore((s) => s.inputs);
  const address = useDealStore((s) => s.address);
  const leadId = useDealStore((s) => s.leadId);
  const buyBox = useSettingsStore((s) => s.buyBox);
  const r = computeBrrrr(inp);
  const ev = evaluateBuyBox(r, buyBox);
  const vc = verdictColor(ev.verdict);
  const isAmber = ev.verdict === "MARGINAL";
  const over = r.cashLeftInDeal - buyBox.maxCashLeftIn;
  const barFill = r.cashLeftInDeal > 0 ? Math.min(1, buyBox.maxCashLeftIn / r.cashLeftInDeal) : 1;
  const purchaseOver = inp.purchasePrice - r.mao;
  const [revealed, setRevealed] = useState<Tile | null>(null);

  const usd = (n: number) => formatUSD(Math.round(n));
  const tiles: Tile[] = [
    {
      label: "ALL-IN COST",
      value: formatUSD(r.allInCost),
      benchmark: "TGT ≤ $150K",
      status: r.allInCost > inp.arv * 0.75 ? "fail" : "pass",
      formula: "purchase + closing + rehab + carry×months + fees",
      detail: `${usd(inp.purchasePrice)} + ${usd(inp.buyClosingCosts)} + ${usd(inp.rehabBudget)} + ${usd(inp.monthlyHoldingCost)}×${inp.holdingMonths} + ${usd(inp.acqLoanFees)}`,
    },
    {
      label: "EQUITY CAPTURED",
      value: formatUSD(r.equityCaptured),
      benchmark: "TGT ≥ $25K",
      status: r.equityCaptured >= 25000 ? "pass" : "watch",
      formula: "ARV − all-in cost",
      detail: `${usd(inp.arv)} − ${usd(r.allInCost)}`,
    },
    {
      label: "CASH FLOW/MO",
      value: formatUSD(Math.round(r.cashFlowMonthly)),
      benchmark: `TGT ≥ ${formatUSD(buyBox.minMonthlyCashFlow)}`,
      status: ev.cashFlow,
      formula: "NOI − capex reserve − mortgage",
      detail: `${usd(r.noiMonthly)} − ${usd(r.capexReserveMonthly)} − ${usd(r.newMortgageMonthly)}`,
    },
    {
      label: "CASH-ON-CASH",
      value: r.cashOnCash === null ? "♾" : formatPercent(r.cashOnCash),
      benchmark: "TGT ≥ 8%",
      status: ev.cashOnCash,
      formula: "annual cash flow ÷ cash left in deal",
      detail: r.isFullyRecycled ? "capital fully recycled" : `${usd(r.cashFlowAnnual)} ÷ ${usd(r.cashLeftInDeal)}`,
    },
    {
      label: "CAP RATE",
      value: formatPercent(r.capRate),
      benchmark: "TGT ≥ 6%",
      status: ev.capRate,
      formula: "annual NOI ÷ ARV",
      detail: `${usd(r.noiAnnual)} ÷ ${usd(inp.arv)}`,
    },
    {
      label: "DSCR",
      value: r.dscr.toFixed(2),
      benchmark: "TGT ≥ 1.20",
      status: ev.dscr,
      formula: "annual NOI ÷ annual debt service",
      detail: `${usd(r.noiAnnual)} ÷ ${usd(r.annualDebtService)}`,
    },
    {
      label: "YIELD ON COST",
      value: formatPercent(r.yieldOnCost),
      benchmark: "TGT ≥ CAP",
      status: r.yieldOnCost >= r.capRate ? "pass" : "watch",
      formula: "annual NOI ÷ all-in cost",
      detail: `${usd(r.noiAnnual)} ÷ ${usd(r.allInCost)}`,
    },
    {
      label: "RENT-TO-VALUE",
      value: formatPercent(r.rentToValue, 2),
      benchmark: "TGT ≥ 1%",
      status: r.rentToValue >= 0.01 ? "pass" : "watch",
      formula: "monthly rent ÷ ARV",
      detail: `${usd(inp.grossMonthlyRent)} ÷ ${usd(inp.arv)}`,
    },
  ];

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="ANALYSIS"
          titleSize={17}
          titleSpacing={2}
          left={<BackButton onPress={() => router.back()} />}
          sub={`${address} · BRRRR`}
        />
      </TopBar>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* VERDICT BANNER */}
        <View style={{ position: "relative", overflow: "hidden", borderWidth: 1, borderColor: vc, padding: 14 }}>
          {isAmber ? <HazardStripes color="rgba(255,178,62,0.10)" /> : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ui size={22} weight="bold" color={vc}>
              {verdictGlyph(ev.verdict)}
            </Ui>
            <View style={{ flex: 1 }}>
              <Ui size={18} weight="bold" spacing={1.5} color={isAmber ? Tactical.status.amberBright : vc}>
                {ev.verdict}
              </Ui>
              <Mono size={9} color={Tactical.text.muted} style={{ marginTop: 2 }}>
                {SUBTITLE[ev.verdict]}
              </Mono>
            </View>
          </View>
          <Mono size={10} color={Tactical.text.secondary} style={{ marginTop: 10, lineHeight: 15 }}>
            Recycles capital + captures {formatUSD(r.equityCaptured)} equity — but fails 70% rule &amp; DSCR &lt; 1.20 lender gate.
          </Mono>
        </View>

        {/* HERO */}
        <View style={{ gap: 8 }}>
          <Ui size={9} weight="semi" spacing={1.5} color={Tactical.text.secondary}>
            ★ CASH LEFT IN DEAL
          </Ui>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
            <Mono size={40} weight="xbold" color={vc} glow={vc}>
              {r.isFullyRecycled ? "♾" : formatUSD(r.cashLeftInDeal)}
            </Mono>
            <Mono size={9} color={Tactical.text.muted}>
              TGT ≤ {formatUSD(buyBox.maxCashLeftIn)}
              {over > 0 ? ` · +${formatUSD(over)} OVER` : ""}
            </Mono>
          </View>
          <View style={{ height: 6, backgroundColor: hairline(0.1) }}>
            <View style={{ width: `${barFill * 100}%`, height: 6, backgroundColor: vc }} />
          </View>
        </View>

        {/* METRIC GRID */}
        <View style={{ gap: 8 }}>
          {[0, 2, 4, 6].map((i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8 }}>
              <MetricTile {...tiles[i]} onPress={() => setRevealed(tiles[i])} />
              <MetricTile {...tiles[i + 1]} onPress={() => setRevealed(tiles[i + 1])} />
            </View>
          ))}
        </View>

        {/* 70% RULE SCREEN */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <SectionLabel>70% RULE SCREEN</SectionLabel>
            <Ui size={9} weight="bold" spacing={1} color={Tactical.status.red}>
              FAIL · +{formatUSD(purchaseOver)}
            </Ui>
          </View>
          <View style={{ height: 6, backgroundColor: hairline(0.1), position: "relative" }}>
            <View style={{ position: "absolute", left: "0%", width: "70%", height: 6, backgroundColor: "rgba(124,255,155,0.25)" }} />
            <View style={{ position: "absolute", left: "70%", width: 2, height: 12, top: -3, backgroundColor: Tactical.green.primary }} />
            <View style={{ position: "absolute", left: "84%", width: 2, height: 12, top: -3, backgroundColor: Tactical.status.red }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Mono size={8} color={Tactical.green.primary}>
              MAO {formatUSD(r.mao)}
            </Mono>
            <Mono size={8} color={Tactical.status.red}>
              PURCHASE {formatUSD(inp.purchasePrice)}
            </Mono>
          </View>
        </View>
      </ScrollView>

      <ActionBar>
        <ChamferButton
          label="SAVE TO DOSSIER"
          onPress={async () => {
            await saveDeal({ address, leadId, inputs: inp, status: "PURSUING", buyBox });
            router.replace("/dossier");
          }}
          full
        />
        <IconButton onPress={() => {}} size={48}>
          <Ui size={15} color={Tactical.text.secondary}>
            ⤴
          </Ui>
        </IconButton>
      </ActionBar>

      {revealed ? (
        <Pressable
          onPress={() => setRevealed(null)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(3,6,4,0.86)", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <View style={{ width: "100%", backgroundColor: Tactical.bg.panel, borderWidth: 1, borderColor: hairline(0.2), padding: 16, gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Ui size={11} weight="bold" spacing={1.5} color={Tactical.text.heading}>
                {revealed.label}
              </Ui>
              <Mono size={16} weight="bold" color={Tactical.text.heading}>
                {revealed.value}
              </Mono>
            </View>
            <View style={{ height: 1, backgroundColor: hairline(0.12) }} />
            <View style={{ gap: 4 }}>
              <Ui size={8} weight="semi" spacing={1} color={Tactical.text.faint}>
                FORMULA
              </Ui>
              <Mono size={11} color={Tactical.green.bright}>
                {revealed.formula}
              </Mono>
            </View>
            <View style={{ gap: 4 }}>
              <Ui size={8} weight="semi" spacing={1} color={Tactical.text.faint}>
                INPUTS
              </Ui>
              <Mono size={11} color={Tactical.text.secondary} style={{ lineHeight: 17 }}>
                {revealed.detail}
              </Mono>
            </View>
            <Mono size={8} color={Tactical.text.dim} style={{ textAlign: "center", marginTop: 4 }}>
              TAP ANYWHERE TO DISMISS
            </Mono>
          </View>
        </Pressable>
      ) : null}
    </ScreenShell>
  );
}
