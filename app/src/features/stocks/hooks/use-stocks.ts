import { useQueries, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { WATCHLIST_SYMBOLS } from '@/shared/constants/stocks'
import { getCandles, getQuote } from '../api/stocks.api'
import { useStocksStore } from '../stocks.store'

export function useStockQuote(symbol: string) {
  const setPrice = useStocksStore((state) => state.setPrice)

  const query = useQuery({
    queryKey: ['stock-quote', symbol],
    queryFn: () => getQuote(symbol),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (query.data) {
      setPrice(symbol, query.data.price, query.data.timestamp)
    }
  }, [query.data, setPrice, symbol])

  return query
}

export function useWatchlistQuotes() {
  const setPrice = useStocksStore((state) => state.setPrice)

  const queries = useQueries({
    queries: WATCHLIST_SYMBOLS.map((symbol) => ({
      queryKey: ['stock-quote', symbol],
      queryFn: () => getQuote(symbol),
      staleTime: 30_000,
    })),
  })

  useEffect(() => {
    queries.forEach((query, index) => {
      if (query.data) {
        const symbol = WATCHLIST_SYMBOLS[index]
        setPrice(symbol, query.data.price, query.data.timestamp)
      }
    })
  }, [queries, setPrice])

  const hasAnyData = queries.some((query) => query.data != null)
  const isLoading = !hasAnyData && queries.some((query) => query.isLoading)
  const isError = !hasAnyData && queries.every((query) => query.isError)
  const isRefetching = queries.some((query) => query.isRefetching)

  const refetch = () => Promise.all(queries.map((query) => query.refetch()))

  return {
    queries,
    isLoading,
    isError,
    isRefetching,
    refetch,
  }
}

export function useStockCandles(
  symbol: string,
  resolution = '60',
  days = 7,
  enabled = true,
) {
  return useQuery({
    queryKey: ['stock-candles', symbol, resolution, days],
    queryFn: () => getCandles(symbol, resolution, days),
    staleTime: 60_000,
    enabled,
  })
}
