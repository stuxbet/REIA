/**
 * Atmospheric motifs: grid overlay, hazard stripes, radar sweep, ping ring.
 * Decorative — built from react-native-svg + reanimated. Each <Svg> scopes its
 * own <Defs>, so reusing pattern ids across instances is safe.
 */
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Pattern, Polygon, Rect, Stop } from "react-native-svg";

/** Fills its (relative/absolute) parent with a faint HUD grid. */
export function GridOverlay({
  cell = 34,
  color = "rgba(124,255,155,0.06)",
}: {
  cell?: number;
  color?: string;
}) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="grid" width={cell} height={cell} patternUnits="userSpaceOnUse">
          <Path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" stroke={color} strokeWidth={1} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grid)" />
    </Svg>
  );
}

/** Diagonal hazard stripes — fills parent (banners, advisory edges). */
export function HazardStripes({ color = "rgba(255,178,62,0.10)", band = 9 }: { color?: string; band?: number }) {
  const tile = band * 2;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="hz" width={tile} height={tile} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <Rect width={band} height={tile} fill={color} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#hz)" />
    </Svg>
  );
}

/** Rotating radar sweep wedge (7s linear). */
export function RadarSweep({ color = "#7CFF9B", period = 7000 }: { color?: string; period?: number }) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(withTiming(360, { duration: period, easing: Easing.linear }), -1, false);
  }, [rot, period]);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="sweep" x1="50" y1="50" x2="100" y2="20" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={color} stopOpacity={0.22} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Polygon points="50,50 100,8 100,46" fill="url(#sweep)" />
      </Svg>
    </Animated.View>
  );
}

/** Expanding/fading ring (user reticle + capture pin). Centered on its parent. */
export function PingRing({
  color = "#7CFF9B",
  size = 120,
  period = 2600,
}: {
  color?: string;
  size?: number;
  period?: number;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: period, easing: Easing.out(Easing.ease) }), -1, false);
  }, [p, period]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.5 + p.value * 0.95 }],
    opacity: 0.85 * (1 - p.value),
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color },
        style,
      ]}
    />
  );
}

/** Static centered View helper for stacking reticle layers. */
export function Center({ children }: { children: React.ReactNode }) {
  return <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center" }]}>{children}</View>;
}
