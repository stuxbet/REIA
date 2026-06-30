import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { HazardStripes, Mono, ScreenHeader, ScreenShell, TopBar, Ui } from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import type { Lead } from "@/data/sample";
import { listLeads, seedLeadsIfEmpty } from "@/db/leads-repo";
import { heatColor, statusColor } from "@/lib/tactical";

const FILTER_KEYS = ["ALL", "NEW", "RECON", "CONTACT", "ENGAGED"] as const;

function SegToggle() {
  return (
    <View style={{ flexDirection: "row", borderWidth: 1, borderColor: hairline(0.16) }}>
      {(["MAP", "LIST"] as const).map((seg) => {
        const active = seg === "LIST";
        return (
          <View key={seg} style={{ paddingHorizontal: 9, paddingVertical: 5, backgroundColor: active ? "rgba(124,255,155,0.12)" : "transparent" }}>
            <Ui size={8} weight="bold" spacing={1} color={active ? Tactical.green.primary : Tactical.text.dim}>
              {seg}
            </Ui>
          </View>
        );
      })}
    </View>
  );
}

function FilterChip({ label, count, active, onPress }: { label: string; count: number; active?: boolean; onPress?: () => void }) {
  const c = active ? Tactical.green.primary : Tactical.text.muted;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: active ? Tactical.green.primary : hairline(0.16),
        backgroundColor: active ? "rgba(124,255,155,0.10)" : Tactical.bg.raised,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ui size={9} weight="semi" spacing={1} color={c}>
        {label}
      </Ui>
      <Mono size={9} color={c}>
        {count}
      </Mono>
    </Pressable>
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [active, setActive] = useState<string>("ALL");

  useFocusEffect(
    useCallback(() => {
      let on = true;
      (async () => {
        await seedLeadsIfEmpty();
        const rows = await listLeads();
        if (on) setLeads(rows);
      })();
      return () => {
        on = false;
      };
    }, []),
  );

  const hot = leads.filter((l) => l.heat === "HOT").length;
  const count = (key: string) => (key === "ALL" ? leads.length : leads.filter((l) => l.status === key).length);
  const filtered = active === "ALL" ? leads : leads.filter((l) => l.status === active);

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          title="TARGETS"
          titleSpacing={3}
          sub={
            <Mono size={9} color={Tactical.text.muted} style={{ marginTop: 3 }}>
              {leads.length} ACTIVE ·{" "}
              <Mono size={9} color={Tactical.heat.hot}>
                {hot} HOT
              </Mono>
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
        {FILTER_KEYS.map((k) => (
          <FilterChip key={k} label={k} count={count(k)} active={k === active} onPress={() => setActive(k)} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 14, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
        {filtered.map((lead) => (
          <TargetCard key={lead.id} lead={lead} onPress={() => router.push(`/target/${lead.id}`)} />
        ))}
      </ScrollView>
    </ScreenShell>
  );
}
