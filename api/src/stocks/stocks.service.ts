import { Injectable } from '@nestjs/common';
import { CandleQueryDto } from './dto/candle-query.dto';
import { CandleDto, StockCandleDto } from './dto/stock-candle.dto';
import { StockQuoteDto } from './dto/stock-quote.dto';
import { StockSearchResultDto } from './dto/stock-search-result.dto';
import { FinnhubService } from './finnhub.service';
import { YahooFinanceService } from './yahoo-finance.service';

interface CachedQuote {
  data: StockQuoteDto;
  expiresAt: number;
}

interface CachedCandles {
  data: CandleDto[];
  expiresAt: number;
}

const QUOTE_CACHE_TTL_MS = 60_000;
const CANDLE_CACHE_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class StocksService {
  private readonly quoteCache = new Map<string, CachedQuote>();
  private readonly candleCache = new Map<string, CachedCandles>();

  constructor(
    private readonly finnhubService: FinnhubService,
    private readonly yahooFinanceService: YahooFinanceService,
  ) {}

  async getQuote(symbol: string): Promise<StockQuoteDto> {
    const cached = this.quoteCache.get(symbol);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    try {
      const quote = await this.finnhubService.getQuote(symbol);
      this.quoteCache.set(symbol, {
        data: quote,
        expiresAt: now + QUOTE_CACHE_TTL_MS,
      });

      return quote;
    } catch (error) {
      if (cached) {
        return cached.data;
      }

      throw error;
    }
  }

  async getCandles(
    symbol: string,
    query: CandleQueryDto,
  ): Promise<StockCandleDto> {
    const resolution = query.resolution ?? '60';
    const days = query.days ?? 7;
    const cacheKey = `${symbol}:${resolution}:${days}`;
    const cached = this.candleCache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return { symbol, candles: cached.data };
    }

    const to = Math.floor(Date.now() / 1000);
    const from = to - days * 24 * 60 * 60;

    try {
      const candles = await this.yahooFinanceService.getCandles(
        symbol,
        resolution,
        from,
        to,
      );

      this.candleCache.set(cacheKey, {
        data: candles,
        expiresAt: now + CANDLE_CACHE_TTL_MS,
      });

      return { symbol, candles };
    } catch (error) {
      if (cached) {
        return { symbol, candles: cached.data };
      }

      throw error;
    }
  }

  searchSymbols(query: string): Promise<StockSearchResultDto[]> {
    return this.finnhubService.searchSymbols(query);
  }
}
