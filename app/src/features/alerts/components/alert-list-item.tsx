import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { useTheme } from '@/hooks/use-theme'
import { showAppAlert } from '@/shared/alert'
import { Card, HeaderIconButton, StatusBadge } from '@/shared/components'
import { formatPrice } from '@/shared/utils/format-price'
import { Spacing } from '@/shared/theme'
import { useDeleteAlert } from '../hooks/use-alerts'
import type { StockAlert } from '../types'

interface AlertListItemProps {
  alert: StockAlert
}

export function AlertListItem({ alert }: AlertListItemProps) {
  const theme = useTheme()
  const deleteMutation = useDeleteAlert()

  const handleDelete = () => {
    showAppAlert(
      'Delete Alert',
      `Remove the ${alert.symbol} alert at ${formatPrice(alert.targetPrice)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            deleteMutation.mutate(alert.id, {
              onError: () => {
                showAppAlert(
                  'Delete Failed',
                  'Could not delete this alert. Please try again.',
                )
              },
            }),
        },
      ],
    )
  }

  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="smallBold">{alert.symbol}</ThemedText>
          <StatusBadge
            variant={alert.isTriggered ? 'triggered' : 'active'}
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Target: {formatPrice(alert.targetPrice)}
        </ThemedText>
      </View>

      {deleteMutation.isPending ? (
        <View style={styles.deleteButton}>
          <ActivityIndicator color={theme.danger} size="small" />
        </View>
      ) : (
        <HeaderIconButton
          icon="trash-outline"
          onPress={handleDelete}
          accessibilityLabel="Delete"
          accessibilityHint="Removes this price alert"
          color={theme.danger}
        />
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  content: {
    flex: 1,
    gap: Spacing.half,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  deleteButton: {
    minHeight: 44,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
})
