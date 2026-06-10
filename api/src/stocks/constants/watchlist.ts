export const WATCHLIST_SYMBOLS = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'TSLA',
  'AMZN',
  'META',
  'NVDA',
] as const;

export type WatchlistSymbol = (typeof WATCHLIST_SYMBOLS)[number];
