/**
 * Data-readout primitives: status dots (static + blinking), segmented heat
 * bars, metric tiles (pass/fail dot + semantic top accent), and steppers.
 */
import { useEffect } from "react";
import { Pressable, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Tactical, hairline } from "@/constants/theme";

import { glowBox } from "./primitives";
import { Mono, Ui } from "./text";

import type { MetricStatus } from "@/calc/brrrr";

function dot(color: string, size: number): ViewStyle {
  return { width: size, height: size, borderRadius: size / 2, backgroundColor: color };
}

export function StatusDot({ color, size = 7, glow = true }: { color: string; size?: number; glow?: boolean }) {
  return <View style={[dot(color, size), glow ? glowBox(color, 7, 0.6) : null]} />;
}

/** Blinking dot (REC indicator, SYS ONLINE) — opacity 1 → .25 loop. */
export function BlinkDot({
  color,
  size = 7,
  period = 1600,
}: {
  color: string;
  size?: number;
  period?: number;
}) {
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.25, { duration: period, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [o, period]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[dot(color, size), glowBox(color, 8, 0.7), style]} />;
}

/** Segmented heat bar. Pass colors per segment (use a faint value for "empty"). */
export function HeatBar({ colors, height = 6 }: { colors: string[]; height?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 3 }}>
      {colors.map((c, i) => (
        <View key={i} style={{ flex: 1, height, backgroundColor: c }} />
      ))}
    </View>
  );
}

export const HEAT_EMPTY = "rgba(124,255,155,0.10)";

const STATUS_COLOR: Record<MetricStatus, string> = {
  pass: Tactical.verdict.go,
  fail: Tactical.verdict.nogo,
  watch: Tactical.status.amber,
};

/** Verdict metric tile: label + pass/fail dot, value, benchmark, 2px top accent. */
export function MetricTile({
  label,
  value,
  benchmark,
  status = "pass",
  valueColor,
  onPress,
}: {
  label: string;
  value: string;
  benchmark?: string;
  status?: MetricStatus;
  valueColor?: string;
  onPress?: () => void;
}) {
  const sc = STATUS_COLOR[status];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: Tactical.bg.panel2,
        borderWidth: 1,
        borderColor: hairline(0.1),
        borderTopWidth: 2,
        borderTopColor: sc,
        padding: 10,
        gap: 5,
        opacity: pressed && onPress ? 0.7 : 1,
      })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Ui size={7.5} weight="semi" spacing={1} color={Tactical.text.faint}>
          {label}
        </Ui>
        <View style={dot(sc, 6)} />
      </View>
      <Mono size={16} weight="med" color={valueColor ?? Tactical.text.heading}>
        {value}
      </Mono>
      {benchmark ? (
        <Mono size={7.5} color={Tactical.text.dim}>
          {benchmark}
        </Mono>
      ) : null}
    </Pressable>
  );
}

/** −/+ stepper for input cells. */
export function Stepper({ onDec, onInc }: { onDec?: () => void; onInc?: () => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      <StepBtn label="−" onPress={onDec} />
      <StepBtn label="+" onPress={onInc} />
    </View>
  );
}

function StepBtn({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        {
          width: 22,
          height: 22,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: hairline(0.18),
          backgroundColor: Tactical.bg.raised,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Ui size={13} weight="bold" color={Tactical.green.deep}>
        {label}
      </Ui>
    </Pressable>
  );
}
