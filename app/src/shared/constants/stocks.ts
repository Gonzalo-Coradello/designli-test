export const WATCHLIST_SYMBOLS = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'TSLA',
  'AMZN',
  'META',
  'NVDA',
] as const

export type WatchlistSymbol = (typeof WATCHLIST_SYMBOLS)[number]

export const STOCK_DESCRIPTIONS: Record<WatchlistSymbol, string> = {
  AAPL: 'Apple Inc',
  MSFT: 'Microsoft Corp',
  GOOGL: 'Alphabet Inc',
  TSLA: 'Tesla Inc',
  AMZN: 'Amazon.com Inc',
  META: 'Meta Platforms',
  NVDA: 'NVIDIA Corp',
}
