import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { IconButton, Mono, ScreenHeader, ScreenShell, TopBar, Ui } from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import type { DealStatus } from "@/data/sample";
import { type DealRecord, listDeals, seedIfEmpty } from "@/db/deals-repo";
import { formatPercent, formatUSD } from "@/lib/format";
import { verdictColor, verdictGlyph } from "@/lib/tactical";

function dealStatusColor(s: DealStatus): string {
  return s === "PURSUING" ? Tactical.green.primary : s === "ANALYZING" ? Tactical.status.amber : Tactical.text.dim;
}

function PortfolioStrip({ deals }: { deals: DealRecord[] }) {
  const go = deals.filter((d) => d.verdict === "GO").length;
  const marginal = deals.filter((d) => d.verdict === "MARGINAL").length;
  const nogo = deals.filter((d) => d.verdict === "NO-GO").length;
  const cocs = deals.map((d) => d.snapshot.cashOnCash).filter((x): x is number => x !== null);
  const avgCoc = cocs.length ? formatPercent(cocs.reduce((a, b) => a + b, 0) / cocs.length) : "—";

  const cells = [
    { v: `${go}`, l: "GO", c: Tactical.verdict.go },
    { v: `${marginal}`, l: "MARGINAL", c: Tactical.verdict.marginal },
    { v: `${nogo}`, l: "NO-GO", c: Tactical.verdict.nogo },
    { v: avgCoc, l: "AVG COC", c: Tactical.text.heading },
  ];
  return (
    <View style={{ flexDirection: "row", marginTop: 12, borderWidth: 1, borderColor: hairline(0.12) }}>
      {cells.map((cell, i) => (
        <View
          key={cell.l}
          style={{ flex: 1, paddingVertical: 9, alignItems: "center", gap: 2, borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: hairline(0.1), backgroundColor: Tactical.bg.panel2 }}
        >
          <Mono size={15} weight="bold" color={cell.c}>
            {cell.v}
          </Mono>
          <Ui size={7} weight="semi" spacing={0.5} color={Tactical.text.faint}>
            {cell.l}
          </Ui>
        </View>
      ))}
    </View>
  );
}

function MetricCell({ label, value, color = Tactical.text.heading }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1, gap: 3 }}>
      <Mono size={7} color={Tactical.text.faint} spacing={0.5}>
        {label}
      </Mono>
      <Mono size={12} weight="med" color={color}>
        {value}
      </Mono>
    </View>
  );
}

function SavedCard({ record, onPress }: { record: DealRecord; onPress: () => void }) {
  const vc = verdictColor(record.verdict);
  const s = record.snapshot;
  const recycled = s.isFullyRecycled;
  const cashLeft = recycled ? "$0" : formatUSD(s.cashLeftInDeal);
  const coc = s.cashOnCash === null ? "♾" : formatPercent(s.cashOnCash);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: Tactical.bg.panel,
        borderWidth: 1,
        borderColor: hairline(0.12),
        borderLeftWidth: 3,
        borderLeftColor: vc,
        marginBottom: 8,
        padding: 12,
        gap: 10,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Mono size={13} color={Tactical.text.heading} spacing={0.5}>
          {record.address}
        </Mono>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Ui size={11} weight="bold" color={vc}>
            {verdictGlyph(record.verdict)}
          </Ui>
          <Ui size={9} weight="bold" spacing={1} color={vc}>
            {record.verdict}
          </Ui>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <MetricCell label="CASH LEFT" value={cashLeft} color={recycled ? Tactical.green.primary : Tactical.text.heading} />
        <MetricCell label="COC" value={coc} />
        <MetricCell label="DSCR" value={s.dscr.toFixed(2)} />
        <MetricCell label="STATUS" value={record.status} color={dealStatusColor(record.status)} />
      </View>
      {recycled ? (
        <View style={{ borderTopWidth: 1, borderTopColor: hairline(0.08), paddingTop: 8 }}>
          <Mono size={8} color={Tactical.green.deep} spacing={0.5}>
            ♾ CAPITAL FULLY RECYCLED
          </Mono>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function SavedDossierScreen() {
  const router = useRouter();
  const [deals, setDeals] = useState<DealRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        await seedIfEmpty();
        const loaded = await listDeals();
        if (active) setDeals(loaded);
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="DOSSIER"
          titleSpacing={3}
          sub={`SAVED ANALYSES · ${deals.length} OPS`}
          right={
            <IconButton onPress={() => router.push("/settings" as Href)}>
              <Ui size={13} color={Tactical.text.secondary}>
                ⚙
              </Ui>
            </IconButton>
          }
        />
        <PortfolioStrip deals={deals} />
      </TopBar>

      <ScrollView contentContainerStyle={{ padding: 14 }} showsVerticalScrollIndicator={false}>
        {deals.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Mono size={10} color={Tactical.text.dim} spacing={0.5}>
              NO SAVED OPS · RUN AN ANALYSIS
            </Mono>
          </View>
        ) : (
          deals.map((deal) => (
            <SavedCard key={deal.id} record={deal} onPress={() => router.push(`/target/${deal.leadId ?? "TGT-0147"}`)} />
          ))
        )}
      </ScrollView>
    </ScreenShell>
  );
}
