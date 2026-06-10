import { apiClient } from '@/api/axios'
import type {
  StockCandleResponse,
  StockQuote,
  StockSearchResult,
} from '../types'

export async function getQuote(symbol: string): Promise<StockQuote> {
  const { data } = await apiClient.get<StockQuote>(`/stocks/${symbol}/quote`)
  return data
}

export async function getCandles(
  symbol: string,
  resolution = '60',
  days = 7,
): Promise<StockCandleResponse> {
  const { data } = await apiClient.get<StockCandleResponse>(
    `/stocks/${symbol}/candles`,
    { params: { resolution, days } },
  )
  return data
}

export async function searchSymbols(
  query: string,
): Promise<StockSearchResult[]> {
  const { data } = await apiClient.get<{ results: StockSearchResult[] }>(
    '/stocks/search',
    { params: { q: query } },
  )
  return data.results
}
