/**
 * Tactical typography. Two families only:
 *   - <Ui>   Chakra Petch — titles, labels, buttons (usually UPPERCASE + tracked)
 *   - <Mono> JetBrains Mono — all numbers, money, coords, IDs, benchmarks
 * Keep every money/percent string going through src/lib/format.ts upstream.
 */
import { StyleSheet, Text, type TextProps } from "react-native";

import { Tactical, TacticalFonts } from "@/constants/theme";

type UiWeight = "reg" | "med" | "semi" | "bold";
type MonoWeight = "reg" | "med" | "bold" | "xbold";

const UI_FAMILY: Record<UiWeight, string> = {
  reg: TacticalFonts.uiReg,
  med: TacticalFonts.uiMed,
  semi: TacticalFonts.uiSemi,
  bold: TacticalFonts.ui,
};

const MONO_FAMILY: Record<MonoWeight, string> = {
  reg: TacticalFonts.mono,
  med: TacticalFonts.monoMed,
  bold: TacticalFonts.monoBold,
  xbold: TacticalFonts.monoXBold,
};

type BaseProps = TextProps & {
  size?: number;
  color?: string;
  spacing?: number;
  upper?: boolean;
  glow?: string;
};

/** Chakra Petch — squared techno-military UI face. */
export function Ui({
  size = 13,
  color = Tactical.text.primary,
  weight = "bold",
  spacing,
  upper = true,
  glow,
  style,
  children,
  ...rest
}: BaseProps & { weight?: UiWeight }) {
  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontFamily: UI_FAMILY[weight],
          fontSize: size,
          color,
          letterSpacing: spacing,
          textTransform: upper ? "uppercase" : "none",
        },
        glow ? glowStyle(glow) : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** JetBrains Mono — tabular data readout face. */
export function Mono({
  size = 13,
  color = Tactical.text.primary,
  weight = "reg",
  spacing,
  upper = false,
  glow,
  style,
  children,
  ...rest
}: BaseProps & { weight?: MonoWeight }) {
  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontFamily: MONO_FAMILY[weight],
          fontSize: size,
          color,
          letterSpacing: spacing,
          textTransform: upper ? "uppercase" : "none",
        },
        glow ? glowStyle(glow) : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/** iOS text-shadow glow for hero numbers / active elements. */
export function glowStyle(color: string) {
  return StyleSheet.create({
    g: { textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  }).g;
}
