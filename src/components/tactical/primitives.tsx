/**
 * Core tactical motifs: chamfered buttons/shape, chips, panels, section
 * labels, icon buttons. The chamfer (top-left + bottom-right cut corners)
 * is drawn with react-native-svg since CSS clip-path has no RN equivalent.
 */
import { type ReactNode, useState } from "react";
import { type LayoutChangeEvent, Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Polygon } from "react-native-svg";

import { Tactical, hairline } from "@/constants/theme";

import { Ui } from "./text";

/** Polygon points for a w×h rect with `cut`px chamfer at top-left + bottom-right. */
function chamferPoints(w: number, h: number, cut: number) {
  return `${cut},0 ${w},0 ${w},${h - cut} ${w - cut},${h} 0,${h} 0,${cut}`;
}

/** Chamfered fill/stroke that self-measures to its parent's size. */
function ChamferBg({ fill, stroke, cut = 12 }: { fill?: string; stroke?: string; cut?: number }) {
  const [s, setS] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) =>
    setS({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout}>
      {s.w > 0 ? (
        <Svg width={s.w} height={s.h}>
          <Polygon
            points={chamferPoints(s.w, s.h, cut)}
            fill={fill ?? "transparent"}
            stroke={stroke}
            strokeWidth={stroke ? 1.25 : 0}
          />
        </Svg>
      ) : null}
    </View>
  );
}

export function ChamferButton({
  label,
  onPress,
  variant = "solid",
  color = Tactical.green.primary,
  textColor,
  icon,
  cut = 12,
  disabled = false,
  full = false,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: "solid" | "outline";
  color?: string;
  textColor?: string;
  icon?: ReactNode;
  cut?: number;
  disabled?: boolean;
  full?: boolean;
  style?: ViewStyle;
}) {
  const solid = variant === "solid";
  const txt = textColor ?? (solid ? Tactical.green.on : color);
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.btn,
        full && { flex: 1 },
        { opacity: disabled ? 0.4 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <ChamferBg fill={solid ? color : "transparent"} stroke={solid ? undefined : color} cut={cut} />
      {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
      <Ui size={13.5} weight="bold" spacing={1.8} color={txt}>
        {label}
      </Ui>
    </Pressable>
  );
}

/** Selectable tag chip (distress tags, channels). Square by default. */
export function Chip({
  label,
  selected = false,
  color = Tactical.green.primary,
  onPress,
}: {
  label: string;
  selected?: boolean;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? color : hairline(0.16),
          backgroundColor: selected ? "rgba(124,255,155,0.10)" : Tactical.bg.raised,
          opacity: pressed ? 0.8 : 1,
        },
        selected ? glowBox(color) : null,
      ]}
    >
      <Ui size={9.5} weight="semi" spacing={1} color={selected ? color : Tactical.text.muted}>
        {selected ? `✓ ${label}` : label}
      </Ui>
    </Pressable>
  );
}

/** Sharp-cornered card / readout panel. Optional semantic left accent. */
export function Panel({
  children,
  style,
  accent,
  accentWidth = 3,
  bg = Tactical.bg.panel,
}: {
  children: ReactNode;
  style?: ViewStyle;
  accent?: string;
  accentWidth?: number;
  bg?: string;
}) {
  return (
    <View
      style={[
        { backgroundColor: bg, borderWidth: 1, borderColor: hairline(0.12), padding: 12 },
        accent ? { borderLeftWidth: accentWidth, borderLeftColor: accent } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** "A · ACQUISITION" style section eyebrow. */
export function SectionLabel({
  children,
  color = Tactical.text.secondary,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: ViewStyle;
}) {
  return (
    <Ui size={10} weight="semi" spacing={2} color={color} style={style}>
      {children}
    </Ui>
  );
}

/** 32px square HUD icon button. */
export function IconButton({
  children,
  onPress,
  size = 32,
}: {
  children: ReactNode;
  onPress?: () => void;
  size?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Tactical.bg.raised,
          borderWidth: 1,
          borderColor: hairline(0.16),
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

/** iOS colored box-glow (shadow). Android can't tint elevation — degrades gracefully. */
export function glowBox(color: string, radius = 10, opacity = 0.5): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: radius,
    shadowOpacity: opacity,
  };
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
});
