import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth/auth.store'
import { useStocksStore } from '@/features/stocks/stocks.store'
import { WATCHLIST_SYMBOLS } from '@/shared/constants/stocks'
import {
  connectSocket,
  disconnectSocket,
  onPriceUpdate,
  subscribeToSymbols,
  unsubscribeFromSymbols,
} from '../socket.service'

export function useStockSocket() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const setPrice = useStocksStore((state) => state.setPrice)

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket()
      return
    }

    connectSocket()
    onPriceUpdate((event) => {
      setPrice(event.symbol, event.price, event.timestamp)
    })
    subscribeToSymbols([...WATCHLIST_SYMBOLS])

    return () => {
      unsubscribeFromSymbols([...WATCHLIST_SYMBOLS])
      disconnectSocket()
    }
  }, [accessToken, setPrice])
}
