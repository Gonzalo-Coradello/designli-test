import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import {
  Card,
  PercentChange,
  PriceDisplay,
} from '@/shared/components'
import {
  STOCK_DESCRIPTIONS,
  type WatchlistSymbol,
} from '@/shared/constants/stocks'
import { Spacing } from '@/shared/theme'
import { useStockQuote } from '../hooks/use-stocks'
import { useStocksStore } from '../stocks.store'
import { StockSparkline } from './stock-sparkline'

interface StockListItemProps {
  symbol: WatchlistSymbol
  isVisible?: boolean
}

export function StockListItem({ symbol, isVisible }: StockListItemProps) {
  const router = useRouter()
  const { data: quote, isLoading, isError } = useStockQuote(symbol)
  const livePrice = useStocksStore((state) => state.prices[symbol])

  const price = livePrice?.price ?? quote?.price
  const percentChange = quote?.percentChange
  const showPlaceholder = (isLoading || isError) && price == null

  const accessibilityLabel = showPlaceholder
    ? `${symbol}, price unavailable`
    : `${symbol}, ${price != null ? `$${price.toFixed(2)}` : 'price unavailable'}${percentChange != null ? `, ${percentChange >= 0 ? 'up' : 'down'} ${Math.abs(percentChange).toFixed(2)} percent` : ''}`

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens stock detail"
      onPress={() => router.push(`/stocks/${symbol}`)}
      style={({ pressed }) => [
        pressed && styles.pressed,
      ]}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.info}>
            <ThemedText type="smallBold">{symbol}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {STOCK_DESCRIPTIONS[symbol]}
            </ThemedText>
          </View>
          <View style={styles.priceBlock}>
            <PriceDisplay
              price={price}
              showPlaceholder={showPlaceholder}
            />
            {!showPlaceholder && percentChange != null ? (
              <PercentChange value={percentChange} />
            ) : null}
          </View>
        </View>
        <StockSparkline symbol={symbol} enabled={isVisible ?? true} />
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    gap: Spacing.half,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: Spacing.half,
  },
})
