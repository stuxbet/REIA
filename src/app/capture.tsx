import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

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
import type { Lead } from "@/data/sample";
import { saveLead } from "@/db/leads-repo";

const AMBER = Tactical.status.amber;
const TAGS = ["VACANT", "OVERGROWN", "ROOF DMG", "BOARDED", "FIRE DMG", "CODE VIOL", "FSBO", "HOARDER"];

function fmtCoord(lat: number, lng: number) {
  return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? "N" : "S"} ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? "E" : "W"}`;
}

function PhotoTile({ label, dashed, uri, onPress }: { label?: string; dashed?: boolean; uri?: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
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
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <>
          {dashed ? null : <HazardStripes color="rgba(124,255,155,0.06)" band={6} />}
          <Mono size={8} color={dashed ? Tactical.green.deep : Tactical.text.faint} spacing={0.5}>
            {label}
          </Mono>
        </>
      )}
    </Pressable>
  );
}

export default function CaptureScreen() {
  const router = useRouter();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [addr, setAddr] = useState<{ line1: string; city: string } | null>(null);
  const [locating, setLocating] = useState(true);
  const [selected, setSelected] = useState(new Set(["VACANT", "OVERGROWN", "ROOF DMG"]));
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (on) setCoords(c);
        const places = await Location.reverseGeocodeAsync({ latitude: c.lat, longitude: c.lng });
        const p = places[0];
        if (on && p) {
          const line1 = [p.streetNumber, p.street ?? p.name].filter(Boolean).join(" ").trim().toUpperCase();
          const city = [p.city, p.region, p.postalCode].filter(Boolean).join(", ").toUpperCase();
          setAddr({ line1: line1 || "DROPPED PIN", city: city || "—" });
        }
      } catch {
        // permission denied or geocode failed — keep the manual fallback values
      } finally {
        if (on) setLocating(false);
      }
    })();
    return () => {
      on = false;
    };
  }, []);
  const toggle = (t: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (!res.canceled && res.assets[0]) setPhotos((p) => [...p, res.assets[0].uri].slice(0, 4));
  };

  const confirm = async () => {
    const tags = [...selected];
    const lead: Lead = {
      id: `LEAD-${Date.now().toString(36).toUpperCase()}`,
      address: addr?.line1 ?? "1428 ELM AVE",
      city: addr?.city ?? "KANSAS CITY, MO 64127",
      coords: coords ?? { lat: 39.0991, lng: -94.5772 },
      distanceMi: 0.1,
      heat: "HOT",
      motivationScore: 80,
      status: "NEW",
      distressTags: tags,
      flags: tags.slice(0, 2).join(" · ") || "NEW TARGET",
      photos: photos.length,
    };
    await saveLead(lead);
    router.replace("/targets");
  };

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
              {coords ? `PIN LOCKED · ${fmtCoord(coords.lat, coords.lng)}` : locating ? "ACQUIRING GPS…" : "PIN · MANUAL ENTRY"}
            </Mono>
          </View>
        </View>

        {/* ADDRESS */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <SectionLabel>ADDRESS</SectionLabel>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ui size={8} weight="semi" spacing={1} color={addr ? Tactical.green.primary : AMBER}>
                {addr ? "GEOCODED ✓" : "LOCATING…"}
              </Ui>
              <Ui size={8} weight="semi" spacing={1} color={Tactical.text.muted}>
                EDIT ▸
              </Ui>
            </View>
          </View>
          <Panel>
            <Mono size={15} color={Tactical.text.heading} spacing={0.5}>
              {addr?.line1 ?? "1428 ELM AVE"}
            </Mono>
            <Mono size={10} color={Tactical.text.muted} style={{ marginTop: 3 }}>
              {addr?.city ?? "KANSAS CITY, MO 64127"}
            </Mono>
          </Panel>
        </View>

        {/* PHOTO INTEL */}
        <View style={{ gap: 8 }}>
          <SectionLabel>PHOTO INTEL</SectionLabel>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0, 1, 2, 3].map((i) => {
              if (photos[i]) return <PhotoTile key={i} uri={photos[i]} />;
              if (i === photos.length) return <PhotoTile key={i} label="+ ADD" dashed onPress={pickPhoto} />;
              return <PhotoTile key={i} label={["ROOF", "FRONT", "YARD", "INT"][i]} />;
            })}
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
        <ChamferButton label="CONFIRM TARGET ▸" onPress={confirm} full />
      </ActionBar>
    </ScreenShell>
  );
}
