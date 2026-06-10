import { useCallback, useRef, useState } from 'react'
import {
  FlatList,
  StyleSheet,
  type ViewToken,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedView } from '@/components/themed-view'
import { EmptyState, LoadingSpinner, ScreenHeader } from '@/shared/components'
import { WATCHLIST_SYMBOLS } from '@/shared/constants/stocks'
import { Spacing } from '@/shared/theme'
import { StockListItem } from '../components/stock-list-item'
import { useWatchlistQuotes } from '../hooks/use-stocks'

const viewabilityConfig = { itemVisiblePercentThreshold: 50 }

export default function DashboardScreen() {
  const { isLoading, isError, isRefetching, refetch } = useWatchlistQuotes()
  const [visibleSymbols, setVisibleSymbols] = useState<Set<string>>(
    () => new Set(),
  )
  const visibleSymbolsRef = useRef(visibleSymbols)
  visibleSymbolsRef.current = visibleSymbols

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const next = new Set(
        viewableItems
          .map((item) => item.key)
          .filter((key): key is string => typeof key === 'string'),
      )
      const prev = visibleSymbolsRef.current
      if (
        next.size === prev.size &&
        [...next].every((symbol) => prev.has(symbol))
      ) {
        return
      }
      setVisibleSymbols(next)
    },
    [],
  )

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <LoadingSpinner fullScreen message="Loading stocks..." />
      </ThemedView>
    )
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title="Could not load stocks"
          description="Pull down to refresh or try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader
          title="Dashboard"
          subtitle="Live prices during US market hours"
        />

        <FlatList
          data={[...WATCHLIST_SYMBOLS]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <StockListItem
              symbol={item}
              isVisible={visibleSymbols.has(item)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          onRefresh={refetch}
          refreshing={isRefetching}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
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
  list: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  separator: {
    height: Spacing.two,
  },
})
