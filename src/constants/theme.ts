/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/* ------------------------------------------------------------------ *
 * REIA Tactical — dark-only military/HUD palette.
 * Source of truth: docs handoff "REIA — Tactical BRRRR". Dark is the
 * default and only theme; light mode is intentionally not wired for v1.
 * ------------------------------------------------------------------ */
export const Tactical = {
  bg: {
    page: '#060A07',
    screen: '#0A0F0C',
    deep: '#070C09',
    bar: '#070C09',
    sheet: '#0C120E',
    panel: '#11180F',
    panel2: '#0E140C',
    raised: '#10170F',
  },
  green: {
    primary: '#7CFF9B',
    on: '#06100A',
    bright: '#BFFFD0',
    deep: '#3E8C5C',
    lime: '#B6FF5C',
  },
  text: {
    heading: '#EAF6EE',
    primary: '#D7E6DC',
    secondary: '#9FB6A6',
    muted: '#7E9587',
    faint: '#6E8377',
    dim: '#566B5D',
    backdrop: '#33433A',
  },
  status: {
    amber: '#FFB23E',
    amberBright: '#FFD089',
    orange: '#FF7A4A',
    red: '#FF5A52',
    redLight: '#FF8079',
    cyan: '#54E6E0',
  },
  hairline: 'rgba(124,255,155,0.14)',
  heat: { hot: '#FF5A52', warm: '#FFB23E', cold: '#5E7466' },
  verdict: { go: '#7CFF9B', marginal: '#FFB23E', nogo: '#FF5A52' },
  pipeline: {
    NEW: '#7CFF9B',
    RECON: '#FFB23E',
    CONTACT: '#54E6E0',
    ENGAGED: '#B6FF5C',
    DEAD: '#6E8377',
  },
} as const;

/** Green-tinted hairline at a given alpha (common values .12 .14 .16 .18). */
export const hairline = (alpha = 0.14) => `rgba(124,255,155,${alpha})`;

/** Loaded font family names (see @expo-google-fonts/* and the root layout). */
export const TacticalFonts = {
  ui: 'ChakraPetch_700Bold',
  uiSemi: 'ChakraPetch_600SemiBold',
  uiMed: 'ChakraPetch_500Medium',
  uiReg: 'ChakraPetch_400Regular',
  mono: 'JetBrainsMono_400Regular',
  monoMed: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
  monoXBold: 'JetBrainsMono_800ExtraBold',
} as const;
