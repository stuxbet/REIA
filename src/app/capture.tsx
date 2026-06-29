import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import {
  ActionBar,
  Center,
  ChamferButton,
  Chip,
  GridOverlay,
  HazardStripes,
  HeatBar,
  HEAT_EMPTY,
  IconButton,
  Mono,
  Panel,
  PingRing,
  ScreenHeader,
  ScreenShell,
  SectionLabel,
  TopBar,
  Ui,
  glowBox,
} from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";

const AMBER = Tactical.status.amber;
const TAGS = ["VACANT", "OVERGROWN", "ROOF DMG", "BOARDED", "FIRE DMG", "CODE VIOL", "FSBO", "HOARDER"];

function PhotoTile({ label, dashed }: { label: string; dashed?: boolean }) {
  return (
    <View
      style={{
        flex: 1,
        aspectRatio: 1,
        backgroundColor: Tactical.bg.panel2,
        borderWidth: 1,
        borderColor: dashed ? hairline(0.25) : hairline(0.12),
        borderStyle: dashed ? "dashed" : "solid",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {dashed ? null : <HazardStripes color="rgba(124,255,155,0.06)" band={6} />}
      <Mono size={8} color={dashed ? Tactical.green.deep : Tactical.text.faint} spacing={0.5}>
        {label}
      </Mono>
    </View>
  );
}

export default function CaptureScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set(["VACANT", "OVERGROWN", "ROOF DMG"]));
  const toggle = (t: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  return (
    <ScreenShell>
      <TopBar>
        <ScreenHeader
          accent={AMBER}
          title="DROP TARGET"
          titleSize={20}
          titleSpacing={2}
          titleColor={Tactical.text.heading}
          sub={
            <Mono size={9} color={AMBER} spacing={0.5} style={{ marginTop: 3 }}>
              NEW CONTACT · UNVERIFIED
            </Mono>
          }
          right={
            <IconButton onPress={() => router.back()}>
              <Ui size={14} weight="bold" color={Tactical.text.secondary}>
                ✕
              </Ui>
            </IconButton>
          }
        />
      </TopBar>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* PIN STRIP */}
        <View
          style={{
            height: 96,
            backgroundColor: Tactical.bg.deep,
            borderWidth: 1,
            borderColor: hairline(0.12),
            overflow: "hidden",
          }}
        >
          <GridOverlay cell={20} color="rgba(124,255,155,0.05)" />
          <Center>
            <PingRing color={AMBER} size={46} />
            <View style={[{ width: 11, height: 11, borderRadius: 6, backgroundColor: AMBER }, glowBox(AMBER, 8, 0.9)]} />
          </Center>
          <View style={{ position: "absolute", bottom: 8, left: 10, flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: AMBER }, glowBox(AMBER, 6, 0.8)]} />
            <Mono size={8} color={AMBER}>
              PIN LOCKED · 39.0991°N 94.5772°W
            </Mono>
          </View>
        </View>

        {/* ADDRESS */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <SectionLabel>ADDRESS</SectionLabel>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ui size={8} weight="semi" spacing={1} color={Tactical.green.primary}>
                GEOCODED ✓
              </Ui>
              <Ui size={8} weight="semi" spacing={1} color={Tactical.text.muted}>
                EDIT ▸
              </Ui>
            </View>
          </View>
          <Panel>
            <Mono size={15} color={Tactical.text.heading} spacing={0.5}>
              1428 ELM AVE
            </Mono>
            <Mono size={10} color={Tactical.text.muted} style={{ marginTop: 3 }}>
              KANSAS CITY, MO 64127
            </Mono>
          </Panel>
        </View>

        {/* PHOTO INTEL */}
        <View style={{ gap: 8 }}>
          <SectionLabel>PHOTO INTEL</SectionLabel>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <PhotoTile label="ROOF" />
            <PhotoTile label="FRONT" />
            <PhotoTile label="YARD" />
            <PhotoTile label="+ ADD" dashed />
          </View>
        </View>

        {/* DISTRESS TAGS */}
        <View style={{ gap: 8 }}>
          <SectionLabel>DISTRESS TAGS</SectionLabel>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
            {TAGS.map((t) => (
              <Chip key={t} label={t} selected={selected.has(t)} onPress={() => toggle(t)} />
            ))}
          </View>
        </View>

        {/* MOTIVATION / HEAT */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <SectionLabel>MOTIVATION // HEAT</SectionLabel>
            <Ui size={11} weight="bold" spacing={1} color={Tactical.heat.hot}>
              HOT
            </Ui>
          </View>
          <HeatBar
            colors={[Tactical.heat.hot, Tactical.heat.hot, Tactical.status.orange, Tactical.status.amber, HEAT_EMPTY]}
            height={7}
          />
          <Mono size={8} color={Tactical.text.muted} style={{ marginTop: 2 }}>
            +VACANT +ROOF +OVERGROWN · AWAIT ENRICHMENT
          </Mono>
        </View>
      </ScrollView>

      <ActionBar>
        <ChamferButton label="DISCARD" variant="outline" color={Tactical.text.muted} onPress={() => router.back()} full />
        <ChamferButton label="CONFIRM TARGET ▸" onPress={() => router.replace("/targets")} full />
      </ActionBar>
    </ScreenShell>
  );
}
