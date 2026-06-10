import { useLocalSearchParams, useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/hooks/use-theme'
import {
  Button,
  LoadingSpinner,
  PercentChange,
  PriceDisplay,
  ScreenHeader,
} from '@/shared/components'
import {
  STOCK_DESCRIPTIONS,
  WATCHLIST_SYMBOLS,
  type WatchlistSymbol,
} from '@/shared/constants/stocks'
import { Spacing } from '@/shared/theme'
import { StockChart } from '../components/stock-chart'
import type { ChartTimeRange } from '../constants/chart-ranges'
import { useStockQuote } from '../hooks/use-stocks'
import { useStocksStore } from '../stocks.store'

function isWatchlistSymbol(symbol: string): symbol is WatchlistSymbol {
  return (WATCHLIST_SYMBOLS as readonly string[]).includes(symbol)
}

export default function StockDetailScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { symbol: rawSymbol } = useLocalSearchParams<{ symbol: string }>()
  const symbol = rawSymbol?.toUpperCase() ?? ''
  const [timeRange, setTimeRange] = useState<ChartTimeRange>('1W')

  const handleGoBack = useCallback(() => {
    router.back()
  }, [router])

  const { data: quote, isLoading: isQuoteLoading, isError: isQuoteError } =
    useStockQuote(symbol)
  const livePrice = useStocksStore((state) => state.prices[symbol])

  const isValid = isWatchlistSymbol(symbol)

  useEffect(() => {
    if (symbol && !isValid) {
      router.back()
    }
  }, [symbol, isValid, router])

  if (!symbol || !isValid) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText type="small" themeColor="textSecondary">
            Invalid stock symbol
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    )
  }

  const hasPrice = livePrice?.price != null || quote?.price != null
  const price = livePrice?.price ?? quote?.price
  const percentChange = quote?.percentChange ?? 0

  const handleCreateAlert = () => {
    router.push({
      pathname: '/alerts/create',
      params: { symbol },
    })
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleGoBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}>
            <SymbolView
              name={{
                ios: 'chevron.left',
                android: 'chevron_left',
                web: 'chevron_left',
              }}
              size={18}
              weight="semibold"
              tintColor={theme.text}
            />
            <ThemedText type="small">Back</ThemedText>
          </Pressable>

          <ScreenHeader
            title={symbol}
            subtitle={STOCK_DESCRIPTIONS[symbol]}
            style={styles.header}
          />

          <View style={styles.priceBlock}>
            {isQuoteLoading && !hasPrice ? (
              <LoadingSpinner size="small" message="Loading price..." />
            ) : isQuoteError && !hasPrice ? (
              <ThemedText type="small" style={{ color: theme.danger }}>
                Could not load price
              </ThemedText>
            ) : (
              <>
                <PriceDisplay price={price} type="display" />
                <PercentChange value={percentChange} />
              </>
            )}
          </View>

          <StockChart
            symbol={symbol}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          <Button
            label="Create Alert"
            onPress={handleCreateAlert}
            accessibilityHint="Opens form to create a price alert"
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    paddingVertical: Spacing.one,
    paddingRight: Spacing.two,
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    marginBottom: 0,
  },
  priceBlock: {
    gap: Spacing.half,
    minHeight: 60,
    justifyContent: 'center',
  },
})
