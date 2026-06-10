export interface StockQuote {
  symbol: string
  price: number
  change: number
  percentChange: number
  high: number
  low: number
  open: number
  previousClose: number
  timestamp: number
}

export interface StockCandle {
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
}

export interface StockCandleResponse {
  symbol: string
  candles: StockCandle[]
}

export interface StockSearchResult {
  symbol: string
  description: string
}

export interface LivePrice {
  price: number
  timestamp: number
}

export interface PriceUpdateEvent {
  symbol: string
  price: number
  timestamp: number
}
