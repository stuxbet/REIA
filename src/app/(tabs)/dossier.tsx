import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { IconButton, Mono, ScreenHeader, ScreenShell, TopBar, Ui } from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import { PORTFOLIO, SAVED_DEALS, type DealStatus, type SavedDeal } from "@/data/sample";
import { verdictColor, verdictGlyph } from "@/lib/tactical";

function dealStatusColor(s: DealStatus): string {
  return s === "PURSUING" ? Tactical.green.primary : s === "ANALYZING" ? Tactical.status.amber : Tactical.text.dim;
}

function PortfolioStrip() {
  const cells = [
    { v: `${PORTFOLIO.go}`, l: "GO", c: Tactical.verdict.go },
    { v: `${PORTFOLIO.marginal}`, l: "MARGINAL", c: Tactical.verdict.marginal },
    { v: `${PORTFOLIO.nogo}`, l: "NO-GO", c: Tactical.verdict.nogo },
    { v: PORTFOLIO.avgCoc, l: "AVG COC", c: Tactical.text.heading },
  ];
  return (
    <View style={{ flexDirection: "row", marginTop: 12, borderWidth: 1, borderColor: hairline(0.12) }}>
      {cells.map((cell, i) => (
        <View
          key={cell.l}
          style={{
            flex: 1,
            paddingVertical: 9,
            alignItems: "center",
            gap: 2,
            borderLeftWidth: i === 0 ? 0 : 1,
            borderLeftColor: hairline(0.1),
            backgroundColor: Tactical.bg.panel2,
          }}
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

function SavedCard({ deal, onPress }: { deal: SavedDeal; onPress: () => void }) {
  const vc = verdictColor(deal.verdict);
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
          {deal.address}
        </Mono>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Ui size={11} weight="bold" color={vc}>
            {verdictGlyph(deal.verdict)}
          </Ui>
          <Ui size={9} weight="bold" spacing={1} color={vc}>
            {deal.verdict}
          </Ui>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <MetricCell label="CASH LEFT" value={deal.cashLeftIn} color={deal.recycled ? Tactical.green.primary : Tactical.text.heading} />
        <MetricCell label="COC" value={deal.coc} />
        <MetricCell label="DSCR" value={deal.dscr} />
        <MetricCell label="STATUS" value={deal.status} color={dealStatusColor(deal.status)} />
      </View>
      {deal.recycled ? (
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
  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="DOSSIER"
          titleSpacing={3}
          sub="SAVED ANALYSES · 12 OPS"
          right={
            <IconButton onPress={() => {}}>
              <Ui size={12} color={Tactical.text.secondary}>
                ⇅
              </Ui>
            </IconButton>
          }
        />
        <PortfolioStrip />
      </TopBar>

      <ScrollView contentContainerStyle={{ padding: 14 }} showsVerticalScrollIndicator={false}>
        {SAVED_DEALS.map((deal) => (
          <SavedCard key={deal.id} deal={deal} onPress={() => router.push(`/target/${deal.leadId ?? "TGT-0147"}`)} />
        ))}
      </ScrollView>
    </ScreenShell>
  );
}
