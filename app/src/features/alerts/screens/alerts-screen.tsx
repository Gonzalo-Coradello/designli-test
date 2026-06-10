import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/hooks/use-theme'
import {
  EmptyState,
  LoadingSpinner,
  ScreenHeader,
} from '@/shared/components'
import { Radius, Spacing } from '@/shared/theme'
import { AlertListItem } from '../components/alert-list-item'
import { useAlerts } from '../hooks/use-alerts'

type AlertFilter = 'active' | 'triggered'

export default function AlertsScreen() {
  const router = useRouter()
  const theme = useTheme()
  const [filter, setFilter] = useState<AlertFilter>('active')
  const { data: alerts, isLoading, isError, refetch, isRefetching } =
    useAlerts()

  const alertList = useMemo(() => {
    const all = alerts ?? []
    return all.filter((alert) =>
      filter === 'active' ? !alert.isTriggered : alert.isTriggered,
    )
  }, [alerts, filter])

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <LoadingSpinner fullScreen message="Loading alerts..." />
      </ThemedView>
    )
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title="Could not load alerts"
          description="Pull down to refresh or try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Alerts"
          subtitle="Get notified when a stock price crosses your target."
        />

        <FlatList
          data={alertList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AlertListItem alert={item} />}
          contentContainerStyle={[
            styles.list,
            alertList.length === 0 && styles.emptyList,
          ]}
          ItemSeparatorComponent={() => (
            <ThemedView style={styles.separator} />
          )}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View style={styles.filterRow}>
                {(['active', 'triggered'] as const).map((option) => {
                  const isActive = filter === option
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityLabel={`Show ${option} alerts`}
                      accessibilityState={{ selected: isActive }}
                      onPress={() => setFilter(option)}
                      style={[
                        styles.filterButton,
                        {
                          backgroundColor: isActive
                            ? theme.primary
                            : theme.backgroundElement,
                        },
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={{
                          color: isActive ? theme.onPrimary : theme.text,
                        }}>
                        {option === 'active' ? 'Active' : 'Triggered'}
                      </ThemedText>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              title={
                filter === 'active' ? 'No active alerts' : 'No triggered alerts'
              }
              description={
                filter === 'active'
                  ? 'Create a price alert to get notified when a stock crosses your target.'
                  : 'Triggered alerts will appear here after a price threshold is reached.'
              }
              actionLabel={filter === 'active' ? 'Create Alert' : undefined}
              onAction={
                filter === 'active'
                  ? () => router.push('/alerts/create')
                  : undefined
              }
            />
          }
          onRefresh={refetch}
          refreshing={isRefetching}
        />
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  listHeader: {
    gap: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  filterButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  list: {
    paddingBottom: Spacing.four,
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  emptyList: {
    flexGrow: 1,
  },
  separator: {
    height: Spacing.two,
  },
})
