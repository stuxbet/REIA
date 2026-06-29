/**
 * Screen scaffolding + structural motifs shared by every tactical screen:
 * ScreenShell · TopBar / ScreenHeader · ActionBar · AccentBar · CornerBrackets.
 */
import { type ReactNode } from "react";
import { type ColorValue, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { Tactical, hairline } from "@/constants/theme";

import { Mono, Ui } from "./text";

/** Back chevron for drill-in headers. */
export function BackButton({ onPress, color = Tactical.text.secondary }: { onPress?: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}>
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Path d="M11 3 L5 9 L11 15" stroke={color} strokeWidth={1.7} fill="none" />
      </Svg>
    </Pressable>
  );
}

/** Full-height vertical column with the tactical background. */
export function ScreenShell({ children, bg = Tactical.bg.screen }: { children: ReactNode; bg?: string }) {
  return <View style={{ flex: 1, backgroundColor: bg }}>{children}</View>;
}

/** Small colored bar to the left of a screen title. */
export function AccentBar({ color = Tactical.green.primary, height = 19 }: { color?: string; height?: number }) {
  return <View style={{ width: 6, height, backgroundColor: color, marginRight: 10 }} />;
}

/** Top bar: safe-area top inset + horizontal padding + bottom hairline. */
export function TopBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: hairline(0.14),
        backgroundColor: Tactical.bg.screen,
      }}
    >
      {children}
    </View>
  );
}

/** Composed header row: accent bar + title (+ sub) on the left, optional right slot. */
export function ScreenHeader({
  accent = Tactical.green.primary,
  title,
  titleSize = 21,
  titleSpacing = 3,
  titleColor = Tactical.text.heading,
  sub,
  right,
  left,
}: {
  accent?: string;
  title: string;
  titleSize?: number;
  titleSpacing?: number;
  titleColor?: string;
  sub?: ReactNode;
  right?: ReactNode;
  left?: ReactNode;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerLeft}>
        {left ? <View style={{ marginRight: 10 }}>{left}</View> : null}
        <AccentBar color={accent} height={titleSize + 6} />
        <View style={{ flexShrink: 1 }}>
          <Ui size={titleSize} weight="bold" spacing={titleSpacing} color={titleColor}>
            {title}
          </Ui>
          {typeof sub === "string" ? (
            <Mono size={9} color={Tactical.text.muted} spacing={0.5} style={{ marginTop: 3 }}>
              {sub}
            </Mono>
          ) : (
            sub
          )}
        </View>
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

/** Bottom action bar: bg.bar, top hairline, safe-area bottom inset. */
export function ActionBar({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          gap: 9,
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopWidth: 1,
          borderTopColor: hairline(0.14),
          backgroundColor: Tactical.bg.bar,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Four inset L-brackets framing a region (parent must be position:relative). */
export function CornerBrackets({
  color = Tactical.green.primary,
  size = 14,
  inset = 6,
  thickness = 1.5,
}: {
  color?: ColorValue;
  size?: number;
  inset?: number;
  thickness?: number;
}) {
  const base: ViewStyle = { position: "absolute", width: size, height: size, borderColor: color };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[base, { top: inset, left: inset, borderTopWidth: thickness, borderLeftWidth: thickness }]} />
      <View style={[base, { top: inset, right: inset, borderTopWidth: thickness, borderRightWidth: thickness }]} />
      <View style={[base, { bottom: inset, left: inset, borderBottomWidth: thickness, borderLeftWidth: thickness }]} />
      <View
        style={[base, { bottom: inset, right: inset, borderBottomWidth: thickness, borderRightWidth: thickness }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerLeft: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 },
});
