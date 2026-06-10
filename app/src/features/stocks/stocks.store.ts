import { create } from 'zustand'
import type { LivePrice } from './types'

interface StocksState {
  prices: Record<string, LivePrice>
  setPrice: (symbol: string, price: number, timestamp: number) => void
}

export const useStocksStore = create<StocksState>((set) => ({
  prices: {},

  setPrice: (symbol, price, timestamp) => {
    set((state) => ({
      prices: {
        ...state.prices,
        [symbol]: { price, timestamp },
      },
    }))
  },
}))
