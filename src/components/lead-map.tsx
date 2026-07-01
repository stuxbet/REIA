/**
 * LeadMap — real Apple map (react-native-maps, iOS Apple Maps provider, no API
 * key) with live, heat-colored diamond pins for each lead. Dark-styled to match
 * the tactical theme; HUD readouts + corner brackets overlay the map surface.
 *
 * Native module: not available in Expo Go on all SDKs — falls back to a dev build.
 */
import { useMemo } from "react";
import { View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

import { CornerBrackets, Mono, Ui } from "@/components/tactical";
import { Tactical, hairline } from "@/constants/theme";
import type { Lead } from "@/data/sample";
import { heatColor } from "@/lib/tactical";

const GREEN = Tactical.green.primary;

/** Kansas City fallback when there are no leads to frame. */
const DEFAULT_REGION: Region = {
  latitude: 39.0997,
  longitude: -94.5786,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

/** A region that frames all leads with a little breathing room. */
function regionForLeads(leads: Lead[]): Region {
  if (leads.length === 0) return DEFAULT_REGION;
  const lats = leads.map((l) => l.coords.lat);
  const lngs = leads.map((l) => l.coords.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max((maxLat - minLat) * 0.4, 0.01);
  const lngPad = Math.max((maxLng - minLng) * 0.4, 0.01);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: maxLat - minLat + latPad * 2,
    longitudeDelta: maxLng - minLng + lngPad * 2,
  };
}

function DiamondPin({ heat }: { heat: Lead["heat"] }) {
  const c = heatColor(heat);
  return (
    <View
      style={{
        width: 14,
        height: 14,
        backgroundColor: c,
        transform: [{ rotate: "45deg" }],
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.55)",
        shadowColor: c,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 6,
        shadowOpacity: 0.9,
      }}
    />
  );
}

export function LeadMap({ leads, onPressLead }: { leads: Lead[]; onPressLead?: (lead: Lead) => void }) {
  const region = useMemo(() => regionForLeads(leads), [leads]);
  const hot = leads.filter((l) => l.heat === "HOT").length;

  return (
    <View style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        userInterfaceStyle="dark"
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: 42, right: 8, bottom: 8, left: 8 }}
      >
        {leads.map((lead) => (
          <Marker
            key={lead.id}
            coordinate={{ latitude: lead.coords.lat, longitude: lead.coords.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => onPressLead?.(lead)}
          >
            <DiamondPin heat={lead.heat} />
          </Marker>
        ))}
      </MapView>

      {/* HUD overlays (non-interactive so the map still pans/zooms underneath) */}
      <View pointerEvents="none" style={{ position: "absolute", top: 10, left: 12 }}>
        <Mono size={9} color={Tactical.text.secondary}>
          TARGETS // {String(leads.length).padStart(2, "0")}
        </Mono>
        <Mono size={9} color={Tactical.status.red} style={{ marginTop: 2 }}>
          HOT // {String(hot).padStart(2, "0")}
        </Mono>
      </View>
      <View pointerEvents="none" style={{ position: "absolute", top: 10, right: 14 }}>
        <Ui size={11} weight="bold" color={GREEN}>
          N ↑
        </Ui>
      </View>
      <CornerBrackets color={GREEN} size={16} inset={8} />
      <View
        pointerEvents="none"
        style={{ position: "absolute", bottom: 10, left: 12, flexDirection: "row", alignItems: "center", gap: 6 }}
      >
        <View style={{ width: 30, height: 1, backgroundColor: hairline(0.4) }} />
        <Mono size={8} color={Tactical.text.faint}>
          500 FT
        </Mono>
      </View>
    </View>
  );
}
