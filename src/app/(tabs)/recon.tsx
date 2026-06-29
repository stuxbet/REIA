import { useRouter } from "expo-router";
import { type DimensionValue, Pressable, View } from "react-native";
import Svg, { Circle, Ellipse, Line } from "react-native-svg";

import {
  BlinkDot,
  Center,
  ChamferButton,
  CornerBrackets,
  GridOverlay,
  IconButton,
  Mono,
  PingRing,
  RadarSweep,
  ScreenHeader,
  ScreenShell,
  StatusDot,
  TopBar,
  Ui,
} from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import { LEADS } from "@/data/sample";
import { heatColor } from "@/lib/tactical";

const GREEN = Tactical.green.primary;

const PINS: { top: DimensionValue; left: DimensionValue; heat: "HOT" | "WARM" | "COLD"; absentee?: boolean }[] = [
  { top: "28%", left: "26%", heat: "WARM" },
  { top: "57%", left: "63%", heat: "HOT", absentee: true },
  { top: "40%", left: "80%", heat: "COLD" },
  { top: "72%", left: "34%", heat: "WARM" },
  { top: "20%", left: "62%", heat: "HOT" },
];

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

function Pin({ heat, absentee }: { heat: "HOT" | "WARM" | "COLD"; absentee?: boolean }) {
  const c = heatColor(heat);
  return (
    <View style={{ alignItems: "center" }}>
      {absentee ? (
        <View style={{ marginBottom: 4, backgroundColor: "rgba(255,90,82,0.16)", paddingHorizontal: 4, paddingVertical: 1 }}>
          <Mono size={7} weight="bold" color={Tactical.status.redLight} spacing={0.5}>
            $$ ABSENTEE
          </Mono>
        </View>
      ) : null}
      <View
        style={{
          width: 13,
          height: 13,
          backgroundColor: c,
          transform: [{ rotate: "45deg" }],
          shadowColor: c,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 8,
          shadowOpacity: 0.9,
        }}
      />
    </View>
  );
}

function TargetRow({ lead, onPress }: { lead: (typeof LEADS)[number]; onPress: () => void }) {
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

      {/* MAP CANVAS */}
      <View style={{ flex: 1, backgroundColor: Tactical.bg.deep, position: "relative", overflow: "hidden" }}>
        <GridOverlay cell={34} color="rgba(124,255,155,0.05)" />
        <RadarSweep color={GREEN} />
        <Svg style={{ position: "absolute", width: "100%", height: "100%" }} pointerEvents="none">
          <Line x1="-5%" y1="38%" x2="105%" y2="52%" stroke="rgba(124,255,155,0.11)" strokeWidth="2" />
          <Line x1="20%" y1="-5%" x2="70%" y2="105%" stroke="rgba(124,255,155,0.09)" strokeWidth="2" />
          <Line x1="105%" y1="22%" x2="10%" y2="95%" stroke="rgba(124,255,155,0.08)" strokeWidth="1.5" />
          <Ellipse cx="50%" cy="50%" rx="33%" ry="24%" stroke="rgba(124,255,155,0.07)" strokeWidth="1" fill="none" />
        </Svg>

        {/* overlay readouts */}
        <View style={{ position: "absolute", top: 10, left: 12 }}>
          <Mono size={9} color={Tactical.text.secondary}>
            TARGETS // 14
          </Mono>
          <Mono size={9} color={Tactical.status.red} style={{ marginTop: 2 }}>
            HOT // 03
          </Mono>
        </View>
        <View style={{ position: "absolute", top: 10, right: 14 }}>
          <Ui size={11} weight="bold" color={GREEN}>
            N ↑
          </Ui>
        </View>

        {/* pins */}
        {PINS.map((p, i) => (
          <View key={i} style={{ position: "absolute", top: p.top, left: p.left }}>
            <Pin heat={p.heat} absentee={p.absentee} />
          </View>
        ))}

        {/* user reticle */}
        <Center>
          <PingRing color={GREEN} size={96} />
          <View style={{ position: "absolute", width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: hairline(0.35) }} />
          <View style={{ position: "absolute", width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: GREEN }} />
          <View style={{ position: "absolute", width: 44, height: 1, backgroundColor: hairline(0.4) }} />
          <View style={{ position: "absolute", width: 1, height: 44, backgroundColor: hairline(0.4) }} />
          <StatusDot color={GREEN} size={7} />
        </Center>

        <CornerBrackets color={GREEN} size={16} inset={8} />

        {/* scale bar */}
        <View style={{ position: "absolute", bottom: 10, left: 12, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 30, height: 1, backgroundColor: hairline(0.4) }} />
          <Mono size={8} color={Tactical.text.faint}>
            500 FT
          </Mono>
        </View>
      </View>

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
        {LEADS.slice(0, 2).map((lead) => (
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
