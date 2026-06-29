/**
 * Custom tactical bottom tab bar: RECON · TARGETS · UNDERWRITE · DOSSIER.
 * Active = green icon + label + a short glowing underline; inactive = dim.
 */
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Rect } from "react-native-svg";

import { Tactical, hairline } from "@/constants/theme";

import { glowBox } from "./primitives";
import { Ui } from "./text";

// Derive the tab-bar prop type from expo-router's own Tabs so it matches the
// router's bundled react-navigation types exactly (avoids cross-copy clashes).
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const LABELS: Record<string, string> = {
  recon: "RECON",
  targets: "TARGETS",
  underwrite: "UNDERWRITE",
  dossier: "DOSSIER",
};

function TabIcon({ name, color }: { name: string; color: string }) {
  const s = 20;
  switch (name) {
    case "recon": // crosshair
      return (
        <Svg width={s} height={s} viewBox="0 0 20 20">
          <Circle cx="10" cy="10" r="6" stroke={color} strokeWidth="1.4" fill="none" />
          <Line x1="10" y1="1" x2="10" y2="5" stroke={color} strokeWidth="1.4" />
          <Line x1="10" y1="15" x2="10" y2="19" stroke={color} strokeWidth="1.4" />
          <Line x1="1" y1="10" x2="5" y2="10" stroke={color} strokeWidth="1.4" />
          <Line x1="15" y1="10" x2="19" y2="10" stroke={color} strokeWidth="1.4" />
        </Svg>
      );
    case "targets": // list rows
      return (
        <Svg width={s} height={s} viewBox="0 0 20 20">
          {[4, 10, 16].map((y) => (
            <Line key={y} x1="3" y1={y} x2="17" y2={y} stroke={color} strokeWidth="1.6" />
          ))}
        </Svg>
      );
    case "underwrite": // bar chart
      return (
        <Svg width={s} height={s} viewBox="0 0 20 20">
          <Rect x="3" y="10" width="3.5" height="7" fill={color} />
          <Rect x="8.25" y="6" width="3.5" height="11" fill={color} />
          <Rect x="13.5" y="3" width="3.5" height="14" fill={color} />
        </Svg>
      );
    case "dossier": // card stack
      return (
        <Svg width={s} height={s} viewBox="0 0 20 20">
          <Rect x="4" y="3" width="12" height="9" stroke={color} strokeWidth="1.4" fill="none" />
          <Rect x="6" y="7" width="12" height="9" stroke={color} strokeWidth="1.4" fill="none" />
        </Svg>
      );
    default:
      return null;
  }
}

export function TacticalTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: Tactical.bg.bar,
        borderTopWidth: 1,
        borderTopColor: hairline(0.16),
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
      }}
    >
      {state.routes.map((route, idx) => {
        const focused = state.index === idx;
        const color = focused ? Tactical.green.primary : Tactical.text.dim;
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 2 }}
          >
            <TabIcon name={route.name} color={color} />
            <Ui size={8} weight="semi" spacing={1} color={color}>
              {LABELS[route.name] ?? route.name}
            </Ui>
            <View
              style={[
                { width: 14, height: 2, backgroundColor: focused ? Tactical.green.primary : "transparent" },
                focused ? glowBox(Tactical.green.primary, 6, 0.9) : null,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
