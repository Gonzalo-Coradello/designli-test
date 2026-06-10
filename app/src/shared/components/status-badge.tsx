import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/hooks/use-theme'
import { Radius, Spacing } from '@/shared/theme'

type StatusBadgeVariant = 'active' | 'triggered'

interface StatusBadgeProps {
  variant: StatusBadgeVariant
}

const LABELS: Record<StatusBadgeVariant, string> = {
  active: 'Active',
  triggered: 'Triggered',
}

export function StatusBadge({ variant }: StatusBadgeProps) {
  const theme = useTheme()

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            variant === 'active'
              ? theme.badgeActiveBg
              : theme.badgeTriggeredBg,
        },
      ]}>
      <ThemedText type="caption">{LABELS[variant]}</ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.sm,
  },
})
