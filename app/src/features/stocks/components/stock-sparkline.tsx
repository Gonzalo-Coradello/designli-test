import { LineChart } from 'react-native-gifted-charts'
import { StyleSheet, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { LoadingSpinner } from '@/shared/components'
import { useTheme } from '@/hooks/use-theme'
import { useStockCandles } from '../hooks/use-stocks'

interface StockSparklineProps {
  symbol: string
  enabled?: boolean
}

export function StockSparkline({ symbol, enabled = true }: StockSparklineProps) {
  const theme = useTheme()
  const { data, isLoading, isError } = useStockCandles(
    symbol,
    '60',
    7,
    enabled,
  )

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner size="small" />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <ThemedText type="caption" themeColor="textSecondary">
          —
        </ThemedText>
      </View>
    )
  }

  const chartData =
    data?.candles.map((candle) => ({
      value: candle.close,
    })) ?? []

  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="caption" themeColor="textSecondary">
          —
        </ThemedText>
      </View>
    )
  }

  const first = chartData[0]?.value ?? 0
  const last = chartData[chartData.length - 1]?.value ?? 0
  const lineColor = last >= first ? theme.priceUp : theme.priceDown

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={120}
        height={32}
        hideAxesAndRules
        maxValue={Math.max(...chartData.map((item) => item.value)) + 100}
        hideDataPoints
        curved
        color={lineColor}
        thickness={1.5}
        disableScroll
        adjustToWidth
        initialSpacing={0}
        endSpacing={0}
        
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
})
