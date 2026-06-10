import { LineChart } from 'react-native-gifted-charts'
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/hooks/use-theme'
import { Radius, Spacing, Typography } from '@/shared/theme'
import {
  CHART_RANGES,
  CHART_TIME_RANGES,
  type ChartTimeRange,
} from '../constants/chart-ranges'
import { useStockCandles } from '../hooks/use-stocks'

interface StockChartProps {
  symbol: string
  timeRange: ChartTimeRange
  onTimeRangeChange: (range: ChartTimeRange) => void
}

function formatAxisLabel(timestamp: number, timeRange: ChartTimeRange): string {
  const date = new Date(timestamp * 1000)
  if (timeRange === '1W') {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function StockChart({
  symbol,
  timeRange,
  onTimeRangeChange,
}: StockChartProps) {
  const theme = useTheme()
  const { resolution, days } = CHART_RANGES[timeRange]
  const { data, isLoading, isError, refetch } = useStockCandles(
    symbol,
    resolution,
    days,
  )

  const chartWidth = Dimensions.get('window').width - Spacing.four * 4

  const chartData =
    data?.candles.map((candle, index, candles) => {
      const showLabel =
        index === 0 ||
        index === Math.floor(candles.length / 2) ||
        index === candles.length - 1

      return {
        value: candle.close,
        label: showLabel ? formatAxisLabel(candle.timestamp, timeRange) : '',
      }
    }) ?? []

  const first = chartData[0]?.value ?? 0
  const last = chartData[chartData.length - 1]?.value ?? 0
  const lineColor = last >= first ? theme.priceUp : theme.priceDown


  console.log(chartData)

  return (
    <ThemedView style={styles.container}>
      <View style={styles.rangeSelector}>
        {CHART_TIME_RANGES.map((range) => {
          const isActive = range === timeRange
          return (
            <Pressable
              key={range}
              accessibilityRole="button"
              accessibilityLabel={`${range} chart range`}
              accessibilityState={{ selected: isActive }}
              onPress={() => onTimeRangeChange(range)}
              style={[
                styles.rangeButton,
                {
                  backgroundColor: isActive
                    ? theme.primary
                    : theme.backgroundElement,
                },
              ]}>
              <ThemedText
                type={isActive ? 'smallBold' : 'small'}
                style={{
                  color: isActive ? theme.onPrimary : theme.text,
                }}>
                {range}
              </ThemedText>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.chartArea}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.textSecondary} />
        ) : isError ? (
          <View style={styles.messageContainer}>
            <ThemedText type="small" themeColor="textSecondary">
              Failed to load chart data
            </ThemedText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry loading chart"
              onPress={() => refetch()}>
              <ThemedText type="smallBold" style={{ color: theme.link }}>
                Retry
              </ThemedText>
            </Pressable>
          </View>
        ) : chartData.length === 0 ? (
          <View style={styles.messageContainer}>
            <ThemedText type="small" themeColor="textSecondary">
              No chart data
            </ThemedText>
          </View>
        ) : (
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            curved
            color={lineColor}
            thickness={2}
            hideDataPoints
            xAxisColor={theme.textSecondary}
            yAxisColor={theme.textSecondary}
            yAxisTextStyle={{
              color: theme.textSecondary,
              fontSize: Typography.caption.fontSize,
            }}
            xAxisLabelTextStyle={{
              display: 'none',
            }}
            rulesColor={theme.backgroundElement}
            noOfSections={4}
            adjustToWidth
            initialSpacing={8}
            endSpacing={8}
          />
        )}
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  rangeSelector: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rangeButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  chartArea: {
    // height: 280,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    gap: Spacing.two,
  },
})
