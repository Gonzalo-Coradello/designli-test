export type ChartTimeRange = '1W' | '1M' | '3M'

export const CHART_TIME_RANGES: ChartTimeRange[] = ['1W', '1M', '3M']

export const CHART_RANGES: Record<
  ChartTimeRange,
  { resolution: string; days: number }
> = {
  '1W': { resolution: '60', days: 7 },
  '1M': { resolution: '60', days: 30 },
  '3M': { resolution: 'D', days: 90 },
}
