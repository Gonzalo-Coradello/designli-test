import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { Spacing } from '@/shared/theme'

interface ScreenHeaderProps {
  title: string
  subtitle?: string
  style?: StyleProp<ViewStyle>
}

export function ScreenHeader({ title, subtitle, style }: ScreenHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <ThemedText type="heading">{title}</ThemedText>
      {subtitle ? (
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.half,
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
})
