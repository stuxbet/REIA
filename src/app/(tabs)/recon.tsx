import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

import { LeadMap } from "@/components/lead-map";
import {
  BlinkDot,
  ChamferButton,
  IconButton,
  Mono,
  ScreenHeader,
  ScreenShell,
  StatusDot,
  TopBar,
  Ui,
} from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import type { Lead } from "@/data/sample";
import { listLeads, seedLeadsIfEmpty } from "@/db/leads-repo";
import { heatColor } from "@/lib/tactical";

const GREEN = Tactical.green.primary;

function HudIcon({ name, color = GREEN }: { name: "layers" | "filter" | "crosshair"; color?: string }) {
  if (name === "layers")
    return (
      <Svg width={16} height={16} viewBox="0 0 16 16">
        <Line x1="8" y1="2" x2="15" y2="6" stroke={color} strokeWidth="1.2" />
        <Line x1="15" y1="6" x2="8" y2="10" stroke={color} strokeWidth="1.2" />
        <Line x1="8" y1="10" x2="1" y2="6" stroke={color} strokeWidth="1.2" />
        <Line x1="1" y1="6" x2="8" y2="2" stroke={color} strokeWidth="1.2" />
        <Line x1="1" y1="10" x2="8" y2="14" stroke={color} strokeWidth="1.2" />
        <Line x1="8" y1="14" x2="15" y2="10" stroke={color} strokeWidth="1.2" />
      </Svg>
    );
  if (name === "filter")
    return (
      <Svg width={16} height={16} viewBox="0 0 16 16">
        <Line x1="2" y1="4" x2="14" y2="4" stroke={color} strokeWidth="1.3" />
        <Line x1="4" y1="8" x2="12" y2="8" stroke={color} strokeWidth="1.3" />
        <Line x1="6" y1="12" x2="10" y2="12" stroke={color} strokeWidth="1.3" />
      </Svg>
    );
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Circle cx="8" cy="8" r="4.5" stroke={color} strokeWidth="1.3" fill="none" />
      <Line x1="8" y1="0" x2="8" y2="3.5" stroke={color} strokeWidth="1.3" />
      <Line x1="8" y1="12.5" x2="8" y2="16" stroke={color} strokeWidth="1.3" />
      <Line x1="0" y1="8" x2="3.5" y2="8" stroke={color} strokeWidth="1.3" />
      <Line x1="12.5" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.3" />
    </Svg>
  );
}

function TargetRow({ lead, onPress }: { lead: Lead; onPress: () => void }) {
  const c = heatColor(lead.heat);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderLeftColor: c,
        backgroundColor: pressed ? "rgba(124,255,155,0.05)" : "transparent",
      })}
    >
      <View style={{ flex: 1 }}>
        <Mono size={11} color={Tactical.text.primary} spacing={0.5}>
          {lead.address}
        </Mono>
        <Mono size={8} color={Tactical.text.muted} style={{ marginTop: 2 }}>
          {lead.flags}
        </Mono>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Ui size={9} weight="bold" spacing={1} color={c}>
          {lead.heat}
        </Ui>
        <Mono size={8} color={Tactical.text.faint} style={{ marginTop: 2 }}>
          {lead.distanceMi.toFixed(1)}MI
        </Mono>
      </View>
    </Pressable>
  );
}

export default function ReconScreen() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);

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

  return (
    <ScreenShell bg={Tactical.bg.deep}>
      <TopBar>
        <ScreenHeader
          title="RECON"
          titleSpacing={3}
          sub="SECTOR 7 · GREENWOOD"
          right={
            <>
              <IconButton onPress={() => {}}>
                <HudIcon name="layers" />
              </IconButton>
              <IconButton onPress={() => {}}>
                <HudIcon name="filter" />
              </IconButton>
            </>
          }
        />
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 8 }}>
          <StatusDot color={GREEN} size={6} />
          <Ui size={8} weight="semi" spacing={1} color={GREEN}>
            GPS LOCK
          </Ui>
          <Mono size={8} color={Tactical.text.muted}>
            39.0997°N 94.5786°W
          </Mono>
          <View style={{ flex: 1 }} />
          <BlinkDot color={Tactical.status.red} size={6} />
          <Ui size={8} weight="semi" spacing={1} color={Tactical.status.red}>
            REC
          </Ui>
        </View>
      </TopBar>

      {/* MAP CANVAS — real Apple map with live lead pins */}
      <LeadMap leads={leads} onPressLead={(lead) => router.push(`/target/${lead.id}`)} />

      {/* BOTTOM SHEET */}
      <View
        style={{
          backgroundColor: Tactical.bg.sheet,
          borderTopWidth: 1,
          borderTopColor: hairline(0.16),
          paddingHorizontal: 14,
          paddingTop: 8,
          paddingBottom: 14,
        }}
      >
        <View style={{ alignItems: "center", paddingBottom: 8 }}>
          <View style={{ width: 36, height: 3, borderRadius: 2, backgroundColor: hairline(0.25) }} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <Ui size={11} weight="bold" spacing={1.5} color={Tactical.text.heading}>
            NEARBY TARGETS
          </Ui>
          <Mono size={9} color={Tactical.text.muted}>
            SORT // HEAT ▾
          </Mono>
        </View>
        {leads.slice(0, 2).map((lead) => (
          <TargetRow key={lead.id} lead={lead} onPress={() => router.push(`/target/${lead.id}`)} />
        ))}
        <ChamferButton
          label="DROP TARGET"
          icon={<HudIcon name="crosshair" color={Tactical.green.on} />}
          onPress={() => router.push("/capture")}
          style={{ marginTop: 10 }}
        />
      </View>
    </ScreenShell>
  );
}
