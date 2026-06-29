import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import {
  HazardStripes,
  Mono,
  ScreenHeader,
  ScreenShell,
  TopBar,
  Ui,
} from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import { LEADS, type Lead } from "@/data/sample";
import { heatColor, statusColor } from "@/lib/tactical";

const FILTERS = [
  { label: "NEW", count: 5 },
  { label: "ALL", count: 14 },
  { label: "RECON", count: 3 },
  { label: "CONTACT", count: 4 },
  { label: "ENGAGED", count: 1 },
];

function SegToggle() {
  return (
    <View style={{ flexDirection: "row", borderWidth: 1, borderColor: hairline(0.16) }}>
      {(["MAP", "LIST"] as const).map((seg) => {
        const active = seg === "LIST";
        return (
          <View
            key={seg}
            style={{
              paddingHorizontal: 9,
              paddingVertical: 5,
              backgroundColor: active ? "rgba(124,255,155,0.12)" : "transparent",
            }}
          >
            <Ui size={8} weight="bold" spacing={1} color={active ? Tactical.green.primary : Tactical.text.dim}>
              {seg}
            </Ui>
          </View>
        );
      })}
    </View>
  );
}

function FilterChip({ label, count, active }: { label: string; count: number; active?: boolean }) {
  const c = active ? Tactical.green.primary : Tactical.text.muted;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: active ? Tactical.green.primary : hairline(0.16),
        backgroundColor: active ? "rgba(124,255,155,0.10)" : Tactical.bg.raised,
      }}
    >
      <Ui size={9} weight="semi" spacing={1} color={c}>
        {label}
      </Ui>
      <Mono size={9} color={c}>
        {count}
      </Mono>
    </View>
  );
}

function MiniTag({ label }: { label: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: hairline(0.16), paddingHorizontal: 5, paddingVertical: 2 }}>
      <Ui size={7.5} weight="semi" spacing={0.5} color={Tactical.text.muted}>
        {label}
      </Ui>
    </View>
  );
}

function StatusPill({ status }: { status: Lead["status"] }) {
  const c = statusColor(status);
  return (
    <View style={{ borderWidth: 1, borderColor: c, paddingHorizontal: 6, paddingVertical: 2 }}>
      <Ui size={7.5} weight="bold" spacing={1} color={c}>
        {status}
      </Ui>
    </View>
  );
}

function TargetCard({ lead, onPress }: { lead: Lead; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        backgroundColor: Tactical.bg.panel,
        borderWidth: 1,
        borderColor: hairline(0.12),
        borderLeftWidth: 3,
        borderLeftColor: heatColor(lead.heat),
        marginBottom: 8,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ width: 54, backgroundColor: Tactical.bg.panel2, overflow: "hidden" }}>
        <HazardStripes color="rgba(124,255,155,0.06)" band={6} />
      </View>
      <View style={{ flex: 1, padding: 10, gap: 6 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Mono size={12} color={Tactical.text.heading} spacing={0.5}>
            {lead.address}
          </Mono>
          <Ui size={8} weight="bold" spacing={1} color={heatColor(lead.heat)}>
            {lead.heat}
          </Ui>
        </View>
        <Mono size={8} color={Tactical.text.muted}>
          {lead.city}
        </Mono>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <StatusPill status={lead.status} />
          {lead.distressTags.slice(0, 2).map((t) => (
            <MiniTag key={t} label={t} />
          ))}
          <View style={{ flex: 1 }} />
          <Mono size={8} color={Tactical.text.faint}>
            {lead.distanceMi.toFixed(1)}MI
          </Mono>
        </View>
      </View>
    </Pressable>
  );
}

export default function TargetsScreen() {
  const router = useRouter();
  const [active] = useState("NEW");
  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="TARGETS"
          titleSpacing={3}
          sub={
            <Mono size={9} color={Tactical.text.muted} style={{ marginTop: 3 }}>
              14 ACTIVE · <Mono size={9} color={Tactical.heat.hot}>3 HOT</Mono>
            </Mono>
          }
          right={<SegToggle />}
        />
      </TopBar>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: hairline(0.1) }}
        contentContainerStyle={{ gap: 7, paddingHorizontal: 14, paddingVertical: 10 }}
      >
        {FILTERS.map((f) => (
          <FilterChip key={f.label} label={f.label} count={f.count} active={f.label === active} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 14, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
        {LEADS.map((lead) => (
          <TargetCard key={lead.id} lead={lead} onPress={() => router.push(`/target/${lead.id}`)} />
        ))}
      </ScrollView>
    </ScreenShell>
  );
}
