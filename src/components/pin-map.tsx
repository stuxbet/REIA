/**
 * PinMap — a small, static locator map (react-native-maps, Apple Maps on iOS)
 * for CAPTURE. Shows a single amber pin at the captured coordinate; tap the map
 * or drag the pin to adjust it. Pan/zoom are disabled so it sits cleanly inside
 * a ScrollView and reads as a preview, not a full map.
 */
import { View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";

import { Tactical } from "@/constants/theme";

const AMBER = Tactical.status.amber;

/** Kansas City fallback before a fix / when location is denied. */
const DEFAULT_REGION: Region = {
  latitude: 39.0997,
  longitude: -94.5786,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type Coords = { lat: number; lng: number };

export function PinMap({ coords, onChange }: { coords: Coords | null; onChange?: (c: Coords) => void }) {
  const region: Region = coords
    ? { latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.004, longitudeDelta: 0.004 }
    : DEFAULT_REGION;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={region}
      userInterfaceStyle="dark"
      showsUserLocation
      showsMyLocationButton={false}
      showsCompass={false}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      onPress={(e) => onChange?.({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
    >
      {coords ? (
        <Marker
          coordinate={{ latitude: coords.lat, longitude: coords.lng }}
          anchor={{ x: 0.5, y: 0.5 }}
          draggable={!!onChange}
          onDragEnd={(e) => onChange?.({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
        >
          <View
            style={{
              width: 13,
              height: 13,
              borderRadius: 7,
              backgroundColor: AMBER,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.5)",
              shadowColor: AMBER,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 8,
              shadowOpacity: 0.9,
            }}
          />
        </Marker>
      ) : null}
    </MapView>
  );
}
