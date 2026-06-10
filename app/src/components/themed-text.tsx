import { Platform, StyleSheet, Text, type TextProps } from 'react-native'

import { Fonts, ThemeColor, Typography } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'heading'
    | 'display'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'caption'
    | 'code'
  themeColor?: ThemeColor
}

const MAX_FONT_SCALE: Partial<Record<NonNullable<ThemedTextProps['type']>, number>> = {
  title: 1.15,
  display: 1.15,
  heading: 1.2,
  subtitle: 1.2,
}

export function ThemedText({
  style,
  type = 'default',
  themeColor,
  maxFontSizeMultiplier,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme()

  return (
    <Text
      maxFontSizeMultiplier={
        maxFontSizeMultiplier ?? MAX_FONT_SCALE[type] ?? 1.3
      }
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'heading' && styles.heading,
        type === 'display' && styles.display,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && { ...styles.link, color: theme.link },
        type === 'caption' && styles.caption,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  small: Typography.small,
  smallBold: Typography.smallBold,
  default: Typography.default,
  title: Typography.title,
  heading: Typography.heading,
  display: Typography.display,
  subtitle: Typography.subtitle,
  link: Typography.link,
  caption: Typography.caption,
  code: {
    ...Typography.code,
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
  },
})
