/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css'

import { Platform } from 'react-native'

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    primary: '#3357ae',
    onPrimary: '#ffffff',
    success: '#22c55e',
    danger: '#ef4444',
    link: '#3c87f7',
    priceUp: '#22c55e',
    priceDown: '#ef4444',
    border: '#E0E1E6',
    badgeActiveBg: 'rgba(34, 197, 94, 0.15)',
    badgeTriggeredBg: 'rgba(239, 68, 68, 0.15)',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    primary: '#5588ee',
    onPrimary: '#ffffff',
    success: '#22c55e',
    danger: '#ef4444',
    link: '#3c87f7',
    priceUp: '#22c55e',
    priceDown: '#ef4444',
    border: '#2E3135',
    badgeActiveBg: 'rgba(34, 197, 94, 0.2)',
    badgeTriggeredBg: 'rgba(239, 68, 68, 0.2)',
  },
} as const

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark

export type ThemePalette = (typeof Colors)['light' | 'dark'] & { isDark: boolean }

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
})

export const Typography = {
  display: { fontSize: 36, lineHeight: 40, fontWeight: '600' as const },
  title: { fontSize: 48, lineHeight: 52, fontWeight: '600' as const },
  heading: { fontSize: 28, lineHeight: 34, fontWeight: '600' as const },
  subtitle: { fontSize: 32, lineHeight: 44, fontWeight: '600' as const },
  default: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
  smallBold: { fontSize: 14, lineHeight: 20, fontWeight: '700' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  link: { fontSize: 14, lineHeight: 30, fontWeight: '500' as const },
  code: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
}

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
} as const

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0
export const MaxContentWidth = 800
